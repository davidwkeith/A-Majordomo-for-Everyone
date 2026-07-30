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

/// Post-reconciliation invariants, shared by the spike and the `narrate`
/// CLI: every boundary must index into the source text, boundaries must not
/// overlap, and both axes (text start, audio offset) must advance
/// monotonically. Returns one human-readable message per violation; an
/// empty array means the list is safe to emit as SMIL clip times.
///
/// This is deliberately separate from `reconcile` — reconcile *resolves*
/// known tokenizer noise, this *proves* nothing unresolved slipped through.
public func validateBoundaries(_ boundaries: [SpokenWordBoundary], totalUTF16Length: Int) -> [String] {
    var problems: [String] = []
    var previousEnd = 0
    var previousStart = -1
    var previousOffset = -1

    for (index, boundary) in boundaries.enumerated() {
        let start = boundary.range.location
        let end = start + boundary.range.length
        if start < 0 || end > totalUTF16Length {
            problems.append(
                "boundary \(index) range [\(start), \(end)) falls outside the chapter text "
                    + "(0..<\(totalUTF16Length))")
        }
        if start < previousEnd {
            problems.append(
                "boundary \(index) starts at \(start), inside the previous boundary "
                    + "which ends at \(previousEnd)")
        }
        if start < previousStart {
            problems.append(
                "boundary \(index) text start \(start) regressed behind the previous start "
                    + "\(previousStart)")
        }
        if boundary.byteOffset < previousOffset {
            problems.append(
                "boundary \(index) audio offset \(boundary.byteOffset) regressed behind the "
                    + "previous offset \(previousOffset)")
        }
        previousEnd = max(previousEnd, end)
        previousStart = max(previousStart, start)
        previousOffset = boundary.byteOffset
    }
    return problems
}
