// narrate — chapter-scale, multi-voice narration for the read-along
// audiobook pipeline. Reads a NarrationJob (ordered voice segments whose
// concatenated text *is* the chapter's narratable text), synthesizes each
// segment with its own voice through the macOS 13+ marker API
// write(_:toBufferCallback:toMarkerCallback:), writes one AAC .m4a, and
// prints a BoundaryOutput JSON document to stdout.
//
// Contract (build/audio/avspeech-boundaries.ts parses stdout verbatim):
//   stdout — the BoundaryOutput JSON and nothing else.
//   stderr — every progress line, warning, and error.
//   exit   — 0 only when the boundary list passed validation.
//
// The synthesis driver (callback ordering, the zero-length end-of-utterance
// sentinel, and the run-loop spin instead of a blocking semaphore) is
// copied from Sources/avspeech-spike/main.swift: both callbacks arrive as
// run-loop sources from the system speech-synthesis service, so blocking
// the thread deadlocks (#174).

import AVFoundation
import Foundation
import SpikeCore

func eprint(_ message: String) {
    FileHandle.standardError.write((message + "\n").data(using: .utf8)!)
}

func die(_ message: String) -> Never {
    eprint("narrate: error: \(message)")
    exit(1)
}

// Reconcile only needs a monotonic integer audio axis; ticks (100 ns, the
// same unit SMIL clip times use downstream) keep sub-millisecond detail
// without floating-point comparisons inside the reconciliation rules.
let ticksPerSecond = 10_000_000.0

// Stay under the ~2000-UTF-16-unit ceiling where the synthesis service
// stops reporting word markers (see chunkText).
let maxChunkLength = 1800

// Generous per-chunk ceiling: 1800 units is ~2 minutes of speech, and
// premium voices synthesize a good deal slower than compact ones.
let chunkTimeoutSeconds = 120.0

// MARK: - Job

guard CommandLine.arguments.count == 2 else {
    die("usage: narrate <job.json>")
}
let jobURL = URL(fileURLWithPath: CommandLine.arguments[1])
let job: NarrationJob
do {
    job = try JSONDecoder().decode(NarrationJob.self, from: Data(contentsOf: jobURL))
} catch {
    die("cannot read job \(jobURL.path): \(error.localizedDescription)")
}
guard !job.segments.isEmpty else { die("job has no segments") }

let chapterText = job.segments.map(\.text).joined() as NSString

// MARK: - Voices
//
// Resolved up front so a missing voice fails before any audio is written.

var voices: [String: AVSpeechSynthesisVoice] = [:]
for segment in job.segments where voices[segment.voiceId] == nil {
    guard let voice = AVSpeechSynthesisVoice(identifier: segment.voiceId) else {
        eprint("Voice not installed: \(segment.voiceId). Installed English voices:")
        for candidate in AVSpeechSynthesisVoice.speechVoices().sorted(by: { $0.identifier < $1.identifier })
        where candidate.language.hasPrefix("en") {
            eprint("  \(candidate.identifier)  (\(candidate.name), \(candidate.language))")
        }
        die("download the voice in System Settings → Accessibility → Spoken Content, then retry")
    }
    voices[segment.voiceId] = voice
}

// MARK: - Output file

let outURL = URL(fileURLWithPath: job.audioOutput)
try? FileManager.default.createDirectory(
    at: outURL.deletingLastPathComponent(), withIntermediateDirectories: true)

guard
    let targetFormat = AVAudioFormat(
        commonFormat: .pcmFormatFloat32, sampleRate: 44_100, channels: 1, interleaved: false)
else {
    die("could not build the 44.1 kHz mono float32 target format")
}
let aacSettings: [String: Any] = [
    AVFormatIDKey: kAudioFormatMPEG4AAC,
    AVSampleRateKey: 44_100,
    AVNumberOfChannelsKey: 1,
    AVEncoderBitRateKey: 96_000,
]

var audioFile: AVAudioFile?
// Frames of *target-format* audio committed so far — the chapter clock.
var framesWritten: AVAudioFramePosition = 0
// A converter carries resampler state (a filter delay line) across calls,
// so it must live as long as the native format does — rebuilding it per
// buffer throws away that state and silently drops ~12 ms of priming
// residual at every seam. Hence one converter held until the format
// actually changes, rather than a cache keyed on anything derived from the
// AVAudioFormat *object*: the synthesizer hands out a fresh instance per
// buffer, and `description` embeds the instance pointer, so any such key
// misses every time. AVAudioFormat's own `==` compares stream
// descriptions, which is the comparison that means what we want.
var lastNativeFormat: AVAudioFormat?
var currentConverter: AVAudioConverter?
var convertersBuilt = 0

