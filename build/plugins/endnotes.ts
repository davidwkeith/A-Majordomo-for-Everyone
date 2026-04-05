import type { Root, Element } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Rehype plugin that transforms remark-gfm footnotes into
 * ePub 3.0 endnotes at the end of each chapter.
 *
 * remark-gfm generates:
 *   - Inline refs: <sup><a href="#user-content-fn-X" ...>
 *   - Definitions: <section data-footnotes class="footnotes">
 *
 * This plugin transforms them into:
 *   - Inline refs: <a epub:type="noteref" href="#en-{id}">[N]</a>
 *   - Endnotes section: <aside epub:type="endnotes"> with
 *     individual <aside epub:type="endnote" id="en-{id}"> blocks
 */
const rehypeEndnotes: Plugin<[], Root> = () => {
  return (tree: Root) => {
    const footnoteSection: Element | undefined = findFootnoteSection(tree);
    if (!footnoteSection) return;

    // Transform inline footnote references
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'sup') return;
      const anchor = node.children.find(
        (c): c is Element => c.type === 'element' && c.tagName === 'a'
      );
      if (!anchor) return;

      const href = String(anchor.properties?.href ?? '');
      if (!href.includes('fn-')) return;

      const fnId = href.replace(/^#user-content-fn-/, '').replace(/^#fn-/, '');

      // Replace the <sup><a> with a flat <a epub:type="noteref">
      node.tagName = 'a';
      node.properties = {
        'epub:type': 'noteref',
        href: `#en-${fnId}`,
        className: ['endnote-ref'],
      };
      node.children = anchor.children;
    });

    // Transform the footnotes section into endnotes
    footnoteSection.tagName = 'aside';
    footnoteSection.properties = {
      'epub:type': 'endnotes',
      className: ['endnotes'],
    };
    delete footnoteSection.properties?.['dataFootnotes'];

    // Transform each <li> inside the footnotes <ol> into an endnote aside
    visit(footnoteSection, 'element', (node: Element) => {
      if (node.tagName !== 'li') return;
      const id = String(node.properties?.id ?? '');
      const fnId = id
        .replace(/^user-content-fn-/, '')
        .replace(/^fn-/, '');
      if (!fnId) return;

      node.tagName = 'aside';
      node.properties = {
        'epub:type': 'endnote',
        id: `en-${fnId}`,
        className: ['endnote'],
      };

      // Remove backref links
      visit(node, 'element', (child: Element, index, parent) => {
        if (
          child.tagName === 'a' &&
          String(child.properties?.href ?? '').includes('fnref')
        ) {
          if (parent && typeof index === 'number') {
            (parent as Element).children.splice(index, 1);
          }
        }
      });
    });

    // Remove the <ol> wrapper, promote children
    visit(footnoteSection, 'element', (node: Element, index, parent) => {
      if (node.tagName === 'ol' && parent) {
        const parentEl = parent as Element;
        if (typeof index === 'number') {
          parentEl.children.splice(index, 1, ...node.children);
        }
      }
    });
  };
};

function findFootnoteSection(tree: Root): Element | undefined {
  let result: Element | undefined;
  visit(tree, 'element', (node: Element) => {
    if (
      node.tagName === 'section' &&
      (node.properties?.dataFootnotes !== undefined ||
        (Array.isArray(node.properties?.className) &&
          (node.properties.className as string[]).includes('footnotes')))
    ) {
      result = node;
    }
  });
  return result;
}

export default rehypeEndnotes;
