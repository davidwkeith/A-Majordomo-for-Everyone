// AVSpeechSynthesizer word-boundary spike — the local-TTS counterpart to
// build/scripts/tts-spike.ts (Azure). Where the Azure spike checks that
// `WordBoundary`'s reported offset lines up with the source string it was
// given, `AVSpeechSynthesizer` has no separate wire encoding to drift
// against: `willSpeakRangeOfSpeechString` always indexes into the exact
// `String` handed to `AVSpeechUtterance`. Confirmed: the callback fires per
// word (not per sentence) and holds up against Djot's smart-typography
// substitutions (curly quotes, em/en dash, ellipsis). Also confirmed, on
// real chapter-length text: it stops firing altogether above ~2000 UTF-16
// units per utterance (worked around below via chunkText), and even within
// a single chunk it occasionally reports overlapping or out-of-order
// ranges around punctuation-heavy text (citations, phone numbers, footnote
// markers) — see the README's Results section for the full breakdown.
// See docs/superpowers/specs/2026-07-27-azure-tts-engine-design.md for why
// this mattered enough to spike in the first place.

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

struct WordBoundary {
    let range: NSRange
    let text: String
}

final class SpikeDelegate: NSObject, AVSpeechSynthesizerDelegate {
    private let lock = NSLock()
    private var collected: [WordBoundary] = []
    private let sourceText: NSString

    init(sourceText: String) {
        self.sourceText = sourceText as NSString
    }

    var boundaries: [WordBoundary] {
        lock.lock()
        defer { lock.unlock() }
        return collected
    }

    func speechSynthesizer(
        _ synthesizer: AVSpeechSynthesizer,
        willSpeakRangeOfSpeechString characterRange: NSRange,
        utterance: AVSpeechUtterance
    ) {
        guard characterRange.location != NSNotFound,
            characterRange.location + characterRange.length <= sourceText.length
        else { return }
        let word = sourceText.substring(with: characterRange)
        lock.lock()
        collected.append(WordBoundary(range: characterRange, text: word))
        lock.unlock()
    }
}

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

let synthesizer = AVSpeechSynthesizer()

let outputDir = URL(fileURLWithPath: "dist/tts-spike", isDirectory: true)
try? FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)
let outputURL = outputDir.appendingPathComponent("avspeech-spike.caf")

// Stay comfortably under the ~2000 UTF-16-unit ceiling where
// willSpeakRangeOfSpeechString stops firing (see chunkText's doc comment).
let maxChunkLength = 1800
let chunks = chunkText(text, maxUTF16Length: maxChunkLength)
if chunks.count > 1 {
    print(
        "Splitting into \(chunks.count) chunks (~\(maxChunkLength) UTF-16 units each) to stay under "
            + "AVSpeechSynthesizer's word-boundary ceiling.")
}

var audioFile: AVAudioFile?
var writeError: Error?
var boundaries: [WordBoundary] = []

for chunk in chunks {
    let utterance = AVSpeechUtterance(string: chunk.text)
    utterance.voice = voice

    let delegate = SpikeDelegate(sourceText: chunk.text)
    synthesizer.delegate = delegate

    var finished = false
    synthesizer.write(utterance) { buffer in
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
        do {
            if audioFile == nil {
                audioFile = try AVAudioFile(forWriting: outputURL, settings: pcmBuffer.format.settings)
            }
            // Every chunk shares one voice, so format stays consistent —
            // appending keeps the whole chapter as a single playable file.
            try audioFile?.write(from: pcmBuffer)
        } catch {
            writeError = error
            finished = true
        }
    }

    // `write(_:toBufferCallback:)` and `willSpeakRangeOfSpeechString` deliver
    // their results as run-loop sources (XPC replies from the system
    // speech-synthesis service), not raw GCD callbacks. Blocking the main
    // thread on a DispatchSemaphore — as an earlier version of this script
    // did — parks the thread in a kernel-level semaphore_wait_trap that never
    // pumps the run loop, so those replies queue up and are never delivered:
    // a permanent deadlock, not a slow synthesis. Spinning the run loop here
    // is what lets them arrive.
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

    // Translate this chunk's self-relative ranges back into the full
    // source text's coordinate space so downstream checks (and callers)
    // see one continuous set of boundaries, as if chunking never happened.
    for boundary in delegate.boundaries {
        let shifted = NSRange(location: boundary.range.location + chunk.startOffset, length: boundary.range.length)
        boundaries.append(WordBoundary(range: shifted, text: boundary.text))
    }
}

if let writeError {
    eprint("Audio write failed: \(writeError.localizedDescription)")
    exit(1)
}

// MARK: - Verify boundaries

let nsText = text as NSString
let wordCount = text.split(whereSeparator: { !$0.isLetter && !$0.isNumber }).filter { !$0.isEmpty }.count

print("\n\(boundaries.count) word boundaries captured (~\(wordCount) words in source text).")
for boundary in boundaries {
    let end = boundary.range.location + boundary.range.length
    print("  [\(boundary.range.location), \(end)) \(boundary.text)")
}

var outOfBounds = 0
var overlaps = 0
var previousEnd = 0
for boundary in boundaries {
    let start = boundary.range.location
    let end = start + boundary.range.length
    if end > nsText.length { outOfBounds += 1 }
    if start < previousEnd { overlaps += 1 }
    previousEnd = max(previousEnd, end)
}

print("\nAudio written to \(outputURL.path)")

var failed = false
if boundaries.isEmpty {
    print("FAIL: no willSpeakRangeOfSpeechString callbacks fired for this voice.")
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
    print("FAIL: \(overlaps) boundary range(s) overlap the previous one.")
    failed = true
}

if failed {
    exit(1)
}
print("\nPASS: word-level boundaries are in range and sequential against the source text.")
