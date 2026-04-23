import { describe, it, expect } from 'vitest';
import { validateAccessibility, formatA11yIssues } from './a11y.js';
import { BOOK_META } from '../types.js';
import type { ProcessedChapter } from '../types.js';
import type { ArtBrief, ArtBriefContext } from '../filters/art-briefs.js';

const chapter = (over: Partial<ProcessedChapter['meta']> = {}, html = ''): ProcessedChapter => ({
  meta: {
    title: 'Ch',
    part: 0,
    order: 0,
    strategy: null,
    status: 'draft',
    slug: 'ch',
    sourceFile: '/tmp/ch.dj',
    ...over,
  },
  html,
  endnotes: [],
});

const brief = (over: Partial<ArtBrief> = {}): ArtBrief => ({
  stem: 'x',
  format: 'png',
  size: 'full',
  alt: 'Alt text',
  brief: 'A production brief body.',
  rights: '',
  sourcePath: '/tmp/x.art.md',
  ...over,
});

const ctx = (briefs: ArtBrief[] = []): ArtBriefContext => ({
  imagesDir: '/tmp',
  briefs: new Map(briefs.map((b) => [b.stem, b])),
  xmpCache: new Map(),
  existingImages: new Set(),
  embeddedCount: 0,
});

describe('validateAccessibility', () => {
  it('passes clean content with briefs and chapters', () => {
    const issues = validateAccessibility(
      BOOK_META,
      [chapter({ slug: 'a', order: 0 }), chapter({ slug: 'b', order: 1 })],
      ctx([brief()])
    );
    expect(issues).toEqual([]);
  });

  it('fails when an art brief has no alt text', () => {
    const issues = validateAccessibility(BOOK_META, [chapter()], ctx([brief({ alt: '' })]));
    expect(issues.some((i) => i.feature === 'alternativeText')).toBe(true);
  });

  it('fails when an art brief has whitespace-only alt text', () => {
    const issues = validateAccessibility(BOOK_META, [chapter()], ctx([brief({ alt: '   ' })]));
    expect(issues.some((i) => i.feature === 'alternativeText')).toBe(true);
  });

  it('fails when an art brief has no production description', () => {
    const issues = validateAccessibility(BOOK_META, [chapter()], ctx([brief({ brief: '' })]));
    expect(issues.some((i) => i.feature === 'longDescription')).toBe(true);
  });

  it('fails on <img> without alt attribute', () => {
    const html = '<p>Hello <img src="x.png"/> world</p>';
    const issues = validateAccessibility(BOOK_META, [chapter({}, html)], ctx());
    const alt = issues.filter((i) => i.feature === 'alternativeText');
    expect(alt.length).toBe(1);
    expect(alt[0].message).toContain('without alt');
  });

  it('fails on <img> with empty alt attribute', () => {
    const html = '<img src="x.png" alt=""/>';
    const issues = validateAccessibility(BOOK_META, [chapter({}, html)], ctx());
    const alt = issues.filter((i) => i.feature === 'alternativeText');
    expect(alt.length).toBe(1);
    expect(alt[0].message).toContain('empty alt');
  });

  it('fails on single-quoted empty alt', () => {
    const html = "<img src='x.png' alt=''/>";
    const issues = validateAccessibility(BOOK_META, [chapter({}, html)], ctx());
    const alt = issues.filter((i) => i.feature === 'alternativeText');
    expect(alt.length).toBe(1);
    expect(alt[0].message).toContain('empty alt');
  });

  it('tolerates whitespace around alt=', () => {
    const present = '<img src="x.png" alt = "A figure."/>';
    const absent = validateAccessibility(BOOK_META, [chapter({}, present)], ctx());
    expect(absent.filter((i) => i.feature === 'alternativeText')).toEqual([]);

    const empty = '<img src="x.png" alt = " "/>';
    const issues = validateAccessibility(BOOK_META, [chapter({}, empty)], ctx());
    expect(issues.filter((i) => i.feature === 'alternativeText').length).toBe(1);
  });

  it('does not confuse data-alt with alt', () => {
    const html = '<img src="x.png" data-alt="not real"/>';
    const issues = validateAccessibility(BOOK_META, [chapter({}, html)], ctx());
    const alt = issues.filter((i) => i.feature === 'alternativeText');
    expect(alt.length).toBe(1);
    expect(alt[0].message).toContain('without alt');
  });

  it('reports every violation in a chapter, not just the first', () => {
    const html =
      '<img src="a.png"/><img src="b.png" alt=""/><img src="c.png" alt="ok"/><img src="d.png"/>';
    const issues = validateAccessibility(BOOK_META, [chapter({}, html)], ctx());
    const alt = issues.filter((i) => i.feature === 'alternativeText');
    expect(alt.length).toBe(3);
  });

  it('passes on <img> with non-empty alt attribute', () => {
    const html = '<img src="x.png" alt="A figure."/>';
    const issues = validateAccessibility(BOOK_META, [chapter({}, html)], ctx());
    expect(issues.filter((i) => i.feature === 'alternativeText')).toEqual([]);
  });

  it('fails when no chapters are provided', () => {
    const issues = validateAccessibility(BOOK_META, [], ctx());
    expect(issues.some((i) => i.feature === 'tableOfContents')).toBe(true);
  });

  it('fails when a chapter has no title', () => {
    const issues = validateAccessibility(BOOK_META, [chapter({ title: '' })], ctx());
    expect(issues.some((i) => i.feature === 'tableOfContents')).toBe(true);
  });

  it('fails on duplicate (part, order) across chapters', () => {
    const issues = validateAccessibility(
      BOOK_META,
      [chapter({ slug: 'a', part: 1, order: 0 }), chapter({ slug: 'b', part: 1, order: 0 })],
      ctx()
    );
    expect(issues.some((i) => i.feature === 'readingOrder')).toBe(true);
  });

  it('fails on duplicate slug across chapters', () => {
    const issues = validateAccessibility(
      BOOK_META,
      [chapter({ slug: 'same', order: 0 }), chapter({ slug: 'same', order: 1 })],
      ctx()
    );
    expect(issues.some((i) => i.feature === 'readingOrder')).toBe(true);
  });

  it('fails when book metadata is missing language', () => {
    const issues = validateAccessibility({ ...BOOK_META, language: '' }, [chapter()], ctx());
    expect(issues.some((i) => i.feature === 'structuralNavigation')).toBe(true);
  });

  it('reports issues grouped by feature in formatA11yIssues', () => {
    const out = formatA11yIssues([
      { feature: 'alternativeText', message: 'm1', source: '/a' },
      { feature: 'alternativeText', message: 'm2' },
      { feature: 'readingOrder', message: 'm3' },
    ]);
    expect(out).toContain('alternativeText (2)');
    expect(out).toContain('readingOrder (1)');
    expect(out).toContain('m1');
    expect(out).toContain('(/a)');
  });
});
