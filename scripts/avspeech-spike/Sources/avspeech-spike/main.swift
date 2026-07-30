// AVSpeechSynthesizer word-marker spike — the local-TTS counterpart to
// build/scripts/tts-spike.ts (Azure). Uses the macOS 13+
// write(_:toBufferCallback:toMarkerCallback:) API rather than the
// willSpeakRangeOfSpeechString delegate: markers carry a byteSampleOffset
// into the audio stream (empirically bytes — see #173), which is the
// timing data ePub Media Overlays need and the delegate never provided.
// The ~2000-UTF-16-unit ceiling on word reporting is in the synthesis
// service itself (delegate AND markers, multiple engines), so input is
// chunked below it; raw markers are then reconciled by SpikeCore's
// three-rule pass (duplicates, regressions, forward overlaps — see
// Reconcile.swift for why that isn't papering over the findings).
// See docs/superpowers/specs/2026-07-29-avspeech-marker-migration-design.md.

import AVFoundation
import Foundation
import SpikeCore

// Mirrors build/scripts/tts-spike.ts's SAMPLE_TEXT so the two spikes run
// against identical text.
let sampleText =
    "Jeeves considered the matter. \u{201C}It is, if I may say so, a delicate "
    + "situation\u{201D}\u{2014}the sort that wants patience, not haste. The Skill itself is "
    + "well-formed; it\u{2019}s the ePub\u{2019}s Djot source that needs a second look\u{2026} "
    + "three passes, minimum\u{2014}maybe four."

func eprint(_ message: String) {
    FileHandle.standardError.write((message + "\n").data(using: .utf8)!)
}

func qualityLabel(_ quality: AVSpeechSynthesisVoiceQuality) -> String {
    switch quality {
    case .premium: return "premium"
    case .enhanced: return "enhanced"
    case .default: return "default"
    @unknown default: return "unknown"
    }
}

func bestAvailableVoice() -> AVSpeechSynthesisVoice? {
    func rank(_ quality: AVSpeechSynthesisVoiceQuality) -> Int {
        switch quality {
        case .premium: return 3
        case .enhanced: return 2
        case .default: return 1
        @unknown default: return 0
        }
    }

    return AVSpeechSynthesisVoice.speechVoices()
        .filter { $0.language.hasPrefix("en-US") }
        .max { rank($0.quality) < rank($1.quality) }
        ?? AVSpeechSynthesisVoice(language: "en-US")
}

func resolveVoice(named identifier: String?) -> AVSpeechSynthesisVoice? {
    guard let identifier else { return bestAvailableVoice() }
    if let voice = AVSpeechSynthesisVoice(identifier: identifier) { return voice }
    if let voice = AVSpeechSynthesisVoice.speechVoices().first(where: { $0.name == identifier }) {
        return voice
    }
    eprint("No voice matches \"\(identifier)\" — falling back to the best available en-US voice.")
    return bestAvailableVoice()
}

// MARK: - Argument parsing
//
// Usage:
//   swift run avspeech-spike                       # built-in smart-typography sample
//   swift run avspeech-spike path/to/text.txt       # check a real chapter excerpt
//   swift run avspeech-spike --voice <identifier>   # audition a specific voice
//   swift run avspeech-spike --list-voices          # print installed voice identifiers

var textPath: String?
var voiceIdentifier: String?
var listVoices = false

var args = Array(CommandLine.arguments.dropFirst())
while !args.isEmpty {
    let arg = args.removeFirst()
    switch arg {
    case "--voice":
        voiceIdentifier = args.first
        if !args.isEmpty { args.removeFirst() }
    case "--list-voices":
        listVoices = true
    default:
        textPath = arg
    }
}

if listVoices {
    for voice in AVSpeechSynthesisVoice.speechVoices().sorted(by: { $0.identifier < $1.identifier }) {
        print("\(voice.identifier)  \(voice.name)  \(voice.language)  quality=\(qualityLabel(voice.quality))")
    }
    exit(0)
}

let text: String
if let textPath {
    do {
        let fileURL = URL(fileURLWithPath: textPath)
        text = try String(contentsOf: fileURL, encoding: .utf8)
            .trimmingCharacters(in: .whitespacesAndNewlines)
    } catch {
        eprint("Could not read \(textPath): \(error.localizedDescription)")
        exit(1)
    }
} else {
    text = sampleText
}

guard let voice = resolveVoice(named: voiceIdentifier) else {
    eprint("No en-US voice available on this system.")
    exit(1)
}

