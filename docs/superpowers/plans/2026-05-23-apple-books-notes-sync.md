# Apple Books Notes → GitHub Issues Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a macOS LaunchAgent + TypeScript script that hourly reads Apple Books typed annotations on *A Majordomo for Everyone* from local sqlite and files each one as a deduped GitHub Issue on this repo.

**Architecture:** Pure functions for transformations (`render`, `reconcile`, `uuid-parse`), thin I/O wrappers (`sqlite-source` reads via `better-sqlite3`; `github-target` shells out to `gh` CLI), a single entry point that orchestrates them, and a one-shot installer that writes a LaunchAgent plist with `launchctl bootstrap`. Idempotency is achieved by embedding the stable Apple Books `ZANNOTATIONUUID` in each issue body as an HTML comment and searching the existing-issue index by UUID on every run.

**Tech Stack:** TypeScript (ES2022 / Node16 ESM), `vitest` for tests, `better-sqlite3` for read-only sqlite, `gh` CLI via `child_process` for GitHub API, `tsx` for direct TS execution (no compile step needed for the daemon). All conventions match the existing `build/` pipeline.

**Spec:** [docs/superpowers/specs/2026-05-23-apple-books-notes-sync-design.md](../specs/2026-05-23-apple-books-notes-sync-design.md)

---

## File map

| File | Created in Task | Purpose |
|---|---|---|
| `build/notes/types.ts` | 1 | Shared interfaces: `Annotation`, `IssueRecord`, `RenderedIssue`, `Action`, `SyncState` |
| `build/notes/uuid-parse.ts` | 2 | Extract `<!-- apple-books-uuid: X -->` from issue body |
| `build/notes/uuid-parse.test.ts` | 2 | Tests for `uuid-parse` |
| `build/notes/render.ts` | 3 | Pure: `Annotation → RenderedIssue` |
| `build/notes/render.test.ts` | 3 | Tests for `render` (NSDate conversion, title derivation, truncation) |
| `build/notes/reconcile.ts` | 4 | Pure: `(annotations, existing) → Action[]` |
| `build/notes/reconcile.test.ts` | 4 | Tests for `reconcile` |
| `build/notes/state.ts` | 5 | Read/write/migrate `~/Library/Application Support/majordomo/notes-sync-state.json` |
| `build/notes/state.test.ts` | 5 | Tests for state file handling |
| `build/notes/sqlite-source.ts` | 6 | Read-only sqlite access: `findAssetId`, `listAnnotations` |
| `build/notes/sqlite-source.test.ts` | 6 | Integration tests with in-memory sqlite |
| `build/notes/__fixtures__/aeannotation.sql` | 6 | Schema + seed data for sqlite tests |
| `build/notes/github-target.ts` | 7 | Wraps `gh` CLI: list, create, edit, label-create |
| `build/notes/github-target.test.ts` | 7 | Tests with mocked spawn |
| `build/scripts/sync-apple-books-notes.ts` | 8 | Daemon entry point |
| `build/scripts/sync-apple-books-notes-status.ts` | 9 | `npm run sync:notes:status` output |
| `build/scripts/install-notes-sync.ts` | 10 | One-shot installer |
| `build/scripts/uninstall-notes-sync.ts` | 10 | One-shot uninstaller |
| `build/scripts/notes-sync/io.dwk.majordomo.notes-sync.plist.template` | 10 | LaunchAgent plist with token placeholders |
| `package.json` | 0 (deps), 11 (scripts), 12 (version) | Three modifications across the plan |
| `CLAUDE.md` | 11 | Document sync:notes commands |

---

## Task 0: Add dependencies and verify clean baseline

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Verify the current branch and clean state**

```bash
git status
git rev-parse --abbrev-ref HEAD
```

Expected: branch `claude/issue-23-apple-books-notes-sync-spec`, working tree clean.

- [ ] **Step 2: Install `better-sqlite3` as a production dep**

```bash
npm install better-sqlite3@^12.5.0
```

Expected: `package.json` `dependencies` gains `better-sqlite3`.

- [ ] **Step 3: Install `tsx` as a devDep**

```bash
npm install --save-dev tsx@^4.20.0
```

Expected: `package.json` `devDependencies` gains `tsx`; `node_modules/.bin/tsx` exists.

- [ ] **Step 4: Verify the existing test suite still passes**

```bash
npm test
```

Expected: 55/55 pass.

- [ ] **Step 5: Verify type-check still clean**

```bash
npm run build:check
```

Expected: zero `tsc` output.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add better-sqlite3 and tsx deps for notes sync (#23)

better-sqlite3 reads Apple Books sqlite directly; tsx runs the
daemon entry-point TS file without a compile step. Both are needed
by the upcoming Apple-Books-notes → GitHub-Issues sync feature.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 1: Shared types

**Files:**
- Create: `build/notes/types.ts`

- [ ] **Step 1: Create the types module**

Create `build/notes/types.ts`:

```ts
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
```

- [ ] **Step 2: Verify type-check**

```bash
npm run build:check
```

Expected: silent.

- [ ] **Step 3: Commit**

```bash
git add build/notes/types.ts
git commit -m "Add shared types for notes sync (#23)

types.ts defines Annotation, IssueRecord, RenderedIssue, Action,
SyncState, plus shared constants (label name, book title, NSDate
offset).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: UUID parsing (pure)

**Files:**
- Create: `build/notes/uuid-parse.ts`
- Create: `build/notes/uuid-parse.test.ts`

- [ ] **Step 1: Write the failing test**

Create `build/notes/uuid-parse.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseUuid } from './uuid-parse.js';

