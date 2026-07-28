/**
 * Incremental, hash-based narration regeneration (see #161's cost-control
 * section and #167). This is a living document under active revision — a
 * full multi-hour re-render on every typo fix isn't viable, so each
 * chapter's narratable text (the same string `injectWordFragments` returns,
 * see `build/audio/word-fragments.ts`) is hashed and compared against the
 * hash recorded the last time that chapter was actually synthesized.
 *
 * Pure planning logic only — it decides what *would* need synthesis. It
 * does not call Azure and does not write the manifest; that's the
 * responsibility of the synthesis step itself (deferred to #167's
 * end-to-end pipeline wiring, which needs a live Azure resource from #161).
 */

import { createHash } from 'node:crypto';

export interface NarrationManifestEntry {
  /** SHA-256 hex digest of the narratable text last synthesized for this chapter. */
  hash: string;
  /** Audio file this chapter's narration was written to, e.g. "ch03.mp3". */
  audioFile: string;
}

/** slug -> the manifest entry recorded after that chapter's last successful synthesis. */
export type NarrationManifest = Record<string, NarrationManifestEntry>;

export interface ChapterNarration {
  slug: string;
  narratableText: string;
}

export type RegenerationReason = 'new' | 'changed' | 'unchanged';

export interface RegenerationPlanEntry {
  slug: string;
  hash: string;
  charCount: number;
  reason: RegenerationReason;
}

export function hashNarratableText(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * Decide, for each chapter, whether its narration needs (re)synthesis:
 * "new" (no manifest entry yet), "changed" (hash no longer matches), or
 * "unchanged" (safe to skip — the existing audio is still current).
 */
export function planNarrationRegeneration(
  chapters: ChapterNarration[],
  manifest: NarrationManifest,
): RegenerationPlanEntry[] {
  return chapters.map(({ slug, narratableText }) => {
    const hash = hashNarratableText(narratableText);
    const existing = manifest[slug];
    const reason: RegenerationReason = !existing ? 'new' : existing.hash !== hash ? 'changed' : 'unchanged';
    return { slug, hash, charCount: narratableText.length, reason };
  });
}

/**
 * Manifest entries for chapters no longer present in the source — e.g. a
 * chapter was deleted or renamed. Their audio files are safe to prune;
 * this only reports the stale slugs, it doesn't delete anything.
 */
export function findStaleManifestEntries(chapters: ChapterNarration[], manifest: NarrationManifest): string[] {
  const slugs = new Set(chapters.map((c) => c.slug));
  return Object.keys(manifest).filter((slug) => !slugs.has(slug));
}

/** Record a chapter's manifest entry after it's actually been synthesized. */
export function updateManifest(
  manifest: NarrationManifest,
  slug: string,
  hash: string,
  audioFile: string,
): NarrationManifest {
  return { ...manifest, [slug]: { hash, audioFile } };
}
