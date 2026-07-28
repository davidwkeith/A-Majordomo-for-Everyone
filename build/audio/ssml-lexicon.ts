/**
 * SSML pronunciation lexicon for recurring proper nouns, per the
 * "SSML baseline" item in #161 (docs/superpowers/specs/2026-07-27-azure-tts-engine-design.md).
 *
 * Uses `<sub alias="...">` rather than `<phoneme>`/IPA on purpose: alias
 * substitution is voice-independent, so this doesn't have to wait on the
 * final narrator/prompt/agent voice picks (still open — see the design
 * doc's "Remaining work"). Once voices are locked and specific mis-stresses
 * turn up in listening, add per-voice `<phoneme>` overrides here instead of
 * widening the alias list.
 */

export interface LexiconMatch {
  /** Character offsets into the source text, [charStart, charEnd). */
  charStart: number;
  charEnd: number;
  original: string;
  alias: string;
}

interface LexiconRule {
  /** Must include the global flag. */
  pattern: RegExp;
  alias: (match: RegExpExecArray) => string;
}

const PROPER_NOUN_RULES: LexiconRule[] = [
  { pattern: /\bDjot\b/g, alias: () => 'jot' },
  { pattern: /\bePub\b/g, alias: () => 'ee pub' },
  { pattern: /\bJeeves\b/g, alias: () => 'Jeevz' },
];

/**
 * The book's episode-citation format (`spec/outline.md`: `[Show:SxEy
 * "Title"](wikipedia-url), Year`) renders as literal link text, e.g.
 * "Seinfeld:S3E3" — read verbatim, a TTS engine says "Seinfeld colon S
 * three E three." Expands it to the same prose form the episode-index.md
 * captions already use: "Seinfeld, season 3, episode 3."
 */
const EPISODE_REFERENCE_RULE: LexiconRule = {
  pattern: /\b([A-Z][A-Za-z0-9' ]*?):S(\d+)E(\d+)\b/g,
  alias: (match) => `${match[1]}, season ${Number(match[2])}, episode ${Number(match[3])}`,
};

const RULES: LexiconRule[] = [...PROPER_NOUN_RULES, EPISODE_REFERENCE_RULE];

/**
 * Find every lexicon match in `text`, left to right. Rules are tried in
 * declaration order; a span already claimed by an earlier rule can't be
 * re-matched by a later one.
 */
export function findLexiconMatches(text: string): LexiconMatch[] {
  const matches: LexiconMatch[] = [];
  const claimed: Array<[number, number]> = [];

  for (const rule of RULES) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = re.exec(text))) {
      const charStart = match.index;
      const charEnd = charStart + match[0].length;
      if (claimed.some(([s, e]) => charStart < e && charEnd > s)) continue;
      matches.push({ charStart, charEnd, original: match[0], alias: rule.alias(match) });
      claimed.push([charStart, charEnd]);
    }
  }

  return matches.sort((a, b) => a.charStart - b.charStart);
}

function escapeXmlText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeXmlAttr(value: string): string {
  return escapeXmlText(value).replace(/"/g, '&quot;');
}

/**
 * Render `text` as SSML body content: every lexicon match wrapped in
 * `<sub alias="...">`, everything else XML-escaped. The caller embeds the
 * result inside a `<voice>`/`<prosody>` element — this only handles the
 * lexicon substitution, not the surrounding SSML document.
 *
 * `text` is expected to be `word-fragments.ts`'s `narratableText` — the
 * same string `WordBoundary` offsets are reported against. A `<sub>` changes
 * both the length of the text and what Azure narrates for that span, so a
 * downstream consumer reconciling `WordBoundary` output back to
 * `WordFragment` ids across a substitution needs its own remapping; this
 * function doesn't attempt that (it belongs with the pipeline wiring in
 * #167, once SSML generation actually feeds live Azure output).
 */
export function applySsmlLexicon(text: string): string {
  const matches = findLexiconMatches(text);
  let out = '';
  let cursor = 0;
  for (const match of matches) {
    out += escapeXmlText(text.slice(cursor, match.charStart));
    out += `<sub alias="${escapeXmlAttr(match.alias)}">${escapeXmlText(match.original)}</sub>`;
    cursor = match.charEnd;
  }
  out += escapeXmlText(text.slice(cursor));
  return out;
}
