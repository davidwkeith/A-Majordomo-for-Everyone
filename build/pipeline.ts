import { readFile, readdir, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, basename, dirname, resolve, extname } from 'node:path';
import sharp from 'sharp';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkCallouts from './plugins/callouts.js';
import remarkArtBriefs, { discoverBriefs } from './plugins/art-briefs.js';
import type { ArtBrief } from './plugins/art-briefs.js';
import rehypeConversations from './plugins/conversations.js';
import rehypeEndnotes from './plugins/endnotes.js';
import type { ChapterMeta, ProcessedChapter } from './types.js';

export const ROOT = resolve(import.meta.dirname, '..', '..');
export const CONTENT_DIR = join(ROOT, 'src', 'content');
export const STYLES_DIR = join(ROOT, 'src', 'styles');
export const IMAGES_DIR = join(ROOT, 'src', 'images');
export const STYLE_GUIDE = join(
  ROOT,
  'spec',
  'illustration',
  'gem-illustration-instructions.md'
);

export { discoverBriefs };
export type { ArtBrief };

export function createProcessor(briefs: Map<string, ArtBrief>) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCallouts)
    .use(remarkArtBriefs, { imagesDir: IMAGES_DIR, briefs })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeConversations)
    .use(rehypeEndnotes)
    .use(rehypeStringify, {
      closeSelfClosing: true,
      allowDangerousHtml: true,
    });
}

export async function discoverChapters(): Promise<string[]> {
  const entries = await readdir(CONTENT_DIR, { recursive: true });
  return entries
    .filter(
      (f: string) =>
        f.endsWith('.md') && !f.endsWith('.art.md') && !basename(f).startsWith('_')
    )
    .map((f: string) => join(CONTENT_DIR, f));
}

export function parseSlug(filePath: string): string {
  const name = basename(filePath, '.md');
  if (name === 'index') {
    return basename(dirname(filePath));
  }
  return name;
}

export async function processChapter(
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

export function sortChapters(chapters: ProcessedChapter[]): ProcessedChapter[] {
  return chapters.sort((a, b) => {
    if (a.meta.part !== b.meta.part) return a.meta.part - b.meta.part;
    return a.meta.order - b.meta.order;
  });
}

export function getPartLabel(partNum: number): string {
  switch (partNum) {
    case 0:
      return 'Introduction';
    case 1:
      return 'Part One: The Strategies';
    case 2:
      return 'Part Two: The Field Guide';
    case 3:
      return 'Part Three: The General Method';
    case 4:
      return 'Appendices';
    default:
      return `Part ${partNum}`;
  }
}

export function groupByPart(
  chapters: ProcessedChapter[]
): Map<number, ProcessedChapter[]> {
  const map = new Map<number, ProcessedChapter[]>();
  for (const ch of chapters) {
    const arr = map.get(ch.meta.part) ?? [];
    arr.push(ch);
    map.set(ch.meta.part, arr);
  }
  return map;
}

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

/**
 * Copy images from src/images/ to an output directory, resizing any
 * that exceed maxWidth and re-compressing PNGs. SVGs and small images
 * pass through unchanged. Returns the number of images processed.
 */
export async function optimizeImages(
  srcDir: string,
  destDir: string,
  maxWidth = 1200
): Promise<number> {
  await mkdir(destDir, { recursive: true });
  const entries = await readdir(srcDir, { recursive: true });
  let count = 0;

  for (const entry of entries) {
    const srcPath = join(srcDir, entry);
    const info = await stat(srcPath);
    if (info.isDirectory()) continue;

    const ext = extname(entry).toLowerCase();
    const destPath = join(destDir, entry);

    // Ensure subdirectory exists
    await mkdir(dirname(destPath), { recursive: true });

    if (!IMAGE_EXTS.has(ext)) {
      // SVG, GIF, etc. — copy as-is
      const data = await readFile(srcPath);
      await writeFile(destPath, data);
    } else {
      const img = sharp(srcPath);
      const meta = await img.metadata();
      let pipeline = img;

      if (meta.width && meta.width > maxWidth) {
        pipeline = pipeline.resize(maxWidth);
      }

      if (ext === '.png') {
        pipeline = pipeline.png({ compressionLevel: 9 });
      } else if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({ quality: 85 });
      } else if (ext === '.webp') {
        pipeline = pipeline.webp({ quality: 85 });
      }

      await pipeline.toFile(destPath);
    }
    count++;
  }

  return count;
}
