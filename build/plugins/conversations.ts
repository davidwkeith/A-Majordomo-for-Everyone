import type { Root, Element, ElementContent } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const LANG_MAP: Record<string, { tag: string; className: string }> = {
  prompt: { tag: 'kbd', className: 'conversation-prompt' },
  agent: { tag: 'samp', className: 'conversation-agent' },
};

/**
 * Rehype plugin that transforms <pre><code> blocks into semantic
 * conversation blocks.
 *
 * - Bare code blocks (no language) and `language-prompt` → <pre><kbd>
 * - `language-agent` → <pre><samp>
 * - Any other language class is left as standard <pre><code>.
 * - Single newlines become spaces (prose wrapping).
 * - Blank lines (double newlines) become <br/> paragraph breaks.
 *
 * Input HTML (from remark-rehype):
 *   <pre><code>Help me with my banking setup.\n...</code></pre>
 *
 * Output XHTML:
 *   <pre class="conversation conversation-prompt">
 *     <kbd>Help me with my banking setup. ...</kbd>
 *   </pre>
 */
const rehypeConversations: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'pre') return;

      // Find the <code> child
      const codeChild = node.children.find(
        (c): c is Element => c.type === 'element' && c.tagName === 'code'
      );
      if (!codeChild) return;

      // Determine the language from class (e.g. "language-prompt")
      const classes = (codeChild.properties?.className as string[]) ?? [];
      const langClass = classes.find((c) => c.startsWith('language-'));
      const lang = langClass ? langClass.replace('language-', '') : null;

      // Bare blocks (no lang) default to prompt; explicit prompt/agent respected;
      // any other lang (markdown, yaml, etc.) is left as standard code.
      let role: string;
      if (lang === null || lang === 'prompt') {
        role = 'prompt';
      } else if (lang === 'agent') {
        role = 'agent';
      } else {
        return;
      }

      const { tag, className } = LANG_MAP[role];

      // Extract text content from the code element
      const text = codeChild.children
        .filter((c): c is { type: 'text'; value: string } => c.type === 'text')
        .map((c) => c.value)
        .join('');

      // Split on blank lines (paragraph breaks), join single newlines as spaces
      const trimmed = text.replace(/\n+$/, '');
      const paragraphs = trimmed.split(/\n{2,}/);
      const innerChildren: ElementContent[] = [];
      for (let i = 0; i < paragraphs.length; i++) {
        if (i > 0) {
          innerChildren.push({
            type: 'element',
            tagName: 'br',
            properties: {},
            children: [],
          });
          innerChildren.push({
            type: 'element',
            tagName: 'br',
            properties: {},
            children: [],
          });
        }
        // Join single newlines with spaces for prose flow
        const prose = paragraphs[i].replace(/\n/g, ' ');
        if (prose) {
          innerChildren.push({ type: 'text', value: prose });
        }
      }

      // Replace <pre> contents and add classes
      node.properties = {
        className: ['conversation', className],
      };
      node.children = [
        {
          type: 'element',
          tagName: tag,
          properties: {},
          children: innerChildren,
        },
      ];
    });
  };
};

export default rehypeConversations;