func writeConverted(_ pcm: AVAudioPCMBuffer) throws {
    if audioFile == nil {
        audioFile = try AVAudioFile(
            forWriting: outURL, settings: aacSettings,
            commonFormat: .pcmFormatFloat32, interleaved: false)
    }

    let native = pcm.format
    let out: AVAudioPCMBuffer
    if native == targetFormat {
        out = pcm
    } else {
        if lastNativeFormat != native || currentConverter == nil {
            guard let fresh = AVAudioConverter(from: native, to: targetFormat) else {
                throw NSError(
                    domain: "narrate", code: 2,
                    userInfo: [NSLocalizedDescriptionKey: "no converter from \(native) to \(targetFormat)"])
            }
            currentConverter = fresh
            lastNativeFormat = native
            convertersBuilt += 1
        }
        let converter = currentConverter!

        let capacity =
            AVAudioFrameCount(Double(pcm.frameLength) * targetFormat.sampleRate / native.sampleRate) + 64
        guard let converted = AVAudioPCMBuffer(pcmFormat: targetFormat, frameCapacity: capacity) else {
            throw NSError(
                domain: "narrate", code: 3,
                userInfo: [NSLocalizedDescriptionKey: "could not allocate a \(capacity)-frame output buffer"])
        }
        var fed = false
        var convertError: NSError?
        // .inputRanDry is the expected outcome: one input buffer goes in,
        // the converter keeps whatever residual it needs for the next call.
        // .error is not recoverable here — now that the converter is
        // genuinely reused, a failed call would corrupt the resampler state
        // for every buffer after it, so it has to stop the run.
        let status = converter.convert(to: converted, error: &convertError) { _, inputStatus in
            if fed {
                inputStatus.pointee = .noDataNow
                return nil
            }
            fed = true
            inputStatus.pointee = .haveData
            return pcm
        }
        if let convertError { throw convertError }
        if status == .error {
            throw NSError(
                domain: "narrate", code: 4,
                userInfo: [NSLocalizedDescriptionKey: "AVAudioConverter reported .error converting from \(native)"])
        }
        out = converted
    }

    try audioFile!.write(from: out)
    framesWritten += AVAudioFramePosition(out.frameLength)
}

// MARK: - Synthesis

let synthesizer = AVSpeechSynthesizer()
let ipaAttribute = NSAttributedString.Key(AVSpeechSynthesisIPANotationAttribute)

var allBoundaries: [SpokenWordBoundary] = []
var totalRawMarkers = 0
var nonWordMarkers = 0
var duplicatesCollapsed = 0
var overlapsMerged = 0
var regressionsDropped = 0
var skippedSegments = 0
var synthesizedChunks = 0

// UTF-16 offset of the current segment within the chapter text.
var segmentStart = 0