describe('parseUuid', () => {
  it('extracts the UUID from a well-formed comment', () => {
    const body = '> quoted passage\n\nmy note\n\n<!-- apple-books-uuid: 4F3A-AB12-B891 -->\n';
    expect(parseUuid(body)).toBe('4F3A-AB12-B891');
  });

  it('returns null when no comment is present', () => {
    expect(parseUuid('plain body, no marker')).toBeNull();
  });

  it('returns null on malformed comment (missing prefix)', () => {
    expect(parseUuid('<!-- some-other-uuid: ABC123 -->')).toBeNull();
  });

  it('tolerates surrounding whitespace inside the comment', () => {
    expect(parseUuid('<!--  apple-books-uuid:   ABC-123  -->')).toBe('ABC-123');
  });

  it('returns the first UUID if the body contains two (defensive)', () => {
    const body = '<!-- apple-books-uuid: FIRST -->\n<!-- apple-books-uuid: SECOND -->';
    expect(parseUuid(body)).toBe('FIRST');
  });

  it('handles real-world Apple Books UUID format (long hex with dashes)', () => {
    const body = '<!-- apple-books-uuid: 4F3A2B1C-9D8E-7F6A-5B4C-3D2E1F0A9B8C -->';
    expect(parseUuid(body)).toBe('4F3A2B1C-9D8E-7F6A-5B4C-3D2E1F0A9B8C');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run build/notes/uuid-parse.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the minimal module**

Create `build/notes/uuid-parse.ts`:

```ts
/**
 * Extract the Apple Books UUID from a GitHub Issue body.
 */

const UUID_RE = /<!--\s*apple-books-uuid:\s*([^\s][^\s-]*(?:-[^\s-]+)*)\s*-->/;

export function parseUuid(body: string): string | null {
  const m = body.match(UUID_RE);
  return m ? m[1] : null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run build/notes/uuid-parse.test.ts
```

Expected: PASS — 6/6 tests pass.

- [ ] **Step 5: Run the full suite**

```bash
npm test
```

Expected: 61/61 pass (55 existing + 6 new).

- [ ] **Step 6: Commit**

```bash
git add build/notes/uuid-parse.ts build/notes/uuid-parse.test.ts
git commit -m "Add UUID parser for Apple Books issue dedup (#23)

parseUuid extracts the <!-- apple-books-uuid: X --> marker from a
GitHub Issue body. Used by reconcile to build the dedup index from
existing auto-filed issues.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Render annotation → issue body (pure)

**Files:**
- Create: `build/notes/render.ts`
- Create: `build/notes/render.test.ts`

- [ ] **Step 1: Write the failing test**

Create `build/notes/render.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { render, nsdateToDate, deriveTitle } from './render.js';
import type { Annotation } from './types.js';
import { GITHUB_BODY_MAX } from './types.js';

const sample: Annotation = {
  uuid: '4F3A-AB12-B891',
  selectedText: 'A library is a building; a life is a way of living.',
  note: 'fix this metaphor about libraries',
  chapterTitle: 'Chapter 1: Introduction',
  locationPercent: 0.12,
  modifiedAt: new Date('2026-05-23T14:11:00Z'),
};

describe('nsdateToDate', () => {
  it('converts Core Data NSDate seconds to a JS Date', () => {
    expect(nsdateToDate(0).toISOString()).toBe('2001-01-01T00:00:00.000Z');
  });

  it('converts a real-world NSDate to the expected year', () => {
    const d = nsdateToDate(800_000_000);
    expect(d.getUTCFullYear()).toBe(2026);
  });

  it('round-trips a known modification date', () => {
    expect(nsdateToDate(769702260).toISOString()).toBe('2026-05-23T14:11:00.000Z');
  });
});

describe('deriveTitle', () => {
  it('takes the first non-empty line', () => {
    expect(deriveTitle('first line\nsecond line')).toBe('first line');
  });

  it('skips leading blank lines', () => {
    expect(deriveTitle('\n\nactual content')).toBe('actual content');
  });

  it('truncates to 80 chars with an ellipsis', () => {
    const long = 'a'.repeat(120);
    const result = deriveTitle(long);
    expect(result.length).toBe(80);
    expect(result.endsWith('…')).toBe(true);
  });

  it('strips leading markdown punctuation', () => {
    expect(deriveTitle('## Heading')).toBe('Heading');
    expect(deriveTitle('- list item')).toBe('list item');
    expect(deriveTitle('> quoted')).toBe('quoted');
  });

  it('collapses runs of whitespace', () => {
    expect(deriveTitle('hello   world\t\tagain')).toBe('hello world again');
  });

  it('returns a sensible default for empty input', () => {
    expect(deriveTitle('')).toBe('(empty note)');
    expect(deriveTitle('\n\n  \n')).toBe('(empty note)');
  });
});

describe('render', () => {
  it('produces the expected title and body for a typical annotation', () => {
    const out = render(sample);
    expect(out.title).toBe('fix this metaphor about libraries');
    expect(out.body).toContain('> A library is a building; a life is a way of living.');
    expect(out.body).toContain('— Chapter 1: Introduction (12%)');
    expect(out.body).toContain('fix this metaphor about libraries');
    expect(out.body).toContain('<!-- apple-books-uuid: 4F3A-AB12-B891 -->');
    expect(out.body).toContain('<!-- apple-books-modified: 2026-05-23T14:11:00.000Z -->');
  });

  it('handles a null chapter title gracefully', () => {
    const out = render({ ...sample, chapterTitle: null });
    expect(out.body).toContain('— Uncategorized (12%)');
  });

  it('quotes each line of a multi-line passage', () => {
    const out = render({ ...sample, selectedText: 'line one\nline two\nline three' });
    expect(out.body).toContain('> line one');
    expect(out.body).toContain('> line two');
    expect(out.body).toContain('> line three');
  });

  it('truncates an over-long body, preserving the UUID footer', () => {
    const out = render({ ...sample, note: 'x'.repeat(GITHUB_BODY_MAX + 1000) });
    expect(out.body.length).toBeLessThanOrEqual(GITHUB_BODY_MAX);
    expect(out.body).toContain('_[truncated]_');
    expect(out.body).toContain('<!-- apple-books-uuid: 4F3A-AB12-B891 -->');
  });

  it('renders location as an integer percentage', () => {
    const out = render({ ...sample, locationPercent: 0.0735 });
    expect(out.body).toContain('(7%)');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run build/notes/render.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the render module**

Create `build/notes/render.ts`:

```ts
/**
 * Pure transformation: Apple Books annotation → GitHub issue body.
 */

import type { Annotation, RenderedIssue } from './types.js';
import { GITHUB_BODY_MAX, NSDATE_EPOCH_OFFSET } from './types.js';

const TRUNCATED_SUFFIX = '\n\n_[truncated]_\n';

export function nsdateToDate(nsdateSeconds: number): Date {
  return new Date((nsdateSeconds + NSDATE_EPOCH_OFFSET) * 1000);
}

export function deriveTitle(note: string): string {
  const firstNonEmpty = note
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);

  if (!firstNonEmpty) return '(empty note)';

  const stripped = firstNonEmpty.replace(/^(#+|[-*+]|>)\s+/, '').trim();
  const collapsed = stripped.replace(/\s+/g, ' ');

  if (collapsed.length <= 80) return collapsed;
  return collapsed.slice(0, 79) + '…';
}

function quoteLines(text: string): string {
  return text
    .split('\n')
    .map((l) => `> ${l}`)
    .join('\n');
}

function locationLabel(percent: number): string {
  return `${Math.round(percent * 100)}%`;
}

export function render(ann: Annotation): RenderedIssue {
  const title = deriveTitle(ann.note);
  const chapter = ann.chapterTitle ?? 'Uncategorized';

  const body =
    quoteLines(ann.selectedText) +
    `\n>\n> — ${chapter} (${locationLabel(ann.locationPercent)})\n\n` +
    ann.note +
    `\n\n<!-- apple-books-uuid: ${ann.uuid} -->\n` +
    `<!-- apple-books-modified: ${ann.modifiedAt.toISOString()} -->\n`;

  if (body.length <= GITHUB_BODY_MAX) {
    return { title, body };
  }

  const footer =
    `\n\n<!-- apple-books-uuid: ${ann.uuid} -->\n` +
    `<!-- apple-books-modified: ${ann.modifiedAt.toISOString()} -->\n`;
  const budget = GITHUB_BODY_MAX - TRUNCATED_SUFFIX.length - footer.length;
  const truncated = body.slice(0, budget) + TRUNCATED_SUFFIX + footer;
  return { title, body: truncated };
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run build/notes/render.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run the full suite**

```bash
npm test
```

Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add build/notes/render.ts build/notes/render.test.ts
git commit -m "Add render for Apple Books annotation → issue body (#23)

Pure transformation matching the body schema in the design spec.
Covers NSDate→Date conversion (Core Data 2001 epoch), title
derivation, and body-length truncation that preserves the UUID
footer for dedup.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Reconcile actions (pure)

**Files:**
- Create: `build/notes/reconcile.ts`
- Create: `build/notes/reconcile.test.ts`

- [ ] **Step 1: Write the failing test**

Create `build/notes/reconcile.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { reconcile } from './reconcile.js';
import { render } from './render.js';
import type { Annotation, IssueRecord } from './types.js';

const ann = (overrides: Partial<Annotation> = {}): Annotation => ({
  uuid: 'UUID-A',
  selectedText: 'passage',
  note: 'note A',
  chapterTitle: 'Ch 1',
  locationPercent: 0.1,
  modifiedAt: new Date('2026-05-23T14:11:00Z'),
  ...overrides,
});

const issueWith = (n: number, body: string, state: 'OPEN' | 'CLOSED' = 'OPEN'): IssueRecord => ({
  number: n,
  body,
  state,
});

describe('reconcile', () => {
  it('returns create actions for annotations with no matching issue', () => {
    const annotations = [ann({ uuid: 'UUID-A' }), ann({ uuid: 'UUID-B', note: 'note B' })];
    const actions = reconcile(annotations, []);
    expect(actions).toHaveLength(2);
    expect(actions.every((a) => a.type === 'create')).toBe(true);
  });

  it('returns noop for an annotation whose rendered body matches the existing issue', () => {
    const a = ann({ uuid: 'UUID-A' });
    const existing = [issueWith(42, render(a).body)];
    const actions = reconcile([a], existing);
    expect(actions).toEqual([{ type: 'noop', uuid: 'UUID-A', issue: 42 }]);
  });

  it('returns update for an annotation whose rendered body differs from the existing issue', () => {
    const original = ann({ uuid: 'UUID-A', note: 'old note' });
    const existing = [issueWith(42, render(original).body)];
    const edited = ann({ uuid: 'UUID-A', note: 'new note' });
    const actions = reconcile([edited], existing);
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('update');
    if (actions[0].type === 'update') {
      expect(actions[0].issue).toBe(42);
      expect(actions[0].uuid).toBe('UUID-A');
    }
  });

  it('matches issues against UUIDs found in CLOSED issues, not just OPEN ones', () => {
    const a = ann({ uuid: 'UUID-A' });
    const existing = [issueWith(42, render(a).body, 'CLOSED')];
    const actions = reconcile([a], existing);
    expect(actions[0].type).toBe('noop');
  });

  it('ignores existing issues whose body has no UUID marker', () => {
    const a = ann({ uuid: 'UUID-A' });
    const existing = [issueWith(42, 'a manually filed issue with no marker')];
    const actions = reconcile([a], existing);
    expect(actions[0].type).toBe('create');
  });

  it('returns a mix of create / update / noop in one call', () => {
    const a1 = ann({ uuid: 'A1', note: 'a1' });
    const a2 = ann({ uuid: 'A2', note: 'a2 new' });
    const a3 = ann({ uuid: 'A3', note: 'a3' });
    const a2Original = ann({ uuid: 'A2', note: 'a2 old' });

    const existing = [
      issueWith(10, render(a1).body),
      issueWith(11, render(a2Original).body),
      issueWith(12, 'unrelated issue'),
    ];
    const actions = reconcile([a1, a2, a3], existing);

    const byUuid = new Map(actions.map((x) => [x.uuid, x]));
    expect(byUuid.get('A1')?.type).toBe('noop');
    expect(byUuid.get('A2')?.type).toBe('update');
    expect(byUuid.get('A3')?.type).toBe('create');
    expect(actions).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run build/notes/reconcile.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement reconcile**

Create `build/notes/reconcile.ts`:

```ts
/**
 * Pure reconciliation: given current annotations and existing
 * auto-filed issues, compute the action list.
 */

import type { Action, Annotation, IssueRecord } from './types.js';
import { render } from './render.js';
import { parseUuid } from './uuid-parse.js';

export function reconcile(
  annotations: readonly Annotation[],
  existing: readonly IssueRecord[]
): Action[] {
  const byUuid = new Map<string, IssueRecord>();
  for (const issue of existing) {
    const uuid = parseUuid(issue.body);
    if (uuid !== null) byUuid.set(uuid, issue);
  }

  const actions: Action[] = [];
  for (const ann of annotations) {
    const rendered = render(ann);
    const found = byUuid.get(ann.uuid);
    if (!found) {
      actions.push({ type: 'create', uuid: ann.uuid, rendered });
    } else if (found.body === rendered.body) {
      actions.push({ type: 'noop', uuid: ann.uuid, issue: found.number });
    } else {
      actions.push({ type: 'update', uuid: ann.uuid, issue: found.number, rendered });
    }
  }
  return actions;
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run build/notes/reconcile.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run the full suite**

```bash
npm test
```

Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add build/notes/reconcile.ts build/notes/reconcile.test.ts
git commit -m "Add reconcile for sqlite ↔ GitHub action computation (#23)

reconcile is the heart of the sync algorithm: given annotations
from Apple Books and existing auto-filed issues, returns the
create/update/noop action list. UUID-based matching makes the sync
crash-safe and idempotent.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: State file read/write/migrate

**Files:**
- Create: `build/notes/state.ts`
- Create: `build/notes/state.test.ts`

- [ ] **Step 1: Write the failing test**

Create `build/notes/state.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run build/notes/state.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the state module**

Create `build/notes/state.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run build/notes/state.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run the full suite**

```bash
npm test
```

Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add build/notes/state.ts build/notes/state.test.ts
git commit -m "Add state file read/write/migrate for notes sync (#23)

Manages ~/Library/Application Support/majordomo/notes-sync-state.json.
Schema-version-aware: future versions fall back to emptyState rather
than corrupt the run.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Sqlite source

**Files:**
- Create: `build/notes/__fixtures__/aeannotation.sql`
- Create: `build/notes/sqlite-source.ts`
- Create: `build/notes/sqlite-source.test.ts`

- [ ] **Step 1: Create the fixture SQL**

Create `build/notes/__fixtures__/aeannotation.sql`:

```sql
-- Schema snapshot of the columns used from Apple Books's sqlite
-- databases. Updates here flag schema drift on real Apple updates.

CREATE TABLE ZBKLIBRARYASSET (
  Z_PK INTEGER PRIMARY KEY,
  ZASSETID TEXT,
  ZTITLE TEXT
);

CREATE TABLE ZAEANNOTATION (
  Z_PK INTEGER PRIMARY KEY,
  ZANNOTATIONUUID TEXT,
  ZANNOTATIONASSETID TEXT,
  ZANNOTATIONSELECTEDTEXT TEXT,
  ZANNOTATIONNOTE TEXT,
  ZFUTUREPROOFING5 TEXT,
  ZANNOTATIONLOCATION TEXT,
  ZANNOTATIONMODIFICATIONDATE REAL,
  ZANNOTATIONDELETED INTEGER
);

INSERT INTO ZBKLIBRARYASSET VALUES (1, 'ASSET-MAJORDOMO', 'A Majordomo for Everyone');
INSERT INTO ZBKLIBRARYASSET VALUES (2, 'ASSET-OTHER',     'Some Other Book');

INSERT INTO ZAEANNOTATION VALUES (
  101, 'UUID-A', 'ASSET-MAJORDOMO',
  'A library is a building; a life is a way of living.',
  'fix this metaphor about libraries',
  'Chapter 1: Introduction',
  '0.12',
  769702260.0,
  0
);
INSERT INTO ZAEANNOTATION VALUES (
  102, 'UUID-B', 'ASSET-MAJORDOMO',
  'A bare highlight with no typed note.',
  NULL,
  'Chapter 1: Introduction',
  '0.13',
  769702300.0,
  0
);
INSERT INTO ZAEANNOTATION VALUES (
  103, 'UUID-C', 'ASSET-MAJORDOMO',
  'Another passage I marked.',
  'rewrite the second paragraph',
  'Chapter 2: Engage',
  '0.45',
  769702400.0,
  0
);
INSERT INTO ZAEANNOTATION VALUES (
  104, 'UUID-D', 'ASSET-MAJORDOMO',
  'A passage on a deleted annotation.',
  'will be filtered out',
  'Chapter 2: Engage',
  '0.46',
  769702500.0,
  1
);
INSERT INTO ZAEANNOTATION VALUES (
  201, 'UUID-OTHER', 'ASSET-OTHER',
  'From a different book entirely.',
  'should not appear',
  'Some Chapter',
  '0.5',
  769702600.0,
  0
);
```

- [ ] **Step 2: Write the failing test**

Create `build/notes/sqlite-source.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { findAssetId, listAnnotations } from './sqlite-source.js';
import { BOOK_TITLE } from './types.js';

const fixtureSql = readFileSync(
  join(import.meta.dirname, '__fixtures__', 'aeannotation.sql'),
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
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
npx vitest run build/notes/sqlite-source.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement sqlite-source**

Create `build/notes/sqlite-source.ts`:

```ts
/**
 * Read-only access to Apple Books's sqlite databases.
 *
 * Real paths (caller resolves via glob):
 *   ~/Library/Containers/com.apple.iBooksX/Data/Documents/BKLibrary/BKLibrary-*.sqlite
 *   ~/Library/Containers/com.apple.iBooksX/Data/Documents/AEAnnotation/AEAnnotation_*.sqlite
 */

import { glob } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import type { Annotation } from './types.js';
import { nsdateToDate } from './render.js';

const BOOKS_CONTAINER = 'Library/Containers/com.apple.iBooksX/Data/Documents';

export async function findAnnotationDbPath(home: string = homedir()): Promise<string | null> {
  const pattern = join(home, BOOKS_CONTAINER, 'AEAnnotation', 'AEAnnotation_*.sqlite');
  for await (const match of glob(pattern)) return match;
  return null;
}

export async function findLibraryDbPath(home: string = homedir()): Promise<string | null> {
  const pattern = join(home, BOOKS_CONTAINER, 'BKLibrary', 'BKLibrary-*.sqlite');
  for await (const match of glob(pattern)) return match;
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
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npx vitest run build/notes/sqlite-source.test.ts
```

Expected: PASS.

- [ ] **Step 6: Run the full suite**

```bash
npm test
```

Expected: all green.

- [ ] **Step 7: Commit**

```bash
git add build/notes/sqlite-source.ts build/notes/sqlite-source.test.ts build/notes/__fixtures__/aeannotation.sql
git commit -m "Add sqlite-source for Apple Books DB access (#23)

Read-only access to BKLibrary and AEAnnotation databases. The
fixture SQL is a checked-in schema snapshot — if Apple bumps the
schema in a future macOS update, the failing tests surface the
drift.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: GitHub target

**Files:**
- Create: `build/notes/github-target.ts`
- Create: `build/notes/github-target.test.ts`

- [ ] **Step 1: Write the failing test**

Create `build/notes/github-target.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IssueRecord } from './types.js';

const spawnSyncMock = vi.hoisted(() => vi.fn());
vi.mock('node:child_process', () => ({ spawnSync: spawnSyncMock }));

const {
  listAutoFiledIssues,
  createIssue,
  editIssue,
  createLabelIfMissing,
} = await import('./github-target.js');

const okResult = (stdout: string) => ({ status: 0, stdout, stderr: '', signal: null });
const errResult = (stderr: string) => ({ status: 1, stdout: '', stderr, signal: null });

beforeEach(() => {
  spawnSyncMock.mockReset();
});

describe('listAutoFiledIssues', () => {
  it('invokes gh with the right flags and parses the JSON', async () => {
    const sample = [
      { number: 1, body: 'body 1', state: 'OPEN' },
      { number: 2, body: 'body 2', state: 'CLOSED' },
    ];
    spawnSyncMock.mockReturnValueOnce(okResult(JSON.stringify(sample)));
    const out = await listAutoFiledIssues();

    expect(spawnSyncMock).toHaveBeenCalledTimes(1);
    const callArgs = spawnSyncMock.mock.calls[0];
    expect(callArgs[0]).toBe('gh');
    expect(callArgs[1]).toEqual([
      'issue',
      'list',
      '--label',
      'from:apple-books',
      '--state',
      'all',
      '--limit',
      '1000',
      '--json',
      'number,body,state',
    ]);

    expect(out).toEqual<IssueRecord[]>([
      { number: 1, body: 'body 1', state: 'OPEN' },
      { number: 2, body: 'body 2', state: 'CLOSED' },
    ]);
  });

  it('throws when gh exits non-zero', async () => {
    spawnSyncMock.mockReturnValueOnce(errResult('authentication required'));
    await expect(listAutoFiledIssues()).rejects.toThrow(/authentication required/);
  });
});

describe('createIssue', () => {
  it('invokes gh issue create with the rendered title/body and label', async () => {
    spawnSyncMock.mockReturnValueOnce(
      okResult('https://github.com/owner/repo/issues/42\n')
    );
    const n = await createIssue({ title: 'fix metaphor', body: 'long body' });

    expect(n).toBe(42);
    const callArgs = spawnSyncMock.mock.calls[0];
    expect(callArgs[1]).toEqual([
      'issue',
      'create',
      '--title',
      'fix metaphor',
      '--body',
      'long body',
      '--label',
      'from:apple-books',
    ]);
  });
});

describe('editIssue', () => {
  it('invokes gh issue edit with the new body', async () => {
    spawnSyncMock.mockReturnValueOnce(okResult(''));
    await editIssue(42, 'new body');

    const callArgs = spawnSyncMock.mock.calls[0];
    expect(callArgs[1]).toEqual(['issue', 'edit', '42', '--body', 'new body']);
  });
});

describe('createLabelIfMissing', () => {
  it('returns true on successful create', async () => {
    spawnSyncMock.mockReturnValueOnce(okResult(''));
    expect(await createLabelIfMissing()).toBe(true);
  });

  it('returns false when the label already exists', async () => {
    spawnSyncMock.mockReturnValueOnce(errResult('label "from:apple-books" already exists'));
    expect(await createLabelIfMissing()).toBe(false);
  });

  it('throws for unexpected errors', async () => {
    spawnSyncMock.mockReturnValueOnce(errResult('some other failure'));
    await expect(createLabelIfMissing()).rejects.toThrow(/some other failure/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run build/notes/github-target.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement github-target**

Create `build/notes/github-target.ts`:

```ts
/**
 * Thin wrappers around the `gh` CLI. We shell out via spawnSync (not
 * a shell-expansion API) so arguments are passed as an array — no
 * quoting or escaping concerns.
 */

import { spawnSync } from 'node:child_process';
import type { IssueRecord, RenderedIssue } from './types.js';
import { LABEL_NAME } from './types.js';

interface SpawnResult {
  status: number | null;
  stdout: string | Buffer;
  stderr: string | Buffer;
  signal: NodeJS.Signals | null;
}

function runGh(args: string[]): { stdout: string; stderr: string } {
  const r = spawnSync('gh', args, { encoding: 'utf8' }) as unknown as SpawnResult;
  const stdout = typeof r.stdout === 'string' ? r.stdout : r.stdout.toString('utf8');
  const stderr = typeof r.stderr === 'string' ? r.stderr : r.stderr.toString('utf8');
  if (r.status !== 0) {
    throw new Error(`gh ${args.join(' ')} exited ${r.status}: ${stderr.trim()}`);
  }
  return { stdout, stderr };
}

export async function listAutoFiledIssues(): Promise<IssueRecord[]> {
  const { stdout } = runGh([
    'issue', 'list',
    '--label', LABEL_NAME,
    '--state', 'all',
    '--limit', '1000',
    '--json', 'number,body,state',
  ]);
  return JSON.parse(stdout) as IssueRecord[];
}

export async function createIssue(rendered: RenderedIssue): Promise<number> {
  const { stdout } = runGh([
    'issue', 'create',
    '--title', rendered.title,
    '--body', rendered.body,
    '--label', LABEL_NAME,
  ]);
  const m = stdout.match(/\/issues\/(\d+)/);
  if (!m) throw new Error(`could not parse issue number from gh output: ${stdout}`);
  return parseInt(m[1], 10);
}

export async function editIssue(number: number, body: string): Promise<void> {
  runGh(['issue', 'edit', String(number), '--body', body]);
}

export async function createLabelIfMissing(): Promise<boolean> {
  const r = spawnSync(
    'gh',
    ['label', 'create', LABEL_NAME, '--description', 'Auto-filed from Apple Books annotations', '--color', 'ededed'],
    { encoding: 'utf8' }
  ) as unknown as SpawnResult;
  const stderr = typeof r.stderr === 'string' ? r.stderr : r.stderr.toString('utf8');
  if (r.status === 0) return true;
  if (/already exists/i.test(stderr)) return false;
  throw new Error(`gh label create exited ${r.status}: ${stderr.trim()}`);
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run build/notes/github-target.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run the full suite**

```bash
npm test
```

Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add build/notes/github-target.ts build/notes/github-target.test.ts
git commit -m "Add github-target for gh CLI operations (#23)

Wraps gh issue list/create/edit and gh label create with typed
TS signatures. Uses spawnSync (array args, no shell expansion) so
content with special characters cannot inject. Auth inherited from
gh auth login — no PAT to manage.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Daemon entry point

**Files:**
- Create: `build/scripts/sync-apple-books-notes.ts`

- [ ] **Step 1: Implement the entry point**

Create `build/scripts/sync-apple-books-notes.ts`:

```ts
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
```

- [ ] **Step 2: Verify type-check**

```bash
npm run build:check
```

Expected: silent.

- [ ] **Step 3: Run the full test suite**

```bash
npm test
```

Expected: all green.

- [ ] **Step 4: Manual smoke test — happy path**

```bash
node_modules/.bin/tsx build/scripts/sync-apple-books-notes.ts
```

Expected: `[info]` log lines ending in `run-end ok=true`. If there are typed notes in Apple Books on Majordomo, expect `issue-created` lines for each. Verify:

```bash
gh issue list --label from:apple-books
```

- [ ] **Step 5: Smoke test the mtime guard**

Re-run immediately:

```bash
node_modules/.bin/tsx build/scripts/sync-apple-books-notes.ts
```

Expected: `mtime-changed=false skip-reason=mtime-stable` and `run-end ok=true`. No new issues filed.

- [ ] **Step 6: Smoke test the idempotency**

Delete the state file and re-run:

```bash
rm "$HOME/Library/Application Support/majordomo/notes-sync-state.json"
node_modules/.bin/tsx build/scripts/sync-apple-books-notes.ts
```

Expected: all `noop` actions, no `issue-created`. Dedup by UUID prevents duplicates even with no state.

- [ ] **Step 7: Commit**

```bash
git add build/scripts/sync-apple-books-notes.ts
git commit -m "Add daemon entry point for Apple Books → Issues sync (#23)

Wires the pure functions (reconcile, render) and I/O modules
(sqlite-source, github-target, state) into a single hourly run.
Exit-code semantics: 0 = soft, 1 = hard. Logs are structured
one-line-per-event for easy grep.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Status script

**Files:**
- Create: `build/scripts/sync-apple-books-notes-status.ts`

- [ ] **Step 1: Implement the status script**

Create `build/scripts/sync-apple-books-notes-status.ts`:

```ts
#!/usr/bin/env node
/**
 * `npm run sync:notes:status` — pretty-printed observability summary.
 */

import { stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { readState, statePath } from '../notes/state.js';
import { findAnnotationDbPath } from '../notes/sqlite-source.js';
import { LABEL_NAME } from '../notes/types.js';

function fmt(iso: string): string {
  if (iso === '1970-01-01T00:00:00.000Z') return '(never)';
  const d = new Date(iso);
  const now = Date.now();
  const ago = Math.round((now - d.getTime()) / 60000);
  return `${d.toLocaleString()} (${ago} minutes ago)`;
}

async function fileSize(path: string): Promise<string> {
  try {
    const s = await stat(path);
    if (s.size > 1024 * 1024) return `${(s.size / 1024 / 1024).toFixed(1)} MB`;
    if (s.size > 1024) return `${(s.size / 1024).toFixed(1)} KB`;
    return `${s.size} B`;
  } catch {
    return '(missing)';
  }
}

function ghCount(state: 'open' | 'closed'): number | null {
  const r = spawnSync(
    'gh',
    ['issue', 'list', '--label', LABEL_NAME, '--state', state, '--limit', '1000', '--json', 'number'],
    { encoding: 'utf8' }
  );
  if (r.status !== 0) return null;
  try {
    return (JSON.parse(r.stdout) as unknown[]).length;
  } catch {
    return null;
  }
}

function launchctlLoaded(): boolean {
  const r = spawnSync(
    'launchctl',
    ['print', `gui/${process.getuid?.() ?? 0}/io.dwk.majordomo.notes-sync`],
    { encoding: 'utf8' }
  );
  return r.status === 0;
}

async function main(): Promise<void> {
  const home = homedir();
  const s = await readState(statePath(home));
  const logPath = join(home, 'Library', 'Logs', 'majordomo-notes-sync.log');
  const annPath = await findAnnotationDbPath(home);
  const annMtime = annPath ? (await stat(annPath)).mtime.toISOString() : null;

  console.log('Majordomo notes sync');
  console.log(`  Last run:           ${fmt(s.lastSuccessfulSync)}`);
  console.log(`  Apple Books mtime:  ${annMtime ? fmt(annMtime) : '(books not installed)'}`);
  console.log(`  State file:         ${statePath(home)}`);
  console.log(`  Log file:           ${logPath}  (${await fileSize(logPath)})`);
  console.log(`  LaunchAgent:        ${launchctlLoaded() ? 'loaded' : 'NOT loaded'}`);
  console.log('');
  console.log('  Lifetime counters');
  console.log(`    runs:     ${s.runs.total}   (created: ${s.runs.created}, updated: ${s.runs.updated}, noop: ${s.runs.noop})`);

  const open = ghCount('open');
  const closed = ghCount('closed');
  if (open !== null && closed !== null) {
    console.log(`    open issues with ${LABEL_NAME} label:    ${open}`);
    console.log(`    closed issues with ${LABEL_NAME} label:  ${closed}`);
  } else {
    console.log(`    (could not query GitHub — is gh auth valid?)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Verify type-check**

```bash
npm run build:check
```

Expected: silent.

- [ ] **Step 3: Smoke test**

```bash
node_modules/.bin/tsx build/scripts/sync-apple-books-notes-status.ts
```

Expected: pretty-printed summary.

- [ ] **Step 4: Commit**

```bash
git add build/scripts/sync-apple-books-notes-status.ts
git commit -m "Add status subcommand for notes-sync observability (#23)

\`npm run sync:notes:status\` prints last-run time, Apple Books
mtime, state/log file paths, LaunchAgent load state, lifetime
counters, and a fresh open/closed count via gh.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Installer, uninstaller, plist template

**Files:**
- Create: `build/scripts/notes-sync/io.dwk.majordomo.notes-sync.plist.template`
- Create: `build/scripts/install-notes-sync.ts`
- Create: `build/scripts/uninstall-notes-sync.ts`

- [ ] **Step 1: Create the plist template**

Create `build/scripts/notes-sync/io.dwk.majordomo.notes-sync.plist.template`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>io.dwk.majordomo.notes-sync</string>

    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/env</string>
        <string>-i</string>
        <string>HOME=__HOME__</string>
        <string>PATH=__PATH__</string>
        <string>__TSX__</string>
        <string>build/scripts/sync-apple-books-notes.ts</string>
    </array>

    <key>WorkingDirectory</key>
    <string>__REPO__</string>

    <key>StartInterval</key>
    <integer>3600</integer>

    <key>RunAtLoad</key>
    <true/>

    <key>StandardOutPath</key>
    <string>__HOME__/Library/Logs/majordomo-notes-sync.log</string>

    <key>StandardErrorPath</key>
    <string>__HOME__/Library/Logs/majordomo-notes-sync.log</string>

    <key>ProcessType</key>
    <string>Background</string>

    <key>Nice</key>
    <integer>10</integer>
</dict>
</plist>
```

- [ ] **Step 2: Implement the installer**

Create `build/scripts/install-notes-sync.ts`:

```ts
#!/usr/bin/env node
/**
 * One-shot installer for the Apple Books notes sync LaunchAgent.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createLabelIfMissing } from '../notes/github-target.js';
import { findAnnotationDbPath } from '../notes/sqlite-source.js';

const LABEL_PLIST = 'io.dwk.majordomo.notes-sync';
const PLIST_NAME = `${LABEL_PLIST}.plist`;

function die(msg: string, code = 1): never {
  console.error(`[install-notes-sync] ${msg}`);
  process.exit(code);
}

function checkTool(tool: string, args: string[] = ['--version']): void {
  const r = spawnSync(tool, args, { encoding: 'utf8' });
  if (r.status !== 0) die(`required tool not working: \`${tool} ${args.join(' ')}\` exited ${r.status}`);
}

function repoRoot(): string {
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  if (r.status !== 0) die('not inside a git repository');
  return r.stdout.trim();
}

function repoRemote(repo: string): string {
  const r = spawnSync('git', ['-C', repo, 'remote', 'get-url', 'origin'], { encoding: 'utf8' });
  if (r.status !== 0) die('repo has no `origin` remote');
  return r.stdout.trim();
}

async function main(): Promise<void> {
  const home = homedir();
  const repo = repoRoot();
  const tsx = resolve(repo, 'node_modules', '.bin', 'tsx');
  const path = '/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin';

  console.log('[install-notes-sync] preflight...');

  checkTool('gh');

  const auth = spawnSync('gh', ['auth', 'status'], { encoding: 'utf8' });
  if (auth.status !== 0) {
    die(`gh CLI is not authenticated. Run: gh auth login --git-protocol https --hostname github.com`);
  }

  checkTool(tsx);

  const remote = repoRemote(repo);
  if (!/davidwkeith\/A-Majordomo-for-Everyone(\.git)?$/.test(remote)) {
    die(`unexpected origin remote: ${remote}\n  expected: davidwkeith/A-Majordomo-for-Everyone`);
  }

  const annPath = await findAnnotationDbPath(home);
  if (!annPath) {
    console.log('[install-notes-sync] warning: Apple Books sqlite not found yet — open Books at least once after install.');
  }

  console.log('[install-notes-sync] creating from:apple-books label (if missing)...');
  const created = await createLabelIfMissing();
  console.log(`[install-notes-sync]   ${created ? 'created' : 'already exists'}`);

  console.log('[install-notes-sync] writing LaunchAgent plist...');
  const tmplPath = join(repo, 'build', 'scripts', 'notes-sync', `${PLIST_NAME}.template`);
  const dest = join(home, 'Library', 'LaunchAgents', PLIST_NAME);
  const tmpl = await readFile(tmplPath, 'utf8');
  const plist = tmpl
    .replaceAll('__HOME__', home)
    .replaceAll('__PATH__', path)
    .replaceAll('__TSX__', tsx)
    .replaceAll('__REPO__', repo);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, plist, 'utf8');
  console.log(`[install-notes-sync]   wrote ${dest}`);

  console.log('[install-notes-sync] loading via launchctl bootstrap...');
  const uid = process.getuid?.() ?? 0;
  const bootstrap = spawnSync('launchctl', ['bootstrap', `gui/${uid}`, dest], { encoding: 'utf8' });
  if (bootstrap.status !== 0) {
    if (/already loaded|Bootstrap failed/i.test(bootstrap.stderr)) {
      console.log('[install-notes-sync]   already loaded — replacing');
      spawnSync('launchctl', ['bootout', `gui/${uid}/${LABEL_PLIST}`], { encoding: 'utf8' });
      const second = spawnSync('launchctl', ['bootstrap', `gui/${uid}`, dest], { encoding: 'utf8' });
      if (second.status !== 0) die(`launchctl bootstrap failed: ${second.stderr.trim()}`);
    } else {
      die(`launchctl bootstrap failed: ${bootstrap.stderr.trim()}`);
    }
  }
  console.log('[install-notes-sync]   loaded');

  console.log('[install-notes-sync] kickstarting first run...');
  const kick = spawnSync('launchctl', ['kickstart', '-p', `gui/${uid}/${LABEL_PLIST}`], { encoding: 'utf8' });
  if (kick.status !== 0) die(`launchctl kickstart failed: ${kick.stderr.trim()}`);
  console.log('[install-notes-sync]   kicked');

  console.log('');
  console.log('Done. Next steps:');
  console.log(`  • Log:           tail -f ${home}/Library/Logs/majordomo-notes-sync.log`);
  console.log(`  • Status:        npm run sync:notes:status`);
  console.log(`  • Manual run:    npm run sync:notes`);
  console.log(`  • Uninstall:     npm run sync:notes:uninstall`);
}

main().catch((e) => die(e instanceof Error ? e.message : String(e)));
```

- [ ] **Step 3: Implement the uninstaller**

Create `build/scripts/uninstall-notes-sync.ts`:

```ts
#!/usr/bin/env node
/**
 * One-shot uninstaller. Unloads the LaunchAgent and removes the plist.
 * Leaves state file and GitHub label alone — data, not config.
 */

import { rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

const LABEL = 'io.dwk.majordomo.notes-sync';

async function main(): Promise<void> {
  const home = homedir();
  const uid = process.getuid?.() ?? 0;
  const dest = join(home, 'Library', 'LaunchAgents', `${LABEL}.plist`);

  console.log('[uninstall-notes-sync] booting out...');
  const r = spawnSync('launchctl', ['bootout', `gui/${uid}/${LABEL}`], { encoding: 'utf8' });
  if (r.status !== 0 && !/not loaded|no such/i.test(r.stderr)) {
    console.log(`[uninstall-notes-sync]   note: ${r.stderr.trim()}`);
  } else {
    console.log('[uninstall-notes-sync]   booted out');
  }

  console.log('[uninstall-notes-sync] removing plist...');
  try {
    await rm(dest);
    console.log(`[uninstall-notes-sync]   removed ${dest}`);
  } catch {
    console.log(`[uninstall-notes-sync]   no plist at ${dest}`);
  }

  console.log('');
  console.log('State file and GitHub label left in place:');
  console.log(`  ${home}/Library/Application Support/majordomo/notes-sync-state.json`);
  console.log(`  GitHub label: from:apple-books`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 4: Verify type-check**

```bash
npm run build:check
```

Expected: silent.

- [ ] **Step 5: Commit (installer is tested end-to-end in Task 11)**

```bash
git add build/scripts/install-notes-sync.ts build/scripts/uninstall-notes-sync.ts build/scripts/notes-sync/io.dwk.majordomo.notes-sync.plist.template
git commit -m "Add installer/uninstaller and LaunchAgent plist template (#23)

install: preflight (gh CLI, gh auth, tsx, git remote, Apple Books
db), create the from:apple-books label, substitute tokens in the
plist template, launchctl bootstrap + kickstart smoke run.

uninstall: launchctl bootout + plist rm. Leaves state file and
GitHub label intact (data, not config).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Wire npm scripts, document in CLAUDE.md

**Files:**
- Modify: `package.json`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add the four npm scripts**

Edit `package.json` `scripts` block — add four new entries (existing entries stay):

```json
{
  "scripts": {
    "build": "tsc && node dist/build/index.js",
    "build:site": "tsc && node dist/build/site/index.js",
    "build:pdf": "tsc && node dist/build/pdf/index.js",
    "build:all": "tsc && node dist/build/index.js && node dist/build/site/index.js",
    "build:check": "tsc --noEmit",
    "dev": "npm run build:site && wrangler dev",
    "test": "vitest run",
    "test:watch": "vitest",
    "clean": "rm -rf dist",
    "sync:notes": "tsx build/scripts/sync-apple-books-notes.ts",
    "sync:notes:status": "tsx build/scripts/sync-apple-books-notes-status.ts",
    "sync:notes:install": "tsx build/scripts/install-notes-sync.ts",
    "sync:notes:uninstall": "tsx build/scripts/uninstall-notes-sync.ts"
  }
}
```

- [ ] **Step 2: Verify the scripts resolve**

```bash
npm run sync:notes:status
```

Expected: prints the status summary (mostly "(never)" since the daemon hasn't done a real run yet).

- [ ] **Step 3: Document in CLAUDE.md**

Find the insertion point (after `## Build`, before `## Project Structure`):

```bash
grep -n '^## ' CLAUDE.md
```

Insert this section after `## Build`:

```markdown
## Apple Books Notes Sync

Hourly sync from your Apple Books typed annotations on the built ePub to GitHub Issues on this repo (label `from:apple-books`). Each annotation becomes one deduped issue.

\`\`\`bash
npm run sync:notes:install      # one-time: install LaunchAgent + create label
npm run sync:notes              # force a sync now (rather than wait for next hour)
npm run sync:notes:status       # last-run, mtime, log file size, lifetime counters
npm run sync:notes:uninstall    # remove the LaunchAgent
\`\`\`

State lives outside the repo:
- `~/Library/Application Support/majordomo/notes-sync-state.json` (mtime cache, asset_id, counters)
- `~/Library/Logs/majordomo-notes-sync.log` (structured one-line-per-event log)

Requires `gh auth login` to have been run once. See [the design spec](docs/superpowers/specs/2026-05-23-apple-books-notes-sync-design.md) for the full architecture.
```

(When pasting, replace the escaped fence sequences with real triple backticks.)

- [ ] **Step 4: Verify type-check + tests still green**

```bash
npm run build:check && npm test
```

Expected: silent / all green.

- [ ] **Step 5: Run the installer end-to-end**

```bash
npm run sync:notes:install
```

Expected: preflight passes, label created (or "already exists"), plist written, launchctl bootstrap + kickstart succeed, "Done." footer prints with next-step commands.

- [ ] **Step 6: Verify the LaunchAgent is loaded**

```bash
launchctl print "gui/$(id -u)/io.dwk.majordomo.notes-sync" | head -20
```

Expected: prints the plist's path, label, state=running or waiting.

- [ ] **Step 7: Tail the log to see the first auto-run**

```bash
tail -20 ~/Library/Logs/majordomo-notes-sync.log
```

Expected: sequence of `[info]` log lines from the kickstarted first run, ending in `run-end`.

- [ ] **Step 8: Verify uninstall + reinstall symmetry**

```bash
npm run sync:notes:uninstall
launchctl print "gui/$(id -u)/io.dwk.majordomo.notes-sync" 2>&1 | head -3
# expected: "Could not find service" or similar
npm run sync:notes:install
launchctl print "gui/$(id -u)/io.dwk.majordomo.notes-sync" | head -3
# expected: service printed again
```

- [ ] **Step 9: Commit**

```bash
git add package.json CLAUDE.md
git commit -m "Wire sync:notes npm scripts and document in CLAUDE.md (#23)

Four new scripts: sync:notes (force run), sync:notes:status (pretty
summary), sync:notes:install (one-shot installer that loads the
LaunchAgent), sync:notes:uninstall (clean teardown).

CLAUDE.md gains an Apple Books Notes Sync section with the four
commands, state/log paths, and a pointer to the design spec.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Version bump

**Files:**
- Modify: `package.json`

Per CLAUDE.md: minor bump for pipeline changes → `0.3.0 → 0.4.0`. Tag created when this merges to main, not in this commit.

- [ ] **Step 1: Bump the version**

Edit `package.json`:

```json
{
  "version": "0.4.0"
}
```

- [ ] **Step 2: Verify everything is still green**

```bash
npm run build:check && npm test
```

Expected: silent / all green.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "Bump version to 0.4.0 for notes sync subsystem (#23)

Per CLAUDE.md, minor bump for pipeline changes. Tag v0.4.0 when
this branch merges to main.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Final checks before opening the PR

- [ ] **Step 1: `git log` looks clean**

```bash
git log --oneline main..HEAD
```

Expected: ~13 commits, each on a clear unit of work, all referencing #23.

- [ ] **Step 2: Full suite passes one more time**

```bash
npm run build:check && npm test
```

Expected: silent / all green.

- [ ] **Step 3: `npm run sync:notes:status` shows real activity**

```bash
npm run sync:notes:status
```

Expected: `Last run` is recent, `LaunchAgent: loaded`, counters > 0 if any notes existed at sync time.

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin claude/issue-23-apple-books-notes-sync-spec
gh pr create --fill --body "Implements #23 per the design at \`docs/superpowers/specs/2026-05-23-apple-books-notes-sync-design.md\`. Supersedes the April 14 design.

## Highlights

- Each typed Apple Books note becomes one deduped GitHub Issue (label \`from:apple-books\`)
- Idempotent via \`<!-- apple-books-uuid: X -->\` HTML-comment dedup
- Hourly LaunchAgent with mtime guard for cheap no-op runs
- TypeScript reading sqlite directly via better-sqlite3; auth via existing \`gh auth login\`
- One PR, 12 commits along leaf-to-trunk build order
- 0.3.0 → 0.4.0 (minor bump per CLAUDE.md)

## Verification

- All unit + integration tests pass (\`npm test\`)
- Manual smoke tests for install / kickstart / mtime guard / idempotency documented in the spec
- Verified \`launchctl print\` shows the loaded service
- End-to-end: typed a test note in Apple Books, ran the daemon, confirmed an issue appeared with correct body schema

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

Closes #23 when merged.

---

## Notes for the executing agent

- The daemon's first real-world run requires the user to have opened the built *Majordomo* ePub in Apple Books on macOS at least once (so its asset_id appears in `BKLibrary-*.sqlite`). If `findAssetId` returns null on first install, that's the cause — not a bug.
- `npm test` count will grow from 55 → ~85 across this plan. Note the exact number after each task and watch for regressions.
- The integration tests in `sqlite-source.test.ts` use `:memory:` sqlite seeded from the fixture SQL. If `better-sqlite3` fails to import on CI (rare; the package ships prebuilt binaries for `ubuntu-latest`), check that the Node major version on the runner is ≥20.
- Commit messages all end with the Co-Authored-By trailer (per the repo's session conventions).
