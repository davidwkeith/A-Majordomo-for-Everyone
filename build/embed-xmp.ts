#!/usr/bin/env npx tsx
/**
 * Embed XMP metadata into an image file.
 *
 * The `.art.md` sidecar is the source of truth — the normal build pipeline
 * calls the same helpers this CLI uses, so running it by hand is only
 * necessary when you want to refresh one image without a full build.
 *
 * Usage:
 *   npx tsx build/embed-xmp.ts src/images/hitchcock-silhouette.png \
 *     --from src/content/00-introduction/00-epigraph/hitchcock-silhouette.art.md
 *
 * Or with explicit fields (skips the sidecar):
 *   npx tsx build/embed-xmp.ts src/images/hitchcock-silhouette.png \
 *     --alt "..." --brief "..." [--rights "..."]
 *
 * XMP fields written (identical to the build-pipeline output):
 *   Iptc4xmpCore:AltTextAccessibility  ← brief.alt
 *   dc:description                      ← brief body
 *   dc:rights / xmpRights:UsageTerms    ← brief.rights or BOOK_META.rights
 */

import { readFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { embedXmp } from './xmp.js';
import type { XmpFields } from './xmp.js';
import { BOOK_META } from './types.js';

async function parseFromArtMd(path: string): Promise<Omit<XmpFields, 'rights'> & { rights?: string }> {
  const raw = await readFile(path, 'utf-8');
  const { data, content } = matter(raw);
  const alt = String(data.alt ?? '').trim();
  const description = content.trim();
  const rights = data.rights != null ? String(data.rights).trim() : undefined;
  if (!alt) {
    throw new Error(`${path} has no alt field`);
  }
  return { alt, description, rights };
}

async function parseArgs(): Promise<{ imagePath: string; fields: XmpFields }> {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error(
      'Usage: npx tsx build/embed-xmp.ts <image> --from <art.md>\n' +
      '       npx tsx build/embed-xmp.ts <image> --alt "..." --brief "..." [--rights "..."]'
    );
    process.exit(1);
  }

  const imagePath = args[0];
  let alt = '';
  let description = '';
  let rights: string | undefined;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--alt') alt = args[++i];
    else if (args[i] === '--brief') description = args[++i];
    else if (args[i] === '--rights') rights = args[++i];
    else if (args[i] === '--from') {
      const parsed = await parseFromArtMd(args[++i]);
      alt = parsed.alt;
      description = parsed.description;
      if (parsed.rights) rights = parsed.rights;
    }
  }

  if (!alt) {
    console.error('Alt text is required (--alt or --from)');
    process.exit(1);
  }

  return {
    imagePath,
    fields: { alt, description, rights: rights || BOOK_META.rights },
  };
}

async function main() {
  const { imagePath, fields } = await parseArgs();
  await embedXmp(imagePath, fields);

  const trunc = (s: string) => (s.length > 80 ? s.slice(0, 80) + '...' : s);
  console.log(`XMP embedded in ${imagePath}`);
  console.log(`  AltTextAccessibility: ${trunc(fields.alt)}`);
  console.log(`  dc:description: ${trunc(fields.description)}`);
  console.log(`  dc:rights: ${trunc(fields.rights)}`);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
