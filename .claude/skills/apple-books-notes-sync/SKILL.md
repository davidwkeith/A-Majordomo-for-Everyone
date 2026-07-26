---
name: apple-books-notes-sync
description: Install, run, troubleshoot, or remove the hourly sync from Apple Books annotations on the built ePub to GitHub Issues. Use for the sync:notes scripts, the LaunchAgent, or macOS Full Disk Access errors reading the Apple Books container.
---

# Apple Books Notes Sync

Hourly sync from your Apple Books typed annotations on the built ePub to GitHub Issues on this repo (label `from:apple-books`). Each annotation becomes one deduped issue.

```bash
npm run sync:notes:install      # one-time: install LaunchAgent + create label
npm run sync:notes              # force a sync now (rather than wait for next hour)
npm run sync:notes:status       # last-run, mtime, log file size, lifetime counters
npm run sync:notes:uninstall    # remove the LaunchAgent
```

State lives outside the repo:
- `~/Library/Application Support/majordomo/notes-sync-state.json` (mtime cache, asset_id, counters)
- `~/Library/Logs/majordomo-notes-sync.log` (structured one-line-per-event log)

Requires `gh auth login` to have been run once.

**macOS Full Disk Access:** The LaunchAgent-spawned daemon needs Full Disk Access to read `~/Library/Containers/com.apple.iBooksX/`. Interactive shells inherit this from Terminal/iTerm/Claude Code; LaunchAgents are attributed to their own responsible code and need explicit grants. After running `sync:notes:install`, open **System Settings → Privacy & Security → Full Disk Access**, click **+**, navigate to (Cmd+Shift+G) the node binary path printed by the installer (e.g. `/opt/homebrew/Cellar/node@22/22.22.2_1/bin/node`), and toggle it on. Then kickstart the daemon: `launchctl kickstart -p "gui/$(id -u)/io.dwk.majordomo.notes-sync"`.

See [the design spec](docs/superpowers/specs/2026-05-23-apple-books-notes-sync-design.md) for the full architecture.
