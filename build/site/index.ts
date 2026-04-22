import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import {
  ROOT,
  CONTENT_DIR,
  STYLES_DIR,
  IMAGES_DIR,
  discoverBriefs,
  prepareArtContext,
  discoverChapters,
  processChapter,
  sortChapters,
  optimizeImages,
} from '../pipeline.js';
import { BOOK_META } from '../types.js';
import {
  chapterPage,
  tocPage,
  landingPage,
  notFoundPage,
} from './templates.js';

const OUTPUT_DIR = join(ROOT, 'dist', 'site');

async function buildSite(): Promise<void> {
  console.log('Discovering art briefs...');
  const briefs = discoverBriefs(CONTENT_DIR);
  console.log(`Found ${briefs.size} art brief(s)`);

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

  // Create output directories
  await mkdir(join(OUTPUT_DIR, 'styles'), { recursive: true });
  await mkdir(join(OUTPUT_DIR, 'images'), { recursive: true });
  await mkdir(join(OUTPUT_DIR, 'read'), { recursive: true });

  // Concatenate base + site CSS
  console.log('Writing CSS...');
  const baseCss = await readFile(join(STYLES_DIR, 'base.css'), 'utf-8');
  const siteCss = await readFile(join(STYLES_DIR, 'site.css'), 'utf-8');
  await writeFile(
    join(OUTPUT_DIR, 'styles', 'site.css'),
    baseCss + '\n' + siteCss
  );

  // Optimize and copy images
  console.log('Optimizing images...');
  const imgCount = await optimizeImages(IMAGES_DIR, join(OUTPUT_DIR, 'images'));
  console.log(`Optimized ${imgCount} images`);

  // Landing page
  console.log('Writing pages...');
  await writeFile(join(OUTPUT_DIR, 'index.html'), landingPage(BOOK_META));

  // 404 page
  await writeFile(join(OUTPUT_DIR, '404.html'), notFoundPage(BOOK_META));

  // Table of contents
  await writeFile(join(OUTPUT_DIR, 'read', 'index.html'), tocPage(BOOK_META, sorted));

  // Chapter pages
  for (let i = 0; i < sorted.length; i++) {
    const ch = sorted[i];
    const prev = sorted[i - 1] ?? null;
    const next = sorted[i + 1] ?? null;

    // Fix image paths: epub uses ../images/, site uses /images/
    ch.html = ch.html.replace(/src="\.\.\/images\//g, 'src="/images/');

    const dir = join(OUTPUT_DIR, 'read', ch.meta.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, 'index.html'),
      chapterPage(BOOK_META, ch, prev, next, sorted)
    );
  }

  // Copy epub and pdf if they exist (built by earlier steps in build:all)
  for (const file of [
    'majordomo.epub',
    'majordomo.pdf',
  ]) {
    const src = join(ROOT, 'dist', file);
    try {
      await access(src);
      await copyFile(src, join(OUTPUT_DIR, file));
      console.log(`Copied ${file} to site output`);
    } catch {
      console.log(`${file} not found — skipping`);
    }
  }

  console.log(`Site written to ${OUTPUT_DIR} (${sorted.length} chapters)`);
}

buildSite().catch((err) => {
  console.error('Site build failed:', err);
  process.exit(1);
});
