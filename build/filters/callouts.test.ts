import { describe, it, expect } from 'vitest';
import { parse, renderHTML, applyFilter } from '@djot/djot';
import { calloutFilter } from './callouts.js';
import { conversationFilter } from './conversations.js';
import { EndnoteState, epubOverrides, renderNotesSection } from './endnotes.js';
import type { ArtBriefContext } from './art-briefs.js';

const process = (dj: string): string => {
  const doc = parse(dj);
  applyFilter(doc, calloutFilter);
  applyFilter(doc, conversationFilter);
  const state = new EndnoteState();
  const html = renderHTML(doc, { overrides: epubOverrides(state) });
  return html + renderNotesSection(doc, state);
};

const mockArtCtx: ArtBriefContext = {
  imagesDir: '/tmp',
  briefs: new Map([
    ['test-img', { stem: 'test-img', format: 'png', size: 'full', alt: 'Test alt', brief: 'Brief text', rights: '', sourcePath: '' }],
  ]),
  xmpCache: new Map(),
  existingImages: new Set(),
  embeddedCount: 0,
};

const processWithArt = (dj: string): string => {
  const doc = parse(dj);
  applyFilter(doc, calloutFilter);
  applyFilter(doc, conversationFilter);
  const state = new EndnoteState();
  const html = renderHTML(doc, { overrides: epubOverrides(state, mockArtCtx) });
  return html + renderNotesSection(doc, state);
};

describe('calloutFilter', () => {
  it('transforms a science callout', () => {
    const dj = '::: science\nStudies show this works.\n:::';
    const html = process(dj);
    expect(html).toContain('class="callout callout-science"');
    expect(html).toContain('class="callout-label"');
    expect(html).toContain('SCIENCE');
    expect(html).toContain('Studies show this works.');
  });

  it('transforms a tip callout', () => {
    const dj = '::: tip\nAdd plain language to your prompt.\n:::';
    const html = process(dj);
    expect(html).toContain('callout-tip');
    expect(html).toContain('Add plain language to your prompt.');
  });

  it('transforms all six callout types', () => {
    for (const type of ['science', 'tip', 'fairness', 'meme', 'spec', 'also']) {
      const dj = `::: ${type}\nContent.\n:::`;
      const html = process(dj);
      expect(html).toContain(`callout-${type}`);
    }
  });

  it('leaves non-callout divs unchanged', () => {
    const dj = '::: note\nJust a regular div.\n:::';
    const html = process(dj);
    expect(html).not.toContain('callout');
    expect(html).toContain('<div');
  });

  it('handles multi-paragraph callouts', () => {
    const dj = '::: science\nFirst paragraph.\n\nSecond paragraph with more detail.\n:::';
    const html = process(dj);
    expect(html).toContain('callout-science');
    expect(html).toContain('First paragraph.');
    expect(html).toContain('Second paragraph with more detail.');
  });

  it('preserves footnotes inside callouts', () => {
    const dj = '::: science\nText with note.[^fn1]\n:::\n\n[^fn1]: A citation.';
    const html = process(dj);
    expect(html).toContain('epub:type="noteref"');
    expect(html).toContain('epub:type="endnote"');
    expect(html).toContain('A citation.');
  });
});

