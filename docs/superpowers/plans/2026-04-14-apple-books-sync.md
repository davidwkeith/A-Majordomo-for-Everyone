# Apple Books Highlight Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a script that syncs Apple Books highlights from the _A Majordomo for Everyone_ ePub into `notes/highlights.md`, auto-committing and pushing, with an hourly launchd daemon.

**Architecture:** A single Python script (`scripts/sync-highlights.py`) reads Apple Books' SQLite databases directly, filters to one book, renders markdown, and does git commit+push. A launchd plist runs it hourly. No third-party Python dependencies — stdlib only (`sqlite3`, `subprocess`, `pathlib`, `datetime`, `glob`).

**Tech Stack:** Python 3 (via `uv run`), SQLite, launchd, git

**Spec:** `docs/superpowers/specs/2026-04-14-apple-books-sync-design.md`

---

### Task 1: Create the script skeleton with iCloud sync

**Files:**
- Create: `scripts/sync-highlights.py`

- [ ] **Step 1: Create `scripts/` directory**

```bash
mkdir -p scripts
```

- [ ] **Step 2: Write the script skeleton with iCloud sync function**

Create `scripts/sync-highlights.py` with the `uv` inline script metadata, logging setup, and the iCloud sync step:

```python
# /// script
# requires-python = ">=3.12"
# ///
"""Sync Apple Books highlights for A Majordomo for Everyone to notes/highlights.md."""

import glob
import logging
import os
import sqlite3
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
log = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parent.parent
BOOK_TITLE = "A Majordomo for Everyone"

ANNOTATION_DB_GLOB = os.path.expanduser(
    "~/Library/Containers/com.apple.iBooksX/Data/Documents/AEAnnotation/*.sqlite"
)
LIBRARY_DB_GLOB = os.path.expanduser(
    "~/Library/Containers/com.apple.iBooksX/Data/Documents/BKLibrary/*.sqlite"
)

# Apple Cocoa epoch: 2001-01-01 00:00:00 UTC
COCOA_EPOCH = datetime(2001, 1, 1, tzinfo=timezone.utc)


def ensure_icloud_sync() -> None:
    """Open Books.app to force iCloud sync, then close it.

    Skips if Books is already running to avoid disrupting active reading.
    """
    result = subprocess.run(
        ["pgrep", "-x", "Books"], capture_output=True, text=True
    )
    if result.returncode == 0:
        log.info("Books.app already running — skipping iCloud sync trigger")
        return

    log.info("Opening Books.app to trigger iCloud sync...")
    subprocess.run(["open", "-a", "Books"], check=True)
    time.sleep(20)
    subprocess.run(
        ["osascript", "-e", 'quit app "Books"'],
        capture_output=True,
    )
    log.info("Books.app closed")


def main() -> None:
    log.info("Starting highlight sync")
    ensure_icloud_sync()
    log.info("Done")


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Make the script executable**

```bash
chmod +x scripts/sync-highlights.py
```

- [ ] **Step 4: Test the skeleton runs**

```bash
uv run scripts/sync-highlights.py
```

Expected: logs "Starting highlight sync", triggers (or skips) Books sync, logs "Done". If you get a permission error about `~/Library/Containers/com.apple.iBooksX/`, grant Full Disk Access to your terminal in System Settings > Privacy & Security > Full Disk Access.

- [ ] **Step 5: Commit**

```bash
git add scripts/sync-highlights.py
git commit -m "feat: add sync-highlights script skeleton with iCloud sync (#23)"
```

---

### Task 2: Read annotations from SQLite

**Files:**
- Modify: `scripts/sync-highlights.py`

- [ ] **Step 1: Add the database discovery function**

Add after the `COCOA_EPOCH` constant:

```python
def find_db(pattern: str) -> Path:
    """Find the single SQLite database matching a glob pattern."""
    matches = glob.glob(pattern)
    if not matches:
        log.error("No database found matching %s", pattern)
        log.error(
            "Make sure you have opened the book in Apple Books on this Mac. "
            "You may also need to grant Full Disk Access to your terminal "
            "in System Settings > Privacy & Security."
        )
        sys.exit(1)
    return Path(matches[0])
