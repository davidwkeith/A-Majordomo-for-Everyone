import { describe, it, expect } from 'vitest';
import { toWordBoundaryRecords, crossCheckBoundaries } from './avspeech-boundaries.js';
import type { AvspeechBoundaryFile } from './avspeech-boundaries.js';

const file: AvspeechBoundaryFile = {
  totalDurationSeconds: 2.5,
  boundaries: [
    { text: 'Hello', textOffset: 0, wordLength: 5, clipBeginSeconds: 0.1 },
    { text: 'world', textOffset: 6, wordLength: 5, clipBeginSeconds: 0.9 },
  ],
};

describe('toWordBoundaryRecords', () => {
  it('converts seconds to ticks and derives contiguous durations', () => {
    const records = toWordBoundaryRecords(file);
    expect(records).toEqual([
      { text: 'Hello', textOffset: 0, wordLength: 5, audioOffsetTicks: 1_000_000, durationTicks: 8_000_000 },
      { text: 'world', textOffset: 6, wordLength: 5, audioOffsetTicks: 9_000_000, durationTicks: 16_000_000 },
    ]);
  });
  it('handles an empty boundary list', () => {
    expect(toWordBoundaryRecords({ totalDurationSeconds: 0, boundaries: [] })).toEqual([]);
  });
});

describe('crossCheckBoundaries', () => {
  const fragments = [
    { id: 'w1', text: 'Hello', charStart: 0, charEnd: 5 },
    { id: 'w2', text: 'world', charStart: 6, charEnd: 11 },
  ];
  it('matches overlapping boundaries and reports the rest', () => {
    const { matched, unmatched } = crossCheckBoundaries(fragments, [
      ...file.boundaries,
      { text: 'ghost', textOffset: 50, wordLength: 5, clipBeginSeconds: 2.0 },
    ]);
    expect(matched).toBe(2);
    expect(unmatched.map((b) => b.text)).toEqual(['ghost']);
  });
});
