# Apple Books Highlight Sync

**Issue:** [#23](https://github.com/davidwkeith/A-Majordomo-for-Everyone/issues/23)
**Date:** 2026-04-14

## Goal

Sync highlights and notes from the _A Majordomo for Everyone_ ePub in Apple Books to the repo under `notes/highlights.md`, committing and pushing changes automatically on an hourly schedule.

## Components

### 1. Script: `scripts/sync-highlights.py`

A single Python file using `uv` inline script metadata (`# /// script`). No venv or requirements.txt — run via `uv run scripts/sync-highlights.py`.

**Dependencies:** Likely none beyond stdlib — `sqlite3`, `subprocess`, `pathlib`, `datetime`, `json`, and `glob` cover all needs. If a third-party dep turns out to be necessary during implementation, it gets declared in the inline `# /// script` metadata block.

**Four-step pipeline:**

1. **Force iCloud sync** — if Books.app is not already running (`pgrep -x Books`), open it, wait ~20 seconds, then close it via AppleScript. If already running, skip this step to avoid disrupting active reading.

2. **Read SQLite databases** — query the two Apple Books databases directly:
   - Annotations: `~/Library/Containers/com.apple.iBooksX/Data/Documents/AEAnnotation/*.sqlite`
   - Book metadata: `~/Library/Containers/com.apple.iBooksX/Data/Documents/BKLibrary/*.sqlite`
   - Join `ZAEANNOTATION` with `ZBKLIBRARYASSET`, filter where title matches "A Majordomo for Everyone".

3. **Write markdown** — output a single file `notes/highlights.md`:
   ```markdown
   ---
   title: "A Majordomo for Everyone"
   author: "David W. Keith"
   asset_id: "<Apple Books UUID>"
   last_synced: "2026-04-14T18:00:00-07:00"
   ---

   ## Chapter 1: Title Here

   > Selected highlight text from the book.

   Note: My annotation about this highlight.

   ---

   > Another highlight from the same chapter.

   ---

   ## Uncategorized

   > Highlights without chapter metadata.
   ```
   - Highlights ordered by location within each chapter.
   - `---` separators between highlights.
   - Notes (if attached) appear directly below their highlight.
   - Highlights with no chapter metadata go under "Uncategorized" at the end.

4. **Git commit + push** — if `git diff --quiet notes/` shows changes:
   - Diff the previous version to count new and updated highlights.
   - `git add notes/`
   - Commit with message: `notes: sync highlights (N new, M updated)`
   - `git push origin main`
   - If push fails (e.g., network unavailable), the commit stays local. Next run will push it. Log the failure but exit 0.

### 2. Daemon: launchd plist

File: `scripts/com.davidwkeith.majordomo-highlights.plist`

- `Program`: `uv run scripts/sync-highlights.py` (full paths resolved in plist)
- `StartInterval`: 3600 (hourly)
- `RunAtLoad`: true (run once immediately when loaded)
- `WorkingDirectory`: repo root (required for git)
- `StandardOutPath` / `StandardErrorPath`: `/tmp/majordomo-highlights-sync.log`

The plist lives in the repo (version-controlled). Installation is a one-time manual step:

```bash
# Install
ln -s "$(pwd)/scripts/com.davidwkeith.majordomo-highlights.plist" ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.davidwkeith.majordomo-highlights.plist

# Uninstall
launchctl unload ~/Library/LaunchAgents/com.davidwkeith.majordomo-highlights.plist
rm ~/Library/LaunchAgents/com.davidwkeith.majordomo-highlights.plist
```

## Edge Cases

- **Books.app already open** — skip the open/wait/close cycle (check via `pgrep -x Books`).
- **No highlights found** — exit cleanly with a log message. No file written, no commit.
- **No changes since last sync** — `git diff --quiet notes/` before committing. Skip if unchanged.
- **Network unavailable** — commit stays local; next successful run pushes. Exit 0.
- **Book not found** — log a warning and exit. Happens if the ePub hasn't been opened on this Mac.
- **Full Disk Access** — the script needs access to `~/Library/Containers/com.apple.iBooksX/`. On recent macOS this requires granting Full Disk Access to the terminal or `uv` in System Settings > Privacy & Security. The script detects the permission error and prints a clear message.

## Files Created

| File | Purpose |
|------|---------|
| `scripts/sync-highlights.py` | Main sync script |
| `scripts/com.davidwkeith.majordomo-highlights.plist` | launchd agent plist |
| `notes/highlights.md` | Output (generated, committed) |

## Out of Scope

- Syncing highlights from other books.
- Web UI or dashboard for viewing highlights.
- Two-way sync (editing `notes/highlights.md` to update Apple Books).
