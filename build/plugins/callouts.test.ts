import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkCallouts from './callouts.js';

const process = (md: string) =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCallouts)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { closeSelfClosing: true })
    .process(md)
    .then((r) => String(r));

describe('remarkCallouts', () => {
  it('transforms a SCIENCE callout', async () => {
    const md = '> **[SCIENCE]** Studies show this works.';
    const html = await process(md);
    expect(html).toContain('class="callout callout-science"');
    expect(html).toContain('class="callout-label"');
    expect(html).toContain('SCIENCE');
    expect(html).toContain('Studies show this works.');
    expect(html).not.toContain('**[SCIENCE]**');
  });

  it('transforms a TIP callout', async () => {
    const md = '> **[TIP]** Add plain language to your prompt.';
    const html = await process(md);
    expect(html).toContain('callout-tip');
    expect(html).toContain('Add plain language to your prompt.');
  });

  it('transforms a FAIRNESS callout', async () => {
    const md = '> **[FAIRNESS]** Verify with a legal aid org.';
    const html = await process(md);
    expect(html).toContain('callout-fairness');
  });

  it('transforms a MEME callout', async () => {
    const md = '> **[MEME]** This is fine.';
    const html = await process(md);
    expect(html).toContain('callout-meme');
  });

  it('transforms a SPEC callout', async () => {
    const md = '> **[SPEC]** The interview loop begins here.';
    const html = await process(md);
    expect(html).toContain('callout-spec');
  });

  it('transforms an ALSO callout', async () => {
    const md = '> **[ALSO]** Claude calls this a Project. Gemini calls it a Gem.';
    const html = await process(md);
    expect(html).toContain('callout-also');
  });

  it('leaves normal blockquotes unchanged', async () => {
    const md = '> Just a regular quote.';
    const html = await process(md);
    expect(html).toContain('<blockquote>');
    expect(html).not.toContain('callout');
  });

  it('leaves blockquotes with non-callout bold unchanged', async () => {
    const md = '> **Important:** do not forget.';
    const html = await process(md);
    expect(html).toContain('<blockquote>');
    expect(html).not.toContain('callout');
  });

  it('handles multi-paragraph callouts', async () => {
    const md = `> **[SCIENCE]** First paragraph.
>
> Second paragraph with more detail.`;
    const html = await process(md);
    expect(html).toContain('callout-science');
    expect(html).toContain('First paragraph.');
    expect(html).toContain('Second paragraph with more detail.');
  });
});
