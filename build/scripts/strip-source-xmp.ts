/**
 * One-shot chore: strip embedded XMP from source PNGs.
 *
 * After this runs once, source PNGs in `src/images/` are byte-stable
 * because the build no longer rewrites them. XMP travels in the
 * `.art.md` sidecar and is embedded only into built artifacts during
 * `optimizeImages`. See issue #78.
 */
import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import sharp from 'sharp';

const IMAGES_DIR = resolve(import.meta.dirname, '..', '..', 'src', 'images');

async function main(): Promise<void> {
  const entries = await readdir(IMAGES_DIR, { recursive: true });
  let stripped = 0;
  for (const entry of entries) {
    if (extname(entry).toLowerCase() !== '.png') continue;
    const path = join(IMAGES_DIR, entry);
    const info = await stat(path);
    if (info.isDirectory()) continue;
    const meta = await sharp(path).metadata();
    if (!meta.xmp) continue;
    // No keepXmp / withXmp → sharp drops the XMP packet on re-encode.
    const buf = await readFile(path);
    const out = await sharp(buf).png().toBuffer();
    await writeFile(path, out);
    stripped++;
    console.log(`stripped ${entry}`);
  }
  console.log(`done — stripped XMP from ${stripped} image(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
