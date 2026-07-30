#!/usr/bin/env node
/**
 * `npm run narrate` — synthesize stale chapters' narration via the
 * scripts/avspeech-spike `narrate` executable (AVSpeech, local Mac only).
 *
 * Per the 2026-07-30 audiobook pipeline spec: incremental (manifest hash
 * = narratable text + voice map + IPA lexicon), abort-safe (manifest
 * updates only after a chapter fully validates), fail-loud (any CLI or
 * cross-check failure stops the run).
 *
 * Usage:
 *   npm run narrate -- --dry-run           # plan only, like narration:plan
 *   npm run narrate -- --chapter <substr>  # synthesize only matching slugs
 *   npm run narrate                        # synthesize every stale chapter
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
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
import type { WordFragment } from '../audio/word-fragments.js';
import { announceIllustrations } from '../audio/narrate-images.js';
import { segmentVoices } from '../audio/voice-segments.js';
import type { VoiceSegment } from '../audio/voice-segments.js';
import { VOICE_MAP, serializeVoiceMap } from '../audio/voices.js';
import { hashNarrationInputs, planNarrationRegeneration, updateManifest } from '../audio/narration-cache.js';
import type { NarrationManifest } from '../audio/narration-cache.js';
import { findIpaMatches, serializeIpaLexicon } from '../audio/ssml-lexicon.js';
import { crossCheckBoundaries } from '../audio/avspeech-boundaries.js';
import type { AvspeechBoundaryFile } from '../audio/avspeech-boundaries.js';

const CACHE_DIR = join(ROOT, '.cache', 'narration');
const MANIFEST_PATH = join(ROOT, 'src', 'audio', 'manifest.json');
const SPIKE_DIR = join(ROOT, 'scripts', 'avspeech-spike');
/**
 * Cross-check failure threshold, per #167: a chapter whose synthesized
 * boundaries don't overlap its word fragments at a near-100% rate means
 * something upstream is broken (a voice regression, a text mismatch) — 1%
 * tolerates the odd tokenizer edge case without masking a real failure.
 */
const UNMATCHED_THRESHOLD = 0.01;

const args = process.argv.slice(2);
const chapterFilter = args.includes('--chapter') ? args[args.indexOf('--chapter') + 1] : null;
const dryRun = args.includes('--dry-run');

interface PreparedChapter {
  slug: string;
  narratableText: string;
  fragments: WordFragment[];
  segments: VoiceSegment[];
}

async function loadManifest(): Promise<NarrationManifest> {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

async function main(): Promise<void> {
  // 1. Render every chapter (identical prep to narration-plan.ts).
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

  const prepared: PreparedChapter[] = chapters.map((chapter) => {
    const narratedHtml = announceIllustrations(chapter.html);
    const { narratableText, fragments } = injectWordFragments(narratedHtml);
    const segments = segmentVoices(narratedHtml);
    const joined = segments.map((s) => s.text).join('');
    if (joined !== narratableText) {
      throw new Error(
        `${chapter.meta.slug}: segmenter invariant violated ` +
          `(segments ${joined.length} chars vs narratable ${narratableText.length} chars)`,
      );
    }
    return { slug: chapter.meta.slug, narratableText, fragments, segments };
  });

  // 2. Plan against the manifest with the widened hash. Planning always
  //    runs over every chapter — --chapter only narrows what gets
  //    synthesized below, so an unrelated stale chapter is never
  //    mistakenly left out of a future unfiltered run's plan.
  const voiceKey = serializeVoiceMap();
  const lexiconKey = serializeIpaLexicon();
  const manifest = await loadManifest();
  const plan = planNarrationRegeneration(
    prepared.map((p) => ({
      slug: p.slug,
      hash: hashNarrationInputs(p.narratableText, voiceKey, lexiconKey),
      charCount: p.narratableText.length,
    })),
    manifest,
  );

  let work = plan.filter((p) => p.reason !== 'unchanged');
  if (chapterFilter) work = work.filter((p) => p.slug.includes(chapterFilter));

  console.log(`${work.length} chapter(s) to synthesize${dryRun ? ' (dry run)' : ''}`);
  for (const p of work) {
    console.log(`  ${p.reason.padEnd(9)} ${p.slug} (${p.charCount} chars)`);
  }
  if (dryRun || work.length === 0) return;

  // 3. Build the Swift CLI once, in release mode.
  execFileSync('swift', ['build', '-c', 'release', '--product', 'narrate'], {
    cwd: SPIKE_DIR,
    stdio: 'inherit',
  });
  const narrateBin = join(SPIKE_DIR, '.build', 'release', 'narrate');

  // 4. Synthesize each stale chapter; update the manifest only after that
  //    chapter's boundary output fully validates (abort-safe: a mid-run
  //    failure leaves already-synthesized chapters recorded and the
  //    failing one — and everything after it — unrecorded, so the very
  //    next run picks up exactly where this one stopped).
  for (const entry of work) {
    const p = prepared.find((c) => c.slug === entry.slug)!;
    const outDir = join(CACHE_DIR, p.slug);
    mkdirSync(outDir, { recursive: true });

    const jobPath = join(outDir, 'job.json');
    writeFileSync(
      jobPath,
      JSON.stringify({
        audioOutput: join(outDir, 'chapter.m4a'),
        segments: p.segments.map((s) => ({
          voiceId: VOICE_MAP[s.role].identifier,
          text: s.text,
          ipa: findIpaMatches(s.text).map((m) => ({
            start: m.charStart,
            length: m.charEnd - m.charStart,
            notation: m.ipa,
          })),
        })),
      }),
    );

    console.log(`  synthesizing ${p.slug} (${entry.charCount} chars)…`);
    const stdout = execFileSync(narrateBin, [jobPath], { maxBuffer: 64 * 1024 * 1024 });
    const boundaries = JSON.parse(stdout.toString('utf-8')) as AvspeechBoundaryFile;

    const { matched, unmatched } = crossCheckBoundaries(p.fragments, boundaries.boundaries);
    const total = boundaries.boundaries.length;
    if (total === 0 || unmatched.length / total > UNMATCHED_THRESHOLD) {
      throw new Error(
        `${p.slug}: boundary/fragment cross-check failed — ` +
          `${unmatched.length}/${total} unmatched (threshold ${UNMATCHED_THRESHOLD})`,
      );
    }
    // Verbatim CLI stdout, per the interface contract — not a re-serialization.
    writeFileSync(join(outDir, 'boundaries.json'), stdout);

    const updated = updateManifest(
      await loadManifest(),
      p.slug,
      entry.hash,
      `${p.slug}.m4a`,
      boundaries.totalDurationSeconds,
    );
    mkdirSync(join(ROOT, 'src', 'audio'), { recursive: true });
    writeFileSync(MANIFEST_PATH, JSON.stringify(updated, null, 2) + '\n');
    console.log(
      `  ✓ ${p.slug}: ${matched}/${total} boundaries matched, ` +
        `${(boundaries.totalDurationSeconds / 60).toFixed(1)} min`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
