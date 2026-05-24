import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { findAssetId, listAnnotations } from './sqlite-source.js';
import { BOOK_TITLE } from './types.js';

const fixtureSql = readFileSync(
  fileURLToPath(new URL('./__fixtures__/aeannotation.sql', import.meta.url)),
  'utf8'
);

let libraryDb: Database.Database;
let annotationDb: Database.Database;

beforeEach(() => {
  libraryDb = new Database(':memory:');
  annotationDb = new Database(':memory:');
  libraryDb.exec(fixtureSql);
  annotationDb.exec(fixtureSql);
  libraryDb.exec('DROP TABLE ZAEANNOTATION');
  annotationDb.exec('DROP TABLE ZBKLIBRARYASSET');
});

describe('findAssetId', () => {
  it('returns the ASSETID for a book title that exists', () => {
    expect(findAssetId(libraryDb, BOOK_TITLE)).toBe('ASSET-MAJORDOMO');
  });

  it('returns null for a title that does not exist', () => {
    expect(findAssetId(libraryDb, 'No Such Book')).toBeNull();
  });
});

describe('listAnnotations', () => {
  it('returns only annotations with a non-null note', () => {
    const rows = listAnnotations(annotationDb, 'ASSET-MAJORDOMO');
    const uuids = rows.map((r) => r.uuid).sort();
    expect(uuids).toEqual(['UUID-A', 'UUID-C']);
  });

  it('filters out soft-deleted annotations', () => {
    const rows = listAnnotations(annotationDb, 'ASSET-MAJORDOMO');
    expect(rows.find((r) => r.uuid === 'UUID-D')).toBeUndefined();
  });

  it('filters by asset_id (no annotations from other books)', () => {
    const rows = listAnnotations(annotationDb, 'ASSET-OTHER');
    expect(rows).toHaveLength(1);
    expect(rows[0].uuid).toBe('UUID-OTHER');
  });

  it('decodes the NSDate column into a JS Date', () => {
    const rows = listAnnotations(annotationDb, 'ASSET-MAJORDOMO');
    const a = rows.find((r) => r.uuid === 'UUID-A');
    expect(a).toBeDefined();
    expect(a!.modifiedAt.toISOString()).toBe('2026-05-23T14:11:00.000Z');
  });

  it('decodes location string to a number', () => {
    const rows = listAnnotations(annotationDb, 'ASSET-MAJORDOMO');
    const a = rows.find((r) => r.uuid === 'UUID-A');
    expect(a!.locationPercent).toBeCloseTo(0.12);
  });

  it('returns an empty array for an unknown asset_id', () => {
    expect(listAnnotations(annotationDb, 'ASSET-MISSING')).toEqual([]);
  });
});
