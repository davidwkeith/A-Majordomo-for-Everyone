# /// script
# requires-python = ">=3.12"
# ///
"""Sync Apple Books highlights for Majordomo to notes/highlights.md."""

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
BOOK_TITLE = "Majordomo"

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
