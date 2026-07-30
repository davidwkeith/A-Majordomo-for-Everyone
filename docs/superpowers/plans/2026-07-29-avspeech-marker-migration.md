# AVSpeech Marker API Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `scripts/avspeech-spike` from the `willSpeakRangeOfSpeechString` delegate to the macOS 13+ marker API with a three-rule reconciliation pass, and widen `build/audio/ssml-lexicon.ts` with an engine-neutral acronym table (issue #173).

**Architecture:** The Swift spike package splits into a testable `SpikeCore` library (chunking + reconciliation, pure logic) and the `avspeech-spike` executable (synthesis + I/O, not unit-testable because it talks to the system speech XPC service — verified by running it). The TypeScript lexicon gains acronym rules realized two ways: `<sub alias>` for Azure (existing mechanism) and a new IPA-match export for AVSpeech.

**Tech Stack:** Swift 5.9 / SwiftPM / XCTest / AVFoundation (macOS 13+); TypeScript / vitest (`npm test`).

**Spec:** `docs/superpowers/specs/2026-07-29-avspeech-marker-migration-design.md`

## Global Constraints

- Swift package platform floor stays `.macOS(.v13)` (marker API availability), swift-tools-version 5.9.
- ES modules only in TypeScript; vanilla — no new dependencies on either side.
- Conventional commits; commit at the end of every task.
- `byteSampleOffset` is **bytes** (empirically confirmed): seconds = `byteOffset ÷ bytesPerFrame ÷ sampleRate`.
- The reconciliation rule order is load-bearing: duplicate-collapse, then regression-drop, then forward-merge (a regressing start also satisfies the forward-overlap predicate, so regression must be checked first).
- The delegate path is deleted, not kept as a fallback — it cannot produce audio offsets and has no remaining role (spec §1).
- All spike commands run from `scripts/avspeech-spike/`.

---

### Task 1: Split the package and extract chunking into SpikeCore

**Files:**
- Modify: `scripts/avspeech-spike/Package.swift`
- Create: `scripts/avspeech-spike/Sources/SpikeCore/Chunking.swift`
- Modify: `scripts/avspeech-spike/Sources/avspeech-spike/main.swift` (remove `TextChunk`/`chunkText`, lines 102–160; add `import SpikeCore`)
- Test: `scripts/avspeech-spike/Tests/SpikeCoreTests/ChunkingTests.swift`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `public struct TextChunk { public let startOffset: Int; public let text: String }` and `public func chunkText(_ text: String, maxUTF16Length: Int) -> [TextChunk]` in module `SpikeCore`. Task 2 adds to the same module; Task 3's executable imports it.

- [ ] **Step 1: Rewrite Package.swift with library + executable + test targets**

```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "avspeech-spike",
    platforms: [.macOS(.v13)],
    targets: [
        .target(name: "SpikeCore", path: "Sources/SpikeCore"),
        .executableTarget(
            name: "avspeech-spike",
            dependencies: ["SpikeCore"],
            path: "Sources/avspeech-spike"),
        .testTarget(
            name: "SpikeCoreTests",
            dependencies: ["SpikeCore"],
            path: "Tests/SpikeCoreTests"),
    ]
)
```

- [ ] **Step 2: Write the failing chunking tests**

Create `Tests/SpikeCoreTests/ChunkingTests.swift`:

```swift
import XCTest
@testable import SpikeCore

final class ChunkingTests: XCTestCase {
    func testShortTextIsASingleChunk() {
        let chunks = chunkText("hello world", maxUTF16Length: 1800)
        XCTAssertEqual(chunks.count, 1)
        XCTAssertEqual(chunks[0].startOffset, 0)
        XCTAssertEqual(chunks[0].text, "hello world")
    }

    func testEmptyTextYieldsNoChunks() {
        XCTAssertTrue(chunkText("", maxUTF16Length: 1800).isEmpty)
    }

    func testSplitsAtWhitespaceUnderTheCeiling() {
        let text = Array(repeating: "word", count: 100).joined(separator: " ") // 499 units
        let chunks = chunkText(text, maxUTF16Length: 100)
        XCTAssertGreaterThan(chunks.count, 1)
        for chunk in chunks {
            XCTAssertLessThanOrEqual(chunk.text.utf16.count, 100)
            XCTAssertFalse(chunk.text.hasPrefix(" "))
            XCTAssertFalse(chunk.text.hasSuffix(" "))
        }
    }

    func testChunkOffsetsSliceBackToTheSourceText() {
        let text = Array(repeating: "word", count: 100).joined(separator: " ")
        let nsText = text as NSString
        for chunk in chunkText(text, maxUTF16Length: 100) {
            let slice = nsText.substring(
                with: NSRange(location: chunk.startOffset, length: chunk.text.utf16.count))
            XCTAssertEqual(slice, chunk.text)
        }
    }

    func testOneVeryLongTokenGetsAHardCut() {
        let text = String(repeating: "x", count: 250)
        let chunks = chunkText(text, maxUTF16Length: 100)
        XCTAssertEqual(chunks.count, 3)
        XCTAssertEqual(chunks.map { $0.text.utf16.count }, [100, 100, 50])
    }
}
```

