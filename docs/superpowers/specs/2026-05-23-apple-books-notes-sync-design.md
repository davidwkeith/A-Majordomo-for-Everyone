# Apple Books Notes → GitHub Issues Sync

**Issue:** [#23](https://github.com/davidwkeith/A-Majordomo-for-Everyone/issues/23)
**Date:** 2026-05-23
**Supersedes:** [2026-04-14-apple-books-sync-design.md](./2026-04-14-apple-books-sync-design.md)

## Goal

Synced revision-TODO capture: every typed note made in Apple Books on the *A Majordomo for Everyone* ePub becomes (or updates) exactly one GitHub Issue on this repo, filed automatically by an hourly LaunchAgent. The GitHub Issue is the durable, triagable record; the Apple Books annotation is the ephemeral capture surface.

This supersedes the April 14 design, which proposed a single `notes/highlights.md` file committed and pushed by a Python+uv script. Issues map more naturally to a revision-TODO workflow than a growing markdown file — each note becomes a discrete unit you can label, assign, close with a commit, or convert to a PR.

## Decisions captured during brainstorming

These framed every downstream choice:

| Decision | Value | Why |
|---|---|---|
| Note purpose | Private revision TODOs (filed publicly on the book's public repo) | The author writes notes against the draft to feed back into editing. Public visibility imposes self-discipline on tone. |
| What counts as a note | Highlights *with* a typed note in `ZANNOTATIONNOTE`. Bare highlights are ignored. | Bare highlights are "this passage interested me," not actionable. |
| Destination | GitHub Issues on `davidwkeith/A-Majordomo-for-Everyone` | Public, in-context with the rest of the project's work tracking. Replaces the original "files under `notes/`" plan. |
| Trigger | LaunchAgent, `StartInterval=3600`, `RunAtLoad=true` | Hourly cadence; resumes correctly from sleep (unlike `StartCalendarInterval`); fires once on login. |
| Edit handling | Patch the issue body | Issue body is a function of current sqlite state; idempotent. Comments on the issue are preserved. |
| Delete handling | Issue stays untouched | GitHub owns the issue lifecycle after creation. Apple Books is capture; GitHub is the record. |
| Issue title format | First line of typed note (≤80 chars). Single label `from:apple-books`. | Minimum noise; one label enables `gh issue list -l from:apple-books` filtering. |
| Language | TypeScript reading sqlite directly via `better-sqlite3` | Matches the rest of the build pipeline. No Python dependency. The `jladicos/apple-books-highlights` schema knowledge is borrowed; the implementation is ours. |
| Operating mode | The daemon is stateless w.r.t. git. No commits, no pushes, no worktree. Only API calls. | The pivot from filesystem-sync to Issues-sync removed the entire class of "what branch is dirty / what worktree am I in" problems. |

## Architecture

### Data flow

```
┌──────────────────────────┐         ┌─────────────────────────────┐
│ iPhone/iPad Apple Books  │         │  GitHub Issues              │
│   (typed annotations)    │         │ davidwkeith/A-Majordomo-    │
└────────────┬─────────────┘         │  for-Everyone               │
             │ iCloud                │  label: from:apple-books    │
             ▼                       └──────────────▲──────────────┘
┌──────────────────────────┐                        │
│ macOS Apple Books        │                        │ gh CLI
│   ~/Library/Containers/  │                        │ (create/edit)
│   …/AEAnnotation_*.sqlite│                        │
└────────────┬─────────────┘                        │
             │ read-only via better-sqlite3         │
             ▼                                      │
┌─────────────────────────────────────────────────────────────────┐
│ sync-apple-books-notes.ts  (hourly, via LaunchAgent)            │
│                                                                 │
│  1. Stat AEAnnotation_*.sqlite — bail if mtime unchanged        │
│  2. Query annotations WHERE asset_id = Majordomo                │
│                       AND   ZANNOTATIONNOTE IS NOT NULL         │
│  3. gh issue list -l from:apple-books --state all --json …      │
│     → parse <!-- apple-books-uuid: X --> from each body         │
│  4. For each annotation: create / edit / no-op                  │
│  5. Persist last-seen mtime to state file                       │
└─────────────────────────────────────────────────────────────────┘
```

### Components

Each unit has one clear purpose. Pure functions are testable without I/O; I/O modules are testable by mocking the shell/spawn boundary.

| Unit | Responsibility | Pure? | Depends on |
|---|---|---|---|
| `build/notes/types.ts` | Shared types: `Annotation`, `IssueRecord`, `Action`, `State`. | yes | — |
| `build/notes/uuid-parse.ts` | Extract `<!-- apple-books-uuid: X -->` from a markdown body. | yes | `types.ts` |
| `build/notes/render.ts` | `Annotation → {title, body}`. Includes NSDate→ISO conversion. | yes | `types.ts` |
| `build/notes/reconcile.ts` | `(current[], existing[]) → Action[]` (`create` / `update` / `noop`). | yes | `types.ts`, `uuid-parse.ts` |
| `build/notes/state.ts` | Read/write/migrate state file at `~/Library/Application Support/majordomo/notes-sync-state.json`. | no (fs I/O) | `types.ts` |
| `build/notes/sqlite-source.ts` | Read-only `better-sqlite3` access. `findAssetId(title)`, `listAnnotations(assetId)`. | no (sqlite I/O) | `types.ts`, `better-sqlite3` |
| `build/notes/github-target.ts` | Wraps `gh` CLI: `listAutoFiledIssues()`, `createIssue(body)`, `editIssue(n, body)`, `createLabelIfMissing()`. | no (child_process) | `types.ts` |
| `build/scripts/sync-apple-books-notes.ts` | Entry point. Orchestrates mtime check → query → reconcile → persist. | no (top-level) | all of `build/notes/*` |
| `build/scripts/sync-apple-books-notes-status.ts` | `npm run sync:notes:status` — print observability summary. | no | `state.ts`, `github-target.ts` |
| `build/scripts/install-notes-sync.ts` | One-shot installer: preflight, label create, plist substitution, `launchctl bootstrap`, smoke test. | no | `child_process`, `fs` |
| `build/scripts/uninstall-notes-sync.ts` | `launchctl bootout`, remove plist. State file and label left alone. | no | `child_process`, `fs` |
| `build/scripts/notes-sync/io.dwk.majordomo.notes-sync.plist.template` | LaunchAgent plist with `__HOME__` / `__PATH__` / `__NPX__` / `__REPO__` tokens. | — | — |

## Issue body schema

The contract between Apple Books state and GitHub state:

```markdown
> [quoted passage from the book]
>
> — [chapter title] ([location %])

[user's typed note, full text, markdown allowed]

<!-- apple-books-uuid: 4F3A-…-B891 -->
<!-- apple-books-modified: 2026-05-23T14:11:00Z -->
```

| Element | sqlite source | Purpose |
|---|---|---|
| Blockquote | `ZAEANNOTATION.ZSELECTEDTEXT` | The passage you marked. Rendered visually distinct. |
| Chapter title | `ZAEANNOTATION.ZFUTUREPROOFING5` (captured at annotation time) | Where the passage came from. Frozen at capture — the chapter title at note-time, not the drift-prone current title. |
| Location % | `ZAEANNOTATION.ZLOCATIONRANGESTART` ÷ asset max | Soft positional reference; the ePub re-paginates between builds. |
| Body text | `ZAEANNOTATION.ZANNOTATIONNOTE` | Verbatim. Markdown is rendered by GitHub. |
| `<!-- apple-books-uuid: … -->` | `ZAEANNOTATION.ZANNOTATIONUUID` | **Primary dedup key.** Stable across edits. |
| `<!-- apple-books-modified: … -->` | `ZAEANNOTATION.ZANNOTATIONMODIFICATIONDATE` (Core Data NSDate, seconds since 2001-01-01 UTC) | Fast change-detection. Converted with `new Date((nsdate + 978307200) * 1000)`. |

**Title derivation:** first non-empty line of `ZANNOTATIONNOTE`, strip markdown punctuation, collapse whitespace, truncate to 80 chars with `…` suffix.

## Dedup mechanics

```ts
// Per run, after the mtime guard passes:

const existing = await gh.issueList({
  label: 'from:apple-books',
  state: 'all',
  limit: 1000,
  fields: ['number', 'body', 'state'],
});

const byUuid = new Map<string, IssueRecord>();
for (const issue of existing) {
  const uuid = parseUuid(issue.body);
  if (uuid) byUuid.set(uuid, issue);
}

for (const ann of annotations) {
  const rendered = render(ann);
  const found = byUuid.get(ann.uuid);
  if (!found)                              actions.push({type: 'create', rendered});
  else if (found.body === rendered.body)   actions.push({type: 'noop',   issue: found.number});
  else                                     actions.push({type: 'update', issue: found.number, rendered});
}
```

**Properties:**
- **Idempotent.** Running the daemon five times in five seconds produces the same end state as running it once.
- **Crash-safe.** No state machine to corrupt. Worst case: one duplicate filing if the daemon dies *exactly* between `gh issue create` and its response landing — detected on the next run, resolved with one manual `gh issue close`.
- **Closed-issue safe.** Closed issues appear in `--state all`, so their UUIDs are in the dedup index. The daemon will *update the body* of a closed issue but not reopen it.

## State file

Location: `~/Library/Application Support/majordomo/notes-sync-state.json`

```json
{
  "schemaVersion": 1,
  "lastSqliteMtime": "2026-05-23T18:30:14.221Z",
  "lastSuccessfulSync": "2026-05-23T18:30:14.502Z",
  "majordomoAssetId": "9789B6F0-…-A442",
  "runs": {
    "total": 142,
    "created": 23,
    "updated": 8,
    "noop": 111
  }
}
```

| Field | Purpose |
|---|---|
| `schemaVersion` | Forward compatibility. Unknown future version → warn, treat as first run. |
| `lastSqliteMtime` | Mtime guard. Skip reconciliation if sqlite unchanged since this. |
| `lastSuccessfulSync` | Observability — "when did this last work?" without trawling logs. |
| `majordomoAssetId` | Cached lookup. First run finds it by title; subsequent runs skip the title-search. |
| `runs.*` | Lightweight counters for "is this thing alive?" |

If the file is missing or unparseable, the daemon falls back to "full reconcile" mode — dedup-by-UUID makes it impossible to file duplicates even with no state.

## LaunchAgent

`build/scripts/notes-sync/io.dwk.majordomo.notes-sync.plist.template`:

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

Token substitution happens at install time. The tokens resolve to:

| Token | Value at install time |
|---|---|
| `__HOME__` | `process.env.HOME` |
| `__PATH__` | A minimal explicit PATH: `/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin` (covers `gh` from Homebrew on both Intel and Apple Silicon, plus system tools) |
| `__TSX__` | `__REPO__/node_modules/.bin/tsx` (the local devDep binary, fully resolved) |
| `__REPO__` | The absolute path of the repo at install time, captured via `git rev-parse --show-toplevel` |

Plists do not expand shell variables; all paths must be fully resolved at write time.

**Why LaunchAgent, not LaunchDaemon:** macOS's TCC (Transparency, Consent, and Control) treats LaunchAgents in the user GUI domain (`gui/$(id -u)`) as inheriting the user's granted permissions, including access to `~/Library/Containers/com.apple.iBooksX/`. A LaunchDaemon (`system` domain) would be sandboxed away from Apple Books's container.

**Why `StartInterval` not `StartCalendarInterval`:** `StartInterval` resumes correctly from sleep; cron-style `StartCalendarInterval` skips fires that happened during sleep.

**Why `/usr/bin/env -i`:** clean environment — only the vars we pass explicitly. Prevents leakage of NVM-style PATH manipulation that wouldn't be present in launchd's env anyway. Forces explicit dependency declaration.

## Auth

```
One-time setup (done by the user, not the daemon):

  gh auth login --git-protocol https --hostname github.com
    → writes creds to ~/.config/gh/hosts.yml

  Verify with: gh auth status
```

The daemon does no auth setup. It calls `gh` and inherits whatever auth is present. If `gh auth status` would fail, the first `gh issue list` call returns non-zero, the daemon logs an error and exits 1, and next hour's run tries again.

No PAT to manage. No environment variables with secrets. No keychain calls. `gh` already solved this.

## Setup script (`install-notes-sync.ts`)

Invoked once: `npm run sync:notes:install`.

1. **Preflight** (fail loudly, fix nothing automatically):
   - `gh --version` exits 0
   - `gh auth status` shows a logged-in user
   - `node_modules/.bin/tsx --version` exits 0 (the local devDep binary)
   - Apple Books sqlite exists at the expected path (warn if not — it doesn't exist until Books is opened at least once)
   - The repo's remote points at `github.com/davidwkeith/A-Majordomo-for-Everyone`
2. **Create the GitHub label** if missing:
   ```
   gh label create from:apple-books \
     --description "Auto-filed from Apple Books annotations" \
     --color "ededed" || true
   ```
   (`gh label create --color` takes the hex without the leading `#`.)
3. **Write the substituted plist** to `~/Library/LaunchAgents/io.dwk.majordomo.notes-sync.plist`, replacing all `__*__` tokens.
4. **Load**: `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/io.dwk.majordomo.notes-sync.plist`.
5. **Smoke test**: `launchctl kickstart -p gui/$(id -u)/io.dwk.majordomo.notes-sync` to fire it once immediately.
6. **Print next steps**: log location, uninstall command, manual run command.

## Uninstaller (`uninstall-notes-sync.ts`)

- `launchctl bootout gui/$(id -u)/io.dwk.majordomo.notes-sync`
- Remove the plist
- **Leave the state file alone** — it's data; user can rm it manually if desired.
- **Don't touch the GitHub label** — issues filed under it stay categorized; user may have applied it manually elsewhere.

## Manual invocation

```json
"scripts": {
  "sync:notes":            "tsx build/scripts/sync-apple-books-notes.ts",
  "sync:notes:install":    "tsx build/scripts/install-notes-sync.ts",
  "sync:notes:uninstall":  "tsx build/scripts/uninstall-notes-sync.ts",
  "sync:notes:status":     "tsx build/scripts/sync-apple-books-notes-status.ts"
}
```

Same script as the daemon, same state file, same dedup. `npm run sync:notes` from any terminal forces a sync without waiting for the next hour.

## Failure modes

Exit code semantics: **0 means "nothing for the user to do."** **1 means "the user needs to look at this."** The LaunchAgent re-fires on schedule regardless of exit code; mtime guard + dedup-by-UUID make it safe to retry indefinitely.

| Failure | Detection | Action | Severity |
|---|---|---|---|
| Apple Books sqlite missing | `stat` ENOENT | Log warn, exit 0 | Soft — pre-first-launch |
| sqlite locked (`SQLITE_BUSY`) | `better-sqlite3` open throws | Retry once after 500ms; if still locked, log warn, exit 0 | Soft — transient |
| Majordomo asset_id not found | `findAssetId('A Majordomo for Everyone')` returns null | Log warn ("have you opened the built ePub at least once?"), exit 0 | Soft — first-run guidance |
| `gh` not on PATH | `spawn` ENOENT | Log error, exit 1 | Hard |
| `gh` auth expired | `gh issue list` exits non-zero with `authentication required` | Log error ("run `gh auth refresh`"), exit 1 | Hard |
| Rate-limited | `gh` exits with `API rate limit exceeded` | Log warn ("will retry next hour"), exit 0 | Soft |
| Network down | `gh` exits with DNS or connection failure | Log warn, exit 0 | Soft |
| State file corrupt | `JSON.parse` throws | Log warn, proceed as first run. Dedup-by-UUID prevents duplicates. | Soft — self-heals |
| One issue fails to file | `gh issue create` non-zero for one item | Log error with UUID, continue loop, exit 1 at end | Mixed |
| Duplicate UUID in sqlite | UUID appears twice in query result | Log warn, process first only | Defensive |
| Body exceeds 65,536 chars (GitHub limit) | Render produces too-long body | Truncate to 65,400 chars with `\n\n_[truncated]_\n` suffix, UUID comment preserved at end | Defensive |

## Observability

Three layers, passive to active:

**1. Log file** — `~/Library/Logs/majordomo-notes-sync.log`

Structured one-line-per-event:

```
2026-05-23T18:30:14.221Z [info]  run-start mtime-changed=true
2026-05-23T18:30:14.245Z [info]  sqlite-query annotations=23 with-notes=8
2026-05-23T18:30:14.302Z [info]  gh-list existing=15 with-uuid=15
2026-05-23T18:30:14.302Z [info]  reconcile create=2 update=1 noop=5
2026-05-23T18:30:15.118Z [info]  issue-created number=87 uuid=4F3A-…-B891
2026-05-23T18:30:15.802Z [info]  issue-created number=88 uuid=2C81-…-A019
2026-05-23T18:30:16.504Z [info]  issue-updated number=84 uuid=9B5E-…-F210
2026-05-23T18:30:16.602Z [info]  run-end ok elapsed-ms=2381
```

No-op run:

```
2026-05-23T19:30:00.118Z [info]  run-start mtime-changed=false skip-reason=mtime-stable
2026-05-23T19:30:00.119Z [info]  run-end ok elapsed-ms=1
```

Greppable by event type, severity, or UUID. No rotation needed; ~150 bytes per no-op × 8760 hours/year ≈ 1.3 MB/year.

**2. State file counters** — `jq .runs < ~/Library/Application\ Support/majordomo/notes-sync-state.json`.

**3. `npm run sync:notes:status`** — pretty-printed summary including last run time, mtime, log size, LaunchAgent loaded state, lifetime counters, and a fresh `gh issue list` count of open/closed auto-filed issues.

## Testing strategy

Following existing repo convention (`vitest`, co-located `*.test.ts`):

| Test file | Layer | Covers |
|---|---|---|
| `build/notes/uuid-parse.test.ts` | unit | Regex extraction. Cases: present, absent, malformed, multiple (take first). |
| `build/notes/render.test.ts` | unit | Title derivation, body shape, NSDate→ISO conversion (the 2001-epoch footgun), markdown special-char handling, body-length truncation. |
| `build/notes/reconcile.test.ts` | unit | Action computation. Cases: empty existing, all-noop, mixed create/update/noop. |
| `build/notes/state.test.ts` | unit | Read/write/migrate. Cases: missing, empty, corrupt JSON, schema v1, future schema → fallback. |
| `build/notes/sqlite-source.test.ts` | integration | In-memory sqlite seeded with the real Apple Books schema (fixture at `build/notes/__fixtures__/aeannotation.sql`). Asserts `findAssetId` and `listAnnotations` returns. |
| `build/notes/github-target.test.ts` | integration | Mock `child_process.spawn`, assert correct `gh` arg construction for list/create/edit and correct parsing of `gh`'s JSON output. |

**Schema-drift defense:** the fixture SQL is a checked-in snapshot of the columns we use. If Apple bumps the schema in a future macOS release, the daemon fails one test rather than silently filing zero issues forever.

**Manual smoke tests** (not CI, documented in install output):

1. After `npm run sync:notes:install`, `launchctl print gui/$(id -u)/io.dwk.majordomo.notes-sync` shows it loaded.
2. Type a test note in Apple Books on iPad with a disposable string. Wait for iCloud + an hour. Confirm an issue appears.
3. Edit the note, wait, confirm the issue body updates.
4. `npm run sync:notes` for forced sync without waiting.
5. `npm run sync:notes:uninstall`; confirm clean teardown.

**CI:** existing `.github/workflows/build.yml` runs type-check + tests + ePub build. New tests slot in unchanged. `better-sqlite3` ships prebuilt binaries for `ubuntu-latest`.

## Files created

```
build/
├── notes/
│   ├── render.ts
│   ├── render.test.ts
│   ├── reconcile.ts
│   ├── reconcile.test.ts
│   ├── uuid-parse.ts
│   ├── uuid-parse.test.ts
│   ├── state.ts
│   ├── state.test.ts
│   ├── sqlite-source.ts
│   ├── sqlite-source.test.ts
│   ├── github-target.ts
│   ├── github-target.test.ts
│   ├── types.ts
│   └── __fixtures__/
│       └── aeannotation.sql
└── scripts/
    ├── sync-apple-books-notes.ts
    ├── sync-apple-books-notes-status.ts
    ├── install-notes-sync.ts
    ├── uninstall-notes-sync.ts
    └── notes-sync/
        └── io.dwk.majordomo.notes-sync.plist.template

docs/
└── superpowers/
    └── specs/
        └── 2026-05-23-apple-books-notes-sync-design.md  ← this file
```

## Files modified

- `package.json` — add `better-sqlite3` to `dependencies`, `tsx` to `devDependencies`, four `sync:notes*` scripts.
- `CLAUDE.md` — document `npm run sync:notes*` commands under a new "Apple Books Notes Sync" section.

## Files NOT created

- No `notes/` directory. The architecture pivot from filesystem to GitHub Issues eliminates it.
- No state file or log file in the repo. User-machine data, not source.
- No installed plist in the repo. User-machine config.

## Dependencies added

```json
{
  "dependencies": {
    "better-sqlite3": "^12.5.0"
  },
  "devDependencies": {
    "tsx": "^4.20.0"
  }
}
```

`better-sqlite3` is synchronous, has prebuilt binaries for darwin-arm64/darwin-x64/linux-x64, and supports read-only opens. `tsx` is already implicitly used (via `npx tsx build/embed-xmp.ts` in CLAUDE.md); making it an explicit devDep speeds up daemon fires by avoiding network on each run.

## Build sequence

For the implementation plan, this is the natural construction order — leaves first, trunks last, with each step testable in isolation against what already exists:

1. `types.ts`
2. `uuid-parse.ts` + test
3. `render.ts` + test
4. `reconcile.ts` + test
5. `state.ts` + test
6. `sqlite-source.ts` + test (introduces the fixture SQL)
7. `github-target.ts` + test
8. `sync-apple-books-notes.ts` (first end-to-end manual run becomes possible here)
9. `sync-apple-books-notes-status.ts`
10. `install-notes-sync.ts`, `uninstall-notes-sync.ts`, plist template
11. `package.json` + `CLAUDE.md`

Steps 1–7 fit a TDD cycle cleanly. Step 8 onward is wiring — manual smoke testing against the real Apple Books library replaces unit tests at that level.

## Versioning

Per `CLAUDE.md`: minor bumps for pipeline changes. This is a new subsystem: `0.3.0 → 0.4.0`. Tag `v0.4.0` when this merges.

## Out of scope

- Two-way sync (editing a GitHub Issue does not propagate back to Apple Books).
- Syncing highlights from other books in the user's library.
- Syncing bare highlights (no typed note).
- Web dashboard or alternate viewers for the synced data.
- Auto-closing issues when the source Apple Books highlight is deleted.
- Multi-user support (this is the author's personal workflow).
- Cross-platform — macOS only; iOS-direct access to its own Apple Books db requires entitlements we don't have.
