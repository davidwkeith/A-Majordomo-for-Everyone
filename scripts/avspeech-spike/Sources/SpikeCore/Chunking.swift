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
