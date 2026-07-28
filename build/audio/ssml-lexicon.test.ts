import { describe, it, expect } from 'vitest';
import { findLexiconMatches, applySsmlLexicon } from './ssml-lexicon.js';

describe('findLexiconMatches', () => {
  it('finds the proper-noun aliases from the design spec', () => {
    const text = "It is, if I may say so, the ePub's Djot source. Jeeves would agree.";
    const matches = findLexiconMatches(text);
    expect(matches.map((m) => [m.original, m.alias])).toEqual([
      ['ePub', 'ee pub'],
      ['Djot', 'jot'],
      ['Jeeves', 'Jeevz'],
    ]);
  });

  it('does not match a lowercase, code-context spelling of ePub or djot', () => {
    const matches = findLexiconMatches('the epub build reads djot source files');
    expect(matches).toEqual([]);
  });

  it('expands an episode citation to the caption-style prose form', () => {
    const matches = findLexiconMatches('Seinfeld:S3E3 "The Pen" is the reference here.');
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      original: 'Seinfeld:S3E3',
      alias: 'Seinfeld, season 3, episode 3',
    });
  });

  it('handles multi-word show names and double-digit season/episode numbers', () => {
    const matches = findLexiconMatches('Star Trek TNG:S6E12 "Ship in a Bottle"');
    expect(matches[0]).toMatchObject({
      original: 'Star Trek TNG:S6E12',
      alias: 'Star Trek TNG, season 6, episode 12',
    });
  });

  it('reports offsets that slice back to the original text', () => {
    const text = 'The book calls it Djot, and the format is ePub.';
    for (const match of findLexiconMatches(text)) {
      expect(text.slice(match.charStart, match.charEnd)).toBe(match.original);
    }
  });
});

describe('applySsmlLexicon', () => {
  it('wraps a match in <sub alias> and leaves surrounding text untouched', () => {
    expect(applySsmlLexicon('the Djot source')).toBe('the <sub alias="jot">Djot</sub> source');
  });

  it('applies multiple substitutions in one pass', () => {
    expect(applySsmlLexicon("the ePub's Djot source")).toBe(
      'the <sub alias="ee pub">ePub</sub>\'s <sub alias="jot">Djot</sub> source',
    );
  });

  it('XML-escapes surrounding text', () => {
    expect(applySsmlLexicon('Djot & ePub')).toBe(
      '<sub alias="jot">Djot</sub> &amp; <sub alias="ee pub">ePub</sub>',
    );
  });

  it('escapes a quote inside an alias for use as an attribute value', () => {
    expect(applySsmlLexicon('Fawlty Towers:S1E2 "The Builders"')).toBe(
      '<sub alias="Fawlty Towers, season 1, episode 2">Fawlty Towers:S1E2</sub> "The Builders"',
    );
  });

  it('round-trips text with no lexicon matches unchanged (aside from escaping)', () => {
    expect(applySsmlLexicon('nothing special here')).toBe('nothing special here');
  });
});
