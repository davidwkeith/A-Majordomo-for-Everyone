#!/usr/bin/env node
/**
 * `npm run tts:spike` — Azure Neural TTS WordBoundary offset check.
 *
 * Synthesizes a paragraph of text and verifies that each `WordBoundary`
 * event's `textOffset` lines up 1:1 with the plain-text string handed to
 * the synthesizer, with no silent drift around smart-typography characters
 * (curly quotes, em/en dashes, ellipses) — the risk flagged in
 * docs/superpowers/specs/2026-07-27-azure-tts-engine-design.md.
 *
 * Requires SPEECH_KEY / SPEECH_REGION (see .env.example). Without them this
 * exits with a clear error rather than attempting a network call.
 *
 * Usage:
 *   npm run tts:spike                    # built-in smart-typography sample
 *   npm run tts:spike -- path/to/text.txt
 */

import 'dotenv/config';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = join(repoRoot, 'dist', 'tts-spike');

/** Narrator voice per the shortlist in the engine-design spec. */
const DEFAULT_VOICE = process.env.TTS_SPIKE_VOICE ?? 'en-US-AndrewMultilingualNeural';

/** Standard-tier pricing per the engine-design spec, for a rough cost readout. */
const PRICE_PER_MILLION_CHARS = 16;

/**
 * Sample deliberately exercises the smart-typography substitutions Djot
 * performs (curly quotes, em/en dash, ellipsis) plus proper nouns the spec
 * flags as pronunciation risks.
 */
const SAMPLE_TEXT =
  'Jeeves considered the matter. "It is, if I may say so, a delicate ' +
  'situation"—the sort that wants patience, not haste. The Skill itself is ' +
  "well-formed; it's the ePub's Djot source that needs a second look… " +
  'three passes, minimum—maybe four.';

interface WordBoundaryRecord {
  text: string;
  textOffset: number;
  wordLength: number;
  audioOffsetTicks: number;
  durationTicks: number;
}

interface Mismatch {
  boundary: WordBoundaryRecord;
  expected: string;
  actual: string;
}

/**
 * Compare each reported word boundary against the source string it should
 * point into. Pure function so it's testable without a network call.
 */
export function verifyWordBoundaries(sourceText: string, boundaries: WordBoundaryRecord[]): Mismatch[] {
  const mismatches: Mismatch[] = [];
  for (const boundary of boundaries) {
    const expected = sourceText.slice(boundary.textOffset, boundary.textOffset + boundary.wordLength);
    if (expected !== boundary.text) {
      mismatches.push({ boundary, expected, actual: boundary.text });
    }
  }
  return mismatches;
}

async function synthesize(text: string, voice: string): Promise<{ audio: ArrayBuffer; boundaries: WordBoundaryRecord[] }> {
  const speechKey = process.env.SPEECH_KEY;
  const speechRegion = process.env.SPEECH_REGION;
  if (!speechKey || !speechRegion) {
    throw new Error('Set SPEECH_KEY and SPEECH_REGION (see .env.example) to run the TTS spike.');
  }

  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechSynthesisVoiceName = voice;
  speechConfig.requestWordLevelTimestamps();

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);
  const boundaries: WordBoundaryRecord[] = [];

  synthesizer.wordBoundary = (_sender, e) => {
    boundaries.push({
      text: e.text,
      textOffset: e.textOffset,
      wordLength: e.wordLength,
      audioOffsetTicks: e.audioOffset,
      durationTicks: e.duration,
    });
  };

  const audio = await new Promise<ArrayBuffer>((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve(result.audioData);
        } else {
          reject(new Error(`Synthesis failed: ${result.errorDetails ?? result.reason}`));
        }
      },
      (err) => {
        synthesizer.close();
        reject(new Error(err));
      },
    );
  });

  return { audio, boundaries };
}

async function main(): Promise<void> {
  const textPath = process.argv[2];
  const text = textPath ? (await readFile(textPath, 'utf-8')).trim() : SAMPLE_TEXT;

  console.log(`Voice: ${DEFAULT_VOICE}`);
  console.log(`Text (${text.length} chars): ${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`);

  const { audio, boundaries } = await synthesize(text, DEFAULT_VOICE);

  await mkdir(outDir, { recursive: true });
  const audioPath = join(outDir, 'spike.mp3');
  await writeFile(audioPath, Buffer.from(audio));

  const mismatches = verifyWordBoundaries(text, boundaries);

  console.log(`\n${boundaries.length} word boundaries captured, ${mismatches.length} mismatched.`);
  if (mismatches.length > 0) {
    console.log('\nMismatches (offset drift — the failure mode this spike checks for):');
    for (const m of mismatches) {
      console.log(`  offset ${m.boundary.textOffset}: expected ${JSON.stringify(m.expected)}, got ${JSON.stringify(m.actual)}`);
    }
  }

  const estimatedCost = (text.length / 1_000_000) * PRICE_PER_MILLION_CHARS;
  console.log(`\nAudio written to ${audioPath}`);
  console.log(`Estimated cost for this run: $${estimatedCost.toFixed(4)} (standard neural tier)`);

  if (mismatches.length > 0) {
    console.error('\nFAIL: WordBoundary offsets do not align 1:1 with the source text.');
    process.exit(1);
  }
  console.log('\nPASS: WordBoundary offsets align 1:1 with the source text.');
}

// Only run when invoked directly (`tsx build/scripts/tts-spike.ts`), not when
// imported for `verifyWordBoundaries` by tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
