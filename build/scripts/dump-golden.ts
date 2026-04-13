/**
 * Dump the HTML output of every chapter to test/golden/ for regression testing.
 * Run once before migration, then diff against post-migration output.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  ROOT,
  CONTENT_DIR,
  IMAGES_DIR,
  discoverBriefs,
  prepareArtContext,
  discoverChapters,
  processChapter,
  sortChapters,
} from '../pipeline.js';

const GOLDEN_DIR = join(ROOT, 'test', 'golden');

async function main(): Promise<void> {
  const briefs = discoverBriefs(CONTENT_DIR);
  const artCtx = await prepareArtContext(briefs, IMAGES_DIR);
  const files = await discoverChapters();
  const chapters = await Promise.all(
    files.map((f) => processChapter(f, artCtx))
  );
  const sorted = sortChapters(chapters);

  await mkdir(GOLDEN_DIR, { recursive: true });

  for (const ch of sorted) {
    const filename = `${ch.meta.part}-${String(ch.meta.order).padStart(2, '0')}-${ch.meta.slug}.html`;
    await writeFile(join(GOLDEN_DIR, filename), ch.html, 'utf-8');
  }

  console.log(`Wrote ${sorted.length} golden reference files to ${GOLDEN_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
