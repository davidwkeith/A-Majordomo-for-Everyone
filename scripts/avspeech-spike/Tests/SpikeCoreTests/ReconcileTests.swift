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