print("Voice: \(voice.identifier) (\(voice.name), quality=\(qualityLabel(voice.quality)))")
let preview = text.count > 80 ? "\(text.prefix(80))…" : text
print("Text (\(text.utf16.count) UTF-16 units): \(preview)")

// MARK: - Synthesis

let synthesizer = AVSpeechSynthesizer()

let outputDir = URL(fileURLWithPath: "dist/tts-spike", isDirectory: true)
try? FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)
let audioURL = outputDir.appendingPathComponent("avspeech-spike.caf")
let jsonURL = outputDir.appendingPathComponent("avspeech-boundaries.json")

// Stay comfortably under the ~2000 UTF-16-unit ceiling where the service
// stops reporting word boundaries (see chunkText's doc comment).
let maxChunkLength = 1800
let chunks = chunkText(text, maxUTF16Length: maxChunkLength)
if chunks.count > 1 {
    print(
        "Splitting into \(chunks.count) chunks (~\(maxChunkLength) UTF-16 units each) to stay under "
            + "the synthesis service's word-marker ceiling.")
}

var audioFile: AVAudioFile?
var writeError: Error?
var rawMarkers: [SpokenWordBoundary] = []
var nonWordMarkCount = 0
var totalFrames = 0
var bytesPerFrame = 0
var sampleRate = 0.0

for chunk in chunks {
    let utterance = AVSpeechUtterance(string: chunk.text)
    utterance.voice = voice

    // Bytes written before this chunk — shifts marker offsets into
    // whole-stream coordinates, mirroring startOffset for text ranges.
    let byteBase = totalFrames * bytesPerFrame

    var chunkMarkers: [SpokenWordBoundary] = []
    var finished = false
    synthesizer.write(utterance, toBufferCallback: { buffer in
        guard let pcmBuffer = buffer as? AVAudioPCMBuffer else {
            writeError = NSError(
                domain: "avspeech-spike", code: 1,
                userInfo: [NSLocalizedDescriptionKey: "Unexpected buffer type from write(_:toBufferCallback:)"])
            finished = true
            return
        }
        // A zero-length buffer signals the end of synthesis for this utterance.
        if pcmBuffer.frameLength == 0 {
            finished = true
            return
        }
        totalFrames += Int(pcmBuffer.frameLength)
        sampleRate = pcmBuffer.format.sampleRate
        bytesPerFrame = Int(pcmBuffer.format.streamDescription.pointee.mBytesPerFrame)
        do {
            if audioFile == nil {
                audioFile = try AVAudioFile(forWriting: audioURL, settings: pcmBuffer.format.settings)
            }
            // Every chunk shares one voice, so format stays consistent —
            // appending keeps the whole chapter as a single playable file.
            try audioFile?.write(from: pcmBuffer)
        } catch {
            writeError = error
            finished = true
        }
    }, toMarkerCallback: { markers in
        for marker in markers {
            guard marker.mark == .word else {
                nonWordMarkCount += 1
                continue
            }
            guard marker.textRange.location != NSNotFound else { continue }
            chunkMarkers.append(
                SpokenWordBoundary(
                    range: NSRange(
                        location: marker.textRange.location + chunk.startOffset,
                        length: marker.textRange.length),
                    byteOffset: marker.byteSampleOffset + byteBase))
        }
    })

    // Both callbacks are delivered as run-loop sources (XPC replies from the
    // system speech-synthesis service). Blocking the thread on a semaphore
    // would deadlock (see #174) — spinning the run loop lets them arrive.
    let deadline = Date().addingTimeInterval(30)
    while !finished && Date() < deadline {
        RunLoop.current.run(mode: .default, before: Date().addingTimeInterval(0.05))
    }
    if !finished {
        eprint("Timed out waiting for synthesis to complete after 30s (chunk at offset \(chunk.startOffset)).")
        exit(1)
    }
    if writeError != nil {
        break
    }

    // Ceiling canary: a chunk with zero word markers means the undocumented
    // ceiling moved under us (OS update, different voice). The failure mode
    // is silent by design, so make it loud.
    if chunkMarkers.isEmpty {
        eprint(
            "FAIL: chunk at offset \(chunk.startOffset) (\(chunk.text.utf16.count) UTF-16 units) "
                + "produced zero word markers — the word-reporting ceiling may have shifted below "
                + "\(maxChunkLength) units on this OS/voice.")
        exit(1)
    }
    rawMarkers.append(contentsOf: chunkMarkers)
}

if let writeError {
    eprint("Audio write failed: \(writeError.localizedDescription)")
    exit(1)
}

// MARK: - Reconcile & verify

