import { describe, it, expect } from 'vitest';
import { buildSmil, formatClockValue } from './smil.js';
import type { WordFragment } from './word-fragments.js';
import type { WordBoundaryRecord } from './smil.js';
import type { EscapableGroup } from './escapable-groups.js';

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

describe('buildSmil with escapable groups', () => {
  // "Before" (w1), a callout ("w2 w3"), "after" (w4) — the callout's pars
  // should nest inside their own <seq>, the rest stay flat.
  const fragments: WordFragment[] = [
    { id: 'w1', text: 'Before', charStart: 0, charEnd: 6 },
    { id: 'w2', text: 'Add', charStart: 7, charEnd: 10 },
    { id: 'w3', text: 'context', charStart: 11, charEnd: 18 },
    { id: 'w4', text: 'After', charStart: 19, charEnd: 24 },
  ];
  const boundaries: WordBoundaryRecord[] = fragments.map((f, i) => ({
    text: f.text,
    textOffset: f.charStart,
    wordLength: f.text.length,
    audioOffsetTicks: i * 1_000_000,
    durationTicks: 500_000,
  }));
  const groups: EscapableGroup[] = [{ id: 'callout-1', epubType: 'sidebar', fragmentIds: ['w2', 'w3'] }];
  const options = { chapterId: 'ch03', textSrc: 'ch03.xhtml', audioSrc: 'ch03.mp3' };

  it('nests a group\'s pars inside a <seq epub:type> matching its structure', () => {
    const smil = buildSmil(fragments, boundaries, options, groups);
    expect(smil).toContain('<seq id="seq-callout-1" epub:type="sidebar">');

    const seqOpen = smil.indexOf('<seq id="seq-callout-1"');
    const seqClose = smil.indexOf('</seq>', seqOpen);
    const nested = smil.slice(seqOpen, seqClose);
    expect(nested).toContain('par-w2');
    expect(nested).toContain('par-w3');
    expect(nested).not.toContain('par-w1');
    expect(nested).not.toContain('par-w4');
  });

  it('leaves ungrouped fragments as direct children of the chapter <seq>', () => {
    const smil = buildSmil(fragments, boundaries, options, groups);
    const chapterSeqOpen = smil.indexOf('<seq id="seq-ch03"');
    const groupSeqOpen = smil.indexOf('<seq id="seq-callout-1"');
    // w1 appears before the nested group opens; w4 appears after it closes.
    expect(smil.indexOf('par-w1')).toBeGreaterThan(chapterSeqOpen);
    expect(smil.indexOf('par-w1')).toBeLessThan(groupSeqOpen);
    const groupSeqClose = smil.indexOf('</seq>', groupSeqOpen);
    expect(smil.indexOf('par-w4')).toBeGreaterThan(groupSeqClose);
  });

  it('produces balanced <seq>...</seq> nesting (one chapter seq, one group seq)', () => {
    const smil = buildSmil(fragments, boundaries, options, groups);
    const opens = (smil.match(/<seq\b/g) ?? []).length;
    const closes = (smil.match(/<\/seq>/g) ?? []).length;
    expect(opens).toBe(2);
    expect(closes).toBe(2);
  });

  it('gives each of two separate groups its own <seq>', () => {
    const twoGroups: EscapableGroup[] = [
      { id: 'callout-1', epubType: 'sidebar', fragmentIds: ['w2'] },
      { id: 'callout-2', epubType: 'sidebar', fragmentIds: ['w4'] },
    ];
    const smil = buildSmil(fragments, boundaries, options, twoGroups);
    expect(smil).toContain('<seq id="seq-callout-1" epub:type="sidebar">');
    expect(smil).toContain('<seq id="seq-callout-2" epub:type="sidebar">');
    expect((smil.match(/<seq\b/g) ?? []).length).toBe(3); // chapter + two groups
  });

  it('behaves exactly as before when no groups are passed', () => {
    const withEmpty = buildSmil(fragments, boundaries, options, []);
    const withDefault = buildSmil(fragments, boundaries, options);
    expect(withEmpty).toBe(withDefault);
    expect(withEmpty).not.toContain('epub:type="sidebar"');
  });
});
