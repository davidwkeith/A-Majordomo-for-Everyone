/**
 * Read-only access to Apple Books's sqlite databases.
 *
 * Real paths (caller resolves via glob):
 *   ~/Library/Containers/com.apple.iBooksX/Data/Documents/BKLibrary/BKLibrary-*.sqlite
 *   ~/Library/Containers/com.apple.iBooksX/Data/Documents/AEAnnotation/AEAnnotation_*.sqlite
 */

import { readdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import type { Annotation } from './types.js';
import { nsdateToDate } from './render.js';

const BOOKS_CONTAINER = 'Library/Containers/com.apple.iBooksX/Data/Documents';

export async function findAnnotationDbPath(home: string = homedir()): Promise<string | null> {
  const dir = join(home, BOOKS_CONTAINER, 'AEAnnotation');
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return null;
  }
  for (const f of entries) {
    if (f.startsWith('AEAnnotation_') && f.endsWith('.sqlite')) {
      return join(dir, f);
    }
  }
  return null;
}

export async function findLibraryDbPath(home: string = homedir()): Promise<string | null> {
  const dir = join(home, BOOKS_CONTAINER, 'BKLibrary');
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return null;
  }
  for (const f of entries) {
    if (f.startsWith('BKLibrary-') && f.endsWith('.sqlite')) {
      return join(dir, f);
    }
  }
  return null;
}

export function openReadonly(path: string): Database.Database {
  return new Database(path, { readonly: true, fileMustExist: true });
}

export function findAssetId(libraryDb: Database.Database, title: string): string | null {
  const row = libraryDb
    .prepare<[string], { ZASSETID: string }>('SELECT ZASSETID FROM ZBKLIBRARYASSET WHERE ZTITLE = ?')
    .get(title);
  return row?.ZASSETID ?? null;
}

interface AnnotationRow {
  ZANNOTATIONUUID: string;
  ZANNOTATIONSELECTEDTEXT: string;
  ZANNOTATIONNOTE: string;
  ZFUTUREPROOFING5: string | null;
  ZANNOTATIONLOCATION: string | null;
  ZANNOTATIONMODIFICATIONDATE: number;
}

export function listAnnotations(annotationDb: Database.Database, assetId: string): Annotation[] {
  const rows = annotationDb
    .prepare<[string], AnnotationRow>(
      `SELECT
         ZANNOTATIONUUID,
         ZANNOTATIONSELECTEDTEXT,
         ZANNOTATIONNOTE,
         ZFUTUREPROOFING5,
         ZANNOTATIONLOCATION,
         ZANNOTATIONMODIFICATIONDATE
       FROM ZAEANNOTATION
       WHERE ZANNOTATIONASSETID = ?
         AND ZANNOTATIONNOTE IS NOT NULL
         AND (ZANNOTATIONDELETED IS NULL OR ZANNOTATIONDELETED = 0)
       ORDER BY ZANNOTATIONLOCATION`
    )
    .all(assetId);

  return rows.map((r) => ({
    uuid: r.ZANNOTATIONUUID,
    selectedText: r.ZANNOTATIONSELECTEDTEXT,
    note: r.ZANNOTATIONNOTE,
    chapterTitle: r.ZFUTUREPROOFING5,
    locationPercent: r.ZANNOTATIONLOCATION ? parseFloat(r.ZANNOTATIONLOCATION) : 0,
    modifiedAt: nsdateToDate(r.ZANNOTATIONMODIFICATIONDATE),
  }));
}
