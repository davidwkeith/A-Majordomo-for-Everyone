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
  /** Optional override for dc:rights; empty string means "use book default". */
  rights: string;
  sourcePath: string;
}

export type { XmpData } from '../xmp.js';

export interface ArtBriefContext {
  imagesDir: string;
  briefs: Map<string, ArtBrief>;
  /** Pre-read XMP data keyed by stem. Populated before filters run. */
  xmpCache: Map<string, import('../xmp.js').XmpData>;
  /** Set of stems with existing images. Pre-checked before filters run. */
  existingImages: Set<string>;
  /** Number of images whose XMP was (re-)embedded during this pass. */
  embeddedCount: number;
}

/**
 * Scan a directory recursively for *.art.md sidecar files and parse them
 * into a brief registry keyed by stem name.
 */
export function discoverBriefs(contentDir: string): Map<string, ArtBrief> {
  const briefs = new Map<string, ArtBrief>();
  let entries: string[];
  try {
    entries = readdirSync(contentDir, { recursive: true }).map(String);
  } catch {
    return briefs; // contentDir missing
  }
  for (const e of entries) {
    if (!e.endsWith('.art.md')) continue;
    const fullPath = join(contentDir, e);
    try {
      const raw = readFileSync(fullPath, 'utf-8');
      const { data, content } = matter(raw);
      const stem = basename(e, '.art.md');
      briefs.set(stem, {
        stem,
        format: String(data.format ?? 'png'),
        size: String(data.size ?? 'full'),
        alt: String(data.alt ?? '').trim(),
        brief: content.trim(),
        rights: String(data.rights ?? '').trim(),
        sourcePath: fullPath,
      });
    } catch (err) {
      console.warn(`art-briefs: failed to read ${fullPath}:`, (err as Error).message);
    }
  }
  return briefs;
}