// Raw-marker audio-monotonicity canary: the entire three-rule reconciliation
// pass rests on the empirical claim that raw marker audio offsets never
// regress (text ranges get noisy; audio does not — see Reconcile.swift). A
// raw audio regression has never been observed across any measured run; if
// one shows up here, that assumption is falsified and reconciliation would
// be silently laundering a real ordering defect instead of resolving noise.
// So this must fail loudly, not be reconciled away.
for index in rawMarkers.indices.dropFirst() {
    let previous = rawMarkers[index - 1]
    let current = rawMarkers[index]
    if current.byteOffset < previous.byteOffset {
        eprint(
            "FAIL: raw marker \(index) audio offset regressed (previous byteOffset "
                + "\(previous.byteOffset) at range \(previous.range) → marker \(index) byteOffset "
                + "\(current.byteOffset) at range \(current.range)). Raw audio offsets have never "
                + "regressed in any measured run; this falsifies the assumption the reconciliation "
                + "pass relies on.")
        exit(1)
    }
}

let result = reconcile(rawMarkers)
let boundaries = result.boundaries
let nsText = text as NSString
let wordCount = text.split(whereSeparator: { !$0.isLetter && !$0.isNumber }).filter { !$0.isEmpty }.count

print("\n\(rawMarkers.count) raw word markers → \(boundaries.count) reconciled boundaries (~\(wordCount) words in source text).")
print("\(nonWordMarkCount) non-word markers ignored (sentence/paragraph/phoneme).")
print(
    "reconciliation: \(result.duplicatesCollapsed) duplicate tokenizations collapsed, "
        + "\(result.overlapsMerged) split tokens merged, \(result.regressionsDropped) regressing re-reports dropped.")
for boundary in boundaries {
    let end = boundary.range.location + boundary.range.length
    guard end <= nsText.length else { continue }
    let seconds = Double(boundary.byteOffset) / Double(max(bytesPerFrame, 1)) / max(sampleRate, 1)
    print(String(format: "  [%d, %d) %8.3fs %@", boundary.range.location, end, seconds, nsText.substring(with: boundary.range)))
}

var outOfBounds = 0
var overlaps = 0
var audioRegressions = 0
var previousEnd = 0
var previousOffset = -1
for boundary in boundaries {
    let start = boundary.range.location
    let end = start + boundary.range.length
    if end > nsText.length { outOfBounds += 1 }
    if start < previousEnd { overlaps += 1 }
    if boundary.byteOffset < previousOffset { audioRegressions += 1 }
    previousEnd = max(previousEnd, end)
    previousOffset = boundary.byteOffset
}

// MARK: - JSON dump (the shape a smil.ts adapter consumes)

struct BoundaryRecord: Codable {
    let text: String
    let textOffset: Int
    let wordLength: Int
    let clipBeginSeconds: Double
}

let records = boundaries.compactMap { boundary -> BoundaryRecord? in
    let end = boundary.range.location + boundary.range.length
    guard end <= nsText.length else { return nil }
    return BoundaryRecord(
        text: nsText.substring(with: boundary.range),
        textOffset: boundary.range.location,
        wordLength: boundary.range.length,
        clipBeginSeconds: Double(boundary.byteOffset) / Double(max(bytesPerFrame, 1)) / max(sampleRate, 1))
}
do {
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
    try encoder.encode(records).write(to: jsonURL)
} catch {
    eprint("Could not write \(jsonURL.path): \(error.localizedDescription)")
    exit(1)
}

print("\nAudio written to \(audioURL.path)")
print("Boundaries written to \(jsonURL.path)")

var failed = false
if boundaries.isEmpty {
    print("FAIL: no word markers were delivered for this voice.")
    failed = true
} else if Double(boundaries.count) < Double(wordCount) * 0.5 {
    print(
        "FAIL: only \(boundaries.count) boundaries for ~\(wordCount) words — looks like "
            + "sentence-level, not word-level, granularity.")
    failed = true
}
if outOfBounds > 0 {
    print("FAIL: \(outOfBounds) boundary range(s) extend past the end of the source text.")
    failed = true
}
if overlaps > 0 {
    print("FAIL: \(overlaps) reconciled boundary range(s) still overlap the previous one.")
    failed = true
}
if audioRegressions > 0 {
    print("FAIL: \(audioRegressions) reconciled boundary audio offset(s) go backwards.")
    failed = true
}

if failed {
    exit(1)
}
print("\nPASS: reconciled word boundaries are in range, non-overlapping, and audio-monotonic.")
