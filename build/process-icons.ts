/**
 * Process callout icon images: remove white background and trim whitespace.
 * Run once after generating icons, saves processed versions in place.
 *
 * Usage: npx tsx build/process-icons.ts
 */
import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const IMAGES_DIR = join(import.meta.dirname, '..', 'src', 'images');
const ICON_PREFIX = 'callout-icon-';
const WHITE_THRESHOLD = 32;
const ICON_SIZE = 128;

async function removeWhiteAndTrim(imagePath: string): Promise<void> {
  // Step 1: Remove white background (same algorithm as generate-art.ts)
  const { data, info } = await sharp(imagePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const distFromWhite = Math.max(255 - r, 255 - g, 255 - b);
    if (distFromWhite < WHITE_THRESHOLD) {
      data[i + 3] = Math.round((distFromWhite / WHITE_THRESHOLD) * data[i + 3]);
    }
  }

  // Step 2: Trim transparent whitespace and resize to icon dimensions
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .trim()
    .resize(ICON_SIZE, ICON_SIZE, { fit: 'inside', withoutEnlargement: false })
    .toFile(imagePath);
}

async function main(): Promise<void> {
  const entries = await readdir(IMAGES_DIR);
  const icons = entries.filter(
    (f) => f.startsWith(ICON_PREFIX) && f.endsWith('.png')
  );

  if (icons.length === 0) {
    console.log('No callout icons found in src/images/');
    return;
  }

  for (const icon of icons) {
    const path = join(IMAGES_DIR, icon);
    process.stdout.write(`Processing ${icon}...`);
    try {
      await removeWhiteAndTrim(path);
      console.log(' done');
    } catch (err) {
      console.log(` failed: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`Processed ${icons.length} icon(s)`);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