- [ ] **Step 3: Run tests to verify they fail to compile**

Run: `cd scripts/avspeech-spike && swift test`
Expected: build error — `SpikeCore` has no `Chunking.swift` yet (`cannot find 'chunkText' in scope` or missing module).

- [ ] **Step 4: Move chunking into SpikeCore**

Create `Sources/SpikeCore/Chunking.swift` with the code currently at `main.swift:102-160`, made public. The body of `chunkText` is **moved verbatim** — only the access modifiers and the doc comment location change:

```swift
import Foundation

public struct TextChunk {
    // UTF-16 offset into the original source text — lets a chunk's own
    // word-marker ranges (reported relative to the chunk's utterance
    // string) be translated back into the caller's coordinate space.
    public let startOffset: Int
    public let text: String

    public init(startOffset: Int, text: String) {
        self.startOffset = startOffset
        self.text = text
    }
}

// AVSpeechSynthesizer silently stops reporting word boundaries altogether
// above ~2000 UTF-16 units of utterance text (measured: 2000 passes, 2003
// fails, on this machine/voice) — confirmed for both the delegate and the
// marker callback, so the ceiling is in the synthesis service itself.
// Splitting on whitespace keeps each chunk under that ceiling without
// cutting a word in half.
public func chunkText(_ text: String, maxUTF16Length: Int) -> [TextChunk] {
    let nsText = text as NSString
    let length = nsText.length
    guard length > 0 else { return [] }

    func isWhitespace(_ unit: unichar) -> Bool {
        guard let scalar = Unicode.Scalar(unit) else { return false }
        return CharacterSet.whitespacesAndNewlines.contains(scalar)
    }

    var chunks: [TextChunk] = []
    var start = 0
    while start < length {
        let remaining = length - start
        if remaining <= maxUTF16Length {
            chunks.append(TextChunk(startOffset: start, text: nsText.substring(from: start)))
            break
        }

        // Walk back from the window's edge to the nearest whitespace so the
        // split falls between words, not inside one.
        var splitAt = start + maxUTF16Length
        var search = splitAt
        while search > start && !isWhitespace(nsText.character(at: search)) {
            search -= 1
        }
        if search > start {
            splitAt = search
        }
        // else: no whitespace anywhere in the window (one very long token) —
        // fall back to a hard cut at the window edge.

        chunks.append(
            TextChunk(startOffset: start, text: nsText.substring(with: NSRange(location: start, length: splitAt - start))))

        // Skip the whitespace run so the next chunk doesn't start with
        // leading space (which would shift its own word boundaries by one).
        var nextStart = splitAt
        while nextStart < length && isWhitespace(nsText.character(at: nextStart)) {
            nextStart += 1
        }
        start = nextStart
    }
    return chunks
}
```

In `main.swift`, delete the `TextChunk` struct and `chunkText` function (lines 102–160) and add `import SpikeCore` after `import Foundation`.

- [ ] **Step 5: Run tests and the executable build**

Run: `cd scripts/avspeech-spike && swift test && swift build`
Expected: all 5 tests PASS; executable still builds (it still uses the delegate at this point — that changes in Task 3).

- [ ] **Step 6: Commit**

```bash
git add scripts/avspeech-spike
git commit -m "refactor(tts): extract spike chunking into testable SpikeCore target (#173)"
```

---

### Task 2: Reconciliation pass in SpikeCore (TDD)

**Files:**
- Create: `scripts/avspeech-spike/Sources/SpikeCore/Reconcile.swift`
- Test: `scripts/avspeech-spike/Tests/SpikeCoreTests/ReconcileTests.swift`