for (segmentIndex, segment) in job.segments.enumerated() {
    defer { segmentStart += (segment.text as NSString).length }

    // Wordless segments (punctuation or whitespace between voice spans)
    // advance the text cursor and nothing else: synthesizing them would
    // trip the zero-marker ceiling canary and there is nothing to say.
    guard hasSpeakableContent(segment.text) else {
        skippedSegments += 1
        continue
    }
    let voice = voices[segment.voiceId]!
    var segmentMarkers: [SpokenWordBoundary] = []

    for chunk in chunkText(segment.text, maxUTF16Length: maxChunkLength) {
        guard hasSpeakableContent(chunk.text) else { continue }

        // Captured before synthesis: the chapter clock at this chunk's
        // first sample. Marker byte offsets are relative to the chunk's
        // own native stream, so this is what lifts them into chapter time.
        let accumulatedSeconds = Double(framesWritten) / targetFormat.sampleRate
        let chunkLength = (chunk.text as NSString).length

        let attributed = NSMutableAttributedString(string: chunk.text)
        for range in segment.ipa {
            // IPA offsets are segment-relative; shift into chunk space and
            // drop anything that doesn't land wholly inside this chunk.
            let location = range.start - chunk.startOffset
            guard location >= 0, range.length > 0, location + range.length <= chunkLength else { continue }
            attributed.addAttribute(
                ipaAttribute, value: range.notation,
                range: NSRange(location: location, length: range.length))
        }

        let utterance = AVSpeechUtterance(attributedString: attributed)
        utterance.voice = voice

        // Markers can in principle arrive before the first buffer, and the
        // native format is only knowable from a buffer — so collect raw
        // markers here and convert them to seconds after the chunk finishes.
        var rawMarkers: [AVSpeechSynthesisMarker] = []
        var nativeFormat: AVAudioFormat?
        var finished = false
        var failure: Error?

        synthesizer.write(
            utterance,
            toBufferCallback: { buffer in
                guard let pcm = buffer as? AVAudioPCMBuffer else {
                    failure = NSError(
                        domain: "narrate", code: 1,
                        userInfo: [NSLocalizedDescriptionKey: "unexpected buffer type from write(_:toBufferCallback:)"])
                    finished = true
                    return
                }
                // A zero-length buffer signals the end of this utterance.
                if pcm.frameLength == 0 {
                    finished = true
                    return
                }
                nativeFormat = pcm.format
                do {
                    try writeConverted(pcm)
                } catch {
                    failure = error
                    finished = true
                }
            },
            toMarkerCallback: { markers in
                rawMarkers.append(contentsOf: markers)
            })

        // Both callbacks are delivered as run-loop sources (XPC replies from
        // the system speech-synthesis service). Blocking this thread on a
        // semaphore would deadlock (#174) — spinning the run loop lets them
        // arrive.
        let deadline = Date().addingTimeInterval(chunkTimeoutSeconds)
        while !finished && Date() < deadline {
            RunLoop.current.run(mode: .default, before: Date().addingTimeInterval(0.05))
        }
        if !finished {
            die(
                "timed out after \(Int(chunkTimeoutSeconds))s waiting for segment \(segmentIndex) "
                    + "chunk at offset \(chunk.startOffset)")
        }
        if let failure {
            die("synthesis failed for segment \(segmentIndex): \(failure.localizedDescription)")
        }
        synthesizedChunks += 1

        guard let native = nativeFormat else {
            die("segment \(segmentIndex) chunk at offset \(chunk.startOffset) produced no audio buffers")
        }
        let bytesPerFrame = Int(native.streamDescription.pointee.mBytesPerFrame)
        guard bytesPerFrame > 0, native.sampleRate > 0 else {
            die("segment \(segmentIndex) reported a degenerate native format \(native)")
        }

        var chunkWordMarkers = 0
        for marker in rawMarkers {
            guard marker.mark == .word else {
                nonWordMarkers += 1
                continue
            }
            guard marker.textRange.location != NSNotFound else { continue }
            chunkWordMarkers += 1
            let seconds = markerSeconds(
                byteOffset: marker.byteSampleOffset, bytesPerFrame: bytesPerFrame,
                sampleRate: native.sampleRate, accumulatedSeconds: accumulatedSeconds)
            segmentMarkers.append(
                SpokenWordBoundary(
                    range: NSRange(
                        location: marker.textRange.location + chunk.startOffset + segmentStart,
                        length: marker.textRange.length),
                    byteOffset: Int(seconds * ticksPerSecond)))
        }
        totalRawMarkers += chunkWordMarkers

        // Ceiling canary: a speakable chunk that reports no words means the
        // undocumented ~2000-unit ceiling moved under us (OS update, new
        // voice). That failure is silent by design, so make it loud.
        if chunkWordMarkers == 0 {
            die(
                "ceiling canary: segment \(segmentIndex) chunk at offset \(chunk.startOffset) "
                    + "(\(chunkLength) UTF-16 units, voice \(segment.voiceId)) produced zero word markers")
        }
    }

    // Reconcile per segment: tokenizer noise is a within-voice, within-
    // utterance-stream phenomenon, and segment seams are real voice changes
    // that must not be merged across.
    let result = reconcile(segmentMarkers)
    duplicatesCollapsed += result.duplicatesCollapsed
    overlapsMerged += result.overlapsMerged
    regressionsDropped += result.regressionsDropped
    allBoundaries.append(contentsOf: result.boundaries)
}

if audioFile == nil {
    die("job produced no audio — every segment was wordless")
}
audioFile = nil  // flush and close the AAC file before anything reads it

// MARK: - Validate

let totalDurationSeconds = Double(framesWritten) / targetFormat.sampleRate
let problems = validateBoundaries(allBoundaries, totalUTF16Length: chapterText.length)

eprint(
    "narrate: \(job.segments.count) segments (\(skippedSegments) wordless, skipped), "
        + "\(synthesizedChunks) chunks synthesized, \(convertersBuilt) resampler(s) built")
eprint(
    "narrate: \(totalRawMarkers) raw word markers → \(allBoundaries.count) boundaries "
        + "(\(nonWordMarkers) non-word markers ignored)")
eprint(
    "narrate: reconciliation: \(duplicatesCollapsed) duplicates collapsed, "
        + "\(overlapsMerged) split tokens merged, \(regressionsDropped) regressions dropped")
eprint(
    String(
        format: "narrate: %.3fs of audio → %@", totalDurationSeconds, outURL.path))

if !problems.isEmpty {
    for problem in problems.prefix(20) { eprint("narrate: FAIL: \(problem)") }
    if problems.count > 20 { eprint("narrate: FAIL: …and \(problems.count - 20) more") }
    die("\(problems.count) boundary validation failure(s)")
}
if allBoundaries.isEmpty {
    die("no word boundaries were produced")
}

// MARK: - Emit (stdout is the JSON and nothing else)

let output = BoundaryOutput(
    totalDurationSeconds: totalDurationSeconds,
    boundaries: allBoundaries.map { boundary in
        ChapterBoundary(
            text: chapterText.substring(with: boundary.range),
            textOffset: boundary.range.location,
            wordLength: boundary.range.length,
            clipBeginSeconds: Double(boundary.byteOffset) / ticksPerSecond)
    })

do {
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.sortedKeys]
    FileHandle.standardOutput.write(try encoder.encode(output))
    FileHandle.standardOutput.write("\n".data(using: .utf8)!)
} catch {
    die("could not encode boundary output: \(error.localizedDescription)")
}
