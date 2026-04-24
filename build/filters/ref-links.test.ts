import { describe, it, expect } from 'vitest';
import { parse, renderHTML, applyFilter } from '@djot/djot';
import { buildRefRegistry, refLinksFilter } from './ref-links.js';
import type { RefWarning } from './ref-links.js';

const render = (dj: string, opts: {
  registry?: ReturnType<typeof buildRefRegistry>;
  warnings?: RefWarning[];
  sourceFile?: string;
} = {}): string => {
  const doc = parse(dj);
  if (opts.registry) {
    applyFilter(doc, refLinksFilter(opts.registry, opts.warnings ?? [], opts.sourceFile));
  }
  return renderHTML(doc);
};

describe('ref-links filter', () => {
  it('builds a registry from heading codes across chapters', () => {
    const registry = buildRefRegistry([
      { slug: '01-health', content: '#### H-2: Preparing Questions\n\nBody.\n' },
      { slug: '05-life', content: '#### Li-1: Difficult Conversations\n\nBody.\n' },
      { slug: '09-irl-interactions', content: '#### IRL-1: Government Offices\n\nBody.\n' },
    ]);
    expect(registry.size).toBe(3);
    expect(registry.get('h-2')).toEqual({ slug: '01-health', anchor: 'h-2' });
    expect(registry.get('li-1')).toEqual({ slug: '05-life', anchor: 'li-1' });
    expect(registry.get('irl-1')).toEqual({ slug: '09-irl-interactions', anchor: 'irl-1' });
  });

  it('rewrites ref: links to concrete chapter anchors', () => {
    const registry = buildRefRegistry([
      { slug: '01-health', content: '#### H-2: Preparing Questions\n\nBody.\n' },
    ]);
    const html = render('See [H-2](ref:h-2) for prep.', { registry });
    expect(html).toContain('href="01-health.xhtml#h-2"');
    expect(html).not.toContain('ref:h-2');
  });

  it('strips unresolved refs to plain text and collects a warning', () => {
    const registry = buildRefRegistry([]);
    const warnings: RefWarning[] = [];
    const html = render('See [Cr-4 (Writing a Book)](ref:cr-4) for craft.', {
      registry,
      warnings,
      sourceFile: 'test.dj',
    });
    expect(html).not.toContain('href');
    expect(html).not.toContain('ref:cr-4');
    expect(html).toContain('Cr-4 (Writing a Book)');
    expect(warnings).toEqual([{ tag: 'cr-4', sourceFile: 'test.dj' }]);
  });

  it('leaves non-ref links untouched', () => {
    const registry = buildRefRegistry([]);
    const html = render('See [docs](https://example.com/docs).', { registry });
    expect(html).toContain('href="https://example.com/docs"');
  });
});