**Interfaces:**
- Consumes: nothing from Task 1 (independent module file, same target).
- Produces (used by Task 3):

```swift
public struct SpokenWordBoundary: Equatable {
    public let range: NSRange   // UTF-16 units into the source text
    public let byteOffset: Int  // bytes into the output audio stream
    public init(range: NSRange, byteOffset: Int)
}
public struct ReconcileResult: Equatable {
    public let boundaries: [SpokenWordBoundary]
    public let duplicatesCollapsed: Int
    public let overlapsMerged: Int
    public let regressionsDropped: Int
}
public func reconcile(_ markers: [SpokenWordBoundary]) -> ReconcileResult
```

- [ ] **Step 1: Write the failing tests**

Create `Tests/SpikeCoreTests/ReconcileTests.swift`. The fixture values are the actual marker sequences observed in the #173 investigation (compact Samantha, macOS 26):

```swift
import XCTest
@testable import SpikeCore

final class ReconcileTests: XCTestCase {
    private func b(_ location: Int, _ length: Int, _ offset: Int) -> SpokenWordBoundary {
        SpokenWordBoundary(range: NSRange(location: location, length: length), byteOffset: offset)
    }

    func testCleanBoundariesPassThroughUntouched() {
        let markers = [b(0, 4, 0), b(5, 4, 20240), b(10, 8, 51920)]
        let result = reconcile(markers)
        XCTAssertEqual(result.boundaries, markers)
        XCTAssertEqual(result.duplicatesCollapsed, 0)
        XCTAssertEqual(result.overlapsMerged, 0)
        XCTAssertEqual(result.regressionsDropped, 0)
    }

    func testCollapsesSameStartSameOffsetDuplicateToTheUnionSpan() {
        // Observed: "credit cards" [52,64) then "credit cards," [52,65),
        // both at byte offset 292600 — one audio moment, two tokenizations.
        let result = reconcile([b(41, 10, 216920), b(52, 12, 292600), b(52, 13, 292600), b(66, 4, 400400)])
        XCTAssertEqual(result.boundaries, [b(41, 10, 216920), b(52, 13, 292600), b(66, 4, 400400)])
        XCTAssertEqual(result.duplicatesCollapsed, 1)
        XCTAssertEqual(result.overlapsMerged, 0)
        XCTAssertEqual(result.regressionsDropped, 0)
    }

    func testDuplicateKeepsTheLongerSpanWhenTheFirstReportIsLonger() {
        // Observed: "request," [35,43) then "request" [35,42), same offset.
        let result = reconcile([b(35, 8, 162800), b(35, 7, 162800)])
        XCTAssertEqual(result.boundaries, [b(35, 8, 162800)])
        XCTAssertEqual(result.duplicatesCollapsed, 1)
    }

    func testMergesForwardOverlapKeepingTheEarlierOffset() {
        // Observed: "(1-800" [58,64) at 375320, then "1-800-669-9777)"
        // [59,74) at 428120 — the normalizer re-reads the phone number.
        let result = reconcile([b(49, 4, 270160), b(58, 6, 375320), b(59, 15, 428120), b(75, 2, 759000)])
        XCTAssertEqual(result.boundaries, [b(49, 4, 270160), b(58, 16, 375320), b(75, 2, 759000)])
        XCTAssertEqual(result.overlapsMerged, 1)
        XCTAssertEqual(result.duplicatesCollapsed, 0)
        XCTAssertEqual(result.regressionsDropped, 0)
    }

    func testDropsARegressingMarkerAsASpuriousRereport() {
        // Observed: after "with" [45993,45997), a marker for "reva"
        // [45116,45120) arrived with a *later* audio offset — audio
        // monotonicity proves the speech never went backwards.
        let result = reconcile([b(45993, 4, 1000), b(45116, 4, 2000), b(46060, 1, 3000)])
        XCTAssertEqual(result.boundaries, [b(45993, 4, 1000), b(46060, 1, 3000)])
        XCTAssertEqual(result.regressionsDropped, 1)
        XCTAssertEqual(result.overlapsMerged, 0)
    }

    func testEmptyInputYieldsEmptyResult() {
        let result = reconcile([])
        XCTAssertTrue(result.boundaries.isEmpty)
    }

    func testReconciledOutputIsAlwaysNonOverlappingAndAudioMonotonic() {
        // Mixed stream exercising all three rules together.
        let markers = [
            b(0, 4, 0),
            b(5, 4, 100), b(5, 5, 100),    // dupe
            b(12, 6, 200), b(13, 10, 250), // forward overlap
            b(3, 2, 300),                  // regression
            b(30, 4, 400),
        ]
        let result = reconcile(markers)
        var prevEnd = 0
        var prevOffset = -1
        for m in result.boundaries {
            XCTAssertGreaterThanOrEqual(m.range.location, prevEnd)
            XCTAssertGreaterThanOrEqual(m.byteOffset, prevOffset)
            prevEnd = m.range.location + m.range.length
            prevOffset = m.byteOffset
        }
        XCTAssertEqual(result.duplicatesCollapsed, 1)
        XCTAssertEqual(result.overlapsMerged, 1)
        XCTAssertEqual(result.regressionsDropped, 1)
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd scripts/avspeech-spike && swift test`
Expected: build error — `cannot find 'reconcile' in scope` / `SpokenWordBoundary` undefined.

