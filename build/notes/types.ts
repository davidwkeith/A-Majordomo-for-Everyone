/**
 * Shared types for the Apple Books → GitHub Issues sync feature.
 */

export interface Annotation {
  /** ZANNOTATIONUUID — stable across edits, primary dedup key. */
  uuid: string;
  /**
   * Apple's expanded natural-unit (typically a sentence) around the user's
   * finger-selection. Sourced from ZANNOTATIONREPRESENTATIVETEXT rather than
   * ZANNOTATIONSELECTEDTEXT because the literal selection is often truncated
   * mid-word and gives less context.
   */
  selectedText: string;
  /** ZANNOTATIONNOTE — the user's typed note. Non-empty by filter. */
  note: string;
  /**
   * Chapter slug parsed from the CFI bracket in ZANNOTATIONLOCATION
   * (e.g. "00-epigraph" from `epubcfi(/6/4[00-epigraph]!/...)`).
   * Null if the CFI is missing or doesn't contain a bracketed ID.
   */
  chapter: string | null;
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
/**
 * The ePub's `dc:title` as set by the build pipeline (see BOOK_META in
 * build/types.ts). This is the value Apple Books stores in ZTITLE on
 * ZBKLIBRARYASSET — NOT the GitHub repo name.
 */
export const BOOK_TITLE = 'Majordomo';
export const GITHUB_BODY_MAX = 65536;
/** Seconds between Unix epoch and Core Data NSDate epoch (2001-01-01 UTC). */
export const NSDATE_EPOCH_OFFSET = 978307200;
