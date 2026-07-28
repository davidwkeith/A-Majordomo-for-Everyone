/**
 * Escapable/skippable structure grouping for EPUB 3 Media Overlays.
 *
 * Per the Media Overlays spec, a reading system can only offer to skip or
 * escape a structure (footnotes, sidebars, etc.) during audio playback if
 * the SMIL file itself nests that structure's `<par>`s inside a `<seq>`
 * carrying a recognized `epub:type` — nothing about the content document's
 * own semantics is inherited automatically:
 * https://idpf.org/epub/301/spec/epub-mediaoverlays-20140626.html
 * ("EPUB creators [must] add additional semantics to the markup using the
 * epub:type attribute on seq and par elements").
 *
 * This scans chapter HTML (after `injectWordFragments` has run, so word
 * spans already carry their ids) for the structures this book already
 * marks with EPUB structural semantics — callouts (`<aside epub:type=
 * "sidebar">`), glossary notes (`<aside epub:type="footnote">`), and
 * endnotes (`<li epub:type="endnote">`) — and reports which word-fragment
 * ids fall inside each instance, so `build/audio/smil.ts` can wrap them in
 * their own nested `<seq>`.
 *
 * Simplification: groups are treated as flat, not recursively nested. This
 * book's callouts/footnotes don't currently contain each other, so a
 * structure's boundary is found via the *outermost* balanced wrapper only.
 */

export type EscapableEpubType = 'sidebar' | 'footnote' | 'rearnote';

export interface EscapableGroup {
  /** The wrapper element's own `id` attribute — also used for the SMIL <seq> id. */
  id: string;
  /** SMIL-recognized skippable-structure semantic. */
  epubType: EscapableEpubType;
  /** Word-fragment ids found inside this structure, in document order. */
  fragmentIds: string[];
}

interface WrapperSpec {
  tag: string;
  contentEpubType: string;
  smilType: EscapableEpubType;
}

const WRAPPERS: WrapperSpec[] = [
  { tag: 'aside', contentEpubType: 'sidebar', smilType: 'sidebar' },
  { tag: 'aside', contentEpubType: 'footnote', smilType: 'footnote' },
  // "endnote" isn't itself in the Media Overlays skippable vocabulary;
  // "rearnote" (content collected at the back of the document) is its
  // overlay-recognized counterpart.
  { tag: 'li', contentEpubType: 'endnote', smilType: 'rearnote' },
];

const FRAGMENT_ID_PATTERN = /<span id="(w\d+)">/g;

/** Find the index of the `</tagName>` that balances the opening tag ending at `searchFrom`. */
function findMatchingClose(html: string, tagName: string, searchFrom: number): number | null {
  const boundary = new RegExp(`<${tagName}\\b|</${tagName}>`, 'g');
  boundary.lastIndex = searchFrom;
  let depth = 1;
  let m: RegExpExecArray | null;
  while ((m = boundary.exec(html))) {
    if (m[0].startsWith('</')) {
      depth--;
      if (depth === 0) return m.index;
    } else {
      depth++;
    }
  }
  return null;
}

function extractFragmentIds(html: string): string[] {
  const ids: string[] = [];
  FRAGMENT_ID_PATTERN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = FRAGMENT_ID_PATTERN.exec(html))) ids.push(m[1]);
  return ids;
}

export function groupEscapableFragments(html: string): EscapableGroup[] {
  const groups: EscapableGroup[] = [];

  for (const { tag, contentEpubType, smilType } of WRAPPERS) {
    const openTagPattern = new RegExp(`<${tag}\\b[^>]*>`, 'g');
    openTagPattern.lastIndex = 0;
    let openMatch: RegExpExecArray | null;
    while ((openMatch = openTagPattern.exec(html))) {
      const openTag = openMatch[0];
      const epubTypeMatch = openTag.match(/\bepub:type="([^"]+)"/);
      if (epubTypeMatch?.[1] !== contentEpubType) continue;

      const idMatch = openTag.match(/\bid="([^"]+)"/);
      if (!idMatch) continue; // no stable id to key the group on — skip rather than guess one

      const contentStart = openMatch.index + openTag.length;
      const closeIndex = findMatchingClose(html, tag, contentStart);
      if (closeIndex == null) continue;

      const fragmentIds = extractFragmentIds(html.slice(contentStart, closeIndex));
      if (fragmentIds.length === 0) continue;

      groups.push({ id: idMatch[1], epubType: smilType, fragmentIds });
      openTagPattern.lastIndex = closeIndex; // don't look for wrappers inside this one
    }
  }

  return groups;
}
