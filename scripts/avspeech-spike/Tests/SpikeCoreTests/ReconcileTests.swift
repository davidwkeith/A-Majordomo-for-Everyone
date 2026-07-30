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

final class FilterSpeakableBoundariesTests: XCTestCase {
    private func b(_ location: Int, _ length: Int, _ offset: Int) -> SpokenWordBoundary {
        SpokenWordBoundary(range: NSRange(location: location, length: length), byteOffset: offset)
    }

    func testDropsPunctuationOnlyBoundariesAndReportsTheCount() {
        // "Trades — plumbing" : "Trades" [0,6), "—" [7,8), "plumbing" [9,17)
        let text = "Trades — plumbing" as NSString
        let markers = [b(0, 6, 0), b(7, 1, 1000), b(9, 8, 2000)]
        let result = filterSpeakableBoundaries(markers, sourceText: text)
        XCTAssertEqual(result.kept, [b(0, 6, 0), b(9, 8, 2000)])
        XCTAssertEqual(result.droppedCount, 1)
    }

    func testKeepsAlphanumericTokensIncludingSingleDigitsAndHyphenatedWords() {
        let text = "top-notch 4 you" as NSString
        let markers = [b(0, 9, 0), b(10, 1, 100), b(12, 3, 200)]
        let result = filterSpeakableBoundaries(markers, sourceText: text)
        XCTAssertEqual(result.kept, markers)
        XCTAssertEqual(result.droppedCount, 0)
    }

    func testDropsEachPunctuationVarietyObservedInTheFullChapterCrossCheck() {
        // Every symbol the 04-home live run's cross-check flagged as
        // unmatched before this filter existed: em dash, slash, ampersand,
        // section mark(s), plus sign, parenthesis, list-bullet hyphen, and
        // the literal triple-hyphen separator. Each is interleaved with a
        // speakable "w" boundary, built up token by token so the recorded
        // offsets always match the actual backing string.
        let punctuationTokens = ["—", "/", "&", "§", "§§", "+", "(", "-", "---"]
        var markers: [SpokenWordBoundary] = []
        var text = ""
        var nextOffset = 0
        for token in punctuationTokens {
            markers.append(b((text as NSString).length, 1, nextOffset))
            text += "w"
            nextOffset += 100
            markers.append(b((text as NSString).length, (token as NSString).length, nextOffset))
            text += token
            nextOffset += 100
        }
        let nsText = text as NSString

        let result = filterSpeakableBoundaries(markers, sourceText: nsText)
        XCTAssertEqual(result.kept.count, punctuationTokens.count) // only the "w" boundaries survive
        XCTAssertEqual(result.droppedCount, punctuationTokens.count)
        for boundary in result.kept {
            XCTAssertEqual(nsText.substring(with: boundary.range), "w")
        }
    }

    func testEmptyInputYieldsEmptyResult() {
        let result = filterSpeakableBoundaries([], sourceText: "" as NSString)
        XCTAssertTrue(result.kept.isEmpty)
        XCTAssertEqual(result.droppedCount, 0)
    }
}

final class ValidateBoundariesTests: XCTestCase {
    private func b(_ location: Int, _ length: Int, _ offset: Int) -> SpokenWordBoundary {
        SpokenWordBoundary(range: NSRange(location: location, length: length), byteOffset: offset)
    }

    func testCleanListHasNoProblems() {
        let problems = validateBoundaries([b(0, 3, 0), b(4, 5, 100), b(10, 2, 250)], totalUTF16Length: 12)
        XCTAssertEqual(problems, [])
    }

    func testEmptyListIsValid() {
        XCTAssertEqual(validateBoundaries([], totalUTF16Length: 0), [])
    }

    func testFlagsRangePastEndOfText() {
        let problems = validateBoundaries([b(0, 3, 0), b(10, 5, 100)], totalUTF16Length: 12)
        XCTAssertEqual(problems.count, 1)
        XCTAssertTrue(problems[0].contains("outside the chapter text"))
    }

    func testFlagsOverlap() {
        let problems = validateBoundaries([b(0, 5, 0), b(3, 4, 100)], totalUTF16Length: 20)
        XCTAssertEqual(problems.count, 1)
        XCTAssertTrue(problems[0].contains("inside the previous boundary"))
    }

    func testFlagsTextRegressionAndOverlapTogether() {
        let problems = validateBoundaries([b(10, 3, 0), b(2, 3, 100)], totalUTF16Length: 20)
        XCTAssertEqual(problems.count, 2)
        XCTAssertTrue(problems.contains { $0.contains("regressed behind the previous start") })
    }

    func testFlagsAudioRegression() {
        let problems = validateBoundaries([b(0, 3, 500), b(4, 3, 100)], totalUTF16Length: 20)
        XCTAssertEqual(problems.count, 1)
        XCTAssertTrue(problems[0].contains("audio offset"))
    }
}
