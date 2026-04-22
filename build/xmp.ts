/**
 * XMP metadata helpers — shared between the build pipeline and the
 * `embed-xmp` CLI.
 *
 * The `.art.md` sidecar is the source of truth: `alt` → AltTextAccessibility,
 * the brief body → dc:description, and the optional `rights` frontmatter
 * field (falling back to the book-level default) → dc:rights / UsageTerms.
 * The build embeds these into the image so a downloaded PNG carries its
 * own accessibility text and license.
 */

import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

export interface XmpFields {
  alt: string;
  description: string;
  rights: string;
}

export interface XmpData {
  altText?: string;
  description?: string;
  rights?: string;
}

function escXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Inverse of `escXml` — decode the five XML predefined entities. */
function unescXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

export function buildXmpXml(f: XmpFields): string {
  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/"
      xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/">
      <Iptc4xmpCore:AltTextAccessibility>${escXml(f.alt)}</Iptc4xmpCore:AltTextAccessibility>
      <dc:description>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${escXml(f.description)}</rdf:li>
        </rdf:Alt>
      </dc:description>
      <dc:rights>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${escXml(f.rights)}</rdf:li>
        </rdf:Alt>
      </dc:rights>
      <xmpRights:UsageTerms>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${escXml(f.rights)}</rdf:li>
        </rdf:Alt>
      </xmpRights:UsageTerms>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

/** Extract the fields we care about from an image's existing XMP packet. */
export async function readXmp(imagePath: string): Promise<XmpData> {
  const result: XmpData = {};
  try {
    const meta = await sharp(imagePath).metadata();
    if (!meta.xmp) return result;

    const xmpStr = meta.xmp.toString('utf-8');

    const altMatch = xmpStr.match(
      /Iptc4xmpCore:AltTextAccessibility[^>]*>([^<]+)</
    );
    if (altMatch) result.altText = unescXml(altMatch[1]).trim();

    const descMatch = xmpStr.match(
      /dc:description[\s\S]*?<rdf:li[^>]*>([^<]+)<\/rdf:li>/
    );
    if (descMatch) result.description = unescXml(descMatch[1]).trim();

    const rightsMatch = xmpStr.match(
      /dc:rights[\s\S]*?<rdf:li[^>]*>([^<]+)<\/rdf:li>/
    );
    if (rightsMatch) result.rights = unescXml(rightsMatch[1]).trim();
  } catch {
    // Image unreadable or no XMP — caller falls back to brief fields
  }
  return result;
}

/** Overwrite `imagePath` with a copy carrying the given XMP packet. */
export async function embedXmp(
  imagePath: string,
  fields: XmpFields
): Promise<void> {
  const xml = buildXmpXml(fields);
  const input = await readFile(imagePath);
  const output = await sharp(input).withXmp(xml).toBuffer();
  await writeFile(imagePath, output);
}

/** Normalize whitespace for semantic equality checks between XMP and brief. */
function norm(s: string | undefined): string {
  return (s ?? '').replace(/\s+/g, ' ').trim();
}

/** True when the image's XMP already matches the declared fields. */
export function xmpMatches(current: XmpData, fields: XmpFields): boolean {
  return (
    norm(current.altText) === norm(fields.alt) &&
    norm(current.description) === norm(fields.description) &&
    norm(current.rights) === norm(fields.rights)
  );
}
