/**
 * Word-level fragment ids for EPUB 3 Media Overlays.
 *
 * Walks rendered chapter HTML, wraps each word in a stable `<span id>`, and
 * returns the plain narratable text with matching character offsets — the
 * same string that gets sent to the TTS engine, and the same offsets its
 * `WordBoundary` events report against (see `build/audio/smil.ts`).
 *
 * Standalone and not yet wired into `build/pipeline.ts`'s default render
 * path — see #167 for why (every one of the book's ~169k words getting a
 * span needs its own review pass once something downstream consumes it).
 */

export interface WordFragment {
  id: string;
  text: string;
  /** Character offsets into the returned narratableText, [charStart, charEnd). */
  charStart: number;
  charEnd: number;
}

export interface WordFragmentResult {
  html: string;
  narratableText: string;
  fragments: WordFragment[];
}

/** A run of letters/numbers, allowing internal apostrophes and hyphens. */
const WORD_SOURCE = String.raw`[\p{L}\p{N}](?:[\p{L}\p{N}'’-]*[\p{L}\p{N}])?`;

/**
 * An HTML character reference, e.g. `&amp;`, `&#38;`, `&#x26;`. djot's HTML
 * renderer only ever emits `&amp;`/`&lt;`/`&gt;` in text content, but this
 * matches any well-formed reference so a future raw_inline HTML block
 * doesn't reintroduce the bug this pattern exists to prevent: without it,
 * the word matcher tokenizes "amp" out of "&amp;" and wraps it in a span,
 * splitting `&amp;` into `&<span>amp</span>;` — a bare `&` that breaks XML
 * well-formedness.
 */
const ENTITY_SOURCE = String.raw`&(?:#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);`;

/** Entities this module knows how to decode for the narratable-text side. */
const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decodeEntity(entity: string): string {
  const body = entity.slice(1, -1);
  if (body.startsWith('#x') || body.startsWith('#X')) return String.fromCodePoint(parseInt(body.slice(2), 16));
  if (body.startsWith('#')) return String.fromCodePoint(parseInt(body.slice(1), 10));
  return NAMED_ENTITIES[body] ?? entity;
}

/** Matches a word or an HTML entity — entities must be tried first so they win the alternation. */
const TOKEN_PATTERN = new RegExp(`${ENTITY_SOURCE}|${WORD_SOURCE}`, 'gu');

/** Matches an HTML tag, so text-node content can be tokenized around it. */
const TAG_PATTERN = /<[^>]+>/g;

/**
 * Wrap each word in the text nodes of `html` with `<span id="w{n}">`,
 * leaving tags, entities, and other non-word characters (whitespace,
 * punctuation) untouched. Ids are sequential within this call, starting
 * from `startIndex`.
 */
export function injectWordFragments(html: string, startIndex = 1): WordFragmentResult {
  const fragments: WordFragment[] = [];
  let narratableText = '';
  let nextId = startIndex;
  let outHtml = '';
  let cursor = 0;

  const appendTextSegment = (segment: string) => {
    let lastEnd = 0;
    TOKEN_PATTERN.lastIndex = 0;
    let tokenMatch: RegExpExecArray | null;
    while ((tokenMatch = TOKEN_PATTERN.exec(segment))) {
      outHtml += segment.slice(lastEnd, tokenMatch.index);
      narratableText += segment.slice(lastEnd, tokenMatch.index);

      const token = tokenMatch[0];
      if (token.startsWith('&')) {
        // Entity reference: passed through verbatim in the HTML (unwrapping
        // it would emit invalid XML), decoded in the narratable text (an
        // HTML entity read as its literal name would mispronounce it).
        outHtml += token;
        narratableText += decodeEntity(token);
      } else {
        const id = `w${nextId++}`;
        const charStart = narratableText.length;
        narratableText += token;
        fragments.push({ id, text: token, charStart, charEnd: narratableText.length });
        outHtml += `<span id="${id}">${token}</span>`;
      }

      lastEnd = tokenMatch.index + token.length;
    }
    outHtml += segment.slice(lastEnd);
    narratableText += segment.slice(lastEnd);
  };

  TAG_PATTERN.lastIndex = 0;
  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = TAG_PATTERN.exec(html))) {
    appendTextSegment(html.slice(cursor, tagMatch.index));
    outHtml += tagMatch[0];
    cursor = tagMatch.index + tagMatch[0].length;
  }
  appendTextSegment(html.slice(cursor));

  return { html: outHtml, narratableText, fragments };
}
