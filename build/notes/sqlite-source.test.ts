import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { findAssetId, listAnnotations, parseChapter } from './sqlite-source.js';
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

  it('returns the most-recently-added asset when multiple share the title', () => {
    // Seed an additional row with a higher Z_PK and the same title
    libraryDb.exec("INSERT INTO ZBKLIBRARYASSET VALUES (99, 'ASSET-NEWER', 'Majordomo');");
    expect(findAssetId(libraryDb, BOOK_TITLE)).toBe('ASSET-NEWER');
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

  it('filters out annotations with empty/whitespace-only notes', () => {
    const rows = listAnnotations(annotationDb, 'ASSET-MAJORDOMO');
    expect(rows.find((r) => r.uuid === 'UUID-E')).toBeUndefined();
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

  it('parses chapter slug from CFI', () => {
    const rows = listAnnotations(annotationDb, 'ASSET-MAJORDOMO');
    const a = rows.find((r) => r.uuid === 'UUID-A');
    expect(a!.chapter).toBe('00-epigraph');
  });

  it('returns an empty array for an unknown asset_id', () => {
    expect(listAnnotations(annotationDb, 'ASSET-MISSING')).toEqual([]);
  });
});

describe('parseChapter', () => {
  it('extracts the bracketed id from a typical CFI', () => {
    expect(parseChapter('epubcfi(/6/4[00-epigraph]!/4/2/6/2/1,:3,:55)')).toBe('00-epigraph');
  });

  it('returns null when the CFI has no bracketed id', () => {
    expect(parseChapter('epubcfi(/6/4!/4/2)')).toBeNull();
  });

  it('returns null on null/empty input', () => {
    expect(parseChapter(null)).toBeNull();
    expect(parseChapter('')).toBeNull();
  });

  it('returns the first bracket if multiple are present', () => {
    expect(parseChapter('[first]/...[second]')).toBe('first');
  });
});
