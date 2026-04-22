import 'dotenv/config';
import { accessSync } from 'node:fs';
import { join } from 'node:path';
import {
  ROOT,
  CONTENT_DIR,
  STYLES_DIR,
  IMAGES_DIR,
  ILLUSTRATION_SPEC_DIR,
  STYLE_GUIDE,
  discoverBriefs,
  prepareArtContext,
  syncArtBriefXmp,
  discoverChapters,
  processChapter,
  sortChapters,
  optimizeImages,
} from './pipeline.js';
import type { ArtBrief } from './pipeline.js';
import { assembleEpub } from './epub/assemble.js';
import { generateMissingArt } from './generate-art.js';
import { BOOK_META } from './types.js';

const OUTPUT_PATH = join(ROOT, 'dist', 'majordomo.epub');

function imageExistsSync(imagesDir: string, brief: ArtBrief): boolean {
  try {
    accessSync(join(imagesDir, `${brief.stem}.${brief.format}`));
    return true;
  } catch {
    return false;
  }
}

async function build(): Promise<void> {
  const args = process.argv.slice(2);
  const shouldGenerate = args.includes('--generate');
  const maxArg = args.find((a) => a.startsWith('--max='));
  const maxImages = maxArg ? parseInt(maxArg.split('=')[1], 10) : Infinity;

  // Discover art briefs from .art.md sidecar files
  console.log('Discovering art briefs...');
  const briefs = discoverBriefs(CONTENT_DIR);
  console.log(`Found ${briefs.size} art brief(s)`);

  // Check for missing images
  const missing = [...briefs.values()].filter(
    (b) => !imageExistsSync(IMAGES_DIR, b)
  );
  if (missing.length > 0) {
    if (shouldGenerate) {
      const batch = missing.slice(0, maxImages);
      const count = await generateMissingArt(batch, IMAGES_DIR, STYLE_GUIDE);
      console.log(`Generated ${count}/${missing.length} image(s)`);
    } else {
      console.log(
        `${missing.length} art brief(s) without images (use --generate to create)`
      );
    }
  }

  // Embed XMP metadata declared in .art.md sidecars into images that
  // are missing it or out of sync. Keeps alt text and license travelling
  // with the file without a manual embed step. Covers callout icons and
  // other images whose briefs live in spec/illustration/ alongside chapter
  // content briefs.
  console.log('Syncing XMP metadata...');
  const illustrationBriefs = discoverBriefs(ILLUSTRATION_SPEC_DIR);
  const allBriefs = new Map([...briefs, ...illustrationBriefs]);
  const embedded = await syncArtBriefXmp(allBriefs, IMAGES_DIR);
  if (embedded > 0) {
    console.log(`Embedded XMP in ${embedded} image(s)`);
  }

  // Pre-read XMP data for all briefs (Djot filters are synchronous)
  console.log('Preparing art context...');
  const artCtx = await prepareArtContext(briefs, IMAGES_DIR);

  console.log('Discovering chapters...');
  const files = await discoverChapters();
  console.log(`Found ${files.length} chapter files`);

  console.log('Processing chapters...');
  const chapters = await Promise.all(
    files.map((f) => processChapter(f, artCtx))
  );
  const sorted = sortChapters(chapters);

  // Optimize images to a temp directory for the epub
  const optimizedDir = join(ROOT, 'dist', '.images');
  console.log('Optimizing images...');
  await optimizeImages(IMAGES_DIR, optimizedDir, 800);

  console.log('Assembling ePub...');
  await assembleEpub(
    BOOK_META,
    sorted,
    join(STYLES_DIR, 'base.css'),
    optimizedDir,
    OUTPUT_PATH
  );

  console.log(`ePub written to ${OUTPUT_PATH}`);
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
