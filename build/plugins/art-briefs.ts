import type { Root, Html } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { accessSync, readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';
import sharp from 'sharp';

/** Parsed art brief from a .art.md sidecar file. */
export interface ArtBrief {
  /** Base name without extension, e.g. "trinitron-s0-specify" */
  stem: string;
  /** Output image format: png, jpg, webp, etc. */
  format: string;
  /** Layout size: full, half-left, half-right, margin */
  size: string;
  /** Accessibility description for screen readers */
  alt: string;
  /** Production brief for the illustrator (body of .art.md) */
  brief: string;
  /** Absolute path to the .art.md source file */
  sourcePath: string;
}

interface ArtBriefsOptions {
  /** Absolute path to src/images directory */
  imagesDir: string;
  /** Pre-discovered art brief registry, keyed by stem name */
  briefs: Map<string, ArtBrief>;
}

/** XMP fields extracted from image metadata */
interface XmpFields {
  altText?: string;
  description?: string;
  rights?: string;
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

/**
 * Parse an <!-- art: stem-name --> reference comment.
 * Returns the stem name or null if not a match.
 */
function parseArtRef(value: string): string | null {
  const match = value.match(/^<!--\s*art:\s*(\S+)\s*-->$/);
  return match ? match[1] : null;
}

/**
 * Extract XMP metadata fields from an image using Sharp.
 */
async function readXmp(imagePath: string): Promise<XmpFields> {
  const result: XmpFields = {};
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

function fileExists(path: string): boolean {
  try {
    accessSync(path);
    return true;
  } catch {
    return false;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sizeToClass(size: string): string {
  switch (size) {
    case 'full':
      return 'inline-graphic inline-graphic-full';
    case 'half-left':
      return 'inline-graphic inline-graphic-half inline-graphic-half-left';
    case 'half-right':
      return 'inline-graphic inline-graphic-half inline-graphic-half-right';
    default:
      return 'inline-graphic inline-graphic-margin';
  }
}

/**
 * Remark plugin that transforms <!-- art: name --> references into:
 * - A <figure><img> when the image exists in src/images/ (XMP alt preferred)
 * - A placeholder box when it does not
 *
 * Art briefs are *.art.md sidecar files discovered from src/content/
 * and passed in as a pre-built registry.
 */
const remarkArtBriefs: Plugin<[ArtBriefsOptions], Root> = (options) => {
  const { imagesDir, briefs } = options;

  return async (tree: Root) => {
    const pending: { node: Html; brief: ArtBrief }[] = [];

    visit(tree, 'html', (node: Html) => {
      if (!node.value.trimStart().startsWith('<!-- art')) return;
      const stem = parseArtRef(node.value);
      if (!stem) return;
      const brief = briefs.get(stem);
      if (!brief) {
        console.warn(`art-briefs: unknown reference "${stem}"`);
        return;
      }
      pending.push({ node, brief });
    });

    await Promise.all(
      pending.map(async ({ node, brief }) => {
        const imageFile = `${brief.stem}.${brief.format}`;
        const imagePath = join(imagesDir, imageFile);
        const sizeClass = sizeToClass(brief.size);

        if (fileExists(imagePath)) {
          const xmp = await readXmp(imagePath);
          const alt = xmp.altText || brief.alt;
          node.value = `<figure class="${sizeClass}"><img src="../images/${escapeHtml(imageFile)}" alt="${escapeHtml(alt)}"/></figure>`;
        } else {
          const placeholderClass = `art-placeholder art-placeholder-${brief.size}`;
          node.value = `<figure class="${placeholderClass}">
  <div class="art-placeholder-box">
    <p class="art-placeholder-file">${escapeHtml(imageFile)}</p>
    <details>
      <summary>${escapeHtml(brief.alt)}</summary>
      <p class="art-placeholder-brief">${escapeHtml(brief.brief)}</p>
    </details>
  </div>
</figure>`;
        }
      })
    );
  };
};

export default remarkArtBriefs;
