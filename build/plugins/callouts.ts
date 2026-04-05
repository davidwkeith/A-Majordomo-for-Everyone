import type { Root, Blockquote, Paragraph, Strong, Text } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { CALLOUT_TYPES } from '../types.js';

const CALLOUT_PATTERN = /^\[(SCIENCE|TIP|FAIRNESS|MEME|SPEC|ALSO)\]\s*/;

/**
 * Remark plugin that transforms blockquotes starting with **[TYPE]**
 * into callout blocks with hName/hProperties for rehype.
 *
 * Input markdown:
 *   > **[SCIENCE]** Some text here...
 *
 * Output XHTML (after rehype):
 *   <aside class="callout callout-science" epub:type="sidebar" role="doc-sidebar">
 *     <p class="callout-label">SCIENCE</p>
 *     <p>Some text here...</p>
 *   </aside>
 */
const remarkCallouts: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      const firstChild = node.children[0];
      if (firstChild?.type !== 'paragraph') return;

      const para = firstChild as Paragraph;
      const firstInline = para.children[0];

      // Pattern: **[TYPE]** text...
      if (firstInline?.type !== 'strong') return;
      const strong = firstInline as Strong;
      if (strong.children.length !== 1) return;
      if (strong.children[0].type !== 'text') return;

      const strongText = (strong.children[0] as Text).value;
      const match = strongText.match(/^\[(SCIENCE|TIP|FAIRNESS|MEME|SPEC|ALSO)\]$/);
      if (!match) return;

      const calloutType = match[1].toLowerCase();
      if (!CALLOUT_TYPES.includes(calloutType as typeof CALLOUT_TYPES[number])) return;

      // Strip the **[TYPE]** from the paragraph
      para.children.shift(); // remove the <strong>

      // Remove leading whitespace from next text node
      if (para.children[0]?.type === 'text') {
        (para.children[0] as Text).value = (para.children[0] as Text).value.replace(/^\s+/, '');
      }

      // Add a label paragraph at the start
      const label: Paragraph = {
        type: 'paragraph',
        children: [{ type: 'text', value: match[1] }],
        data: {
          hProperties: { className: ['callout-label'] },
        },
      };

      node.children.unshift(label);

      // Transform the blockquote into an <aside> via hName/hProperties
      const data = node.data || (node.data = {});
      data.hName = 'aside';
      data.hProperties = {
        className: ['callout', `callout-${calloutType}`],
        'epub:type': 'sidebar',
        role: 'doc-sidebar',
      };
    });
  };
};

export default remarkCallouts;
