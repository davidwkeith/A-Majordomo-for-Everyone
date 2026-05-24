/**
 * Thin wrappers around the `gh` CLI. We shell out via spawnSync (not
 * a shell-expansion API) so arguments are passed as an array — no
 * quoting or escaping concerns.
 */

import { spawnSync } from 'node:child_process';
import type { IssueRecord, RenderedIssue } from './types.js';
import { LABEL_NAME } from './types.js';

function runGh(args: string[]): { stdout: string; stderr: string } {
  const r = spawnSync('gh', args, { encoding: 'utf8' });
  if (r.status !== 0) {
    throw new Error(`gh ${args.join(' ')} exited ${r.status}: ${r.stderr.trim()}`);
  }
  return { stdout: r.stdout, stderr: r.stderr };
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
  );
  if (r.status === 0) return true;
  if (/already exists/i.test(r.stderr)) return false;
  throw new Error(`gh label create exited ${r.status}: ${r.stderr.trim()}`);
}
