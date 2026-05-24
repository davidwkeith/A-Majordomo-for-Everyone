/**
 * Read / write / migrate the sync state file.
 * Location: ~/Library/Application Support/majordomo/notes-sync-state.json
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { SyncState } from './types.js';

export function statePath(home: string): string {
  return join(home, 'Library', 'Application Support', 'majordomo', 'notes-sync-state.json');
}

export function emptyState(): SyncState {
  return {
    schemaVersion: 1,
    lastSqliteMtime: '1970-01-01T00:00:00.000Z',
    lastSuccessfulSync: '1970-01-01T00:00:00.000Z',
    majordomoAssetId: null,
    runs: { total: 0, created: 0, updated: 0, noop: 0 },
  };
}

export async function readState(path: string): Promise<SyncState> {
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    return emptyState();
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.schemaVersion === 1) return parsed as SyncState;
    return emptyState();
  } catch {
    return emptyState();
  }
}

export async function writeState(path: string, state: SyncState): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(state, null, 2) + '\n', 'utf8');
}
