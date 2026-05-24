/**
 * Shared types for the Apple Books → GitHub Issues sync feature.
 */

export interface Annotation {
  /** ZANNOTATIONUUID — stable across edits, primary dedup key. */
  uuid: string;
  /** ZSELECTEDTEXT — the passage highlighted in Apple Books. */
  selectedText: string;
  /** ZANNOTATIONNOTE — the user's typed note. Non-empty by filter. */
  note: string;
  /** ZFUTUREPROOFING5 — chapter title captured at annotation time. */
  chapterTitle: string | null;
  /** ZLOCATIONRANGESTART — 0.0 to 1.0 position in the book. */
  locationPercent: number;
  /** ZANNOTATIONMODIFICATIONDATE — already converted from NSDate. */
  modifiedAt: Date;
}

export interface IssueRecord {
  number: number;
  body: string;
  state: 'OPEN' | 'CLOSED';
}

export interface RenderedIssue {
  title: string;
  body: string;
}

export type Action =
  | { type: 'create'; uuid: string; rendered: RenderedIssue }
  | { type: 'update'; uuid: string; issue: number; rendered: RenderedIssue }
  | { type: 'noop'; uuid: string; issue: number };

export interface SyncState {
  schemaVersion: 1;
  lastSqliteMtime: string;
  lastSuccessfulSync: string;
  majordomoAssetId: string | null;
  runs: {
    total: number;
    created: number;
    updated: number;
    noop: number;
  };
}

/** Constants shared across modules. */
export const LABEL_NAME = 'from:apple-books';
export const BOOK_TITLE = 'A Majordomo for Everyone';
export const GITHUB_BODY_MAX = 65536;
/** Seconds between Unix epoch and Core Data NSDate epoch (2001-01-01 UTC). */
export const NSDATE_EPOCH_OFFSET = 978307200;
