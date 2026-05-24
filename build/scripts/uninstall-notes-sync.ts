#!/usr/bin/env node
/**
 * One-shot uninstaller. Unloads the LaunchAgent and removes the plist.
 * Leaves state file and GitHub label alone — data, not config.
 */

import { rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

const LABEL = 'io.dwk.majordomo.notes-sync';

async function main(): Promise<void> {
  if (typeof process.getuid !== 'function') {
    console.error('This script requires a POSIX environment (macOS).');
    process.exit(1);
  }
  const home = homedir();
  const uid = process.getuid!();
  const dest = join(home, 'Library', 'LaunchAgents', `${LABEL}.plist`);

  console.log('[uninstall-notes-sync] booting out...');
  const r = spawnSync('launchctl', ['bootout', `gui/${uid}/${LABEL}`], { encoding: 'utf8' });
  if (r.status !== 0 && !/not loaded|no such/i.test(r.stderr)) {
    console.log(`[uninstall-notes-sync]   note: ${r.stderr.trim()}`);
  } else {
    console.log('[uninstall-notes-sync]   booted out');
  }

  console.log('[uninstall-notes-sync] removing plist...');
  try {
    await rm(dest);
    console.log(`[uninstall-notes-sync]   removed ${dest}`);
  } catch {
    console.log(`[uninstall-notes-sync]   no plist at ${dest}`);
  }

  console.log('');
  console.log('State file and GitHub label left in place:');
  console.log(`  ${home}/Library/Application Support/majordomo/notes-sync-state.json`);
  console.log(`  GitHub label: from:apple-books`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