- [ ] **Step 3: Implement Reconcile.swift**

Create `Sources/SpikeCore/Reconcile.swift`:

```swift
import Foundation

/// One word boundary from the marker callback, shifted into whole-text
/// (range) and whole-stream (byteOffset) coordinates.
public struct SpokenWordBoundary: Equatable {
    public let range: NSRange
    public let byteOffset: Int

    public init(range: NSRange, byteOffset: Int) {
        self.range = range
        self.byteOffset = byteOffset
    }
}

public struct ReconcileResult: Equatable {
    public let boundaries: [SpokenWordBoundary]
    public let duplicatesCollapsed: Int
    public let overlapsMerged: Int
    public let regressionsDropped: Int

    public init(
        boundaries: [SpokenWordBoundary], duplicatesCollapsed: Int,
        overlapsMerged: Int, regressionsDropped: Int
    ) {
        self.boundaries = boundaries
        self.duplicatesCollapsed = duplicatesCollapsed
        self.overlapsMerged = overlapsMerged
        self.regressionsDropped = regressionsDropped
    }
}

/// Reconcile raw word markers into a non-overlapping, text- and
/// audio-monotonic boundary list.
///
/// AVSpeechSynthesizer's internal text normalization re-reports some spans
/// against more than one tokenization (Apple-acknowledged; see #173). The
/// audio offsets, however, are strictly monotonic in practice — the speech
/// itself never goes backwards — which is what makes each anomaly
/// classifiable rather than papered over:
///
/// 1. Same text start, same audio offset → the same moment tokenized twice;
///    collapse to the union span.
/// 2. Text start regressing behind the previous boundary's *start* while
///    audio advances → spurious re-report of earlier text; drop it.
/// 3. Text start inside the previous span (but not regressing) → the
///    normalizer split one utterance token in two (phone numbers); merge to
///    the union span, keeping the earlier offset.
///
/// Rule order is load-bearing: a regressing start also satisfies rule 3's
/// predicate, so rule 2 must be checked first.
public func reconcile(_ markers: [SpokenWordBoundary]) -> ReconcileResult {
    var out: [SpokenWordBoundary] = []
    var duplicates = 0
    var merges = 0
    var drops = 0

    for marker in markers {
        guard let last = out.last else {
            out.append(marker)
            continue
        }
        let lastEnd = last.range.location + last.range.length

        if marker.range.location == last.range.location && marker.byteOffset == last.byteOffset {
            duplicates += 1
            let end = max(lastEnd, marker.range.location + marker.range.length)
            out[out.count - 1] = SpokenWordBoundary(
                range: NSRange(location: last.range.location, length: end - last.range.location),
                byteOffset: last.byteOffset)
            continue
        }
        if marker.range.location < last.range.location {
            drops += 1
            continue
        }
        if marker.range.location < lastEnd {
            merges += 1
            let end = max(lastEnd, marker.range.location + marker.range.length)
            out[out.count - 1] = SpokenWordBoundary(
                range: NSRange(location: last.range.location, length: end - last.range.location),
                byteOffset: min(last.byteOffset, marker.byteOffset))
            continue
        }
        out.append(marker)
    }

    return ReconcileResult(
        boundaries: out, duplicatesCollapsed: duplicates,
        overlapsMerged: merges, regressionsDropped: drops)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd scripts/avspeech-spike && swift test`
