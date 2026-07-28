import { describe, it, expect } from 'vitest';
import { buildSmil, formatClockValue } from './smil.js';
import type { WordFragment } from './word-fragments.js';
import type { WordBoundaryRecord } from './smil.js';

describe('formatClockValue', () => {
  it('formats sub-second offsets', () => {
    expect(formatClockValue(0)).toBe('0:00:00.000');
    expect(formatClockValue(1.23)).toBe('0:00:01.230');
  });

  it('formats offsets past a minute and an hour', () => {
    expect(formatClockValue(75.5)).toBe('0:01:15.500');
    expect(formatClockValue(3661.004)).toBe('1:01:01.004');
  });
});

describe('buildSmil', () => {
  const fragments: WordFragment[] = [
    { id: 'w1', text: 'Jeeves', charStart: 0, charEnd: 6 },
    { id: 'w2', text: 'considered', charStart: 7, charEnd: 17 },
  ];

  const boundaries: WordBoundaryRecord[] = [
    { text: 'Jeeves', textOffset: 0, wordLength: 6, audioOffsetTicks: 0, durationTicks: 3_000_000 },
    { text: 'considered', textOffset: 7, wordLength: 10, audioOffsetTicks: 3_500_000, durationTicks: 5_000_000 },
  ];

  it('emits one <par> per matched boundary with clip times converted from ticks', () => {
    const smil = buildSmil(fragments, boundaries, {
      chapterId: 'ch03',
      textSrc: 'ch03.xhtml',
      audioSrc: 'ch03.mp3',
    });

    expect(smil).toContain('<seq id="seq-ch03" epub:textref="ch03.xhtml">');
    expect(smil).toContain('<par id="par-w1">');
    expect(smil).toContain('<text src="ch03.xhtml#w1"/>');
    expect(smil).toContain('<audio src="ch03.mp3" clipBegin="0:00:00.000" clipEnd="0:00:00.300"/>');
    expect(smil).toContain('<par id="par-w2">');
    expect(smil).toContain('clipBegin="0:00:00.350" clipEnd="0:00:00.850"');
  });

  it('skips fragments with no matching WordBoundary rather than guessing timing', () => {
    const smil = buildSmil(fragments, [boundaries[0]], {
      chapterId: 'ch03',
      textSrc: 'ch03.xhtml',
      audioSrc: 'ch03.mp3',
    });

    expect(smil).toContain('par-w1');
    expect(smil).not.toContain('par-w2');
  });

  it('produces a valid empty <seq> when there are no boundaries', () => {
    const smil = buildSmil(fragments, [], { chapterId: 'ch03', textSrc: 'ch03.xhtml', audioSrc: 'ch03.mp3' });
    expect(smil).toContain('<seq id="seq-ch03" epub:textref="ch03.xhtml">');
    expect(smil).toContain('</seq>');
    expect(smil).not.toContain('<par');
  });

  it('escapes XML-sensitive characters in ids and file names', () => {
    const smil = buildSmil(
      [{ id: 'w1', text: 'a', charStart: 0, charEnd: 1 }],
      [{ text: 'a', textOffset: 0, wordLength: 1, audioOffsetTicks: 0, durationTicks: 1 }],
      { chapterId: 'ch"1', textSrc: 'a&b.xhtml', audioSrc: 'a&b.mp3' },
    );
    expect(smil).toContain('seq-ch&quot;1');
    expect(smil).toContain('a&amp;b.xhtml');
  });
});
