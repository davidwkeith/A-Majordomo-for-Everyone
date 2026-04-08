import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { join } from 'node:path';
import {
  ROOT,
  CONTENT_DIR,
  STYLES_DIR,
  IMAGES_DIR,
  createProcessor,
  discoverBriefs,
  discoverChapters,
  processChapter,
  sortChapters,
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

  const processor = createProcessor(briefs);

  console.log('Discovering chapters...');
  const files = await discoverChapters();
  console.log(`Found ${files.length} chapter files`);

  console.log('Processing chapters...');
  const chapters = await Promise.all(
    files.map((f) => processChapter(f, processor))
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

  // Copy images
  console.log('Copying images...');
  await cp(IMAGES_DIR, join(OUTPUT_DIR, 'images'), { recursive: true });

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

  console.log(`Site written to ${OUTPUT_DIR} (${sorted.length} chapters)`);
}

buildSite().catch((err) => {
  console.error('Site build failed:', err);
  process.exit(1);
});