describe('conversationFilter', () => {
  it('transforms a prompt div', () => {
    const dj = '::: prompt\nHelp me with my banking.\n:::';
    const html = process(dj);
    expect(html).toContain('conversation-prompt');
    expect(html).toContain('<kbd>');
    expect(html).toContain('Help me with my banking.');
  });

  it('transforms an agent div', () => {
    const dj = '::: agent\nI can help with that.\n:::';
    const html = process(dj);
    expect(html).toContain('conversation-agent');
    expect(html).toContain('<samp>');
    expect(html).toContain('I can help with that.');
  });

  it('renders an ordered list inside a prompt div', () => {
    const dj = '::: prompt\n1. First answer.\n2. Second answer.\n:::';
    const html = process(dj);
    expect(html).toContain('conversation-prompt');
    expect(html).toContain('1. First answer.');
    expect(html).toContain('2. Second answer.');
  });

  it('renders a paragraph followed by a list inside an agent div', () => {
    const dj = '::: agent\nA few questions:\n\n1. What type?\n2. What reason?\n:::';
    const html = process(dj);
    expect(html).toContain('A few questions:');
    expect(html).toContain('1. What type?');
    expect(html).toContain('2. What reason?');
  });

  it('renders a bullet list inside a prompt div', () => {
    const dj = '::: prompt\n- alpha\n- beta\n:::';
    const html = process(dj);
    expect(html).toContain('alpha');
    expect(html).toContain('beta');
  });

  it('respects ordered list start number', () => {
    const dj = '::: prompt\n3. third\n4. fourth\n:::';
    const html = process(dj);
    expect(html).toContain('3. third');
    expect(html).toContain('4. fourth');
  });
});

describe('endnotes', () => {
  it('renders footnote references as epub noterefs', () => {
    const dj = 'A claim.[^note1]\n\n[^note1]: Source citation.';
    const html = process(dj);
    expect(html).toContain('epub:type="noteref"');
    expect(html).toContain('href="#en-note1"');
    expect(html).toContain('[1]');
  });

  it('renders endnotes section', () => {
    const dj = 'A claim.[^n1]\n\n[^n1]: Source.';
    const html = process(dj);
    expect(html).toContain('epub:type="endnotes"');
    expect(html).toContain('epub:type="endnote"');
    expect(html).toContain('id="en-n1"');
    expect(html).toContain('Source.');
  });

  it('emits a reference id and matching backlink', () => {
    const dj = 'A claim.[^n1]\n\n[^n1]: Source.';
    const html = process(dj);
    expect(html).toContain('id="fnref-n1"');
    expect(html).toContain('epub:type="backlink"');
    expect(html).toContain('href="#fnref-n1"');
    expect(html).toContain('aria-label="Back to reference 1"');
  });

  it('only attaches fnref id to the first reference when a note is cited twice', () => {
    const dj = 'First.[^n1] Second.[^n1]\n\n[^n1]: Source.';
    const html = process(dj);
    const matches = html.match(/id="fnref-n1"/g) || [];
    expect(matches.length).toBe(1);
  });

  it('suppresses section wrapping', () => {
    const dj = '## A heading\n\nSome text.';
    const html = process(dj);
    expect(html).not.toContain('<section');
    expect(html).toContain('<h2>');
  });

  it('renders self-closing hr tags', () => {
    const dj = '---';
    const html = process(dj);
    expect(html).toContain('<hr />');
  });
});

describe('art briefs', () => {
  it('renders a placeholder without caption', () => {
    const dj = '[test-img]{.art}';
    const html = processWithArt(dj);
    expect(html).toContain('art-placeholder');
    expect(html).toContain('test-img.png');
    expect(html).not.toContain('<figcaption>');
  });

  it('renders a placeholder with caption', () => {
    const dj = '[_A caption._]{.art stem="test-img"}';
    const html = processWithArt(dj);
    expect(html).toContain('art-placeholder');
    expect(html).toContain('<figcaption>');
    expect(html).toContain('A caption.');
  });

  it('renders caption with inline markup', () => {
    const dj = '[_[Show:S1E1](https://example.com), 1999 — A note._]{.art stem="test-img"}';
    const html = processWithArt(dj);
    expect(html).toContain('<figcaption>');
    expect(html).toContain('<a href="https://example.com">');
    expect(html).toContain('Show:S1E1');
  });

  it('does not wrap art figure in <p>', () => {
    const dj = '[test-img]{.art}';
    const html = processWithArt(dj);
    expect(html).not.toContain('<p>');
    expect(html).toContain('<figure');
  });
});
