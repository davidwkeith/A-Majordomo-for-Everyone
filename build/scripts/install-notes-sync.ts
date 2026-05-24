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
  if (typeof process.getuid !== 'function') {
    console.error('This script requires a POSIX environment (macOS).');
    process.exit(1);
  }
  const home = homedir();
  const repo = repoRoot();
  const tsx = resolve(repo, 'node_modules', '.bin', 'tsx');
  // Prepend the install-time node's bin dir so the daemon uses the same
  // node that built the better-sqlite3 native module. Without this, a
  // user with multiple node versions (e.g. node@22 in their shell PATH
  // but the default `/opt/homebrew/bin/node` being a newer release) would
  // hit a NODE_MODULE_VERSION mismatch when launchd's PATH resolves to
  // the wrong node.
  const nodeDir = dirname(process.execPath);
  const path = [nodeDir, '/usr/local/bin', '/opt/homebrew/bin', '/usr/bin', '/bin']
    .filter((p, i, arr) => arr.indexOf(p) === i)
    .join(':');

  console.log('[install-notes-sync] preflight...');
  console.log(`[install-notes-sync]   node:  ${process.execPath} (${process.version})`);

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
  const uid = process.getuid!();
  const bootstrap = spawnSync('launchctl', ['bootstrap', `gui/${uid}`, dest], { encoding: 'utf8' });
  if (bootstrap.status !== 0) {
    if (/already loaded|already bootstrapped/i.test(bootstrap.stderr)) {
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
  console.log('');
  console.log('⚠️  If the daemon hangs on first launch, grant Full Disk Access to:');
  console.log(`     ${process.execPath}`);
  console.log('   (System Settings → Privacy & Security → Full Disk Access → +)');
  console.log('   Then re-kickstart:');
  console.log(`     launchctl kickstart -p "gui/$(id -u)/io.dwk.majordomo.notes-sync"`);
}

main().catch((e) => die(e instanceof Error ? e.message : String(e)));
