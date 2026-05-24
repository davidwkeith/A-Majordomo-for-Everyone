#!/usr/bin/env node
/**
 * `npm run sync:notes:status` — pretty-printed observability summary.
 */

import { stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { readState, statePath } from '../notes/state.js';
import { findAnnotationDbPath } from '../notes/sqlite-source.js';
import { LABEL_NAME } from '../notes/types.js';

function fmt(iso: string): string {
  if (iso === '1970-01-01T00:00:00.000Z') return '(never)';
  const d = new Date(iso);
  const now = Date.now();
  const ago = Math.round((now - d.getTime()) / 60000);
  return `${d.toLocaleString()} (${ago} minutes ago)`;
}

async function fileSize(path: string): Promise<string> {
  try {
    const s = await stat(path);
    if (s.size > 1024 * 1024) return `${(s.size / 1024 / 1024).toFixed(1)} MB`;
    if (s.size > 1024) return `${(s.size / 1024).toFixed(1)} KB`;
    return `${s.size} B`;
  } catch {
    return '(missing)';
  }
}

function ghCount(state: 'open' | 'closed'): number | null {
  const r = spawnSync(
    'gh',
    ['issue', 'list', '--label', LABEL_NAME, '--state', state, '--limit', '1000', '--json', 'number'],
    { encoding: 'utf8' }
  );
  if (r.status !== 0) return null;
  try {
    return (JSON.parse(r.stdout) as unknown[]).length;
  } catch {
    return null;
  }
}

function launchctlLoaded(): boolean {
  const r = spawnSync(
    'launchctl',
    ['print', `gui/${process.getuid?.() ?? 0}/io.dwk.majordomo.notes-sync`],
    { encoding: 'utf8' }
  );
  return r.status === 0;
}

async function main(): Promise<void> {
  const home = homedir();
  const s = await readState(statePath(home));
  const logPath = join(home, 'Library', 'Logs', 'majordomo-notes-sync.log');
  const annPath = await findAnnotationDbPath(home);
  const annMtime = annPath ? (await stat(annPath)).mtime.toISOString() : null;

  console.log('Majordomo notes sync');
  console.log(`  Last run:           ${fmt(s.lastSuccessfulSync)}`);
  console.log(`  Apple Books mtime:  ${annMtime ? fmt(annMtime) : '(books not installed)'}`);
  console.log(`  State file:         ${statePath(home)}`);
  console.log(`  Log file:           ${logPath}  (${await fileSize(logPath)})`);
  console.log(`  LaunchAgent:        ${launchctlLoaded() ? 'loaded' : 'NOT loaded'}`);
  console.log('');
  console.log('  Lifetime counters');
  console.log(`    runs:     ${s.runs.total}   (created: ${s.runs.created}, updated: ${s.runs.updated}, noop: ${s.runs.noop})`);

  const open = ghCount('open');
  const closed = ghCount('closed');
  if (open !== null && closed !== null) {
    console.log(`    open issues with ${LABEL_NAME} label:    ${open}`);
    console.log(`    closed issues with ${LABEL_NAME} label:  ${closed}`);
  } else {
    console.log(`    (could not query GitHub — is gh auth valid?)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
