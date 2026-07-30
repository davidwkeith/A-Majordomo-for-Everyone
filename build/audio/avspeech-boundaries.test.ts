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
  it('filters out degenerate records with identical adjacent clipBeginSeconds', () => {
    const degenerate: AvspeechBoundaryFile = {
      totalDurationSeconds: 2.5,
      boundaries: [
        { text: 'Hello', textOffset: 0, wordLength: 5, clipBeginSeconds: 0.1 },
        { text: 'phantom', textOffset: 6, wordLength: 7, clipBeginSeconds: 0.1 }, // Same as previous
        { text: 'world', textOffset: 14, wordLength: 5, clipBeginSeconds: 0.9 },
      ],
    };
    const records = toWordBoundaryRecords(degenerate);
    // Hello has durationTicks = 0 (0.1s to 0.1s, until phantom), so it's filtered out
    // phantom survives and runs from 0.1s to 0.9s (8_000_000 ticks)
    // world survives and runs from 0.9s to 2.5s (16_000_000 ticks)
    expect(records.length).toBe(2);
    expect(records.map((r) => r.text)).toEqual(['phantom', 'world']);
    expect(records[0]).toMatchObject({
      text: 'phantom',
      audioOffsetTicks: 1_000_000,
      durationTicks: 8_000_000,
    });
    expect(records[1]).toMatchObject({
      text: 'world',
      audioOffsetTicks: 9_000_000,
      durationTicks: 16_000_000,
    });
  });
  it('verifies normal case still works after filtering degenerate records', () => {
    const normal: AvspeechBoundaryFile = {
      totalDurationSeconds: 1.0,
      boundaries: [
        { text: 'Test', textOffset: 0, wordLength: 4, clipBeginSeconds: 0.0 },
        { text: 'case', textOffset: 5, wordLength: 4, clipBeginSeconds: 0.5 },
      ],
    };
    const records = toWordBoundaryRecords(normal);
    expect(records.length).toBe(2);
    expect(records[0]).toMatchObject({
      text: 'Test',
      audioOffsetTicks: 0,
      durationTicks: 5_000_000,
    });
    expect(records[1]).toMatchObject({
      text: 'case',
      audioOffsetTicks: 5_000_000,
      durationTicks: 5_000_000,
    });
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
