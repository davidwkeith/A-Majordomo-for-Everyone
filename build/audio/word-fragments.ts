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
const WORD_PATTERN = /[\p{L}\p{N}](?:[\p{L}\p{N}'’-]*[\p{L}\p{N}])?/gu;

/** Matches an HTML tag, so text-node content can be tokenized around it. */
const TAG_PATTERN = /<[^>]+>/g;

/**
 * Wrap each word in the text nodes of `html` with `<span id="w{n}">`,
 * leaving tags and non-word characters (whitespace, punctuation) untouched.
 * Ids are sequential within this call, starting from `startIndex`.
 */
export function injectWordFragments(html: string, startIndex = 1): WordFragmentResult {
  const fragments: WordFragment[] = [];
  let narratableText = '';
  let nextId = startIndex;
  let outHtml = '';
  let cursor = 0;

  TAG_PATTERN.lastIndex = 0;
  let tagMatch: RegExpExecArray | null;
  const appendTextSegment = (segment: string) => {
    let lastEnd = 0;
    WORD_PATTERN.lastIndex = 0;
    let wordMatch: RegExpExecArray | null;
    while ((wordMatch = WORD_PATTERN.exec(segment))) {
      outHtml += segment.slice(lastEnd, wordMatch.index);
      narratableText += segment.slice(lastEnd, wordMatch.index);

      const word = wordMatch[0];
      const id = `w${nextId++}`;
      const charStart = narratableText.length;
      narratableText += word;
      fragments.push({ id, text: word, charStart, charEnd: narratableText.length });
      outHtml += `<span id="${id}">${word}</span>`;

      lastEnd = wordMatch.index + word.length;
    }
    outHtml += segment.slice(lastEnd);
    narratableText += segment.slice(lastEnd);
  };

  while ((tagMatch = TAG_PATTERN.exec(html))) {
    appendTextSegment(html.slice(cursor, tagMatch.index));
    outHtml += tagMatch[0];
    cursor = tagMatch.index + tagMatch[0].length;
  }
  appendTextSegment(html.slice(cursor));

  return { html: outHtml, narratableText, fragments };
}
