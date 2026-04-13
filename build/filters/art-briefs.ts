import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';

/** Parsed art brief from a .art.md sidecar file. */
export interface ArtBrief {
  stem: string;
  format: string;
  size: string;
  alt: string;
  brief: string;
  sourcePath: string;
}

/** Pre-read XMP metadata for an image. */
export interface XmpData {
  altText?: string;
  description?: string;
  rights?: string;
}

export interface ArtBriefContext {
  imagesDir: string;
  briefs: Map<string, ArtBrief>;
  /** Pre-read XMP data keyed by stem. Populated before filters run. */
  xmpCache: Map<string, XmpData>;
  /** Set of stems with existing images. Pre-checked before filters run. */
  existingImages: Set<string>;
}

/**
 * Scan a directory recursively for *.art.md sidecar files and parse them
 * into a brief registry keyed by stem name.
 */
export function discoverBriefs(contentDir: string): Map<string, ArtBrief> {
  const briefs = new Map<string, ArtBrief>();
  try {
    const entries = readdirSync(contentDir, { recursive: true });
    for (const entry of entries) {
      const e = String(entry);
      if (!e.endsWith('.art.md')) continue;
      const fullPath = join(contentDir, e);
      const raw = readFileSync(fullPath, 'utf-8');
      const { data, content } = matter(raw);
      const stem = basename(e, '.art.md');
      briefs.set(stem, {
        stem,
        format: String(data.format ?? 'png'),
        size: String(data.size ?? 'full'),
        alt: String(data.alt ?? '').trim(),
        brief: content.trim(),
        sourcePath: fullPath,
      });
    }
  } catch {
    /* contentDir missing */
  }
  return briefs;
}
