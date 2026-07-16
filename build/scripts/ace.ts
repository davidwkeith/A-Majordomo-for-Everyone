#!/usr/bin/env node
/**
 * `npm run check:a11y` — run Ace by DAISY against the built ePub for a
 * second accessibility opinion alongside build/validators/a11y.ts and
 * EPUBCheck. Ace drives a real Chromium (via Puppeteer) and runs axe-core
 * against each rendered document, so it catches things structural checks
 * can't — color contrast, heading order, ARIA role mismatches.
 *
 * Usage: tsx build/scripts/ace.ts [path/to/book.epub]
 */

import { access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const aceBin = join(repoRoot, 'node_modules', '.bin', 'ace-cli');
const outDir = join(repoRoot, 'dist', 'ace-report');

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const epubPath = process.argv[2] ?? join(repoRoot, 'dist', 'majordomo.epub');
  if (!(await exists(epubPath))) {
    console.error(`No ePub at ${epubPath} — run \`npm run build\` first.`);
    process.exit(1);
  }
  if (!(await exists(aceBin))) {
    console.error('ace-cli not found — run `npm install` first.');
    process.exit(1);
  }

  // -f: overwrite the report from a previous run
  // -E: exit with code 2 (non-zero) when accessibility checks fail
  const r = spawnSync(aceBin, ['-o', outDir, '-f', '-E', epubPath], {
    stdio: 'inherit',
  });
  process.exit(r.status ?? 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
