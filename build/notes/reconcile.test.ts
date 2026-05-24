import { describe, it, expect } from 'vitest';
import { reconcile } from './reconcile.js';
import { render } from './render.js';
import type { Annotation, IssueRecord } from './types.js';

const ann = (overrides: Partial<Annotation> = {}): Annotation => ({
  uuid: 'UUID-A',
  selectedText: 'passage',
  note: 'note A',
  chapter: 'ch1',
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

  it('dedupes annotations by UUID, processing only the first occurrence', () => {
    const a1 = ann({ uuid: 'UUID-DUP', note: 'first' });
    const a2 = ann({ uuid: 'UUID-DUP', note: 'second (should be ignored)' });
    const actions = reconcile([a1, a2], []);
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe('create');
    if (actions[0].type === 'create') {
      expect(actions[0].rendered.body).toContain('first');
    }
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
