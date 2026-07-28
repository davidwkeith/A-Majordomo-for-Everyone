#!/usr/bin/env node
/**
 * `npm run narration:plan` — report which chapters' narration would need
 * (re)synthesis, per #161's cost-control requirement and #167's incremental
 * regeneration item.
 *
 * Read-only: computes each chapter's narratable text (the same extraction
 * `injectWordFragments` does for the ePub build), hashes it, and compares
 * against `src/audio/manifest.json` (if present). Does not call Azure and
 * does not write the manifest — that's the synthesis step's job, once #161's
 * Azure resource exists. Until then, every chapter reports "new".
 *
 * Usage: npm run narration:plan
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import {
  ROOT,
  CONTENT_DIR,
  IMAGES_DIR,
  ILLUSTRATION_SPEC_DIR,
  discoverBriefs,
  prepareArtContext,
  discoverChapters,
  processChapterFromSource,
  parseSlug,
  buildRefRegistry,
} from '../pipeline.js';
import type { RefWarning } from '../pipeline.js';
import { injectWordFragments } from '../audio/word-fragments.js';
import { planNarrationRegeneration, findStaleManifestEntries } from '../audio/narration-cache.js';
import type { NarrationManifest } from '../audio/narration-cache.js';

const MANIFEST_PATH = join(ROOT, 'src', 'audio', 'manifest.json');
const PRICE_PER_MILLION_CHARS = 16; // standard neural tier, per docs/superpowers/specs/2026-07-27-azure-tts-engine-design.md

async function loadManifest(): Promise<NarrationManifest> {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

async function main(): Promise<void> {
  const briefs = discoverBriefs(CONTENT_DIR);
  const illustrationBriefs = discoverBriefs(ILLUSTRATION_SPEC_DIR);
  const allBriefs = new Map([...briefs, ...illustrationBriefs]);
  const artCtx = await prepareArtContext(allBriefs, IMAGES_DIR);

  const files = await discoverChapters();
  const sources = await Promise.all(
    files.map(async (filePath) => ({ filePath, raw: await readFile(filePath, 'utf-8') })),
  );

  const refRegistry = buildRefRegistry(
    sources.map(({ filePath, raw }) => ({ slug: parseSlug(filePath), content: matter(raw).content })),
  );
  const refWarnings: RefWarning[] = [];

  const chapters = sources.map(({ filePath, raw }) =>
    processChapterFromSource(filePath, raw, artCtx, { registry: refRegistry, warnings: refWarnings }),
  );

  const narrated = chapters.map((chapter) => ({
    slug: chapter.meta.slug,
    narratableText: injectWordFragments(chapter.html).narratableText,
  }));

  const manifest = await loadManifest();
  const plan = planNarrationRegeneration(narrated, manifest);
  const stale = findStaleManifestEntries(narrated, manifest);

  const needsWork = plan.filter((p) => p.reason !== 'unchanged');
  const totalChars = needsWork.reduce((sum, p) => sum + p.charCount, 0);

  console.log(`${plan.length} chapter(s) checked against ${MANIFEST_PATH}\n`);
  for (const p of plan) {
    if (p.reason === 'unchanged') continue;
    console.log(`  ${p.reason.padEnd(9)} ${p.slug} (${p.charCount} chars)`);
  }

  console.log(
    `\n${needsWork.length}/${plan.length} chapter(s) need synthesis, ` +
      `${plan.length - needsWork.length} unchanged.`,
  );
  if (needsWork.length > 0) {
    const estimatedCost = (totalChars / 1_000_000) * PRICE_PER_MILLION_CHARS;
    console.log(`${totalChars} characters, ~$${estimatedCost.toFixed(2)} at standard neural tier.`);
  }
  if (stale.length > 0) {
    console.log(`\n${stale.length} stale manifest entries with no matching chapter: ${stale.join(', ')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
