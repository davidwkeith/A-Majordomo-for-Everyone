import { GoogleGenAI } from '@google/genai';
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';
import type { ArtBrief } from './filters/art-briefs.js';

const execFileAsync = promisify(execFile);

type Backend = 'gemini' | 'mflux';

const BACKEND = (process.env.IMAGE_BACKEND ?? 'gemini') as Backend;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-image';
const MFLUX_MODEL = process.env.MFLUX_MODEL ?? 'schnell';
const MFLUX_STEPS = parseInt(process.env.MFLUX_STEPS ?? '4', 10);

/** Short style prefix for diffusion models (T5 context is ~512 tokens). */
const LOCAL_STYLE_PREFIX =
  'Hand-drawn #2 pencil sketch on college-ruled notebook paper, ' +
  '1990s kid notebook doodle style, technical-observational drawing, ' +
  'ballpoint pen color in 8-bit NES palette. ';

/** Map brief size to pixel dimensions for local generation. */
const DIMENSIONS: Record<string, [number, number]> = {
  full: [1024, 768],
  'half-left': [512, 768],
  'half-right': [512, 768],
  margin: [512, 512],
};

/** Threshold (0–255) below which a pixel's distance from white is kept opaque. */
const WHITE_THRESHOLD = 32;

/**
 * Convert near-white pixels to transparent. Pixels whose RGB values are all
 * within WHITE_THRESHOLD of 255 get an alpha proportional to their distance
 * from pure white, producing soft anti-aliased edges.
 */
async function removeWhiteBackground(imagePath: string): Promise<void> {
  const { data, info } = await sharp(imagePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const distFromWhite = Math.max(255 - r, 255 - g, 255 - b);
    if (distFromWhite < WHITE_THRESHOLD) {
      // Scale alpha: pure white → 0, threshold edge → original alpha
      data[i + 3] = Math.round((distFromWhite / WHITE_THRESHOLD) * data[i + 3]);
    }
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(imagePath);
}

/**
 * Generate a single image via the Gemini API.
 */
async function generateOneGemini(
  ai: GoogleGenAI,
  brief: ArtBrief,
  imagesDir: string,
  styleGuide: string,
): Promise<void> {
  const outputPath = join(imagesDir, `${brief.stem}.${brief.format}`);

  const prompt = styleGuide
    ? `${styleGuide}\n\n---\n\n${brief.brief}`
    : brief.brief;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseModalities: ['IMAGE'],
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  if (!part?.inlineData?.data) {
    throw new Error('no image data in response');
  }

  const buffer = Buffer.from(part.inlineData.data, 'base64');
  await writeFile(outputPath, buffer);

  // Inline graphics are generated on white; strip to alpha.
  if (brief.size !== 'full' && brief.format === 'png') {
    await removeWhiteBackground(outputPath);
  }
}

/**
 * Generate a single image via mflux (FLUX on Apple Silicon).
 */
async function generateOneMflux(
  brief: ArtBrief,
  imagesDir: string,
): Promise<void> {
  const outputPath = join(imagesDir, `${brief.stem}.${brief.format}`);
  const prompt = LOCAL_STYLE_PREFIX + brief.brief;
  const [width, height] = DIMENSIONS[brief.size] ?? DIMENSIONS.margin;

  await execFileAsync('mflux-generate', [
    '--model', MFLUX_MODEL,
    '--prompt', prompt,
    '--output', outputPath,
    '--steps', String(MFLUX_STEPS),
    '--width', String(width),
    '--height', String(height),
  ]);
}

/**
 * Inspect stderr from a failed mflux-generate call and return a
 * user-friendly message if the error is a known, actionable issue.
 * Returns null when the error is not recognised.
 */
export function diagnoseGenerationError(stderr: string): string | null {
  if (/GatedRepoError|401 Unauthorized/i.test(stderr)) {
    const model =
      stderr.match(/model ([\w./-]+) is restricted/)?.[1] ?? 'the requested model';
    return (
      `${model} is a gated Hugging Face repo. ` +
      'Accept the license at its model page on huggingface.co, then run: ' +
      'hf login'
    );
  }
  const cacheMatch = stderr.match(
    /Incomplete Hugging Face.*cache for '([\w./-]+)'/,
  );
  if (cacheMatch || /Server disconnected.*tokenizer/s.test(stderr)) {
    const model = cacheMatch?.[1] ?? 'the model';
    return (
      `Incomplete Hugging Face cache for ${model}. ` +
      'A previous download was interrupted. Clear the cache and retry: ' +
      `rm -rf ~/.cache/huggingface/hub/models--${model.replace(/\//g, '--')}`
    );
  }
  return null;
}

/**
 * Generate missing images for the given art briefs.
 * Processes sequentially to respect rate limits / GPU.
 * Returns the count of successfully generated images.
 */
export async function generateMissingArt(
  missing: ArtBrief[],
  imagesDir: string,
  styleGuidePath?: string,
): Promise<number> {
  let ai: GoogleGenAI | undefined;
  let styleGuide = '';

  if (BACKEND === 'gemini') {
    const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error(
        'Set GOOGLE_API_KEY or GEMINI_API_KEY to generate images'
      );
      return 0;
    }
    ai = new GoogleGenAI({ apiKey });
    if (styleGuidePath) {
      try {
        styleGuide = await readFile(styleGuidePath, 'utf-8');
      } catch {
        // No style guide — just use the brief
      }
    }
  }

  console.log(`Using ${BACKEND} backend`);

  let generated = 0;
  for (const brief of missing) {
    const imageFile = `${brief.stem}.${brief.format}`;
    process.stdout.write(`Generating ${imageFile}...`);
    try {
      if (BACKEND === 'gemini') {
        await generateOneGemini(ai!, brief, imagesDir, styleGuide);
      } else {
        await generateOneMflux(brief, imagesDir);
      }
      generated++;
      console.log(' done');
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const stderr =
        err && typeof err === 'object' && 'stderr' in err
          ? String((err as { stderr: unknown }).stderr)
          : raw;
      const hint = diagnoseGenerationError(stderr);
      console.log(` failed: ${hint ?? raw}`);
      if (hint) break; // auth issues won't self-resolve — stop early
    }
  }

  return generated;
}
