import { readFile, readdir, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, basename, dirname, resolve, extname } from 'node:path';
import sharp from 'sharp';
import matter from 'gray-matter';
import { parse, renderHTML, applyFilter } from '@djot/djot';
import { calloutFilter } from './filters/callouts.js';
import { discoverBriefs } from './filters/art-briefs.js';
import type { ArtBrief, ArtBriefContext, XmpData } from './filters/art-briefs.js';
import { conversationFilter } from './filters/conversations.js';
import { EndnoteState, epubOverrides, renderNotesSection } from './filters/endnotes.js';
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

/** Extract XMP metadata fields from an image using Sharp. */
async function readXmp(imagePath: string): Promise<XmpData> {
  const result: XmpData = {};
  try {
    const meta = await sharp(imagePath).metadata();
    if (!meta.xmp) return result;

    const xmpStr = meta.xmp.toString('utf-8');

    const altMatch = xmpStr.match(
      /Iptc4xmpCore:AltTextAccessibility[^>]*>([^<]+)</
    );
    if (altMatch) result.altText = altMatch[1].trim();

    const descMatch = xmpStr.match(
      /dc:description[\s\S]*?<rdf:li[^>]*>([^<]+)<\/rdf:li>/
    );
    if (descMatch) result.description = descMatch[1].trim();

    const rightsMatch = xmpStr.match(
      /dc:rights[\s\S]*?<rdf:li[^>]*>([^<]+)<\/rdf:li>/
    );
    if (rightsMatch) result.rights = rightsMatch[1].trim();
  } catch {
    // Image unreadable or no XMP — fall back to brief fields
  }
  return result;
}

/**
 * Pre-read XMP data and check image existence for all briefs.
 * Must be called once before processing chapters, since Djot filters
 * are synchronous and cannot do async I/O.
 */
export async function prepareArtContext(
  briefs: Map<string, ArtBrief>,
  imagesDir: string
): Promise<ArtBriefContext> {
  const xmpCache = new Map<string, XmpData>();
  const existingImages = new Set<string>();

  await Promise.all(
    [...briefs.values()].map(async (brief) => {
      const imagePath = join(imagesDir, `${brief.stem}.${brief.format}`);
      try {
        await stat(imagePath);
        existingImages.add(brief.stem);
        const xmp = await readXmp(imagePath);
        xmpCache.set(brief.stem, xmp);
      } catch {
        // Image does not exist
      }
    })
  );

  return { imagesDir, briefs, xmpCache, existingImages };
}

/**
 * Process Djot content through the full filter pipeline and render to HTML.
 */
export function processContent(
  content: string,
  artCtx: ArtBriefContext
): string {
  // Strip HTML comments (editorial notes like RESEARCH NEEDED)
  const cleaned = content.replace(/<!--[\s\S]*?-->/g, '');

  const doc = parse(cleaned);

  applyFilter(doc, calloutFilter);
  applyFilter(doc, conversationFilter);

  // Render HTML with epub overrides (handles art briefs, callouts,
  // conversations, endnotes, sections, and XHTML self-closing tags)
  const endnoteState = new EndnoteState();
  const mainHtml = renderHTML(doc, {
    overrides: epubOverrides(endnoteState, artCtx),
  });

  // Append endnotes section if any footnotes were referenced
  const notesHtml = renderNotesSection(doc, endnoteState);

  return mainHtml + notesHtml;
}

export async function discoverChapters(): Promise<string[]> {
  const entries = await readdir(CONTENT_DIR, { recursive: true });
  return entries
    .filter(
      (f: string) =>
        f.endsWith('.dj') && !basename(f).startsWith('_')
    )
    .map((f: string) => join(CONTENT_DIR, f));
}

export function parseSlug(filePath: string): string {
  const name = basename(filePath, '.dj');
  if (name === 'index') {
    return basename(dirname(filePath));
  }
  return name;
}

export async function processChapter(
  filePath: string,
  artCtx: ArtBriefContext
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

  let html = processContent(content, artCtx);

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
