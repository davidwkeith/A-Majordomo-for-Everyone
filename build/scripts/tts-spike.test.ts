import { describe, it, expect } from 'vitest';
import { verifyWordBoundaries } from './tts-spike.js';

describe('verifyWordBoundaries', () => {
  it('passes when offsets line up with the source text', () => {
    const text = 'Jeeves considered the matter.';
    const boundaries = [
      { text: 'Jeeves', textOffset: 0, wordLength: 6, audioOffsetTicks: 0, durationTicks: 100 },
      { text: 'considered', textOffset: 7, wordLength: 10, audioOffsetTicks: 100, durationTicks: 100 },
    ];
    expect(verifyWordBoundaries(text, boundaries)).toEqual([]);
  });

  it('flags drift after a smart-typography character', () => {
    // Simulates the failure mode this spike exists to catch: an em dash
    // counted as more than one UTF-16 code unit upstream shifts every
    // subsequent offset by one.
    const text = 'a delicate situation"—the sort that wants patience.';
    const boundaries = [
      { text: 'situation', textOffset: 11, wordLength: 9, audioOffsetTicks: 0, durationTicks: 100 },
      // Drifted by one: should be 22 ("the"), reported as 23.
      { text: 'the', textOffset: 23, wordLength: 3, audioOffsetTicks: 100, durationTicks: 100 },
    ];
    const mismatches = verifyWordBoundaries(text, boundaries);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0].expected).not.toBe('the');
  });

  it('flags an offset that runs past the end of the string', () => {
    const text = 'short';
    const boundaries = [
      { text: 'short', textOffset: 10, wordLength: 5, audioOffsetTicks: 0, durationTicks: 100 },
    ];
    const mismatches = verifyWordBoundaries(text, boundaries);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0].expected).toBe('');
  });
});
