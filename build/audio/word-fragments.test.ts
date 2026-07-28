import { describe, it, expect } from 'vitest';
import { injectWordFragments } from './word-fragments.js';

describe('injectWordFragments', () => {
  it('wraps each word in a plain paragraph', () => {
    const { html, fragments, narratableText } = injectWordFragments('<p>Jeeves considered the matter.</p>');
    expect(html).toBe(
      '<p><span id="w1">Jeeves</span> <span id="w2">considered</span> <span id="w3">the</span> <span id="w4">matter</span>.</p>',
    );
    expect(fragments.map((f) => f.text)).toEqual(['Jeeves', 'considered', 'the', 'matter']);
    expect(narratableText).toBe('Jeeves considered the matter.');
  });

  it('does not tokenize inside tags or attributes', () => {
    const { html, fragments } = injectWordFragments('<a href="ch2.xhtml#note-1">the note</a>');
    expect(html).toBe('<a href="ch2.xhtml#note-1"><span id="w1">the</span> <span id="w2">note</span></a>');
    expect(fragments).toHaveLength(2);
  });

  it('assigns fragment character offsets that slice back to the word in narratableText', () => {
    const { narratableText, fragments } = injectWordFragments('<p>Jeeves considered the matter—carefully.</p>');
    for (const f of fragments) {
      expect(narratableText.slice(f.charStart, f.charEnd)).toBe(f.text);
    }
  });

  it('keeps punctuation-only and whitespace-only segments unwrapped', () => {
    const { html } = injectWordFragments('<p>"Well," he said.</p>');
    expect(html).toBe('<p>"<span id="w1">Well</span>," <span id="w2">he</span> <span id="w3">said</span>.</p>');
  });

  it('handles words split across multiple tags without cross-tag merging', () => {
    const { html, fragments } = injectWordFragments('<p><em>quite</em> right</p>');
    expect(html).toBe('<p><em><span id="w1">quite</span></em> <span id="w2">right</span></p>');
    expect(fragments).toHaveLength(2);
  });

  it('continues fragment ids from a supplied startIndex', () => {
    const { fragments } = injectWordFragments('<p>one two</p>', 41);
    expect(fragments.map((f) => f.id)).toEqual(['w41', 'w42']);
  });

  it('produces no fragments for text with no words', () => {
    const { html, fragments, narratableText } = injectWordFragments('<hr/>');
    expect(html).toBe('<hr/>');
    expect(fragments).toEqual([]);
    expect(narratableText).toBe('');
  });
});
