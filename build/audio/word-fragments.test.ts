import { describe, it, expect } from 'vitest';
import { walkNarratableHtml, decodeEntities, injectWordFragments } from './word-fragments.js';

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

  it('does not split an HTML entity into a word span, and decodes it in narratableText', () => {
    // Reproduces the epubcheck failure this pattern guards against: djot's
    // HTML renderer escapes literal "&" as "&amp;", and naive word-matching
    // tokenizes "amp" out of it, splitting the entity into `&<span>amp</span>;`
    // — a bare `&` that's not well-formed XML.
    const { html, fragments, narratableText } = injectWordFragments('<p>Marks &amp; Spencer</p>');
    expect(html).toBe('<p><span id="w1">Marks</span> &amp; <span id="w2">Spencer</span></p>');
    expect(fragments.map((f) => f.text)).toEqual(['Marks', 'Spencer']);
    expect(narratableText).toBe('Marks & Spencer');
  });

  it('decodes numeric character references and preserves them verbatim in the HTML', () => {
    const { html, narratableText } = injectWordFragments('<p>5 &#38; 10, &#x26;more</p>');
    expect(html).toContain('&#38;');
    expect(html).toContain('&#x26;');
    expect(narratableText).toContain('5 & 10, &more');
  });

  it('keeps every fragment offset valid even when the segment contains entities', () => {
    const { narratableText, fragments } = injectWordFragments('<p>Marks &amp; Spencer &lt;the store&gt;</p>');
    for (const f of fragments) {
      expect(narratableText.slice(f.charStart, f.charEnd)).toBe(f.text);
    }
  });

  it('excludes endnote backlink glyphs from narration but leaves the visible HTML intact', () => {
    // The endnotes epubOverride appends a `↩` backlink anchor to each note
    // (see build/filters/endnotes.ts renderNotesSection). It's navigation
    // chrome, not content — it must not be synthesized or given a word span.
    const backlink =
      '<a epub:type="backlink" role="doc-backlink" class="endnote-backlink" ' +
      'href="#fnref-note1" aria-label="Back to reference 1">↩</a>';
    const html =
      `<li epub:type="endnote" id="en-note1" class="endnote">\n` +
      `<p><span class="endnote-num">[1]</span> A note about Jeeves. ${backlink}</p></li>`;

    const { html: outHtml, narratableText, fragments } = injectWordFragments(html);

    expect(narratableText).not.toContain('↩');
    expect(outHtml).toContain('>↩</a>');
    expect(fragments.map((f) => f.text)).toEqual(['1', 'A', 'note', 'about', 'Jeeves']);
    for (const f of fragments) {
      expect(narratableText.slice(f.charStart, f.charEnd)).toBe(f.text);
    }
  });

  it('excludes glossary backlinks and any words inside a backlink from narration', () => {
    // The glossary backlink carries the same doc-backlink role; if its text
    // ever becomes words instead of a glyph, it must still stay out of the
    // narration stream.
    const html =
      '<p>Term — definition ' +
      '<a epub:type="backlink" role="doc-backlink" class="gloss-backlink" ' +
      'href="#gloss-1-ref" aria-label="Back to text">Back to text</a></p>';

    const { html: outHtml, narratableText, fragments } = injectWordFragments(html);

    expect(narratableText).not.toContain('Back to text');
    expect(outHtml).toContain('>Back to text</a>');
    expect(fragments.map((f) => f.text)).toEqual(['Term', 'definition']);
    for (const f of fragments) {
      expect(narratableText.slice(f.charStart, f.charEnd)).toBe(f.text);
    }
  });
});

describe('walkNarratableHtml', () => {
  it('reproduces narratableText when events accumulate decoded text', () => {
    const html =
      '<p>Ross &amp; the couch.</p>' +
      '<aside epub:type="footnote"><p>A note.<a role="doc-backlink" href="#r">↩</a></p></aside>';
    let acc = '';
    walkNarratableHtml(html, {
      onTag: () => {},
      onText: (raw) => { acc += decodeEntities(raw); },
      onSuppressedText: () => {},
    });
    expect(acc).toBe(injectWordFragments(html).narratableText);
    expect(acc).not.toContain('↩');
  });

  it('reports tag names and suppression state', () => {
    const html = '<p>Hi<a role="doc-backlink" href="#r">↩</a></p>';
    const tags: Array<[string | undefined, boolean]> = [];
    walkNarratableHtml(html, {
      onTag: (_tag, name, suppressed) => { tags.push([name, suppressed]); },
      onText: () => {},
      onSuppressedText: () => {},
    });
    // <p> not suppressed; <a ...> opens suppression (reported suppressed);
    // </a> closes it (reported suppressed); </p> not suppressed.
    expect(tags).toEqual([['p', false], ['a', true], ['a', true], ['p', false]]);
  });

  it('narrates trailing text even when suppression is still open at end-of-input', () => {
    // Pins a pre-refactor quirk: HTML that ends mid-suppression (an
    // unterminated doc-backlink anchor, which real djot output never
    // produces) still narrates its tail rather than swallowing it — the
    // tail after the tag loop always goes through onText.
    const html = '<a role="doc-backlink" href="#r">oops';
    let acc = '';
    let sawTailAsSuppressed = false;
    walkNarratableHtml(html, {
      onTag: () => {},
      onText: (raw) => { acc += raw; },
      onSuppressedText: () => { sawTailAsSuppressed = true; },
    });
    expect(acc).toBe('oops');
    expect(sawTailAsSuppressed).toBe(false);

    const { narratableText, fragments } = injectWordFragments(html);
    expect(narratableText).toBe('oops');
    expect(fragments.map((f) => f.text)).toEqual(['oops']);
  });
});

describe('decodeEntities', () => {
  it('decodes named, decimal, and hex references and leaves the rest alone', () => {
    expect(decodeEntities('a &amp; b &#38; c &#x26; d &unknown; e')).toBe(
      'a & b & c & d &unknown; e',
    );
  });
});
