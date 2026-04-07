#!/usr/bin/env npx tsx
/**
 * Embed XMP metadata into a PNG image from an <!-- art --> comment.
 *
 * Usage:
 *   npx tsx build/embed-xmp.ts src/images/hitchcock-silhouette.png \
 *     --alt "The iconic profile silhouette of Alfred Hitchcock." \
 *     --brief "Hitchcock's famous profile silhouette..." \
 *     --rights "CC BY-SA 4.0"
 *
 * Or extract fields from a markdown file's art comment:
 *   npx tsx build/embed-xmp.ts src/images/hitchcock-silhouette.png \
 *     --from src/content/00-introduction/00-epigraph.md
 *
 * XMP fields written:
 *   Iptc4xmpCore:AltTextAccessibility  ← alt text for screen readers
 *   dc:description                      ← production brief
 *   dc:rights                           ← license
 */

import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import sharp from 'sharp';

interface Args {
  imagePath: string;
  alt: string;
  brief: string;
  rights: string;
}

function buildXmpXml(alt: string, brief: string, rights: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/"
      xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/">
      <Iptc4xmpCore:AltTextAccessibility>${esc(alt)}</Iptc4xmpCore:AltTextAccessibility>
      <dc:description>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${esc(brief)}</rdf:li>
        </rdf:Alt>
      </dc:description>
      <dc:rights>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${esc(rights)}</rdf:li>
        </rdf:Alt>
      </dc:rights>
      <xmpRights:UsageTerms>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${esc(rights)}</rdf:li>
        </rdf:Alt>
      </xmpRights:UsageTerms>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

function parseArtCommentFromMarkdown(
  markdown: string,
  targetFile: string
): { alt: string; brief: string } | null {
  const pattern = /<!--\s*art\s*\n([\s\S]*?)-->/g;
  let match;
  while ((match = pattern.exec(markdown)) !== null) {
    const inner = match[1];
    const fields: Record<string, string> = {};
    let currentField = '';
    let currentValue = '';

    for (const line of inner.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const fieldMatch = trimmed.match(/^(\w+):\s*(.*)$/);
      if (fieldMatch) {
        if (currentField) fields[currentField] = currentValue.trim();
        currentField = fieldMatch[1];
        currentValue = fieldMatch[2];
      } else if (currentField) {
        currentValue += ' ' + trimmed;
      }
    }
    if (currentField) fields[currentField] = currentValue.trim();

    if (fields.file === targetFile) {
      return { alt: fields.alt ?? '', brief: fields.brief ?? '' };
    }
  }
  return null;
}

async function parseArgs(): Promise<Args> {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error(
      'Usage: npx tsx build/embed-xmp.ts <image> --alt "..." --brief "..." [--rights "..."]'
    );
    console.error(
      '       npx tsx build/embed-xmp.ts <image> --from <markdown-file>'
    );
    process.exit(1);
  }

  const imagePath = args[0];
  let alt = '';
  let brief = '';
  let rights =
    'Copyright © 2025 David W. Keith. Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).';

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--alt') alt = args[++i];
    else if (args[i] === '--brief') brief = args[++i];
    else if (args[i] === '--rights') rights = args[++i];
    else if (args[i] === '--from') {
      const mdPath = args[++i];
      const md = await readFile(mdPath, 'utf-8');
      const parsed = parseArtCommentFromMarkdown(md, basename(imagePath));
      if (!parsed) {
        console.error(
          `No <!-- art --> block with file: ${basename(imagePath)} found in ${mdPath}`
        );
        process.exit(1);
      }
      alt = parsed.alt;
      brief = parsed.brief;
    }
  }

  if (!alt) {
    console.error('Alt text is required (--alt or --from)');
    process.exit(1);
  }

  return { imagePath, alt, brief, rights };
}

async function main() {
  const { imagePath, alt, brief, rights } = await parseArgs();

  const xmp = buildXmpXml(alt, brief, rights);

  const output = await sharp(imagePath)
    .withXmp(xmp)
    .toBuffer();

  await writeFile(imagePath, output);

  console.log(`XMP embedded in ${imagePath}`);
  console.log(`  AltTextAccessibility: ${alt.slice(0, 80)}${alt.length > 80 ? '...' : ''}`);
  console.log(`  dc:description: ${brief.slice(0, 80)}${brief.length > 80 ? '...' : ''}`);
  console.log(`  dc:rights: ${rights.slice(0, 80)}${rights.length > 80 ? '...' : ''}`);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
