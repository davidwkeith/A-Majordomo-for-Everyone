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
