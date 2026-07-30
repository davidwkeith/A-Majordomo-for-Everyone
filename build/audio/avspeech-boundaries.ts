/**
 * Adapter from the `scripts/narrate` Swift CLI's boundary JSON to
 * smil.ts's WordBoundaryRecord shape.
 *
 * Markers carry no durations, so each word's clip runs to the next
 * word's clipBegin (the last to total duration) — contiguous clips are
 * what read-along SMIL wants; gaps would flicker the highlight off
 * between words.
 */
import type { WordBoundaryRecord } from './smil.js';
import type { WordFragment } from './word-fragments.js';

const TICKS_PER_SECOND = 10_000_000;

export interface AvspeechBoundary {
  text: string;
  /** UTF-16 offset into the chapter narratable text. */
  textOffset: number;
  wordLength: number;
  clipBeginSeconds: number;
}

export interface AvspeechBoundaryFile {
  totalDurationSeconds: number;
  boundaries: AvspeechBoundary[];
}

export function toWordBoundaryRecords(file: AvspeechBoundaryFile): WordBoundaryRecord[] {
  return file.boundaries
    .map((b, i) => {
      const next = file.boundaries[i + 1];
      const clipEndSeconds = next ? next.clipBeginSeconds : file.totalDurationSeconds;
      const audioOffsetTicks = Math.round(b.clipBeginSeconds * TICKS_PER_SECOND);
      return {
        text: b.text,
        textOffset: b.textOffset,
        wordLength: b.wordLength,
        audioOffsetTicks,
        durationTicks: Math.round(clipEndSeconds * TICKS_PER_SECOND) - audioOffsetTicks,
      };
    })
    .filter((record) => {
      // Degenerate clip (durationTicks <= 0) can arise when two boundaries
      // share the same or very close audio offsets (e.g., from partial
      // reconciliation in the Swift generator). Skip the highlight rather
      // than emit a zero-length or negative <par>; missing a highlight is
      // less disruptive than wrong timing in read-along SMIL.
      return record.durationTicks > 0;
    });
}

/**
 * #167's "validate real boundary output against fragment offsets", as a
 * permanent pipeline property: every boundary should overlap a fragment.
 * The caller applies the failure threshold.
 */
export function crossCheckBoundaries(
  fragments: WordFragment[],
  boundaries: AvspeechBoundary[],
): { matched: number; unmatched: AvspeechBoundary[] } {
  const unmatched: AvspeechBoundary[] = [];
  let matched = 0;
  let cursor = 0; // fragments and boundaries are both text-ordered
  for (const b of boundaries) {
    const end = b.textOffset + b.wordLength;
    while (cursor < fragments.length && fragments[cursor].charEnd <= b.textOffset) cursor++;
    const f = fragments[cursor];
    if (f && f.charStart < end && f.charEnd > b.textOffset) matched++;
    else unmatched.push(b);
  }
  return { matched, unmatched };
}