```

- [ ] **Step 2: Add the annotation query function**

Add after `find_db`:

```python
def fetch_highlights() -> tuple[list[dict], str, str]:
    """Query Apple Books databases for highlights from BOOK_TITLE.

    Returns (highlights, asset_id, author) where each highlight is a dict with
    keys: selected_text, note, chapter, location_start, modified_date.
    """
    annotation_db = find_db(ANNOTATION_DB_GLOB)
    library_db = find_db(LIBRARY_DB_GLOB)

    conn = sqlite3.connect(str(annotation_db))
    conn.row_factory = sqlite3.Row
    conn.execute(f"ATTACH DATABASE ? AS library", (str(library_db),))

    rows = conn.execute(
        """
        SELECT
            ann.ZANNOTATIONSELECTEDTEXT   AS selected_text,
            ann.ZANNOTATIONNOTE           AS note,
            ann.ZFUTUREPROOFING5          AS chapter,
            ann.ZPLLOCATIONRANGESTART     AS location_start,
            ann.ZANNOTATIONMODIFICATIONDATE AS modified_date,
            book.ZASSETID                 AS asset_id,
            book.ZAUTHOR                  AS author
        FROM ZAEANNOTATION ann
        JOIN library.ZBKLIBRARYASSET book
            ON ann.ZANNOTATIONASSETID = book.ZASSETID
        WHERE book.ZTITLE = ?
            AND ann.ZANNOTATIONSELECTEDTEXT IS NOT NULL
            AND ann.ZANNOTATIONDELETED = 0
        ORDER BY ann.ZPLLOCATIONRANGESTART ASC
        """,
        (BOOK_TITLE,),
    ).fetchall()

    conn.close()

    if not rows:
        return [], "", ""

    asset_id = rows[0]["asset_id"]
    author = rows[0]["author"] or ""

    highlights = [
        {
            "selected_text": row["selected_text"],
            "note": row["note"],
            "chapter": row["chapter"],
            "location_start": row["location_start"],
            "modified_date": row["modified_date"],
        }
        for row in rows
    ]

    return highlights, asset_id, author
```

- [ ] **Step 3: Wire it into main and test**

Update `main()`:

```python
def main() -> None:
    log.info("Starting highlight sync")
    ensure_icloud_sync()

    highlights, asset_id, author = fetch_highlights()
    if not highlights:
        log.info("No highlights found for '%s' — nothing to sync", BOOK_TITLE)
        return

    log.info("Found %d highlights (asset: %s)", len(highlights), asset_id)
    log.info("Done")
```

Run:

```bash
uv run scripts/sync-highlights.py
```

Expected: either "No highlights found" (if you haven't highlighted anything yet) or "Found N highlights". Verify the count looks right.

- [ ] **Step 4: Commit**

```bash
git add scripts/sync-highlights.py
git commit -m "feat: add SQLite query for Apple Books highlights (#23)"
```

---

### Task 3: Render highlights as markdown

**Files:**
- Modify: `scripts/sync-highlights.py`

- [ ] **Step 1: Add the markdown rendering function**

Add after `fetch_highlights`:

```python
def render_markdown(
    highlights: list[dict], asset_id: str, author: str
) -> str:
    """Render highlights as a markdown document with YAML frontmatter."""
    now = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")

    lines = [
        "---",
        f'title: "{BOOK_TITLE}"',
        f'author: "{author}"',
        f'asset_id: "{asset_id}"',
        f'last_synced: "{now}"',
        "---",
        "",
    ]

    # Group by chapter, preserving location order within each group
    chapters: dict[str, list[dict]] = {}
    for h in highlights:
        chapter = h["chapter"] or "Uncategorized"
        chapters.setdefault(chapter, []).append(h)

    # Render Uncategorized last
    chapter_names = [c for c in chapters if c != "Uncategorized"]
    if "Uncategorized" in chapters:
        chapter_names.append("Uncategorized")

    for i, chapter in enumerate(chapter_names):
        lines.append(f"## {chapter}")
        lines.append("")

        for j, h in enumerate(chapters[chapter]):
            # Quote each paragraph of the selected text
            for para in h["selected_text"].split("\n"):
                stripped = para.strip()
                if stripped:
                    lines.append(f"> {stripped}")
            lines.append("")

            if h["note"]:
                lines.append(f"Note: {h['note']}")
                lines.append("")

            # Separator between highlights (not after the last one in a chapter)
            if j < len(chapters[chapter]) - 1:
                lines.append("---")
                lines.append("")

        # Blank line between chapters
        if i < len(chapter_names) - 1:
            lines.append("")

    # Ensure trailing newline
    return "\n".join(lines) + "\n"
