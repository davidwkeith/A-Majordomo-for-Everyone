import 'dotenv/config';
import { accessSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import {
  ROOT,
  CONTENT_DIR,
  STYLES_DIR,
  IMAGES_DIR,
  ILLUSTRATION_SPEC_DIR,
  STYLE_GUIDE,
  discoverBriefs,
  prepareArtContext,
  discoverChapters,
  processChapterFromSource,
  parseSlug,
  sortChapters,
  optimizeImages,
  buildRefRegistry,
} from './pipeline.js';
import type { ArtBrief, RefWarning } from './pipeline.js';
import { assembleEpub } from './epub/assemble.js';
import { generateMissingArt } from './generate-art.js';
import { BOOK_META } from './types.js';
import { validateAccessibility, formatA11yIssues } from './validators/a11y.js';

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

  // Prepare the render cache and sync XMP metadata from .art.md sidecars
  // into every image in one pass. Covers callout icons and other images
  // whose briefs live in spec/illustration/ alongside chapter content briefs
  // so the sync keeps alt text and license travelling with the file
  // without a manual embed step.
  console.log('Preparing art context...');
  const illustrationBriefs = discoverBriefs(ILLUSTRATION_SPEC_DIR);
  const allBriefs = new Map([...briefs, ...illustrationBriefs]);
  const artCtx = await prepareArtContext(allBriefs, IMAGES_DIR);
  if (artCtx.embeddedCount > 0) {
    console.log(`Embedded XMP in ${artCtx.embeddedCount} image(s)`);
  }

  console.log('Discovering chapters...');
  const files = await discoverChapters();
  console.log(`Found ${files.length} chapter files`);

  // Read each source file once. The raw content feeds both the
  // cross-reference registry pass (which scans heading codes) and the
  // per-chapter render pass below.
  const sources = await Promise.all(
    files.map(async (filePath) => ({
      filePath,
      raw: await readFile(filePath, 'utf-8'),
    }))
  );

  console.log('Building ref registry...');
  const refRegistry = buildRefRegistry(
    sources.map(({ filePath, raw }) => ({
      slug: parseSlug(filePath),
      content: matter(raw).content,
    }))
  );
  const refWarnings: RefWarning[] = [];
  console.log(`Registered ${refRegistry.size} ref target(s)`);

  console.log('Processing chapters...');
  const chapters = sources.map(({ filePath, raw }) =>
    processChapterFromSource(filePath, raw, artCtx, {
      registry: refRegistry,
      warnings: refWarnings,
    })
  );
  const sorted = sortChapters(chapters);

  if (refWarnings.length > 0) {
    console.warn(`\n${refWarnings.length} unresolved ref(s):`);
    for (const w of refWarnings) {
      console.warn(`  ref:${w.tag}${w.sourceFile ? ` in ${w.sourceFile}` : ''}`);
    }
  }

  // Fail the build if any declared accessibility feature is not satisfied.
  // The ePub OPF claims WCAG 2.0 AA; shipping a book that does not meet its
  // own claim is a worse outcome than failing loudly here.
  const issues = validateAccessibility(BOOK_META, sorted, artCtx);
  if (issues.length > 0) {
    console.error(
      `Accessibility validation failed (${issues.length} issue(s)):\n${formatA11yIssues(issues)}`
    );
    process.exit(1);
  }

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
