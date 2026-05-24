import { describe, it, expect } from 'vitest';
import { render, nsdateToDate, deriveTitle } from './render.js';
import type { Annotation } from './types.js';
import { GITHUB_BODY_MAX } from './types.js';

const sample: Annotation = {
  uuid: '4F3A-AB12-B891',
  selectedText: 'A library is a building; a life is a way of living.',
  note: 'fix this metaphor about libraries',
  chapter: '01-introduction',
  modifiedAt: new Date('2026-05-23T14:11:00Z'),
};

describe('nsdateToDate', () => {
  it('converts Core Data NSDate seconds to a JS Date', () => {
    expect(nsdateToDate(0).toISOString()).toBe('2001-01-01T00:00:00.000Z');
  });

  it('converts a real-world NSDate to the expected year', () => {
    const d = nsdateToDate(800_000_000);
    expect(d.getUTCFullYear()).toBe(2026);
  });

  it('round-trips a known modification date', () => {
    expect(nsdateToDate(801238260).toISOString()).toBe('2026-05-23T14:11:00.000Z');
  });
});

describe('deriveTitle', () => {
  it('takes the first non-empty line', () => {
    expect(deriveTitle('first line\nsecond line')).toBe('first line');
  });

  it('skips leading blank lines', () => {
    expect(deriveTitle('\n\nactual content')).toBe('actual content');
  });

  it('truncates to 80 chars with an ellipsis', () => {
    const long = 'a'.repeat(120);
    const result = deriveTitle(long);
    expect(result.length).toBe(80);
    expect(result.endsWith('…')).toBe(true);
  });

  it('strips leading markdown punctuation', () => {
    expect(deriveTitle('## Heading')).toBe('Heading');
    expect(deriveTitle('- list item')).toBe('list item');
    expect(deriveTitle('> quoted')).toBe('quoted');
  });

  it('collapses runs of whitespace', () => {
    expect(deriveTitle('hello   world\t\tagain')).toBe('hello world again');
  });

  it('returns a sensible default for empty input', () => {
    expect(deriveTitle('')).toBe('(empty note)');
    expect(deriveTitle('\n\n  \n')).toBe('(empty note)');
  });
});

describe('render', () => {
  it('produces the expected title and body for a typical annotation', () => {
    const out = render(sample);
    expect(out.title).toBe('fix this metaphor about libraries');
    expect(out.body).toContain('> A library is a building; a life is a way of living.');
    expect(out.body).toContain('— 01-introduction');
    expect(out.body).toContain('fix this metaphor about libraries');
    expect(out.body).toContain('<!-- apple-books-uuid: 4F3A-AB12-B891 -->');
    expect(out.body).toContain('<!-- apple-books-modified: 2026-05-23T14:11:00.000Z -->');
  });

  it('handles a null chapter gracefully', () => {
    const out = render({ ...sample, chapter: null });
    expect(out.body).toContain('— unknown');
  });

  it('quotes each line of a multi-line passage', () => {
    const out = render({ ...sample, selectedText: 'line one\nline two\nline three' });
    expect(out.body).toContain('> line one');
    expect(out.body).toContain('> line two');
    expect(out.body).toContain('> line three');
  });

  it('truncates an over-long body, preserving the UUID footer', () => {
    const out = render({ ...sample, note: 'x'.repeat(GITHUB_BODY_MAX + 1000) });
    expect(out.body.length).toBeLessThanOrEqual(GITHUB_BODY_MAX);
    expect(out.body).toContain('_[truncated]_');
    expect(out.body).toContain('<!-- apple-books-uuid: 4F3A-AB12-B891 -->');
  });
});
