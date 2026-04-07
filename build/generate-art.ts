import { GoogleGenAI } from '@google/genai';
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { ArtBrief } from './plugins/art-briefs.js';

const execFileAsync = promisify(execFile);

type Backend = 'gemini' | 'mflux';

const BACKEND = (process.env.IMAGE_BACKEND ?? 'mflux') as Backend;
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
      const msg = err instanceof Error ? err.message : String(err);
      console.log(` failed: ${msg}`);
    }
  }

  return generated;
}
