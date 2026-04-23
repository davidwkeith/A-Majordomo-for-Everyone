import type {
  Doc,
  Div,
  Para,
  Span,
  Section,
  ThematicBreak,
  FootnoteReference,
  Footnote,
  Visitor,
  HTMLRenderer,
} from '@djot/djot';
import { renderHTML } from '@djot/djot';
import { CALLOUT_TYPES } from '../types.js';
import type { ArtBriefContext } from './art-briefs.js';

const CONVERSATION_MAP: Record<string, { tag: string; className: string }> = {
  prompt: { tag: 'kbd', className: 'conversation-prompt' },
  agent: { tag: 'samp', className: 'conversation-agent' },
};

/**
 * State tracker for footnote numbering across a chapter.
 */
export class EndnoteState {
  index = 0;
  labelToNum = new Map<string, number>();
  footnoteOrder: { label: string; num: number }[] = [];
  refEmitted = new Set<string>();

  getNum(label: string): number {
    let num = this.labelToNum.get(label);
    if (num == null) {
      num = ++this.index;
      this.labelToNum.set(label, num);
      this.footnoteOrder.push({ label, num });
    }
    return num;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sizeToClass(size: string): string {
  switch (size) {
    case 'full':
      return 'inline-graphic inline-graphic-full';
    case 'half-left':
      return 'inline-graphic inline-graphic-half inline-graphic-half-left';
    case 'half-right':
      return 'inline-graphic inline-graphic-half inline-graphic-half-right';
    default:
      return 'inline-graphic inline-graphic-margin';
  }
}

/** Check if a para contains only a single art span. */
function isArtPara(node: Para): boolean {
  return (
    node.children.length === 1 &&
    node.children[0].tag === 'span' &&
    node.children[0].attributes?.class === 'art'
  );
}

/**
 * Create renderHTML overrides for the ePub pipeline.
 *
 * Handles: art briefs, callouts, conversations, footnote references,
 * section suppression, and XHTML self-closing tags.
 */
export function epubOverrides(
  state: EndnoteState,
  artCtx?: ArtBriefContext
): Visitor<HTMLRenderer, string> {
  return {
    // A paragraph containing only an art span renders as a <figure>
    // (not wrapped in <p>, since <figure> is block-level).
    para: (node: Para, renderer: HTMLRenderer): string => {
      if (isArtPara(node)) {
        return renderer.renderChildren(node);
      }
      return renderer.renderAstNodeDefault(node);
    },

    // Art brief span: [stem]{.art} or [_caption_]{.art stem="stem"} → <figure>
    //
    // Two forms:
    //   [stem-name]{.art}                         — no caption, stem is text content
    //   [_caption text_]{.art stem="stem-name"}   — caption is text content, stem is attribute
    span: (node: Span, renderer: HTMLRenderer): string => {
      if (node.attributes?.class !== 'art' || !artCtx) {
        return renderer.renderAstNodeDefault(node);
      }

      // Determine stem: explicit attribute wins, otherwise text content.
      // Djot represents spaces within str.text; soft_break appears only
      // if the span wraps across source lines.
      const explicitStem = node.attributes?.stem;
      const textStem = node.children
        .map((c: any) => (c.tag === 'str' ? c.text : c.tag === 'soft_break' ? ' ' : ''))
        .join('');
      const stem = explicitStem || textStem;

      // Caption: present only when stem is in the attribute (text is the caption)
      const hasCaption = !!explicitStem;

      if (!stem) return '';

      const brief = artCtx.briefs.get(stem);
      if (!brief) {
        console.warn(`art-briefs: unknown reference "${stem}"`);
        return '';
      }

      const imageFile = `${brief.stem}.${brief.format}`;
      const caption = hasCaption
        ? `<figcaption>${renderer.renderChildren(node)}</figcaption>`
        : '';

      if (artCtx.existingImages.has(stem)) {
        const xmp = artCtx.xmpCache.get(stem);
        const alt = xmp?.altText || brief.alt;
        const cls = sizeToClass(brief.size);
        return `<figure class="${cls}"><img src="../images/${escapeHtml(imageFile)}" alt="${escapeHtml(alt)}"/>${caption}</figure>`;
      }

      const cls = `art-placeholder art-placeholder-${brief.size}`;
      return (
        `<figure class="${cls}">\n` +
        `  <div class="art-placeholder-box">\n` +
        `    <p class="art-placeholder-file">${escapeHtml(imageFile)}</p>\n` +
        `    <details>\n` +
        `      <summary>${escapeHtml(brief.alt)}</summary>\n` +
        `      <p class="art-placeholder-brief">${escapeHtml(brief.brief)}</p>\n` +
        `    </details>\n` +
        `  </div>\n` +
        `${caption}` +
        `</figure>`
      );
    },

    div: (node: Div, renderer: HTMLRenderer): string => {
      // Callout divs (marked by calloutFilter)
      const calloutType = node.attributes?.['data-callout'];
      if (calloutType && CALLOUT_TYPES.includes(calloutType as any)) {
        const label = calloutType.toUpperCase();
        const inner = renderer.renderChildren(node);
        return (
          `<aside class="callout callout-${escapeHtml(calloutType)}" epub:type="sidebar" role="doc-sidebar">\n` +
          `<p class="callout-label">${escapeHtml(label)}</p>\n` +
          `${inner}` +
          `</aside>`
        );
      }

      // Conversation divs (marked by conversationFilter)
      const role = node.attributes?.['data-conversation'];
      if (role && role in CONVERSATION_MAP) {
        const { tag, className } = CONVERSATION_MAP[role];
        const text = extractConversationText(node, renderer);
        return (
          `<pre class="conversation ${escapeHtml(className)}">` +
          `<${tag}>${text}</${tag}>` +
          `</pre>`
        );
      }

      // Default div rendering
      return renderer.renderAstNodeDefault(node);
    },

    footnote_reference: (
      node: FootnoteReference,
      _renderer: HTMLRenderer
    ): string => {
      const label = node.text;
      const num = state.getNum(label);
      const escaped = escapeHtml(label);
      // Only the first reference for a given label gets the id; subsequent
      // references to the same footnote omit it to avoid duplicate ids.
      const isFirst = !state.refEmitted.has(label);
      state.refEmitted.add(label);
      const idAttr = isFirst ? ` id="fnref-${escaped}"` : '';
      return `<a epub:type="noteref" role="doc-noteref" href="#en-${escaped}"${idAttr} class="endnote-ref">[${num}]</a>`;
    },

    section: (node: Section, renderer: HTMLRenderer): string => {
      return renderer.renderChildren(node);
    },

    thematic_break: (_node: ThematicBreak, _renderer: HTMLRenderer): string => {
      return '<hr />\n';
    },
  };
}

/**
 * Extract text from a conversation div's children, applying prose wrapping:
 * single newlines become spaces, blank lines become <br/> breaks.
 */
function extractConversationText(node: Div, renderer: HTMLRenderer): string {
  // Render each child paragraph, then join with <br/><br/> breaks
  const parts: string[] = [];
  for (const child of node.children) {
    if (child.tag === 'para') {
      const html = renderer.renderChildren(child);
      parts.push(html);
    }
  }
  return parts.join('<br/><br/>');
}

/**
 * Render the endnotes section for a chapter.
 */
export function renderNotesSection(
  doc: Doc,
  state: EndnoteState
): string {
  if (state.footnoteOrder.length === 0) return '';

  const notes: string[] = [];
  for (const { label, num } of state.footnoteOrder) {
    const fn = doc.footnotes[label];
    if (!fn) continue;

    const tempDoc: Doc = {
      tag: 'doc',
      references: doc.references,
      autoReferences: doc.autoReferences,
      footnotes: {},
      children: fn.children,
    };
    const content = renderHTML(tempDoc);
    const escaped = escapeHtml(label);
    const backlink =
      `<a epub:type="backlink" role="doc-backlink" class="endnote-backlink" ` +
      `href="#fnref-${escaped}" aria-label="Back to reference ${num}">\u21a9</a>`;

    notes.push(
      `<aside epub:type="endnote" role="doc-endnote" id="en-${escaped}" class="endnote">\n${content}${backlink}\n</aside>`
    );
  }

  return (
    `<aside epub:type="endnotes" class="endnotes">\n` +
    notes.join('\n') +
    `\n</aside>`
  );
}
