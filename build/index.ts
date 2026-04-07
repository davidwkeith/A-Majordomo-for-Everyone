import { readFile, readdir } from 'node:fs/promises';
import { join, basename, resolve } from 'node:path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkCallouts from './plugins/callouts.js';
import remarkArtBriefs from './plugins/art-briefs.js';
import rehypeEndnotes from './plugins/endnotes.js';
import { assembleEpub } from './epub/assemble.js';
import { BOOK_META } from './types.js';
import type { ChapterMeta, ProcessedChapter } from './types.js';

const ROOT = resolve(import.meta.dirname, '..', '..');
const CONTENT_DIR = join(ROOT, 'src', 'content');
const STYLES_DIR = join(ROOT, 'src', 'styles');
const IMAGES_DIR = join(ROOT, 'src', 'images');
const OUTPUT_PATH = join(ROOT, 'dist', 'a-majordomo-for-everyone.epub');

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkCallouts)
  .use(remarkArtBriefs, { imagesDir: IMAGES_DIR })
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeEndnotes)
  .use(rehypeStringify, {
    closeSelfClosing: true,
    allowDangerousHtml: true,
  });

async function discoverChapters(): Promise<string[]> {
  const entries = await readdir(CONTENT_DIR, { recursive: true });
  return entries
    .filter((f: string) => f.endsWith('.md') && !basename(f).startsWith('_'))
    .map((f: string) => join(CONTENT_DIR, f));
}

function parseSlug(filePath: string): string {
  return basename(filePath, '.md');
}

async function processChapter(filePath: string): Promise<ProcessedChapter> {
  const raw = await readFile(filePath, 'utf-8');
  const { data, content } = matter(raw);

  const meta: ChapterMeta = {
    title: String(data.title ?? ''),
    part: Number(data.part ?? 0),
    order: Number(data.order ?? 0),
    strategy: data.strategy != null ? Number(data.strategy) : null,
    status: String(data.status ?? 'draft'),
    slug: parseSlug(filePath),
    sourceFile: filePath,
  };

  const result = await processor.process(content);
  let html = String(result);

  // Strip the first heading if it duplicates the frontmatter title.
  // The template already emits <h1> from the frontmatter, so a matching
  // heading in the markdown body is redundant. Handles headings with
  // prefixes like "Chapter 1:", "Strategy 0:", "Appendix A:", etc.
  if (meta.title) {
    const escaped = meta.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prefix = '(?:(?:Chapter|Strategy|Appendix|Part)\\s+[\\w-]+:\\s*)?';
    html = html.replace(
      new RegExp(`\\s*<h[1-6][^>]*>\\s*${prefix}${escaped}\\s*</h[1-6]>\\s*`, 'i'),
      ''
    );
  }

  return { meta, html, endnotes: [] };
}

function sortChapters(chapters: ProcessedChapter[]): ProcessedChapter[] {
  return chapters.sort((a, b) => {
    if (a.meta.part !== b.meta.part) return a.meta.part - b.meta.part;
    return a.meta.order - b.meta.order;
  });
}

async function build(): Promise<void> {
  console.log('Discovering chapters...');
  const files = await discoverChapters();
  console.log(`Found ${files.length} chapter files`);

  console.log('Processing chapters...');
  const chapters = await Promise.all(files.map(processChapter));
  const sorted = sortChapters(chapters);

  console.log('Assembling ePub...');
  await assembleEpub(
    BOOK_META,
    sorted,
    join(STYLES_DIR, 'epub.css'),
    IMAGES_DIR,
    OUTPUT_PATH
  );

  console.log(`ePub written to ${OUTPUT_PATH}`);
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
