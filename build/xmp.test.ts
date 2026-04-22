import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import {
  buildXmpXml,
  readXmp,
  embedXmp,
  xmpMatches,
  type XmpFields,
} from './xmp.js';
import { discoverBriefs } from './filters/art-briefs.js';
import { syncArtBriefXmp, xmpFieldsFor } from './pipeline.js';

const SAMPLE: XmpFields = {
  // Include characters that require XML escaping on write and decoding on
  // read — the ">>" and "&" ensure entity round-trips are exercised.
  alt: 'A test image <with> "quoted" & escaped chars.',
  description: 'Caption: >> A & B — see also "quotes". Round-trip test.',
  rights: 'Copyright © 2025 Test. CC BY-SA 4.0.',
};

async function makeRedSquare(path: string): Promise<void> {
  await sharp({
    create: { width: 8, height: 8, channels: 3, background: { r: 255, g: 0, b: 0 } },
  })
    .png()
    .toFile(path);
}

describe('buildXmpXml', () => {
  it('includes all three fields and escapes XML-hostile characters', () => {
    const xml = buildXmpXml({
      alt: 'Alt with <brackets> & ampersand',
      description: 'Brief',
      rights: 'Rights',
    });
    expect(xml).toContain('Iptc4xmpCore:AltTextAccessibility');
    expect(xml).toContain('dc:description');
    expect(xml).toContain('dc:rights');
    expect(xml).toContain('xmpRights:UsageTerms');
    expect(xml).toContain('Alt with &lt;brackets&gt; &amp; ampersand');
  });
});

describe('embedXmp / readXmp round trip', () => {
  let tmp: string;
  let imagePath: string;

  beforeAll(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'xmp-test-'));
    imagePath = join(tmp, 'red.png');
    await makeRedSquare(imagePath);
  });

  afterAll(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it('writes and reads back the declared fields', async () => {
    await embedXmp(imagePath, SAMPLE);
    const read = await readXmp(imagePath);
    expect(read.altText).toBe(SAMPLE.alt);
    expect(read.description).toBe(SAMPLE.description);
    expect(read.rights).toBe(SAMPLE.rights);
  });

  it('xmpMatches treats identical content as equal', async () => {
    const read = await readXmp(imagePath);
    expect(xmpMatches(read, SAMPLE)).toBe(true);
  });

  it('xmpMatches detects a mismatch', async () => {
    const read = await readXmp(imagePath);
    expect(xmpMatches(read, { ...SAMPLE, alt: 'different' })).toBe(false);
  });
});

describe('syncArtBriefXmp', () => {
  let tmp: string;
  let contentDir: string;
  let imagesDir: string;

  beforeAll(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'xmp-sync-test-'));
    contentDir = join(tmp, 'content');
    imagesDir = join(tmp, 'images');
    await mkdir(contentDir, { recursive: true });
    await mkdir(imagesDir, { recursive: true });

    await writeFile(
      join(contentDir, 'red.art.md'),
      `---\nformat: png\nsize: margin\nalt: A red square for sync test.\nrights: Custom rights line.\n---\n\nProduction brief body.\n`
    );
    await makeRedSquare(join(imagesDir, 'red.png'));
  });

  afterAll(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it('embeds XMP on first run and is idempotent on the second', async () => {
    const briefs = discoverBriefs(contentDir);
    expect(briefs.size).toBe(1);
    const brief = briefs.get('red')!;
    expect(brief.rights).toBe('Custom rights line.');

    const firstRun = await syncArtBriefXmp(briefs, imagesDir);
    expect(firstRun).toBe(1);

    const fields = xmpFieldsFor(brief);
    const read = await readXmp(join(imagesDir, 'red.png'));
    expect(read.altText).toBe(fields.alt);
    expect(read.description).toBe(fields.description);
    expect(read.rights).toBe(fields.rights);

    const secondRun = await syncArtBriefXmp(briefs, imagesDir);
    expect(secondRun).toBe(0);
  });
});

describe('xmpFieldsFor', () => {
  it('falls back to BOOK_META.rights when brief has no rights override', async () => {
    const briefDir = await mkdtemp(join(tmpdir(), 'xmp-default-'));
    try {
      await writeFile(
        join(briefDir, 'x.art.md'),
        `---\nformat: png\nsize: margin\nalt: An image.\n---\n\nBody.\n`
      );
      const briefs = discoverBriefs(briefDir);
      const fields = xmpFieldsFor(briefs.get('x')!);
      expect(fields.rights).toMatch(/David W\. Keith/);
      expect(fields.rights).toMatch(/CC BY-SA 4\.0/);
    } finally {
      await rm(briefDir, { recursive: true, force: true });
    }
  });
});

