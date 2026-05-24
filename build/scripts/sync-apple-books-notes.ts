#!/usr/bin/env node
/**
 * Entry point for the Apple Books → GitHub Issues sync daemon.
 * Invoked hourly by the LaunchAgent, and by `npm run sync:notes`.
 *
 * Exit 0 = success or soft-fail. Exit 1 = user needs to look at the log.
 */

import { stat } from 'node:fs/promises';
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
import {
  findAnnotationDbPath,
  findAssetId,
  findLibraryDbPath,
  listAnnotations,
  openReadonly,
} from '../notes/sqlite-source.js';
import type { Action } from '../notes/types.js';
import { BOOK_TITLE } from '../notes/types.js';

function log(severity: 'info' | 'warn' | 'error', event: string, fields: Record<string, unknown> = {}): void {
  const pairs = Object.entries(fields)
    .map(([k, v]) => `${k}=${String(v)}`)
    .join(' ');
  console.log(`${new Date().toISOString()} [${severity}]  ${event}${pairs ? ' ' + pairs : ''}`);
}

async function main(): Promise<number> {
  const t0 = Date.now();
  const home = homedir();
  const sPath = statePath(home);
  const state = await readState(sPath);

  const annPath = await findAnnotationDbPath(home);
  if (!annPath) {
    log('warn', 'run-end', { ok: false, reason: 'apple-books-not-installed' });
    return 0;
  }

  const annStat = await stat(annPath);
  const annMtimeIso = annStat.mtime.toISOString();
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
    const libDb = openReadonly(libPath);
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

  const annDb = openReadonly(annPath);
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
  log('info', 'gh-list', { existing: existing.length, 'with-uuid': existing.length });

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
      log('error', 'action-failed', { type: a.type, uuid: a.uuid, message: msg });
      exitCode = 1;
    }
  }

  state.runs.total += 1;
  state.lastSqliteMtime = annMtimeIso;
  if (exitCode === 0) state.lastSuccessfulSync = new Date().toISOString();
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
