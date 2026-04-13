import type { Div, AstNode } from '@djot/djot';

type Transform = (node: any) => void | AstNode | AstNode[];
type FilterPart = Record<string, Transform>;
type Filter = () => FilterPart | FilterPart[];

const ROLES = new Set(['prompt', 'agent']);

/**
 * Djot filter that marks conversation divs with a `data-conversation` attribute.
 * The actual HTML rendering is handled by the renderer override in endnotes.ts.
 *
 * Input djot:
 *   ::: prompt
 *   Help me with my banking setup.
 *   :::
 *
 * After filter: div node gains `data-conversation="prompt"` attribute.
 * Renderer override produces the final `<pre><kbd>` HTML.
 */
export const conversationFilter: Filter = () => ({
  div: (node: Div): void => {
    const cls = node.attributes?.class;
    if (!cls || !ROLES.has(cls)) return;

    // Mark as conversation for the renderer override
    if (!node.attributes) node.attributes = {};
    node.attributes['data-conversation'] = cls;
  },
});
