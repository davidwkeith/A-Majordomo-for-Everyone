import type {
  Doc,
  Div,
  Para,
  Span,
  Section,
  ThematicBreak,
  FootnoteReference,
  Footnote,
  OrderedList,
  BulletList,
  ListItem,
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

/** Flatten a heading's inline children to plain text for id generation. */
function extractHeadingText(node: any): string {
  if (!node) return '';
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node.children)) return node.children.map(extractHeadingText).join('');
  return '';
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
      // Hoist an id onto the first heading so cross-references can link
      // directly to a skill section. Prefer a code-based slug (e.g. "H-2"
      // or "Ho-7") extracted from the heading text — that gives stable,
      // predictable anchors that match the code used in cross-refs.
      const children = renderer.renderChildren(node);
      const first = node.children?.[0] as any;
      if (first?.tag !== 'heading') return children;
      const headingText = extractHeadingText(first);
      const codeMatch = headingText.match(/^([A-Za-z]{1,3}-\d+[a-z]?):/);
      const id = codeMatch ? codeMatch[1].toLowerCase() : undefined;
      if (!id) return children;
      const openTag = children.match(/^<h[1-6]/);
      if (!openTag) return children;
      const insertAt = openTag[0].length;
      return children.slice(0, insertAt) + ` id="${escapeHtml(id)}"` + children.slice(insertAt);
    },

    thematic_break: (_node: ThematicBreak, _renderer: HTMLRenderer): string => {
      return '<hr />\n';
    },
  };
}

/**
 * Extract text from a conversation div's children, applying prose wrapping:
 * paragraphs are separated by blank-line breaks, and ordered/bullet lists are
 * flattened to one item per line so the content renders inside <kbd>/<samp>
 * without introducing block-level list markup.
 */
function extractConversationText(node: Div, renderer: HTMLRenderer): string {
  const parts: string[] = [];
  for (const child of node.children) {
    const rendered = renderConversationBlock(child, renderer);
    if (rendered) parts.push(rendered);
  }
  return parts.join('<br/><br/>');
}

function renderConversationBlock(
  block: Div['children'][number],
  renderer: HTMLRenderer
): string {
  if (block.tag === 'para') {
    return renderer.renderChildren(block);
  }
  if (block.tag === 'ordered_list' || block.tag === 'bullet_list') {
    return renderConversationList(block, renderer);
  }
  return '';
}

function renderConversationList(
  list: OrderedList | BulletList,
  renderer: HTMLRenderer
): string {
  const isOrdered = list.tag === 'ordered_list';
  let num = isOrdered ? (list as OrderedList).start ?? 1 : 0;
  const lines: string[] = [];
  for (const item of list.children) {
    if (item.tag !== 'list_item') continue;
    const marker = isOrdered ? `${num++}. ` : '— ';
    lines.push(marker + renderListItemContent(item, renderer));
  }
  return lines.join('<br/>');
}

function renderListItemContent(item: ListItem, renderer: HTMLRenderer): string {
  const parts: string[] = [];
  for (const child of item.children) {
    const rendered = renderConversationBlock(child, renderer);
    if (rendered) parts.push(rendered);
  }
  return parts.join('<br/>');
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
    const numLabel = `<span class="endnote-num">[${num}]</span> `;
    const backlink =
      `<a epub:type="backlink" role="doc-backlink" class="endnote-backlink" ` +
      `href="#fnref-${escaped}" aria-label="Back to reference ${num}">\u21a9</a>`;

    // Inject the visible number label inside the first paragraph and the
    // backlink inside the last — both inline so they flow with the prose
    // instead of sitting on their own lines.
    let rendered = content;
    const openPMatch = rendered.match(/<p(\s[^>]*)?>/);
    if (openPMatch && openPMatch.index != null) {
      const insertAt = openPMatch.index + openPMatch[0].length;
      rendered = rendered.slice(0, insertAt) + numLabel + rendered.slice(insertAt);
    } else {
      rendered = numLabel + rendered;
    }
    const lastPIdx = rendered.lastIndexOf('</p>');
    rendered =
      lastPIdx >= 0
        ? rendered.slice(0, lastPIdx) + backlink + rendered.slice(lastPIdx)
        : rendered.replace(/\s+$/, '') + backlink;

    notes.push(
      `<aside epub:type="endnote" role="doc-endnote" id="en-${escaped}" class="endnote">\n${rendered}</aside>`
    );
  }

  return (
    `<aside epub:type="endnotes" class="endnotes">\n` +
    notes.join('\n') +
    `\n</aside>`
  );
}