Expected: all ChunkingTests + ReconcileTests PASS (12 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/avspeech-spike
git commit -m "feat(tts): three-rule marker reconciliation pass in SpikeCore (#173)"
```

---

### Task 3: Migrate the executable to the marker API

**Files:**
- Modify: `scripts/avspeech-spike/Sources/avspeech-spike/main.swift` (full rewrite below)
- Create: `scripts/avspeech-spike/fixtures/credit-cards.txt`
- Create: `scripts/avspeech-spike/fixtures/hud-phone.txt`

**Interfaces:**
- Consumes: `chunkText(_:maxUTF16Length:) -> [TextChunk]`, `reconcile(_:) -> ReconcileResult`, `SpokenWordBoundary` from `SpikeCore` (Tasks 1–2).
- Produces: `dist/tts-spike/avspeech-spike.caf` (audio) and `dist/tts-spike/avspeech-boundaries.json` — an array of `{ "text": String, "textOffset": Int, "wordLength": Int, "clipBeginSeconds": Double }`, offsets in UTF-16 units into the input text, sorted ascending. This JSON shape is what a future `smil.ts` adapter consumes (`audioOffsetTicks = clipBeginSeconds × 10⁷`; `durationTicks` from the next record's `clipBegin`).

- [ ] **Step 1: Create the reproduction fixtures**

`fixtures/credit-cards.txt` (one line, no trailing newline needed):

```
This caps interest on pre-service debts, mortgages, credit cards, auto loans, at 6% with written notice to the creditor.
```

`fixtures/hud-phone.txt`:

```
...service animal or accommodation request, file with HUD (1-800-669-9777) or your local fair housing office.
```

- [ ] **Step 2: Replace main.swift**

Full replacement (keeps `sampleText`, voice resolution, and arg parsing; replaces the delegate/synthesis/verification sections):

```swift
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
        for marker in markers where marker.mark == .word {
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

let result = reconcile(rawMarkers)
let boundaries = result.boundaries
let nsText = text as NSString
let wordCount = text.split(whereSeparator: { !$0.isLetter && !$0.isNumber }).filter { !$0.isEmpty }.count

print("\n\(rawMarkers.count) raw word markers → \(boundaries.count) reconciled boundaries (~\(wordCount) words in source text).")
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
```

- [ ] **Step 3: Verify against the built-in sample**

Run: `cd scripts/avspeech-spike && swift run avspeech-spike`
Expected: PASS; ~40 boundaries; reconciliation counts `0 duplicate tokenizations collapsed, 0 split tokens merged, 0 regressing re-reports dropped`; `dist/tts-spike/avspeech-boundaries.json` exists and its `textOffset` values slice the sample text to the printed words.

- [ ] **Step 4: Verify against both reproduction fixtures**

Run: `swift run avspeech-spike fixtures/credit-cards.txt`
Expected: PASS with `1 duplicate tokenizations collapsed` (the `credit cards,` double-report).

Run: `swift run avspeech-spike fixtures/hud-phone.txt`
Expected: PASS with `1 duplicate tokenizations collapsed, 1 split tokens merged` (the `request,` duplicate and the `(1-800` / `1-800-669-9777)` phone split).

These previously FAILED the delegate spike's overlap check — that flip is the point of the migration.

- [ ] **Step 5: Commit**

```bash
git add scripts/avspeech-spike
git commit -m "feat(tts): migrate spike to marker API with reconciliation and JSON output (#173)"
```

---

### Task 4: Full-chapter verification and README rewrite

**Files:**
- Modify: `scripts/avspeech-spike/README.md`

**Interfaces:**
- Consumes: the Task 3 executable and its printed reconciliation counts.
- Produces: documentation only.

- [ ] **Step 1: Run the slow full-chapter check**

Export the chapter as plain text and run the spike over it:

```bash
cd "$(git rev-parse --show-toplevel)"
node -e "
const { parse, renderHTML } = require('@djot/djot');
const fs = require('fs');
const src = fs.readFileSync('src/content/02-field-guide/04-home/index.dj', 'utf8');
const html = renderHTML(parse(src.replace(/^---\n[\s\S]*?\n---\n/, '')));
fs.mkdirSync('dist/tts-spike', { recursive: true });
fs.writeFileSync('dist/tts-spike/chapter-home.txt', html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&quot;/g, '\"').replace(/&#39;/g, \"'\").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').replace(/\n{2,}/g, '\n').trim());
"
cd scripts/avspeech-spike && swift run -c release avspeech-spike ../../dist/tts-spike/chapter-home.txt
```

Expected: PASS in ~2 minutes of synthesis. Reconciliation counts in the measured neighborhood of the #173 investigation (7 duplicates / ~55 merges / ~2 drops for ~7,500 words — counts drifting by an order of magnitude mean the OS changed underneath us and warrant a fresh look, not a shrug). Note: the merge count is inflated by endnote backlink `↩` glyphs this crude export keeps; that's expected.

- [ ] **Step 2: Rewrite the README's Results, "What it checks", and "Known gaps" sections**

Replace the delegate-era prose so the README reflects: the marker API and why (byte offsets → SMIL clip times, which the delegate never provided); the service-level ceiling (delegate AND markers, multiple engines) and the chunking workaround with the zero-marker canary; the three-rule reconciliation and why it is not papering over findings (audio monotonicity as ground truth); the IPA-attribute acronym result; the JSON output shape and path; updated build/run examples including the fixtures; and the still-open gaps (enhanced/premium voice marker support untested — no such voice installed; ceiling stability across OS versions; CI/reproducibility story). Keep the existing tone and the "necessary, not sufficient" framing. Cite #173 and the design doc rather than restating every measurement.

- [ ] **Step 3: Commit**

```bash
git add scripts/avspeech-spike/README.md
git commit -m "docs(tts): document the marker-API spike results and reconciliation (#173)"
```

---

### Task 5: Acronym table and IPA export in the SSML lexicon (TDD)

**Files:**
- Modify: `build/audio/ssml-lexicon.ts`
- Test: `build/audio/ssml-lexicon.test.ts`

**Interfaces:**
- Consumes: existing `LexiconRule`, `RULES`, `findLexiconMatches`, `applySsmlLexicon` internals of `ssml-lexicon.ts`.
- Produces:

```ts
export interface IpaMatch {
  charStart: number;  // [charStart, charEnd) into the source text
  charEnd: number;
  original: string;
  ipa: string;        // for AVSpeechSynthesisIPANotationAttribute
}
export function findIpaMatches(text: string): IpaMatch[];
```

Azure consumers are unchanged: acronyms flow into `findLexiconMatches`/`applySsmlLexicon` as ordinary `<sub alias>` rules.

- [ ] **Step 1: Write the failing tests**

Append to `build/audio/ssml-lexicon.test.ts` (and add `findIpaMatches` to the import from `./ssml-lexicon.js`):

```ts
describe('acronym rules', () => {
  it('substitutes word-read acronyms for the Azure path', () => {
    const text = 'File with HUD, then check FEMA and OSHA guidance on SNAP benefits.';
    const matches = findLexiconMatches(text);
    expect(matches.map((m) => [m.original, m.alias])).toEqual([
      ['HUD', 'hud'],
      ['FEMA', 'fema'],
      ['OSHA', 'osha'],
      ['SNAP', 'snap'],
    ]);
  });

  it('renders an acronym as a sub alias in SSML', () => {
    expect(applySsmlLexicon('File with HUD promptly.')).toBe(
      'File with <sub alias="hud">HUD</sub> promptly.',
    );
  });

  it('leaves spelled-out acronyms alone', () => {
    // These are conventionally read letter-by-letter — no entry, no match.
    expect(findLexiconMatches('The IRS, CFPB, and VA disagree about AI.')).toEqual([]);
  });

  it('does not match lowercase or partial-word occurrences', () => {
    expect(findLexiconMatches('a hudson snapshot of osha-like rules')).toEqual([]);
  });
});

describe('findIpaMatches', () => {
  it('reports IPA notations with offsets that slice back to the original text', () => {
    const text = 'File with HUD, then check FEMA and OSHA guidance on SNAP benefits.';
    const matches = findIpaMatches(text);
    expect(matches.map((m) => [m.original, m.ipa])).toEqual([
      ['HUD', 'hʌd'],
      ['FEMA', 'ˈfimə'],
      ['OSHA', 'ˈoʊʃə'],
      ['SNAP', 'snæp'],
    ]);
    for (const match of matches) {
      expect(text.slice(match.charStart, match.charEnd)).toBe(match.original);
    }
  });

  it('returns matches sorted by position', () => {
    const matches = findIpaMatches('OSHA first, HUD second.');
    expect(matches.map((m) => m.original)).toEqual(['OSHA', 'HUD']);
  });

  it('ignores proper nouns and episode citations — IPA is acronyms-only for now', () => {
    // Djot/ePub/Jeeves realizations for the AVSpeech path are deliberately
    // deferred until that engine path graduates from spike to pipeline
    // (design doc §5).
    expect(findIpaMatches('Jeeves read the Djot source of Seinfeld:S3E3.')).toEqual([]);
  });

  it('finds nothing in text without acronyms', () => {
    expect(findIpaMatches('a perfectly ordinary sentence')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- build/audio/ssml-lexicon.test.ts`
Expected: FAIL — `findIpaMatches` is not exported; acronym alias assertions fail.

- [ ] **Step 3: Implement the acronym table and findIpaMatches**

In `build/audio/ssml-lexicon.ts`, after `PROPER_NOUN_RULES`, add:

```ts
/**
 * Acronyms conventionally read as words that at least one target engine
 * spells out letter-by-letter (AVSpeechSynthesizer reads "HUD" as
 * "H-U-D" — measured in #173). Engine-neutral table, realized two ways:
 * `alias` feeds the Azure `<sub>` path via RULES below; `ipa` feeds the
 * AVSpeech path via `findIpaMatches` (applied as
 * AVSpeechSynthesisIPANotationAttribute ranges, which leave the source
 * text — and therefore every boundary offset — untouched).
 *
 * Spelled-out acronyms (IRS, CFPB, VA, AI…) are correct as-is and must
 * NOT get entries.
 */
interface AcronymEntry {
  /** Must include the global flag. */
  pattern: RegExp;
  alias: string;
  ipa: string;
}

const ACRONYM_ENTRIES: AcronymEntry[] = [
  { pattern: /\bHUD\b/g, alias: 'hud', ipa: 'hʌd' },
  { pattern: /\bFEMA\b/g, alias: 'fema', ipa: 'ˈfimə' },
  { pattern: /\bOSHA\b/g, alias: 'osha', ipa: 'ˈoʊʃə' },
  { pattern: /\bSNAP\b/g, alias: 'snap', ipa: 'snæp' },
];

const ACRONYM_RULES: LexiconRule[] = ACRONYM_ENTRIES.map((entry) => ({
  pattern: entry.pattern,
  alias: () => entry.alias,
}));
```

Change the `RULES` assembly to include them:

```ts
const RULES: LexiconRule[] = [...PROPER_NOUN_RULES, ...ACRONYM_RULES, EPISODE_REFERENCE_RULE];
```

Add the IPA export after `findLexiconMatches`:

```ts
export interface IpaMatch {
  /** Character offsets into the source text, [charStart, charEnd). */
  charStart: number;
  charEnd: number;
  original: string;
  /** IPA notation for AVSpeechSynthesisIPANotationAttribute. */
  ipa: string;
}

/**
 * Find every acronym occurrence in `text` for the AVSpeech path, left to
 * right. Acronym patterns are mutually exclusive by construction, so no
 * claimed-span bookkeeping is needed here.
 */
export function findIpaMatches(text: string): IpaMatch[] {
  const matches: IpaMatch[] = [];
  for (const entry of ACRONYM_ENTRIES) {
    const re = new RegExp(entry.pattern.source, entry.pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = re.exec(text))) {
      matches.push({
        charStart: match.index,
        charEnd: match.index + match[0].length,
        original: match[0],
        ipa: entry.ipa,
      });
    }
  }
  return matches.sort((a, b) => a.charStart - b.charStart);
}
```

- [ ] **Step 4: Run the full TypeScript test suite**

Run: `npm test`
Expected: all tests PASS, including the pre-existing lexicon tests (the acronym rules must not disturb proper-noun or episode matching).

- [ ] **Step 5: Commit**

```bash
git add build/audio/ssml-lexicon.ts build/audio/ssml-lexicon.test.ts
git commit -m "feat(audio): engine-neutral acronym lexicon with IPA export (#173)"
```

---

## Out of scope (tracked in the design doc)

- Enhanced/premium voice marker check (blocked on a manual voice download).
- Azure "HUD" default-behavior test (blocked on `SPEECH_KEY`).
- Apple Feedback filing for the ceiling.
- A `smil.ts` adapter for `avspeech-boundaries.json` (pipeline integration, #167) and IPA realizations for proper nouns/episode citations.