```

- [ ] **Step 2: Add the file-writing function**

Add after `render_markdown`:

```python
def write_highlights(content: str) -> Path:
    """Write markdown content to notes/highlights.md."""
    output_dir = REPO_ROOT / "notes"
    output_dir.mkdir(exist_ok=True)
    output_file = output_dir / "highlights.md"
    output_file.write_text(content, encoding="utf-8")
    log.info("Wrote %s", output_file.relative_to(REPO_ROOT))
    return output_file
```

- [ ] **Step 3: Wire into main and test**

Update `main()`:

```python
def main() -> None:
    log.info("Starting highlight sync")
    ensure_icloud_sync()

    highlights, asset_id, author = fetch_highlights()
    if not highlights:
        log.info("No highlights found for '%s' — nothing to sync", BOOK_TITLE)
        return

    log.info("Found %d highlights (asset: %s)", len(highlights), asset_id)

    content = render_markdown(highlights, asset_id, author)
    write_highlights(content)

    log.info("Done")
```

Run:

```bash
uv run scripts/sync-highlights.py
```

Then inspect the output:

```bash
cat notes/highlights.md
```

Expected: YAML frontmatter with correct title/author/asset_id, highlights grouped by chapter with `>` quoting, notes where present, `---` separators.

- [ ] **Step 4: Commit**

```bash
git add scripts/sync-highlights.py
git commit -m "feat: render highlights as markdown (#23)"
```

---

### Task 4: Git commit and push with change counts

**Files:**
- Modify: `scripts/sync-highlights.py`

- [ ] **Step 1: Add the git operations function**

Add after `write_highlights`:

```python
def count_highlight_changes(content: str) -> tuple[int, int]:
    """Compare new content against existing highlights.md to count changes.

    Returns (new_count, updated_count) based on highlight-level diffing.
    A highlight is identified by its quoted text (lines starting with "> ").
    """
    output_file = REPO_ROOT / "notes" / "highlights.md"
    if not output_file.exists():
        # All highlights are new
        new = content.count("\n> ")
        return new, 0

    old = output_file.read_text(encoding="utf-8")
    old_quotes = {
        line.strip() for line in old.splitlines() if line.startswith("> ")
    }
    new_quotes = {
        line.strip() for line in content.splitlines() if line.startswith("> ")
    }

    added = len(new_quotes - old_quotes)
    # "Updated" = old highlights that disappeared (text changed)
    removed = len(old_quotes - new_quotes)
    return added, removed


def git_commit_and_push(new_count: int, updated_count: int) -> None:
    """Commit and push notes/ if there are changes."""

    def run_git(*args: str, check: bool = True) -> subprocess.CompletedProcess:
        return subprocess.run(
            ["git", "-C", str(REPO_ROOT), *args],
            capture_output=True,
            text=True,
            check=check,
        )

    # Check for changes
    result = run_git("diff", "--quiet", "notes/", check=False)
    untracked = run_git(
        "ls-files", "--others", "--exclude-standard", "notes/", check=False
    )

    if result.returncode == 0 and not untracked.stdout.strip():
        log.info("No changes to commit")
        return

    run_git("add", "notes/")

    # Build commit message
    parts = []
    if new_count:
        parts.append(f"{new_count} new")
    if updated_count:
        parts.append(f"{updated_count} updated")
    summary = ", ".join(parts) if parts else "changes"
    message = f"notes: sync highlights ({summary})"

    run_git("commit", "-m", message)
    log.info("Committed: %s", message)

    # Push — tolerate failure (e.g., no network)
    push_result = run_git("push", "origin", "main", check=False)
    if push_result.returncode == 0:
        log.info("Pushed to origin/main")
    else:
        log.warning(
            "Push failed (will retry next run): %s",
            push_result.stderr.strip(),
        )
