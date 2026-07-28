import { describe, it, expect } from 'vitest';
import { groupEscapableFragments } from './escapable-groups.js';

describe('groupEscapableFragments', () => {
  it('groups a callout aside as a skippable sidebar', () => {
    const html =
      '<p><span id="w1">Before</span>.</p>' +
      '<aside id="callout-1" class="callout callout-tip" epub:type="sidebar" role="note">' +
      '<p class="callout-label">TIP</p>' +
      '<p><span id="w2">Add</span> <span id="w3">context</span>.</p>' +
      '</aside>' +
      '<p><span id="w4">After</span>.</p>';

    const groups = groupEscapableFragments(html);
    expect(groups).toEqual([{ id: 'callout-1', epubType: 'sidebar', fragmentIds: ['w2', 'w3'] }]);
  });

  it('groups a glossary note aside as a skippable footnote', () => {
    const html =
      '<aside epub:type="footnote" role="doc-footnote" id="gloss-1" class="gloss-note">' +
      '<p><span id="w5">Definition</span> <span id="w6">text</span>.</p>' +
      '</aside>';

    const groups = groupEscapableFragments(html);
    expect(groups).toEqual([{ id: 'gloss-1', epubType: 'footnote', fragmentIds: ['w5', 'w6'] }]);
  });

  it('groups an endnote list item as a skippable rearnote', () => {
    const html =
      '<li epub:type="endnote" id="en-h6-3" class="endnote">' +
      '<p><span id="w7">A</span> <span id="w8">citation</span>.</p>' +
      '</li>';

    const groups = groupEscapableFragments(html);
    expect(groups).toEqual([{ id: 'en-h6-3', epubType: 'rearnote', fragmentIds: ['w7', 'w8'] }]);
  });

  it('correctly balances a nested <li> inside an endnote (e.g. a list in the footnote body)', () => {
    const html =
      '<li epub:type="endnote" id="en-1" class="endnote">' +
      '<p><span id="w1">See</span>:</p>' +
      '<ul><li><span id="w2">Alpha</span></li><li><span id="w3">Beta</span></li></ul>' +
      '</li>' +
      '<p><span id="w4">Not</span> <span id="w5">included</span>.</p>';

    const groups = groupEscapableFragments(html);
    expect(groups).toHaveLength(1);
    expect(groups[0].fragmentIds).toEqual(['w1', 'w2', 'w3']);
  });

  it('groups multiple sibling structures independently', () => {
    const html =
      '<aside id="callout-1" class="callout" epub:type="sidebar" role="note"><span id="w1">A</span></aside>' +
      '<aside id="callout-2" class="callout" epub:type="sidebar" role="note"><span id="w2">B</span></aside>';

    const groups = groupEscapableFragments(html);
    expect(groups).toEqual([
      { id: 'callout-1', epubType: 'sidebar', fragmentIds: ['w1'] },
      { id: 'callout-2', epubType: 'sidebar', fragmentIds: ['w2'] },
    ]);
  });

  it('returns no groups for plain prose with no escapable structures', () => {
    const html = '<p><span id="w1">Plain</span> <span id="w2">text</span>.</p>';
    expect(groupEscapableFragments(html)).toEqual([]);
  });

  it('skips a wrapper with a matching epub:type but no id rather than guessing one', () => {
    const html = '<aside class="callout" epub:type="sidebar" role="note"><span id="w1">A</span></aside>';
    expect(groupEscapableFragments(html)).toEqual([]);
  });

  it('ignores an aside whose epub:type is not sidebar or footnote', () => {
    const html = '<aside id="x" epub:type="warning"><span id="w1">A</span></aside>';
    expect(groupEscapableFragments(html)).toEqual([]);
  });
});
