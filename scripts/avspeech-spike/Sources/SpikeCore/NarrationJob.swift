import Foundation

/// Job specification consumed by the `narrate` executable: one chapter,
/// ordered voice segments whose concatenated text is the chapter's
/// narratable text (the TS orchestrator guarantees and asserts this).
public struct IpaRange: Codable, Equatable {
    /// UTF-16 offsets into the segment's own text.
    public let start: Int
    public let length: Int
    public let notation: String
    public init(start: Int, length: Int, notation: String) {
        self.start = start; self.length = length; self.notation = notation
    }
}

public struct NarrationSegment: Codable, Equatable {
    public let voiceId: String
    public let text: String
    public let ipa: [IpaRange]
    public init(voiceId: String, text: String, ipa: [IpaRange]) {
        self.voiceId = voiceId; self.text = text; self.ipa = ipa
    }
}

public struct NarrationJob: Codable, Equatable {
    public let audioOutput: String
    public let segments: [NarrationSegment]
    public init(audioOutput: String, segments: [NarrationSegment]) {
        self.audioOutput = audioOutput; self.segments = segments
    }
}

public struct ChapterBoundary: Codable, Equatable {
    public let text: String
    /// UTF-16 offset into the whole chapter's narratable text.
    public let textOffset: Int
    public let wordLength: Int
    public let clipBeginSeconds: Double
    public init(text: String, textOffset: Int, wordLength: Int, clipBeginSeconds: Double) {
        self.text = text; self.textOffset = textOffset
        self.wordLength = wordLength; self.clipBeginSeconds = clipBeginSeconds
    }
}

public struct BoundaryOutput: Codable, Equatable {
    public let totalDurationSeconds: Double
    public let boundaries: [ChapterBoundary]
    public init(totalDurationSeconds: Double, boundaries: [ChapterBoundary]) {
        self.totalDurationSeconds = totalDurationSeconds; self.boundaries = boundaries
    }
}

/// Marker byte offsets are relative to the *native* PCM stream of the
/// chunk that produced them; audio accumulates in the converted output
/// format. Converting to seconds at the native rate before adding the
/// accumulated output time keeps the two clocks consistent.
public func markerSeconds(byteOffset: Int, bytesPerFrame: Int, sampleRate: Double, accumulatedSeconds: Double) -> Double {
    accumulatedSeconds + Double(byteOffset) / Double(bytesPerFrame) / sampleRate
}

/// Wordless segments (pure punctuation/whitespace between voice spans)
/// are skipped by the CLI — synthesizing them would trip the zero-marker
/// ceiling canary, and there is nothing to say.
public func hasSpeakableContent(_ text: String) -> Bool {
    text.unicodeScalars.contains { CharacterSet.alphanumerics.contains($0) }
}
