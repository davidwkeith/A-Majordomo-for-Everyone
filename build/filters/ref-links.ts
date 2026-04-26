import { parse } from '@djot/djot';
import type { AstNode } from '@djot/djot';

/**
 * AppleRef-style semantic cross-reference system.
 *
 * Source writes links with a `ref:` URL scheme — e.g. `[H-2](ref:h-2)`.
 * A pre-render pass scans every chapter for heading codes (`H-2`, `Ho-7`,
 * `IRL-1`, …) and builds a registry mapping `code → {slug, anchor}`. At
 * render time, a filter rewrites every `ref:` link to a concrete
 * `slug.xhtml#anchor` URL. Unresolved refs emit a warning and degrade to
 * plain text (link unwrapped, label kept) rather than shipping a dead
 * anchor.
 */

export interface RefTarget {
  slug: string;
  anchor: string;
}

export type RefRegistry = Map<string, RefTarget>;

export interface RefWarning {
  tag: string;
  sourceFile?: string;
}

/**
 * Walk an AST visiting every node.
 */
function walk(node: any, visit: (n: any) => void): void {
  visit(node);
  if (Array.isArray(node.children)) node.children.forEach((c: any) => walk(c, visit));
}

function extractText(node: any): string {
  if (!node) return '';
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node.children)) return node.children.map(extractText).join('');
  return '';
}

/**
 * Scan every chapter's djot source for heading codes and build the registry.
 * The anchor id matches the lowercase code, mirroring the id hoisted onto
 * headings by the section renderer override.
 */
export function buildRefRegistry(
  chapters: Array<{ slug: string; content: string }>
): RefRegistry {
  const registry: RefRegistry = new Map();
  for (const { slug, content } of chapters) {
    const doc = parse(content) as any;
    walk(doc, (n) => {
      if (n.tag !== 'section') return;
      const first = n.children?.[0];
      if (first?.tag !== 'heading') return;
      const text = extractText(first);
      const m = text.match(/^([A-Za-z]{1,3}-\d+[a-z]?):/);
      if (!m) return;
      const code = m[1].toLowerCase();
      const existing = registry.get(code);
      if (existing && existing.slug !== slug) {
        console.warn(
          `[ref] duplicate code "${code}" — already registered in ${existing.slug}, now also in ${slug}`
        );
      }
      registry.set(code, { slug, anchor: code });
    });
  }
  return registry;
}

type Transform = (node: any) => void | AstNode | AstNode[];
type FilterPart = Record<string, Transform>;
type Filter = () => FilterPart | FilterPart[];

/**
 * Djot filter that assigns `id="<code>"` to headings whose text starts with
 * a code prefix like `H-2:` or `Ho-7:`. Runs before render so the standard
 * djot renderer emits the id naturally — no string hoisting required.
 * Preserves any id already set by explicit djot `{#id}` attributes.
 */
export function headingIdsFilter(): Filter {
  return () => ({
    heading: (node: any): void => {
      const text = extractText(node);
      const m = text.match(/^([A-Za-z]{1,3}-\d+[a-z]?):/);
      if (!m) return;
      if (!node.attributes) node.attributes = {};
      if (node.attributes.id) return;
      node.attributes.id = m[1].toLowerCase();
    },
  });
}

/**
 * Djot filter that rewrites `ref:` URLs to concrete chapter anchors.
 * Emits warnings into the supplied array; unresolved links are replaced
 * by their text content so the reader still sees something sensible.
 */
export function refLinksFilter(
  registry: RefRegistry,
  warnings: RefWarning[],
  sourceFile?: string
): Filter {
  return () => ({
    link: (node: any): void | AstNode[] => {
      const dest: unknown = node.destination;
      if (typeof dest !== 'string' || !dest.startsWith('ref:')) return;
      const tag = dest.slice('ref:'.length).toLowerCase();
      const target = registry.get(tag);
      if (target) {
        node.destination = `${target.slug}.xhtml#${target.anchor}`;
        return;
      }
      warnings.push({ tag, sourceFile });
      return Array.isArray(node.children) ? node.children : [];
    },
  });
}
