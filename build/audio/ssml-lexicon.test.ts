import { describe, it, expect } from 'vitest';
import { findLexiconMatches, applySsmlLexicon, findIpaMatches, serializeIpaLexicon } from './ssml-lexicon.js';

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

describe('acronym rules', () => {
  it('substitutes word-read acronyms for the Azure path', () => {
    const text = 'File with HUD, then check FEMA and OSHA guidance on SNAP benefits.';
    const matches = findLexiconMatches(text);
    expect(matches.map((m) => [m.original, m.alias])).toEqual([
      ['HUD', 'hud'],
      ['FEMA', 'fema'],
      ['OSHA', 'osha'],
      ['SNAP', 'snap'],
    ]);
  });

  it('renders an acronym as a sub alias in SSML', () => {
    expect(applySsmlLexicon('File with HUD promptly.')).toBe(
      'File with <sub alias="hud">HUD</sub> promptly.',
    );
  });

  it('leaves spelled-out acronyms alone', () => {
    // These are conventionally read letter-by-letter — no entry, no match.
    expect(findLexiconMatches('The IRS, CFPB, and VA disagree about AI.')).toEqual([]);
  });

  it('does not match lowercase or partial-word occurrences', () => {
    expect(findLexiconMatches('a hudson snapshot of osha-like rules')).toEqual([]);
  });
});

describe('findIpaMatches', () => {
  it('reports IPA notations with offsets that slice back to the original text', () => {
    const text = 'File with HUD, then check FEMA and OSHA guidance on SNAP benefits.';
    const matches = findIpaMatches(text);
    expect(matches.map((m) => [m.original, m.ipa])).toEqual([
      ['HUD', 'hʌd'],
      ['FEMA', 'ˈfimə'],
      ['OSHA', 'ˈoʊʃə'],
      ['SNAP', 'snæp'],
    ]);
    for (const match of matches) {
      expect(text.slice(match.charStart, match.charEnd)).toBe(match.original);
    }
  });

  it('returns matches sorted by position', () => {
    const matches = findIpaMatches('OSHA first, HUD second.');
    expect(matches.map((m) => m.original)).toEqual(['OSHA', 'HUD']);
  });

  it('ignores proper nouns and episode citations — IPA is acronyms-only for now', () => {
    // Djot/ePub/Jeeves realizations for the AVSpeech path are deliberately
    // deferred until that engine path graduates from spike to pipeline
    // (design doc §5).
    expect(findIpaMatches('Jeeves read the Djot source of Seinfeld:S3E3.')).toEqual([]);
  });

  it('finds nothing in text without acronyms', () => {
    expect(findIpaMatches('a perfectly ordinary sentence')).toEqual([]);
  });
});

describe('serializeIpaLexicon', () => {
  it('is deterministic and includes every acronym entry', () => {
    const s = serializeIpaLexicon();
    expect(s).toBe(serializeIpaLexicon());
    for (const acronym of ['HUD', 'FEMA', 'OSHA', 'SNAP']) {
      expect(s).toContain(acronym);
    }
  });
});
