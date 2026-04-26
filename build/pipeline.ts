import { readFile, readdir, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, basename, dirname, resolve, extname } from 'node:path';
import sharp from 'sharp';
import matter from 'gray-matter';
import { parse, renderHTML, applyFilter } from '@djot/djot';
import { calloutFilter } from './filters/callouts.js';
import { discoverBriefs } from './filters/art-briefs.js';
import type { ArtBrief, ArtBriefContext } from './filters/art-briefs.js';
import { conversationFilter } from './filters/conversations.js';
import { EndnoteState, epubOverrides, renderNotesSection } from './filters/endnotes.js';
import {
  buildRefRegistry,
  refLinksFilter,
  headingIdsFilter,
} from './filters/ref-links.js';
import type { RefRegistry, RefWarning } from './filters/ref-links.js';
import type { ChapterMeta, ProcessedChapter } from './types.js';
import { BOOK_META } from './types.js';
import { embedXmp, readXmp, xmpMatches } from './xmp.js';
import type { XmpFields } from './xmp.js';

export const ROOT = resolve(import.meta.dirname, '..', '..');
export const CONTENT_DIR = join(ROOT, 'src', 'content');
export const STYLES_DIR = join(ROOT, 'src', 'styles');
export const IMAGES_DIR = join(ROOT, 'src', 'images');
/** Briefs for images sourced outside chapter content (callout icons, etc.). */
export const ILLUSTRATION_SPEC_DIR = join(ROOT, 'spec', 'illustration');
export const STYLE_GUIDE = join(
  ROOT,
  'spec',
  'illustration',
  'gem-illustration-instructions.md'
);

export { discoverBriefs, buildRefRegistry };
export type { ArtBrief, RefRegistry, RefWarning };

/** Resolve the XMP fields for a brief, applying the book-level default rights. */
export function xmpFieldsFor(brief: ArtBrief): XmpFields {
  return {
    alt: brief.alt,
    description: brief.brief,
    rights: brief.rights || BOOK_META.rights,
  };
}

/**
 * Scan every brief's image in one pass: check existence, compare its XMP
 * to the sidecar, embed when stale, and build the render cache.
 *
 * Combines what used to be two separate passes (sync + prepare) so each
 * image is stat'd and XMP-read at most once per build. Returns both the
 * render context and the count of images whose XMP was refreshed.
 *
 * The brief is the source of truth: this step makes the PNG
 * self-describing (alt text and license travel with the file) without
 * requiring contributors to remember a separate `embed-xmp` step.
 */
export async function prepareArtContext(
  briefs: Map<string, ArtBrief>,
  imagesDir: string
): Promise<ArtBriefContext> {
  const xmpCache = new Map<string, Awaited<ReturnType<typeof readXmp>>>();
  const existingImages = new Set<string>();
  let embeddedCount = 0;

  await Promise.all(
    [...briefs.values()].map(async (brief) => {
      const imagePath = join(imagesDir, `${brief.stem}.${brief.format}`);
      try {
        await stat(imagePath);
      } catch {
        return; // image not generated yet
      }
      existingImages.add(brief.stem);

      const current = await readXmp(imagePath);
      const fields = xmpFieldsFor(brief);

      if (fields.alt && !xmpMatches(current, fields)) {
        await embedXmp(imagePath, fields);
        embeddedCount++;
        // Skip a second readXmp — we just wrote these exact values.
        xmpCache.set(brief.stem, {
          altText: fields.alt,
          description: fields.description,
          rights: fields.rights,
        });
      } else {
        xmpCache.set(brief.stem, current);
      }
    })
  );

  return { imagesDir, briefs, xmpCache, existingImages, embeddedCount };
}

/**
 * Sync-only wrapper around `prepareArtContext` — kept for the CLI and
 * tests that care only about the embed count, not the render cache.
 */
export async function syncArtBriefXmp(
  briefs: Map<string, ArtBrief>,
  imagesDir: string
): Promise<number> {
  const ctx = await prepareArtContext(briefs, imagesDir);
  return ctx.embeddedCount;
}

/**
 * Process Djot content through the full filter pipeline and render to HTML.
 * If a ref registry is provided, `ref:` cross-reference links are resolved
 * to concrete chapter anchors (unresolved refs are dropped with a warning).
 */
export function processContent(
  content: string,
  artCtx: ArtBriefContext,
  opts: { refRegistry?: RefRegistry; refWarnings?: RefWarning[]; sourceFile?: string } = {}
): string {
  // Strip HTML comments (editorial notes like RESEARCH NEEDED)
  const cleaned = content.replace(/<!--[\s\S]*?-->/g, '');

  const doc = parse(cleaned);

  applyFilter(doc, calloutFilter);
  applyFilter(doc, conversationFilter);
  applyFilter(doc, headingIdsFilter());
  if (opts.refRegistry && opts.refWarnings) {
    applyFilter(
      doc,
      refLinksFilter(opts.refRegistry, opts.refWarnings, opts.sourceFile)
    );
  }

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

/**
 * Process a chapter from already-read raw source. Used by the ePub build
 * to avoid reading each file twice (once for the ref registry, once for
 * rendering); see `processChapter` for the file-reading wrapper.
 */
export function processChapterFromSource(
  filePath: string,
  raw: string,
  artCtx: ArtBriefContext,
  refCtx?: { registry: RefRegistry; warnings: RefWarning[] }
): ProcessedChapter {
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

  let html = processContent(content, artCtx, {
    refRegistry: refCtx?.registry,
    refWarnings: refCtx?.warnings,
    sourceFile: filePath,
  });

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

export async function processChapter(
  filePath: string,
  artCtx: ArtBriefContext,
  refCtx?: { registry: RefRegistry; warnings: RefWarning[] }
): Promise<ProcessedChapter> {
  const raw = await readFile(filePath, 'utf-8');
  return processChapterFromSource(filePath, raw, artCtx, refCtx);
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
      // Preserve XMP through re-encoding so the alt text and license
      // travel with the image inside the ePub (sharp strips metadata
      // by default).
      let pipeline = img.keepXmp();

      if (meta.width && meta.width > maxWidth) {
        pipeline = pipeline.resize(maxWidth);
      }

      if (ext === '.png') {
        // Palette mode quantizes to ≤256 colors (pngquant internally).
        // The notebook-paper + pencil + limited ballpoint palette of
        // this book's illustrations compresses ~3–5× smaller than 24-bit
        // PNG with near-invisible loss. `quality` controls the quantizer,
        // not DCT, so edges stay crisp.
        pipeline = pipeline.png({
          palette: true,
          quality: 80,
          compressionLevel: 9,
        });
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
