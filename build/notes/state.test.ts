import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readState, writeState, emptyState, statePath } from './state.js';
import type { SyncState } from './types.js';

let tmpDir: string;
let path: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'majordomo-state-'));
  path = join(tmpDir, 'state.json');
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('emptyState', () => {
  it('produces a valid initial SyncState', () => {
    const s = emptyState();
    expect(s.schemaVersion).toBe(1);
    expect(s.majordomoAssetId).toBeNull();
    expect(s.runs).toEqual({ total: 0, created: 0, updated: 0, noop: 0 });
    expect(s.lastSqliteMtime).toBe('1970-01-01T00:00:00.000Z');
  });
});

describe('readState', () => {
  it('returns emptyState when the file does not exist', async () => {
    const s = await readState(path);
    expect(s).toEqual(emptyState());
  });

  it('returns emptyState when the file is unparseable JSON', async () => {
    writeFileSync(path, '{ this is not json');
    const s = await readState(path);
    expect(s).toEqual(emptyState());
  });

  it('returns emptyState when schemaVersion is missing or unknown', async () => {
    writeFileSync(path, JSON.stringify({ schemaVersion: 99, foo: 'bar' }));
    const s = await readState(path);
    expect(s).toEqual(emptyState());
  });

  it('reads and parses a valid v1 state file', async () => {
    const written: SyncState = {
      schemaVersion: 1,
      lastSqliteMtime: '2026-05-23T18:00:00.000Z',
      lastSuccessfulSync: '2026-05-23T18:00:01.000Z',
      majordomoAssetId: 'ASSET-XYZ',
      runs: { total: 5, created: 2, updated: 1, noop: 2 },
    };
    writeFileSync(path, JSON.stringify(written));
    expect(await readState(path)).toEqual(written);
  });
});

describe('writeState', () => {
  it('persists a state object as readable JSON', async () => {
    const s = emptyState();
    s.lastSqliteMtime = '2026-05-23T18:00:00.000Z';
    s.runs.total = 1;
    await writeState(path, s);
    const back = await readState(path);
    expect(back).toEqual(s);
  });

  it('creates parent directories if missing', async () => {
    const nested = join(tmpDir, 'a', 'b', 'c', 'state.json');
    await writeState(nested, emptyState());
    expect(await readState(nested)).toEqual(emptyState());
  });
});

describe('statePath', () => {
  it('returns the macOS Application Support path under the given home', () => {
    const p = statePath('/Users/dwk');
    expect(p).toBe('/Users/dwk/Library/Application Support/majordomo/notes-sync-state.json');
  });
});
