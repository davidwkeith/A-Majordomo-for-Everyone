#!/usr/bin/env node
/**
 * `npm run check:epub` — run EPUBCheck against the built ePub.
 *
 * Downloads the official W3C EPUBCheck release on first run and caches it
 * under node_modules/.cache/epubcheck/. Requires a Java 11+ runtime: `java`
 * on PATH, or JAVA_HOME, or EPUBCHECK_JAVA pointing at a java binary.
 *
 * Usage: tsx build/scripts/epubcheck.ts [path/to/book.epub]
 */

import { mkdir, writeFile, access, rename, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const EPUBCHECK_VERSION = '5.3.0';
const DOWNLOAD_URL = `https://github.com/w3c/epubcheck/releases/download/v${EPUBCHECK_VERSION}/epubcheck-${EPUBCHECK_VERSION}.zip`;

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const cacheDir = join(repoRoot, 'node_modules', '.cache', 'epubcheck');
const jarPath = join(cacheDir, `epubcheck-${EPUBCHECK_VERSION}`, 'epubcheck.jar');

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function findJava(): string | null {
  const candidates = [
    process.env.EPUBCHECK_JAVA,
    process.env.JAVA_HOME && join(process.env.JAVA_HOME, 'bin', 'java'),
    'java',
  ].filter((c): c is string => Boolean(c));

  for (const candidate of candidates) {
    const r = spawnSync(candidate, ['-version'], { encoding: 'utf8' });
    if (r.status === 0) return candidate;
  }
  return null;
}

async function ensureJar(): Promise<void> {
  if (await exists(jarPath)) return;

  console.log(`Downloading EPUBCheck ${EPUBCHECK_VERSION}…`);
  const res = await fetch(DOWNLOAD_URL);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText} for ${DOWNLOAD_URL}`);
  const zip = await JSZip.loadAsync(await res.arrayBuffer());

  // Extract to a temp dir, then rename into place so a partial extraction
  // never masquerades as a valid cache.
  const tmpDir = join(cacheDir, `.tmp-${process.pid}`);
  await rm(tmpDir, { recursive: true, force: true });
  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const dest = join(tmpDir, name);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, await entry.async('nodebuffer'));
  }
  await rm(dirname(jarPath), { recursive: true, force: true });
  await rename(join(tmpDir, `epubcheck-${EPUBCHECK_VERSION}`), dirname(jarPath));
  await rm(tmpDir, { recursive: true, force: true });
}

async function main(): Promise<void> {
  const epubPath = process.argv[2] ?? join(repoRoot, 'dist', 'majordomo.epub');
  if (!(await exists(epubPath))) {
    console.error(`No ePub at ${epubPath} — run \`npm run build\` first.`);
    process.exit(1);
  }

  const java = findJava();
  if (!java) {
    console.error(
      'EPUBCheck needs a Java 11+ runtime and none was found.\n' +
        'Install one (e.g. `brew install --cask temurin`) or set JAVA_HOME or EPUBCHECK_JAVA.'
    );
    process.exit(1);
  }

  await ensureJar();

  const r = spawnSync(java, ['-jar', jarPath, epubPath], { stdio: 'inherit' });
  process.exit(r.status ?? 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
