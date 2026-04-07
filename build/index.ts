import 'dotenv/config';
import { readFile, readdir } from 'node:fs/promises';
import { accessSync } from 'node:fs';
import { join, basename, dirname, resolve } from 'node:path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkCallouts from './plugins/callouts.js';
import remarkArtBriefs, { discoverBriefs } from './plugins/art-briefs.js';
import type { ArtBrief } from './plugins/art-briefs.js';
import rehypeEndnotes from './plugins/endnotes.js';
import { assembleEpub } from './epub/assemble.js';
import { generateMissingArt } from './generate-art.js';
import { BOOK_META } from './types.js';
import type { ChapterMeta, ProcessedChapter } from './types.js';

const ROOT = resolve(import.meta.dirname, '..', '..');
const CONTENT_DIR = join(ROOT, 'src', 'content');
const STYLES_DIR = join(ROOT, 'src', 'styles');
const IMAGES_DIR = join(ROOT, 'src', 'images');
const STYLE_GUIDE = join(ROOT, 'spec', 'illustration', 'gem-illustration-instructions.md');
const OUTPUT_PATH = join(ROOT, 'dist', 'a-majordomo-for-everyone.epub');

function createProcessor(briefs: Map<string, ArtBrief>) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCallouts)
    .use(remarkArtBriefs, { imagesDir: IMAGES_DIR, briefs })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeEndnotes)
    .use(rehypeStringify, {
      closeSelfClosing: true,
      allowDangerousHtml: true,
    });
}

async function discoverChapters(): Promise<string[]> {
  const entries = await readdir(CONTENT_DIR, { recursive: true });
  return entries
    .filter(
      (f: string) =>
        f.endsWith('.md') && !f.endsWith('.art.md') && !basename(f).startsWith('_')
    )
    .map((f: string) => join(CONTENT_DIR, f));
}

function parseSlug(filePath: string): string {
  const name = basename(filePath, '.md');
  // index.md uses the parent directory name as slug
  if (name === 'index') {
    return basename(dirname(filePath));
  }
  return name;
}

async function processChapter(
  filePath: string,
  processor: ReturnType<typeof createProcessor>
): Promise<ProcessedChapter> {
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

function imageExists(imagesDir: string, brief: ArtBrief): boolean {
  try {
    accessSync(join(imagesDir, `${brief.stem}.${brief.format}`));
    return true;
  } catch {
    return false;
  }
}

async function build(): Promise<void> {
  const args = process.argv.slice(2);
  const shouldGenerate = args.includes('--generate');
  const maxArg = args.find((a) => a.startsWith('--max='));
  const maxImages = maxArg ? parseInt(maxArg.split('=')[1], 10) : Infinity;

  // Discover art briefs from .art.md sidecar files
  console.log('Discovering art briefs...');
  const briefs = discoverBriefs(CONTENT_DIR);
  console.log(`Found ${briefs.size} art brief(s)`);

  // Check for missing images
  const missing = [...briefs.values()].filter(
    (b) => !imageExists(IMAGES_DIR, b)
  );
  if (missing.length > 0) {
    if (shouldGenerate) {
      const batch = missing.slice(0, maxImages);
      const count = await generateMissingArt(batch, IMAGES_DIR, STYLE_GUIDE);
      console.log(`Generated ${count}/${missing.length} image(s)`);
    } else {
      console.log(
        `${missing.length} art brief(s) without images (use --generate to create)`
      );
    }
  }

  const processor = createProcessor(briefs);

  console.log('Discovering chapters...');
  const files = await discoverChapters();
  console.log(`Found ${files.length} chapter files`);

  console.log('Processing chapters...');
  const chapters = await Promise.all(
    files.map((f) => processChapter(f, processor))
  );
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
