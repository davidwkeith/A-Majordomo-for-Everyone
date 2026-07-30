import { describe, it, expect } from 'vitest';
import { segmentVoices } from './voice-segments.js';
import { injectWordFragments } from './word-fragments.js';

const JEEVES_P =
  '<p><strong>My Man Jeeves:</strong> <em>One&#8217;s Agent has read the statute &amp; the lease.</em></p>';
const CONVO =
  '<div data-conversation="prompt"><p>Help me understand this bill.</p></div>' +
  '<div data-conversation="agent"><p>I can help. <em>A few</em> questions.</p><div><p>Nested.</p></div></div>';
const PLAIN = '<p>Ross buys a couch.</p>';
const SPEC_P = '<p><strong>The Spec:</strong> <em>not Jeeves</em></p>';
const BACKLINK =
  '<aside epub:type="footnote"><p>A note.<a role="doc-backlink" href="#r">↩</a></p></aside>';

const roleOf = (segments: ReturnType<typeof segmentVoices>, needle: string) =>
  segments.find((s) => s.text.includes(needle))?.role;

describe('segmentVoices', () => {
  const html = PLAIN + JEEVES_P + CONVO + SPEC_P + BACKLINK;

  it('concatenates back to exactly the narratable text (the invariant)', () => {
    const segments = segmentVoices(html);
    expect(segments.map((s) => s.text).join('')).toBe(injectWordFragments(html).narratableText);
    // charStart/charEnd tile the text with no gaps or overlaps
    let cursor = 0;
    for (const s of segments) {
      expect(s.charStart).toBe(cursor);
      expect(s.charEnd).toBe(cursor + s.text.length);
      cursor = s.charEnd;
    }
  });

  it('classifies conversation divs, including nested elements', () => {
    const segments = segmentVoices(html);
    expect(roleOf(segments, 'understand this bill')).toBe('prompt');
    expect(roleOf(segments, 'A few')).toBe('agent');
    expect(roleOf(segments, 'Nested.')).toBe('agent');
  });

  it('splits the Jeeves label from the Jeeves body', () => {
    const segments = segmentVoices(html);
    expect(roleOf(segments, 'My Man Jeeves:')).toBe('narrator');
    expect(roleOf(segments, 'read the statute')).toBe('jeeves');
    // decoded entities land in the right role: &#8217; → ’ and &amp; → &
    expect(roleOf(segments, '’')).toBe('jeeves');
  });

  it('does not treat other strong-opening paragraphs as Jeeves', () => {
    const segments = segmentVoices(html);
    expect(roleOf(segments, 'not Jeeves')).toBe('narrator');
  });

  it('merges adjacent same-role runs', () => {
    const segments = segmentVoices(PLAIN + SPEC_P);
    expect(segments).toHaveLength(1);
    expect(segments[0].role).toBe('narrator');
  });

  it('classifies plain prose as narrator and drops suppressed backlink text', () => {
    const segments = segmentVoices(html);
    expect(roleOf(segments, 'buys a couch')).toBe('narrator');
    expect(segments.some((s) => s.text.includes('↩'))).toBe(false);
  });
});
