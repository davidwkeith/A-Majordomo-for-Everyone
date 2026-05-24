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
