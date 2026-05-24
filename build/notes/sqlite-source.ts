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

export async function openReadonly(path: string): Promise<Database.Database> {
  try {
    return new Database(path, { readonly: true, fileMustExist: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/SQLITE_BUSY|database is locked/i.test(msg)) {
      // Single retry after 500ms — matches spec failure-mode table.
      await new Promise((r) => setTimeout(r, 500));
      return new Database(path, { readonly: true, fileMustExist: true });
    }
    throw e;
  }
}

export function findAssetId(libraryDb: Database.Database, title: string): string | null {
  const row = libraryDb
    .prepare<[string], { ZASSETID: string }>(
      'SELECT ZASSETID FROM ZBKLIBRARYASSET WHERE ZTITLE = ? ORDER BY Z_PK DESC LIMIT 1'
    )
    .get(title);
  return row?.ZASSETID ?? null;
}

/**
 * Extract the chapter identifier from an EPUB CFI.
 * CFIs look like `epubcfi(/6/4[00-epigraph]!/4/2/6/2/1,:3,:55)` — the
 * bracketed part inside the spine reference is the spine item's idref,
 * which in this book's build matches the source-tree chapter directory.
 * Returns the slug (e.g. "00-epigraph") or null if not found.
 */
export function parseChapter(cfi: string | null): string | null {
  if (!cfi) return null;
  const m = cfi.match(/\[([^\]]+)\]/);
  return m ? m[1] : null;
}

interface AnnotationRow {
  ZANNOTATIONUUID: string;
  ZANNOTATIONREPRESENTATIVETEXT: string | null;
  ZANNOTATIONSELECTEDTEXT: string;
  ZANNOTATIONNOTE: string;
  ZANNOTATIONLOCATION: string | null;
  ZANNOTATIONMODIFICATIONDATE: number;
}

export function listAnnotations(annotationDb: Database.Database, assetId: string): Annotation[] {
  const rows = annotationDb
    .prepare<[string], AnnotationRow>(
      `SELECT
         ZANNOTATIONUUID,
         ZANNOTATIONREPRESENTATIVETEXT,
         ZANNOTATIONSELECTEDTEXT,
         ZANNOTATIONNOTE,
         ZANNOTATIONLOCATION,
         ZANNOTATIONMODIFICATIONDATE
       FROM ZAEANNOTATION
       WHERE ZANNOTATIONASSETID = ?
         AND ZANNOTATIONNOTE IS NOT NULL
         AND length(trim(ZANNOTATIONNOTE)) > 0
         AND (ZANNOTATIONDELETED IS NULL OR ZANNOTATIONDELETED = 0)
       ORDER BY ZANNOTATIONLOCATION`
    )
    .all(assetId);

  return rows.map((r) => ({
    uuid: r.ZANNOTATIONUUID,
    // Prefer the representative (full natural unit); fall back to the
    // user's literal selection if Apple didn't populate the representative.
    selectedText: r.ZANNOTATIONREPRESENTATIVETEXT ?? r.ZANNOTATIONSELECTEDTEXT,
    note: r.ZANNOTATIONNOTE,
    chapter: parseChapter(r.ZANNOTATIONLOCATION),
    modifiedAt: nsdateToDate(r.ZANNOTATIONMODIFICATIONDATE),
  }));
}