```

- [ ] **Step 2: Wire into main**

Update the end of `main()`:

```python
def main() -> None:
    log.info("Starting highlight sync")
    ensure_icloud_sync()

    highlights, asset_id, author = fetch_highlights()
    if not highlights:
        log.info("No highlights found for '%s' — nothing to sync", BOOK_TITLE)
        return

    log.info("Found %d highlights (asset: %s)", len(highlights), asset_id)

    content = render_markdown(highlights, asset_id, author)
    new_count, updated_count = count_highlight_changes(content)
    write_highlights(content)
    git_commit_and_push(new_count, updated_count)

    log.info("Done")
```

Note: `count_highlight_changes` must be called _before_ `write_highlights` so it can compare against the old file on disk.

- [ ] **Step 3: Test end-to-end**

Run the script:

```bash
uv run scripts/sync-highlights.py
```

Then check:

```bash
git log --oneline -3
```

Expected: a commit like `notes: sync highlights (1 new)` (or similar). Run it again immediately — should log "No changes to commit" since nothing changed.

- [ ] **Step 4: Commit the script changes**

```bash
git add scripts/sync-highlights.py
git commit -m "feat: add git commit and push for highlight sync (#23)"
```

---

### Task 5: Create the launchd plist

**Files:**
- Create: `scripts/com.davidwkeith.majordomo-highlights.plist`

- [ ] **Step 1: Find the absolute paths needed for the plist**

```bash
which uv
echo $PWD
```

Note the absolute path to `uv` (likely `/opt/homebrew/bin/uv`) and the repo root.

- [ ] **Step 2: Create the plist**

Create `scripts/com.davidwkeith.majordomo-highlights.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.davidwkeith.majordomo-highlights</string>

    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/uv</string>
        <string>run</string>
        <string>scripts/sync-highlights.py</string>
    </array>

    <key>WorkingDirectory</key>
    <string>/Users/dwk/Developer/github.com/davidwkeith/A-Majordomo-for-Everyone</string>

    <key>StartInterval</key>
    <integer>3600</integer>

    <key>RunAtLoad</key>
    <true/>

    <key>StandardOutPath</key>
    <string>/tmp/majordomo-highlights-sync.log</string>

    <key>StandardErrorPath</key>
    <string>/tmp/majordomo-highlights-sync.log</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    </dict>
</dict>
</plist>
```

Note: `EnvironmentVariables` with `PATH` is needed because launchd agents run with a minimal environment that doesn't include Homebrew paths. Without this, `uv` and `git` (if installed via Homebrew) won't be found.

- [ ] **Step 3: Validate the plist syntax**

```bash
plutil -lint scripts/com.davidwkeith.majordomo-highlights.plist
```

Expected: `scripts/com.davidwkeith.majordomo-highlights.plist: OK`

- [ ] **Step 4: Commit**

```bash
git add scripts/com.davidwkeith.majordomo-highlights.plist
git commit -m "feat: add launchd plist for hourly highlight sync (#23)"
```

---

### Task 6: Install the daemon and verify

**Files:**
- No files modified — this is manual setup and verification.

- [ ] **Step 1: Symlink the plist into LaunchAgents**

```bash
ln -sf "$(pwd)/scripts/com.davidwkeith.majordomo-highlights.plist" ~/Library/LaunchAgents/
```

- [ ] **Step 2: Load the agent**

```bash
launchctl load ~/Library/LaunchAgents/com.davidwkeith.majordomo-highlights.plist
```

Since `RunAtLoad` is true, this triggers an immediate run.

- [ ] **Step 3: Verify it ran**

Wait ~30 seconds (the script waits 20s for Books sync), then check:

```bash
cat /tmp/majordomo-highlights-sync.log
```

Expected: log output showing the sync ran (or "No highlights found" if you haven't highlighted anything yet).

- [ ] **Step 4: Verify the agent is registered**

```bash
launchctl list | grep majordomo
```

Expected: a line showing the agent with PID or exit status.

- [ ] **Step 5: Add `notes/` to .gitignore exclusion note and commit**

Add a comment to `.gitignore` so future contributors know `notes/` is intentionally tracked:

The `notes/` directory is committed (generated highlights from Apple Books). No `.gitignore` change needed since git tracks it by default — only ignored patterns are excluded.

No commit needed for this step. The directory will be tracked once `notes/highlights.md` is committed by the script.

- [ ] **Step 6: Final commit — close the issue**

```bash
git add scripts/
git commit -m "feat: complete Apple Books highlight sync (#23)

Closes #23"
git push origin main
```
