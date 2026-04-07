import type { Root, Html } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { readFileSync, accessSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

interface ArtBrief {
  file: string;
  size: string;
  alt: string;
  brief: string;
}

interface ArtBriefsOptions {
  /** Absolute path to src/images directory */
  imagesDir: string;
}

/** XMP fields extracted from image metadata */
interface XmpFields {
  altText?: string;
  description?: string;
  rights?: string;
}

function parseArtComment(value: string): ArtBrief | null {
  const inner = value.replace(/^<!--\s*art\s*\n?/, '').replace(/\s*-->$/, '');

  const fields: Record<string, string> = {};
  let currentField = '';
  let currentValue = '';

  for (const line of inner.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(/^(\w+):\s*(.*)$/);
    if (match) {
      if (currentField) {
        fields[currentField] = currentValue.trim();
      }
      currentField = match[1];
      currentValue = match[2];
    } else if (currentField) {
      currentValue += ' ' + trimmed;
    }
  }

  if (currentField) {
    fields[currentField] = currentValue.trim();
  }

  if (!fields.alt) return null;

  return {
    file: fields.file ?? '',
    size: fields.size ?? 'full',
    alt: fields.alt ?? '',
    brief: fields.brief ?? '',
  };
}

/**
 * Extract XMP metadata fields from a PNG image using Sharp.
 * Returns the alt text and description if present.
 */
async function readXmp(imagePath: string): Promise<XmpFields> {
  const result: XmpFields = {};
  try {
    const meta = await sharp(imagePath).metadata();
    if (!meta.xmp) return result;

    const xmpStr = meta.xmp.toString('utf-8');

    // Iptc4xmpCore:AltTextAccessibility
    const altMatch = xmpStr.match(
      /Iptc4xmpCore:AltTextAccessibility[^>]*>([^<]+)</
    );
    if (altMatch) result.altText = altMatch[1].trim();

    // dc:description — may be in <rdf:Alt><rdf:li> wrapper
    const descMatch = xmpStr.match(
      /dc:description[\s\S]*?<rdf:li[^>]*>([^<]+)<\/rdf:li>/
    );
    if (descMatch) result.description = descMatch[1].trim();

    // dc:rights
    const rightsMatch = xmpStr.match(
      /dc:rights[\s\S]*?<rdf:li[^>]*>([^<]+)<\/rdf:li>/
    );
    if (rightsMatch) result.rights = rightsMatch[1].trim();
  } catch {
    // Image unreadable or no XMP — fall back to comment fields
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

/**
 * Remark plugin that transforms <!-- art ... --> comment blocks into:
 * - An <img> figure if the image file exists (using XMP alt text if available)
 * - A placeholder text box if it does not
 *
 * When the image exists and contains XMP metadata, the embedded
 * Iptc4xmpCore:AltTextAccessibility field is preferred over the
 * comment's alt field.
 */
const remarkArtBriefs: Plugin<[ArtBriefsOptions], Root> = (options) => {
  const { imagesDir } = options;

  // Collect async XMP reads, apply after all are resolved
  return async (tree: Root) => {
    const pending: { node: Html; brief: ArtBrief }[] = [];

    visit(tree, 'html', (node: Html) => {
      if (!node.value.trimStart().startsWith('<!-- art')) return;
      const brief = parseArtComment(node.value);
      if (!brief) return;
      pending.push({ node, brief });
    });

    await Promise.all(
      pending.map(async ({ node, brief }) => {
        const sizeClass =
          brief.size === 'full'
            ? 'inline-graphic inline-graphic-full'
            : brief.size === 'half-left'
              ? 'inline-graphic inline-graphic-half inline-graphic-half-left'
              : brief.size === 'half-right'
                ? 'inline-graphic inline-graphic-half inline-graphic-half-right'
                : 'inline-graphic inline-graphic-margin';

        const imagePath = join(imagesDir, brief.file);

        if (brief.file && fileExists(imagePath)) {
          const xmp = await readXmp(imagePath);
          const alt = xmp.altText || brief.alt;
          node.value = `<figure class="${sizeClass}"><img src="../images/${escapeHtml(brief.file)}" alt="${escapeHtml(alt)}"/></figure>`;
        } else {
          const placeholderClass = `art-placeholder art-placeholder-${brief.size}`;
          node.value = `<figure class="${placeholderClass}">
  <div class="art-placeholder-box">
    <p class="art-placeholder-file">${escapeHtml(brief.file)}</p>
    <details>
      <summary>${escapeHtml(brief.alt)}</summary>
      <p class="art-placeholder-alt">${escapeHtml(brief.alt)}</p>
    </details>
  </div>
</figure>`;
        }
      })
    );
  };
};

export default remarkArtBriefs;
