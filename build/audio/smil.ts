/**
 * EPUB 3 Media Overlays (SMIL) generation.
 *
 * Turns word-level fragment ids (from `word-fragments.ts`) and Azure Neural
 * TTS `WordBoundary` output (see `build/scripts/tts-spike.ts` and
 * docs/superpowers/specs/2026-07-27-azure-tts-engine-design.md) into a SMIL
 * file that syncs each word span to its slice of the narration audio.
 *
 * https://www.w3.org/TR/epub-33/#sec-media-overlays
 */

import type { WordFragment } from './word-fragments.js';

/** Azure `SpeechSynthesisWordBoundaryEventArgs`, in the shape this module needs. */
export interface WordBoundaryRecord {
  text: string;
  /** Character offset into the narratable text handed to the synthesizer. */
  textOffset: number;
  wordLength: number;
  /** 100-nanosecond ticks, per the Speech SDK's audioOffset unit. */
  audioOffsetTicks: number;
  /** 100-nanosecond ticks, per the Speech SDK's duration unit. */
  durationTicks: number;
}

export interface SmilOptions {
  /** id for the top-level <seq>, e.g. "ch03". */
  chapterId: string;
  /** XHTML file the fragments live in, e.g. "ch03.xhtml". */
  textSrc: string;
  /** Audio file the clip times reference, e.g. "ch03.mp3". */
  audioSrc: string;
}

const TICKS_PER_SECOND = 10_000_000;

/** Format seconds as a SMIL full clock value, "H:MM:SS.mmm". */
export function formatClockValue(seconds: number): string {
  const totalMs = Math.round(seconds * 1000);
  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Find the fragment whose character range contains a WordBoundary's range.
 * Uses overlap rather than exact equality since Azure's own word
 * tokenization (e.g. around hyphens or abbreviations) isn't guaranteed to
 * match ours exactly.
 */
function findFragment(fragments: WordFragment[], boundary: WordBoundaryRecord): WordFragment | undefined {
  const boundaryEnd = boundary.textOffset + boundary.wordLength;
  return fragments.find((f) => f.charStart < boundaryEnd && f.charEnd > boundary.textOffset);
}

/**
 * Build a SMIL document mapping each word fragment to its clip range in the
 * narration audio. Fragments with no matching WordBoundary (e.g. a fragment
 * the synthesizer silently dropped) are skipped, not emitted with bogus
 * timing — a missing highlight is a smaller failure than a wrong one.
 */
export function buildSmil(
  fragments: WordFragment[],
  boundaries: WordBoundaryRecord[],
  options: SmilOptions,
): string {
  const pars: string[] = [];

  for (const boundary of boundaries) {
    const fragment = findFragment(fragments, boundary);
    if (!fragment) continue;

    const clipBegin = boundary.audioOffsetTicks / TICKS_PER_SECOND;
    const clipEnd = (boundary.audioOffsetTicks + boundary.durationTicks) / TICKS_PER_SECOND;

    pars.push(
      `      <par id="par-${escapeXmlAttr(fragment.id)}">\n` +
        `        <text src="${escapeXmlAttr(options.textSrc)}#${escapeXmlAttr(fragment.id)}"/>\n` +
        `        <audio src="${escapeXmlAttr(options.audioSrc)}" clipBegin="${formatClockValue(clipBegin)}" clipEnd="${formatClockValue(clipEnd)}"/>\n` +
        `      </par>`,
    );
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<smil xmlns="http://www.w3.org/ns/SMIL" xmlns:epub="http://www.idpf.org/2007/ops" version="3.0">\n` +
    `  <body>\n` +
    `    <seq id="seq-${escapeXmlAttr(options.chapterId)}" epub:textref="${escapeXmlAttr(options.textSrc)}">\n` +
    pars.join('\n') +
    (pars.length ? '\n' : '') +
    `    </seq>\n` +
    `  </body>\n` +
    `</smil>\n`
  );
}
