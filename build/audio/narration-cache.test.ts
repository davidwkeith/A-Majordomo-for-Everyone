import { describe, it, expect } from 'vitest';
import {
  hashNarratableText,
  hashNarrationInputs,
  planNarrationRegeneration,
  findStaleManifestEntries,
  updateManifest,
} from './narration-cache.js';
import type { NarrationManifest } from './narration-cache.js';

describe('hashNarratableText', () => {
  it('is deterministic', () => {
    expect(hashNarratableText('Jeeves considered the matter.')).toBe(
      hashNarratableText('Jeeves considered the matter.'),
    );
  });

  it('differs for different text, including a single-character edit', () => {
    const a = hashNarratableText('Jeeves considered the matter.');
    const b = hashNarratableText('Jeeves considered the matters.');
    expect(a).not.toBe(b);
  });
});

describe('planNarrationRegeneration', () => {
  it('marks a chapter with no manifest entry as new', () => {
    const hash = hashNarratableText('Hello there.');
    const plan = planNarrationRegeneration([{ slug: 'ch01', hash, charCount: 12 }], {});
    expect(plan).toEqual([{ slug: 'ch01', hash, charCount: 12, reason: 'new' }]);
  });

  it('marks a chapter as unchanged when its hash matches the manifest', () => {
    const hash = hashNarratableText('Hello there.');
    const manifest: NarrationManifest = { ch01: { hash, audioFile: 'ch01.mp3' } };
    const plan = planNarrationRegeneration([{ slug: 'ch01', hash, charCount: 12 }], manifest);
    expect(plan[0].reason).toBe('unchanged');
  });

  it('marks a chapter as changed when its hash no longer matches the recorded hash', () => {
    const manifest: NarrationManifest = {
      ch01: { hash: hashNarratableText('Hello there.'), audioFile: 'ch01.mp3' },
    };
    const plan = planNarrationRegeneration(
      [{ slug: 'ch01', hash: hashNarratableText('Hello there, friend.'), charCount: 20 }],
      manifest,
    );
    expect(plan[0].reason).toBe('changed');
  });

  it('plans each chapter independently', () => {
    const manifest: NarrationManifest = {
      ch01: { hash: hashNarratableText('Unchanged text.'), audioFile: 'ch01.mp3' },
      ch02: { hash: hashNarratableText('Old text.'), audioFile: 'ch02.mp3' },
    };
    const plan = planNarrationRegeneration(
      [
        { slug: 'ch01', hash: hashNarratableText('Unchanged text.'), charCount: 15 },
        { slug: 'ch02', hash: hashNarratableText('New text.'), charCount: 9 },
        { slug: 'ch03', hash: hashNarratableText('Brand new chapter.'), charCount: 19 },
      ],
      manifest,
    );
    expect(plan.map((p) => p.reason)).toEqual(['unchanged', 'changed', 'new']);
  });
});

describe('findStaleManifestEntries', () => {
  it('reports manifest entries whose chapter no longer exists', () => {
    const manifest: NarrationManifest = {
      ch01: { hash: 'a', audioFile: 'ch01.mp3' },
      ch02: { hash: 'b', audioFile: 'ch02.mp3' },
    };
    const stale = findStaleManifestEntries([{ slug: 'ch01', hash: 'a', charCount: 10 }], manifest);
    expect(stale).toEqual(['ch02']);
  });

  it('reports nothing stale when every manifest entry has a matching chapter', () => {
    const manifest: NarrationManifest = { ch01: { hash: 'a', audioFile: 'ch01.mp3' } };
    const stale = findStaleManifestEntries([{ slug: 'ch01', hash: 'a', charCount: 1 }], manifest);
    expect(stale).toEqual([]);
  });
});

describe('updateManifest', () => {
  it('adds a new entry without mutating the original manifest', () => {
    const original: NarrationManifest = {};
    const updated = updateManifest(original, 'ch01', 'hash123', 'ch01.mp3');
    expect(original).toEqual({});
    expect(updated).toEqual({ ch01: { hash: 'hash123', audioFile: 'ch01.mp3' } });
  });

  it('overwrites an existing entry for the same slug', () => {
    const original: NarrationManifest = { ch01: { hash: 'old', audioFile: 'ch01.mp3' } };
    const updated = updateManifest(original, 'ch01', 'new', 'ch01.mp3');
    expect(updated.ch01.hash).toBe('new');
  });
});

describe('hashNarrationInputs', () => {
  const text = 'One’s Agent has read the statute.';
  it('changes when the voice map changes, same text', () => {
    const a = hashNarrationInputs(text, '[["narrator","nathan"]]', '[]');
    const b = hashNarrationInputs(text, '[["narrator","zoe"]]', '[]');
    expect(a).not.toBe(b);
  });
  it('changes when the IPA lexicon changes, same text and voices', () => {
    const a = hashNarrationInputs(text, '[]', '[["HUD","hʌd"]]');
    const b = hashNarrationInputs(text, '[]', '[["HUD","hʌːd"]]');
    expect(a).not.toBe(b);
  });
  it('is stable for identical inputs', () => {
    expect(hashNarrationInputs(text, '[]', '[]')).toBe(hashNarrationInputs(text, '[]', '[]'));
  });
});
