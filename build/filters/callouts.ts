import type { Div, AstNode } from '@djot/djot';
import { CALLOUT_TYPES } from '../types.js';

type Transform = (node: any) => void | AstNode | AstNode[];
type FilterPart = Record<string, Transform>;
type Filter = () => FilterPart | FilterPart[];

/**
 * Djot filter that marks callout divs with a `data-callout` attribute.
 * The actual HTML rendering is handled by the renderer override in endnotes.ts.
 *
 * Input djot:
 *   ::: science
 *   Studies show this works.
 *   :::
 *
 * After filter: div node gains `data-callout="science"` attribute.
 * Renderer override produces the final `<aside>` HTML.
 */
export const calloutFilter: Filter = () => ({
  div: (node: Div): void => {
    const cls = node.attributes?.class;
    if (!cls || !CALLOUT_TYPES.includes(cls as typeof CALLOUT_TYPES[number])) {
      return;
    }

    // Mark as callout for the renderer override
    if (!node.attributes) node.attributes = {};
    node.attributes['data-callout'] = cls;
  },
});
