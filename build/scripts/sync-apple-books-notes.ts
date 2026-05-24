#!/usr/bin/env node
/**
 * Entry point for the Apple Books → GitHub Issues sync daemon.
 * Invoked hourly by the LaunchAgent, and by `npm run sync:notes`.
 *
 * Exit 0 = success or soft-fail. Exit 1 = user needs to look at the log.
 */

import { access, stat } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import type Database from 'better-sqlite3';
import { homedir } from 'node:os';
import { reconcile } from '../notes/reconcile.js';
import {
  readState,
  statePath,
  writeState,
} from '../notes/state.js';
import {
  createIssue,
  editIssue,
  listAutoFiledIssues,
} from '../notes/github-target.js';
import { parseUuid } from '../notes/uuid-parse.js';
import {
  findAnnotationDbPath,
  findAssetId,
  findLibraryDbPath,
  listAnnotations,
  openReadonly,
} from '../notes/sqlite-source.js';
import type { Action } from '../notes/types.js';
import { BOOK_TITLE } from '../notes/types.js';

async function maxMtime(paths: string[]): Promise<string> {
  let max = 0;
  for (const p of paths) {
    try {
      const s = await stat(p);
      if (s.mtimeMs > max) max = s.mtimeMs;
    } catch {
      // file may not exist (e.g., no -shm yet); skip
    }
  }
  return new Date(max).toISOString();
}

function log(severity: 'info' | 'warn' | 'error', event: string, fields: Record<string, unknown> = {}): void {
  const pairs = Object.entries(fields)
    .map(([k, v]) => `${k}=${String(v)}`)
    .join(' ');
  console.log(`${new Date().toISOString()} [${severity}]  ${event}${pairs ? ' ' + pairs : ''}`);
}

async function main(): Promise<number> {
  const t0 = Date.now();

  // Daemon-wide hard timeout: if anything async stalls (network,
  // unexpected sqlite lock, etc.), bail before the LaunchAgent considers
  // us still running and skips the next hourly fire.
  const hardTimeout = setTimeout(() => {
    log('error', 'hard-timeout', { 'elapsed-ms': Date.now() - t0 });
    process.exit(1);
  }, 60_000);
  hardTimeout.unref();

  const home = homedir();
  const sPath = statePath(home);
  const state = await readState(sPath);

  // FDA preflight: in launchd context the daemon may be denied access
  // to ~/Library/Containers/com.apple.iBooksX/ even though the installer
  // (run from the user's interactive shell) could see it. Use fs.access
  // wrapped in a 5s timeout so a denied-or-stalled check fails fast
  // rather than hanging the whole hourly slot.
  const annDir = `${home}/Library/Containers/com.apple.iBooksX/Data/Documents/AEAnnotation`;
  try {
    await Promise.race([
      access(annDir, fsConstants.R_OK),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('fda-timeout')), 5000)
      ),
    ]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log('error', 'fda-check-failed', {
      message: msg,
      hint: `grant Full Disk Access to ${process.execPath}`,
    });
    return 1;
  }

  const annPath = await findAnnotationDbPath(home);
  if (!annPath) {
    log('warn', 'run-end', { ok: false, reason: 'apple-books-not-installed' });
    return 0;
  }

  // WAL-aware mtime: Apple Books uses SQLite WAL journaling, so new
  // iCloud-synced annotations may only touch -wal/-shm. Use the max
  // mtime across all three files.
  const annMtimeIso = await maxMtime([annPath, `${annPath}-wal`, `${annPath}-shm`]);
  if (annMtimeIso === state.lastSqliteMtime) {
    log('info', 'run-start', { 'mtime-changed': false, 'skip-reason': 'mtime-stable' });
    state.runs.total += 1;
    await writeState(sPath, state);
    log('info', 'run-end', { ok: true, 'elapsed-ms': Date.now() - t0 });
    return 0;
  }
  log('info', 'run-start', { 'mtime-changed': true });

  let assetId = state.majordomoAssetId;
  if (!assetId) {
    const libPath = await findLibraryDbPath(home);
    if (!libPath) {
      log('warn', 'run-end', { ok: false, reason: 'library-db-missing' });
      return 0;
    }
    const libDb = await openReadonly(libPath);
    try {
      assetId = findAssetId(libDb, BOOK_TITLE);
    } finally {
      libDb.close();
    }
    if (!assetId) {
      log('warn', 'run-end', {
        ok: false,
        reason: 'book-not-found',
        hint: 'open the built ePub in Books at least once',
      });
      return 0;
    }
    state.majordomoAssetId = assetId;
  }

  let annDb: Database.Database;
  try {
    annDb = await openReadonly(annPath);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/SQLITE_BUSY|database is locked/i.test(msg)) {
      log('warn', 'run-end', { ok: false, reason: 'sqlite-busy' });
      return 0;
    }
    throw e;
  }
  let annotations;
  try {
    annotations = listAnnotations(annDb, assetId);
  } finally {
    annDb.close();
  }
  log('info', 'sqlite-query', { annotations: annotations.length, 'with-notes': annotations.length });

  let existing;
  try {
    existing = await listAutoFiledIssues();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/authentication/i.test(msg)) {
      log('error', 'gh-auth-failed', { hint: 'run `gh auth refresh`' });
      return 1;
    }
    if (/rate limit/i.test(msg) || /dial tcp|getaddrinfo/i.test(msg)) {
      log('warn', 'gh-transient', { message: msg });
      return 0;
    }
    log('error', 'gh-list-failed', { message: msg });
    return 1;
  }
  const withUuid = existing.filter((i) => parseUuid(i.body) !== null).length;
  log('info', 'gh-list', { existing: existing.length, 'with-uuid': withUuid });

  const actions: Action[] = reconcile(annotations, existing);
  const counts = { create: 0, update: 0, noop: 0 };
  for (const a of actions) counts[a.type]++;
  log('info', 'reconcile', counts);

  let exitCode = 0;
  for (const a of actions) {
    try {
      if (a.type === 'create') {
        const n = await createIssue(a.rendered);
        state.runs.created += 1;
        log('info', 'issue-created', { number: n, uuid: a.uuid });
      } else if (a.type === 'update') {
        await editIssue(a.issue, a.rendered.body);
        state.runs.updated += 1;
        log('info', 'issue-updated', { number: a.issue, uuid: a.uuid });
      } else {
        state.runs.noop += 1;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/rate limit/i.test(msg) || /dial tcp|getaddrinfo/i.test(msg)) {
        // Transient: surface as warn, bail out of the loop (any later
        // action is likely to hit the same condition). exitCode stays 0
        // so the LaunchAgent doesn't escalate.
        log('warn', 'action-transient', { type: a.type, uuid: a.uuid, message: msg });
        break;
      }
      log('error', 'action-failed', { type: a.type, uuid: a.uuid, message: msg });
      exitCode = 1;
    }
  }

  state.runs.total += 1;
  if (exitCode === 0) {
    state.lastSqliteMtime = annMtimeIso;
    state.lastSuccessfulSync = new Date().toISOString();
  }
  await writeState(sPath, state);

  log('info', 'run-end', {
    ok: exitCode === 0,
    'elapsed-ms': Date.now() - t0,
  });
  return exitCode;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    log('error', 'unhandled', { message: e instanceof Error ? e.message : String(e) });
    process.exit(1);
  });
