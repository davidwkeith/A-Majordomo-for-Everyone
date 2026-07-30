# Read-Along Audiobook Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the end-to-end read-along audiobook pipeline: AVSpeech synthesis (Swift CLI) → word boundaries → SMIL Media Overlays → a separate `dist/majordomo-audio.epub` edition, per `docs/superpowers/specs/2026-07-30-audiobook-pipeline-design.md`.

**Architecture:** Swift synthesizes (new `narrate` executable beside the spike, sharing `SpikeCore`); TypeScript does everything else (voice segmentation, caching, boundary adaptation, SMIL, OPF assembly). All TS logic is CI-safe vitest; only synthesis needs a Mac with the voices downloaded.

**Tech Stack:** TypeScript (strict, ESM, compiled by `tsc` to `dist/`, run via `node dist/...`), vitest, Swift 5.9 / SwiftPM (macOS 13+), AVFoundation, jszip.

## Global Constraints

- Voices pinned by identifier, never display name: narrator/prompt/agent → `com.apple.voice.enhanced.en-US.Nathan`; jeeves → `com.apple.voice.premium.en-GB.Malcolm` (displays as "Jamie (Premium)" — renamed voice, old identifier kept).
- Audio: AAC-LC `.m4a`, 44.1 kHz mono, 96 kbps, one file per chapter.
- Cache: audio + boundaries in gitignored `.cache/narration/<slug>/`; only `src/audio/manifest.json` is committed.
- Cache key: `sha256(narratableText + serialized voice map + serialized IPA lexicon entries)` — never content alone.
- Fail loudly, never package stale: validation failure → no manifest update; hash mismatch at packaging → hard error.
- CI must never require macOS synthesis: every vitest suite passes on a machine with no voices installed.
- All npm scripts follow the existing `tsc && node dist/build/...` pattern (`ROOT` in `build/pipeline.ts` resolves two levels up from `dist/build/`).
- Text offsets are UTF-16 code units on both sides (JS `string.length` and `NSRange` agree by construction).
- Commits: conventional style, ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Run all commands from the repo root (worktree root) unless a task says otherwise; Swift commands from `scripts/avspeech-spike/`.

---

### Task 1: Merge main (PR #177 backlink fix)

**Files:**
- Modify: none by hand — git merge only.

**Interfaces:**
- Consumes: `origin/main` (contains PR #177: `word-fragments.ts` suppresses `role="doc-backlink"` text from narratable extraction).
- Produces: a branch state where `injectWordFragments` excludes backlink glyphs — every later task builds on this version.

- [ ] **Step 1: Merge**

```bash
git fetch origin
git merge origin/main --no-edit
```

Expected: clean merge (branch only has docs commits beyond main). If conflicts appear, they will be in docs — keep both sides.

- [ ] **Step 2: Verify TS tests pass**

Run: `npx vitest run`
Expected: all suites pass (baseline was 182+ on main; #177 added word-fragments tests).

- [ ] **Step 3: Verify Swift tests pass**

Run: `cd scripts/avspeech-spike && swift test && cd ../..`
Expected: 12/12 XCTests pass.

- [ ] **Step 4: Commit** — nothing to commit beyond the merge commit itself (`git log -1` should show the merge). Push nothing yet.

---

### Task 2: Extract a shared narratable-HTML walker

**Files:**
- Modify: `build/audio/word-fragments.ts`
- Test: `build/audio/word-fragments.test.ts` (add cases; existing cases must stay green unchanged)

**Interfaces:**
- Consumes: nothing new.
- Produces (exact exports added to `word-fragments.ts`):
  - `interface NarratableWalkEvents { onTag(tag: string, name: string | undefined, suppressed: boolean): void; onText(rawHtml: string): void; onSuppressedText(rawHtml: string): void; }`
  - `function walkNarratableHtml(html: string, events: NarratableWalkEvents): void`
  - `function decodeEntities(segment: string): string`
  - `injectWordFragments` keeps its exact current signature and behavior.

The walker owns the tag scan and the doc-backlink suppression state machine that currently live inline in `injectWordFragments`; both `injectWordFragments` (this task) and `segmentVoices` (Task 4) drive it, which is what guarantees the two produce identical narratable text.

- [ ] **Step 1: Write the failing tests** (append to `word-fragments.test.ts`)

```ts
import { walkNarratableHtml, decodeEntities, injectWordFragments } from './word-fragments.js';

describe('walkNarratableHtml', () => {
  it('reproduces narratableText when events accumulate decoded text', () => {
    const html =
      '<p>Ross &amp; the couch.</p>' +
      '<aside epub:type="footnote"><p>A note.<a role="doc-backlink" href="#r">↩</a></p></aside>';
    let acc = '';
    walkNarratableHtml(html, {
      onTag: () => {},
      onText: (raw) => { acc += decodeEntities(raw); },
      onSuppressedText: () => {},
    });
    expect(acc).toBe(injectWordFragments(html).narratableText);
    expect(acc).not.toContain('↩');
  });

  it('reports tag names and suppression state', () => {
    const html = '<p>Hi<a role="doc-backlink" href="#r">↩</a></p>';
    const tags: Array<[string | undefined, boolean]> = [];
    walkNarratableHtml(html, {
      onTag: (_tag, name, suppressed) => { tags.push([name, suppressed]); },
      onText: () => {},
      onSuppressedText: () => {},
    });
    // <p> not suppressed; <a ...> opens suppression (reported suppressed);
    // </a> closes it (reported suppressed); </p> not suppressed.
    expect(tags).toEqual([['p', false], ['a', true], ['a', true], ['p', false]]);
  });
});

describe('decodeEntities', () => {
  it('decodes named, decimal, and hex references and leaves the rest alone', () => {
    expect(decodeEntities('a &amp; b &#38; c &#x26; d &unknown; e')).toBe(
      'a & b & c & d &unknown; e',
    );
  });
});
```

Convention note: on suppression-boundary tags, `onTag`'s `suppressed` flag is true for the tag that *opens* suppression and the tag that *closes* it, as well as everything in between. Task 4 only needs "am I inside suppressed text", so this edge convention just has to be documented and stable.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run build/audio/word-fragments.test.ts`
Expected: FAIL — `walkNarratableHtml is not a function`.

- [ ] **Step 3: Implement the refactor**

In `word-fragments.ts`, add (reusing the module's existing `TAG_PATTERN`, `TAG_NAME`, `NON_NARRATED_TAG`, `ENTITY_SOURCE`, `decodeEntity`):

```ts
export interface NarratableWalkEvents {
  onTag(tag: string, name: string | undefined, suppressed: boolean): void;
  onText(rawHtml: string): void;
  onSuppressedText(rawHtml: string): void;
}

const ENTITY_GLOBAL = new RegExp(ENTITY_SOURCE, 'g');

/** Decode HTML character references the way the narratable text does. */
export function decodeEntities(segment: string): string {
  return segment.replace(ENTITY_GLOBAL, (entity) => decodeEntity(entity));
}

/**
 * Scan `html`, reporting tags and text runs in document order, with
 * doc-backlink/backlink elements marked suppressed (their text is
 * navigation chrome, not narration — see NON_NARRATED_TAG).
 */
export function walkNarratableHtml(html: string, events: NarratableWalkEvents): void {
  let cursor = 0;
  let suppressTagName: string | null = null;
  let suppressDepth = 0;

  TAG_PATTERN.lastIndex = 0;
  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = TAG_PATTERN.exec(html))) {
    const text = html.slice(cursor, tagMatch.index);
    if (text) (suppressTagName ? events.onSuppressedText : events.onText)(text);

    const tag = tagMatch[0];
    cursor = tagMatch.index + tag.length;
    const name = TAG_NAME.exec(tag)?.[1];

    if (suppressTagName) {
      events.onTag(tag, name, true);
      if (name === suppressTagName) {
        if (tag.startsWith('</')) {
          if (--suppressDepth === 0) suppressTagName = null;
        } else if (!tag.endsWith('/>')) {
          suppressDepth++;
        }
      }
    } else if (name && !tag.startsWith('</') && !tag.endsWith('/>') && NON_NARRATED_TAG.test(tag)) {
      suppressTagName = name;
      suppressDepth = 1;
      events.onTag(tag, name, true);
    } else {
      events.onTag(tag, name, false);
    }
  }
  const tail = html.slice(cursor);
  if (tail) (suppressTagName ? events.onSuppressedText : events.onText)(tail);
}
```

Then rewrite `injectWordFragments`'s body to drive it (behavior unchanged — `appendTextSegment` stays as-is):

```ts
export function injectWordFragments(html: string, startIndex = 1): WordFragmentResult {
  const fragments: WordFragment[] = [];
  let narratableText = '';
  let nextId = startIndex;
  let outHtml = '';

  const appendTextSegment = (segment: string) => {
    /* ... existing body unchanged, appending to outHtml/narratableText/fragments ... */
  };

  walkNarratableHtml(html, {
    onTag: (tag) => { outHtml += tag; },
    onText: (raw) => { appendTextSegment(raw); },
    onSuppressedText: (raw) => { outHtml += raw; },
  });

  return { html: outHtml, narratableText, fragments };
}
```

- [ ] **Step 4: Run the full suite to verify no behavior change**

Run: `npx vitest run`
Expected: ALL suites pass — including every pre-existing word-fragments test, untouched.

- [ ] **Step 5: Commit**

```bash
git add build/audio/word-fragments.ts build/audio/word-fragments.test.ts
git commit -m "refactor(audio): extract shared narratable-HTML walker

walkNarratableHtml + decodeEntities become the single definition of
'what text is narrated', so the voice segmenter (next) can't diverge
from injectWordFragments.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Role→voice map

**Files:**
- Create: `build/audio/voices.ts`
- Test: `build/audio/voices.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type NarrationRole = 'narrator' | 'prompt' | 'agent' | 'jeeves'`
  - `interface VoiceAssignment { identifier: string; displayName: string }`
  - `const VOICE_MAP: Record<NarrationRole, VoiceAssignment>`
  - `function serializeVoiceMap(map?: Record<NarrationRole, VoiceAssignment>): string` — deterministic (sorted keys), used in the cache key.

- [ ] **Step 1: Write the failing test** (`build/audio/voices.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { VOICE_MAP, serializeVoiceMap } from './voices.js';

describe('VOICE_MAP', () => {
  it('pins the four roles to identifiers, not display names', () => {
    expect(VOICE_MAP.narrator.identifier).toBe('com.apple.voice.enhanced.en-US.Nathan');
    expect(VOICE_MAP.prompt.identifier).toBe('com.apple.voice.enhanced.en-US.Nathan');
    expect(VOICE_MAP.agent.identifier).toBe('com.apple.voice.enhanced.en-US.Nathan');
    // Renamed-voice gotcha: Jamie (Premium) kept Malcolm's identifier.
    expect(VOICE_MAP.jeeves.identifier).toBe('com.apple.voice.premium.en-GB.Malcolm');
  });
});

describe('serializeVoiceMap', () => {
  it('is deterministic regardless of key insertion order', () => {
    const a = { narrator: { identifier: 'x', displayName: 'X' }, jeeves: { identifier: 'y', displayName: 'Y' } };
    const b = { jeeves: { identifier: 'y', displayName: 'Y' }, narrator: { identifier: 'x', displayName: 'X' } };
    expect(serializeVoiceMap(a as never)).toBe(serializeVoiceMap(b as never));
  });

  it('changes when any identifier changes', () => {
    const base = serializeVoiceMap();
    const swapped = serializeVoiceMap({
      ...VOICE_MAP,
      agent: { identifier: 'com.apple.voice.premium.en-US.Zoe', displayName: 'Zoe (Premium)' },
    });
    expect(swapped).not.toBe(base);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run build/audio/voices.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** (`build/audio/voices.ts`)

```ts
/**
 * Role→voice assignments for the read-along audiobook.
 *
 * Voices are pinned by AVSpeech *identifier*, never display name: display
 * names are localized and mutable — "Jamie (Premium)" below carries the
 * identifier `...en-GB.Malcolm` because Apple renamed the voice but kept
 * its identifier. Changing any assignment invalidates every chapter's
 * narration cache entry (the serialized map is part of the cache key).
 *
 * v1 deliberately reads prompt/agent blocks in the narrator voice — the
 * roles are segmented anyway so enabling distinct voices later is a
 * config change plus re-synthesis. See the 2026-07-30 design spec.
 */

export type NarrationRole = 'narrator' | 'prompt' | 'agent' | 'jeeves';

export interface VoiceAssignment {
  identifier: string;
  displayName: string;
}

const NATHAN: VoiceAssignment = {
  identifier: 'com.apple.voice.enhanced.en-US.Nathan',
  displayName: 'Nathan (Enhanced)',
};

export const VOICE_MAP: Record<NarrationRole, VoiceAssignment> = {
  narrator: NATHAN,
  prompt: NATHAN,
  agent: NATHAN,
  jeeves: {
    identifier: 'com.apple.voice.premium.en-GB.Malcolm',
    displayName: 'Jamie (Premium)',
  },
};

/** Deterministic serialization for the narration cache key. */
export function serializeVoiceMap(map: Record<NarrationRole, VoiceAssignment> = VOICE_MAP): string {
  const roles = Object.keys(map).sort() as NarrationRole[];
  return JSON.stringify(roles.map((role) => [role, map[role].identifier]));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run build/audio/voices.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add build/audio/voices.ts build/audio/voices.test.ts
git commit -m "feat(audio): role-to-voice map for audiobook narration

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Voice segmenter

**Files:**
- Create: `build/audio/voice-segments.ts`
- Test: `build/audio/voice-segments.test.ts`

**Interfaces:**
- Consumes: `walkNarratableHtml`, `decodeEntities`, `injectWordFragments` (Task 2); `NarrationRole` (Task 3).
- Produces:
  - `interface VoiceSegment { role: NarrationRole; text: string; charStart: number; charEnd: number }`
  - `function segmentVoices(html: string): VoiceSegment[]` — ordered, adjacent same-role segments merged, and `segments.map(s => s.text).join('') === injectWordFragments(html).narratableText` (the invariant).

Role rules (from the spec): `<div data-conversation="prompt|agent">` → that role until its matching `</div>`; a `<p>` whose first non-whitespace content is exactly `<strong>My Man Jeeves:</strong>` marks the *following* `<em>...</em>` as `jeeves` (label text itself stays `narrator`); jeeves detection is skipped inside conversation divs; everything else `narrator`.

- [ ] **Step 1: Write the failing tests** (`build/audio/voice-segments.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { segmentVoices } from './voice-segments.js';
import { injectWordFragments } from './word-fragments.js';

const JEEVES_P =
  '<p><strong>My Man Jeeves:</strong> <em>One&#8217;s Agent has read the statute &amp; the lease.</em></p>';
const CONVO =
  '<div data-conversation="prompt"><p>Help me understand this bill.</p></div>' +
  '<div data-conversation="agent"><p>I can help. <em>A few</em> questions.</p><div><p>Nested.</p></div></div>';
const PLAIN = '<p>Ross buys a couch.</p>';
const SPEC_P = '<p><strong>The Spec:</strong> <em>not Jeeves</em></p>';
const BACKLINK =
  '<aside epub:type="footnote"><p>A note.<a role="doc-backlink" href="#r">↩</a></p></aside>';

const roleOf = (segments: ReturnType<typeof segmentVoices>, needle: string) =>
  segments.find((s) => s.text.includes(needle))?.role;

describe('segmentVoices', () => {
  const html = PLAIN + JEEVES_P + CONVO + SPEC_P + BACKLINK;

  it('concatenates back to exactly the narratable text (the invariant)', () => {
    const segments = segmentVoices(html);
    expect(segments.map((s) => s.text).join('')).toBe(injectWordFragments(html).narratableText);
    // charStart/charEnd tile the text with no gaps or overlaps
    let cursor = 0;
    for (const s of segments) {
      expect(s.charStart).toBe(cursor);
      expect(s.charEnd).toBe(cursor + s.text.length);
      cursor = s.charEnd;
    }
  });

  it('classifies conversation divs, including nested elements', () => {
    const segments = segmentVoices(html);
    expect(roleOf(segments, 'understand this bill')).toBe('prompt');
    expect(roleOf(segments, 'A few')).toBe('agent');
    expect(roleOf(segments, 'Nested.')).toBe('agent');
  });

  it('splits the Jeeves label from the Jeeves body', () => {
    const segments = segmentVoices(html);
    expect(roleOf(segments, 'My Man Jeeves:')).toBe('narrator');
    expect(roleOf(segments, 'read the statute')).toBe('jeeves');
    // decoded entities land in the right role: &#8217; → ’ and &amp; → &
    expect(roleOf(segments, '’')).toBe('jeeves');
  });

  it('does not treat other strong-opening paragraphs as Jeeves', () => {
    const segments = segmentVoices(html);
    expect(roleOf(segments, 'not Jeeves')).toBe('narrator');
  });

  it('merges adjacent same-role runs', () => {
    const segments = segmentVoices(PLAIN + SPEC_P);
    expect(segments).toHaveLength(1);
    expect(segments[0].role).toBe('narrator');
  });

  it('classifies plain prose as narrator and drops suppressed backlink text', () => {
    const segments = segmentVoices(html);
    expect(roleOf(segments, 'buys a couch')).toBe('narrator');
    expect(segments.some((s) => s.text.includes('↩'))).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run build/audio/voice-segments.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** (`build/audio/voice-segments.ts`)

```ts
/**
 * Classify a rendered chapter's narratable text by speaking role.
 *
 * Drives the same walker as injectWordFragments, so the concatenation of
 * the returned segments is identical to its narratableText by
 * construction — the invariant that keeps whole-chapter boundary offsets
 * valid across voice switches. The orchestrator still asserts it at
 * runtime (fail loudly beats trust).
 */
import { walkNarratableHtml, decodeEntities } from './word-fragments.js';
import type { NarrationRole } from './voices.js';

export interface VoiceSegment {
  role: NarrationRole;
  text: string;
  /** UTF-16 offsets into the chapter narratable text, [charStart, charEnd). */
  charStart: number;
  charEnd: number;
}

const CONVERSATION_ATTR = /\bdata-conversation="(prompt|agent)"/;
const JEEVES_LABEL = 'My Man Jeeves:';

type JeevesPhase =
  | 'idle'          // not in a candidate paragraph
  | 'p-start'       // <p> just opened, nothing but whitespace seen
  | 'in-label'      // inside the opening <strong>
  | 'label-matched' // label verified; waiting for the <em>
  | 'in-em';        // inside the Jeeves <em> body

export function segmentVoices(html: string): VoiceSegment[] {
  const segments: VoiceSegment[] = [];
  let narratableLength = 0;

  // Conversation state: role + open-div depth (1 = the conversation div).
  let convoRole: NarrationRole | null = null;
  let convoDepth = 0;

  // Jeeves state machine (only active outside conversation divs).
  let phase: JeevesPhase = 'idle';
  let labelBuffer = '';
  let emDepth = 0;

  const currentRole = (): NarrationRole =>
    convoRole ?? (phase === 'in-em' ? 'jeeves' : 'narrator');

  const push = (text: string, role: NarrationRole) => {
    if (!text) return;
    const last = segments[segments.length - 1];
    if (last && last.role === role) {
      last.text += text;
      last.charEnd += text.length;
    } else {
      segments.push({
        role,
        text,
        charStart: narratableLength,
        charEnd: narratableLength + text.length,
      });
    }
    narratableLength += text.length;
  };

  walkNarratableHtml(html, {
    onText(raw) {
      const decoded = decodeEntities(raw);
      if (phase === 'in-label') {
        labelBuffer += decoded;
        push(decoded, currentRole()); // the label itself is narrated by the narrator
        return;
      }
      if ((phase === 'p-start' || phase === 'label-matched') && decoded.trim() !== '') {
        // Unexpected prose where only whitespace may appear — not a Jeeves shape.
        phase = 'idle';
      }
      push(decoded, currentRole());
    },
    onSuppressedText() {
      // Navigation chrome (doc-backlinks): not narrated, no offset advance.
    },
    onTag(tag, name, suppressed) {
      if (suppressed) return;
      const isClose = tag.startsWith('</');
      const isSelfClose = tag.endsWith('/>');

      if (name === 'div') {
        if (convoRole) {
          if (isClose) {
            if (--convoDepth === 0) convoRole = null;
          } else if (!isSelfClose) {
            convoDepth++;
          }
        } else if (!isClose && !isSelfClose) {
          const m = CONVERSATION_ATTR.exec(tag);
          if (m) {
            convoRole = m[1] as NarrationRole;
            convoDepth = 1;
            phase = 'idle'; // jeeves detection is off inside conversations
          }
        }
        return;
      }
      if (convoRole) return; // inside a conversation, only div tracking matters

      switch (name) {
        case 'p':
          if (isClose) { phase = 'idle'; emDepth = 0; }
          else { phase = 'p-start'; labelBuffer = ''; }
          break;
        case 'strong':
          if (!isClose && phase === 'p-start') { phase = 'in-label'; labelBuffer = ''; }
          else if (isClose && phase === 'in-label') {
            phase = labelBuffer.trim() === JEEVES_LABEL ? 'label-matched' : 'idle';
          }
          break;
        case 'em':
          if (!isClose && phase === 'label-matched') { phase = 'in-em'; emDepth = 1; }
          else if (phase === 'in-em') {
            if (isClose) { if (--emDepth === 0) phase = 'idle'; }
            else if (!isSelfClose) emDepth++;
          }
          break;
        default:
          // Any other element at p-start (e.g. a leading <span>) breaks the shape.
          if (phase === 'p-start' && !isClose) phase = 'idle';
      }
    },
  });

  return segments;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run build/audio/voice-segments.test.ts`
Expected: PASS (all six).

- [ ] **Step 5: Full suite + type check**

Run: `npx vitest run && npx tsc --noEmit`
Expected: everything green, no type errors. (The invariant against *real* chapters is enforced systematically by Task 9's orchestrator on every run — no ad-hoc check needed here.)

- [ ] **Step 6: Commit**

```bash
git add build/audio/voice-segments.ts build/audio/voice-segments.test.ts
git commit -m "feat(audio): voice segmenter for narrator/prompt/agent/jeeves roles

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Widen the narration cache key

**Files:**
- Modify: `build/audio/narration-cache.ts`
- Modify: `build/audio/ssml-lexicon.ts` (add `serializeIpaLexicon`)
- Modify: `build/scripts/narration-plan.ts` (adapt to the new hash inputs)
- Test: `build/audio/narration-cache.test.ts`, `build/audio/ssml-lexicon.test.ts`

**Interfaces:**
- Consumes: `serializeVoiceMap` (Task 3).
- Produces:
  - In `ssml-lexicon.ts`: `function serializeIpaLexicon(): string` — deterministic serialization of the acronym/IPA entries (pattern source + flags + IPA), so editing an entry changes the cache key without any hand-bumped version constant.
  - In `narration-cache.ts`: `function hashNarrationInputs(narratableText: string, voiceMapSerialized: string, ipaLexiconSerialized: string): string` (sha256 hex). The existing `hashNarratableText` stays (other callers/tests) but `planNarrationRegeneration` consumers now pass the wide hash.
  - `NarrationManifestEntry` gains `durationSeconds?: number` (written by Task 9 after synthesis; absent for never-synthesized entries).
  - `ChapterNarration` becomes `{ slug: string; hash: string; charCount: number }` — callers hash *before* planning (the planner no longer hashes internally).

- [ ] **Step 1: Write the failing tests**

Append to `build/audio/narration-cache.test.ts`:

```ts
import { hashNarrationInputs } from './narration-cache.js';

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
```

Append to `build/audio/ssml-lexicon.test.ts`:

```ts
import { serializeIpaLexicon } from './ssml-lexicon.js';

describe('serializeIpaLexicon', () => {
  it('is deterministic and includes every acronym entry', () => {
    const s = serializeIpaLexicon();
    expect(s).toBe(serializeIpaLexicon());
    for (const acronym of ['HUD', 'FEMA', 'OSHA', 'SNAP']) {
      expect(s).toContain(acronym);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run build/audio/narration-cache.test.ts build/audio/ssml-lexicon.test.ts`
Expected: FAIL — functions not exported.

- [ ] **Step 3: Implement**

In `ssml-lexicon.ts` (adapt field names to the actual `ACRONYM_ENTRIES` shape — pattern + IPA value):

```ts
/**
 * Deterministic serialization of the acronym/IPA table for the narration
 * cache key. Serializing the entries themselves (not a version constant)
 * means "forgot to bump the version" cannot produce stale audio.
 */
export function serializeIpaLexicon(): string {
  return JSON.stringify(
    ACRONYM_ENTRIES.map((e) => [e.pattern.source, e.pattern.flags, e.ipa]),
  );
}
```

In `narration-cache.ts`:

```ts
export function hashNarrationInputs(
  narratableText: string,
  voiceMapSerialized: string,
  ipaLexiconSerialized: string,
): string {
  return createHash('sha256')
    .update(JSON.stringify([narratableText, voiceMapSerialized, ipaLexiconSerialized]))
    .digest('hex');
}
```

Change `ChapterNarration` to `{ slug: string; hash: string; charCount: number }`, delete the internal `hashNarratableText` call from `planNarrationRegeneration` (compare `chapter.hash` against `manifest[slug].hash` directly), and add `durationSeconds?: number` to `NarrationManifestEntry`. Update `findStaleManifestEntries` and `updateManifest` signatures to match. Update the existing narration-cache tests that construct `ChapterNarration` values (they now pass a precomputed hash).

In `build/scripts/narration-plan.ts`, replace the `narrated` mapping:

```ts
import { hashNarrationInputs } from '../audio/narration-cache.js';
import { serializeVoiceMap } from '../audio/voices.js';
import { serializeIpaLexicon } from '../audio/ssml-lexicon.js';

const voiceKey = serializeVoiceMap();
const lexiconKey = serializeIpaLexicon();
const narrated = chapters.map((chapter) => {
  const narratableText = injectWordFragments(chapter.html).narratableText;
  return {
    slug: chapter.meta.slug,
    hash: hashNarrationInputs(narratableText, voiceKey, lexiconKey),
    charCount: narratableText.length,
  };
});
```

- [ ] **Step 4: Run the full suite**

Run: `npx vitest run && npx tsc --noEmit`
Expected: ALL pass, no type errors (the planner's callers all updated).

- [ ] **Step 5: Commit**

```bash
git add build/audio/narration-cache.ts build/audio/narration-cache.test.ts build/audio/ssml-lexicon.ts build/audio/ssml-lexicon.test.ts build/scripts/narration-plan.ts
git commit -m "feat(audio): widen narration cache key to voices and IPA lexicon

A voice swap or lexicon edit must invalidate cached audio; hashing the
serialized inputs makes forgetting impossible.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: AVSpeech boundary adapter + fragment cross-check

**Files:**
- Create: `build/audio/avspeech-boundaries.ts`
- Test: `build/audio/avspeech-boundaries.test.ts`

**Interfaces:**
- Consumes: `WordBoundaryRecord`, `WordFragment` types (existing).
- Produces:
  - `interface AvspeechBoundary { text: string; textOffset: number; wordLength: number; clipBeginSeconds: number }`
  - `interface AvspeechBoundaryFile { totalDurationSeconds: number; boundaries: AvspeechBoundary[] }`
  - `function toWordBoundaryRecords(file: AvspeechBoundaryFile): WordBoundaryRecord[]`
  - `function crossCheckBoundaries(fragments: WordFragment[], boundaries: AvspeechBoundary[]): { matched: number; unmatched: AvspeechBoundary[] }` — a boundary "matches" when its `[textOffset, textOffset+wordLength)` range overlaps some fragment's `[charStart, charEnd)`. Task 9 fails a chapter when `unmatched.length / boundaries.length > 0.01`.

- [ ] **Step 1: Write the failing tests** (`build/audio/avspeech-boundaries.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { toWordBoundaryRecords, crossCheckBoundaries } from './avspeech-boundaries.js';
import type { AvspeechBoundaryFile } from './avspeech-boundaries.js';

const file: AvspeechBoundaryFile = {
  totalDurationSeconds: 2.5,
  boundaries: [
    { text: 'Hello', textOffset: 0, wordLength: 5, clipBeginSeconds: 0.1 },
    { text: 'world', textOffset: 6, wordLength: 5, clipBeginSeconds: 0.9 },
  ],
};

describe('toWordBoundaryRecords', () => {
  it('converts seconds to ticks and derives contiguous durations', () => {
    const records = toWordBoundaryRecords(file);
    expect(records).toEqual([
      { text: 'Hello', textOffset: 0, wordLength: 5, audioOffsetTicks: 1_000_000, durationTicks: 8_000_000 },
      { text: 'world', textOffset: 6, wordLength: 5, audioOffsetTicks: 9_000_000, durationTicks: 16_000_000 },
    ]);
  });
  it('handles an empty boundary list', () => {
    expect(toWordBoundaryRecords({ totalDurationSeconds: 0, boundaries: [] })).toEqual([]);
  });
});

describe('crossCheckBoundaries', () => {
  const fragments = [
    { id: 'w1', text: 'Hello', charStart: 0, charEnd: 5 },
    { id: 'w2', text: 'world', charStart: 6, charEnd: 11 },
  ];
  it('matches overlapping boundaries and reports the rest', () => {
    const { matched, unmatched } = crossCheckBoundaries(fragments, [
      ...file.boundaries,
      { text: 'ghost', textOffset: 50, wordLength: 5, clipBeginSeconds: 2.0 },
    ]);
    expect(matched).toBe(2);
    expect(unmatched.map((b) => b.text)).toEqual(['ghost']);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run build/audio/avspeech-boundaries.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** (`build/audio/avspeech-boundaries.ts`)

```ts
/**
 * Adapter from the `scripts/narrate` Swift CLI's boundary JSON to
 * smil.ts's WordBoundaryRecord shape.
 *
 * Markers carry no durations, so each word's clip runs to the next
 * word's clipBegin (the last to total duration) — contiguous clips are
 * what read-along SMIL wants; gaps would flicker the highlight off
 * between words.
 */
import type { WordBoundaryRecord } from './smil.js';
import type { WordFragment } from './word-fragments.js';

const TICKS_PER_SECOND = 10_000_000;

export interface AvspeechBoundary {
  text: string;
  /** UTF-16 offset into the chapter narratable text. */
  textOffset: number;
  wordLength: number;
  clipBeginSeconds: number;
}

export interface AvspeechBoundaryFile {
  totalDurationSeconds: number;
  boundaries: AvspeechBoundary[];
}

export function toWordBoundaryRecords(file: AvspeechBoundaryFile): WordBoundaryRecord[] {
  return file.boundaries.map((b, i) => {
    const next = file.boundaries[i + 1];
    const clipEndSeconds = next ? next.clipBeginSeconds : file.totalDurationSeconds;
    const audioOffsetTicks = Math.round(b.clipBeginSeconds * TICKS_PER_SECOND);
    return {
      text: b.text,
      textOffset: b.textOffset,
      wordLength: b.wordLength,
      audioOffsetTicks,
      durationTicks: Math.round(clipEndSeconds * TICKS_PER_SECOND) - audioOffsetTicks,
    };
  });
}

/**
 * #167's "validate real boundary output against fragment offsets", as a
 * permanent pipeline property: every boundary should overlap a fragment.
 * The caller applies the failure threshold.
 */
export function crossCheckBoundaries(
  fragments: WordFragment[],
  boundaries: AvspeechBoundary[],
): { matched: number; unmatched: AvspeechBoundary[] } {
  const unmatched: AvspeechBoundary[] = [];
  let matched = 0;
  let cursor = 0; // fragments and boundaries are both text-ordered
  for (const b of boundaries) {
    const end = b.textOffset + b.wordLength;
    while (cursor < fragments.length && fragments[cursor].charEnd <= b.textOffset) cursor++;
    const f = fragments[cursor];
    if (f && f.charStart < end && f.charEnd > b.textOffset) matched++;
    else unmatched.push(b);
  }
  return { matched, unmatched };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run build/audio/avspeech-boundaries.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add build/audio/avspeech-boundaries.ts build/audio/avspeech-boundaries.test.ts
git commit -m "feat(audio): AVSpeech boundary adapter and fragment cross-check

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: SpikeCore job/boundary types and offset math

**Files:**
- Create: `scripts/avspeech-spike/Sources/SpikeCore/NarrationJob.swift`
- Test: `scripts/avspeech-spike/Tests/SpikeCoreTests/NarrationJobTests.swift`

**Interfaces:**
- Consumes: existing `SpokenWordBoundary`, `reconcile`, `chunkText`.
- Produces (all `public`, in `SpikeCore` so they're testable):
  - `struct IpaRange: Codable { let start: Int; let length: Int; let notation: String }`
  - `struct NarrationSegment: Codable { let voiceId: String; let text: String; let ipa: [IpaRange] }`
  - `struct NarrationJob: Codable { let audioOutput: String; let segments: [NarrationSegment] }`
  - `struct ChapterBoundary: Codable { let text: String; let textOffset: Int; let wordLength: Int; let clipBeginSeconds: Double }`
  - `struct BoundaryOutput: Codable { let totalDurationSeconds: Double; let boundaries: [ChapterBoundary] }`
  - `func markerSeconds(byteOffset: Int, bytesPerFrame: Int, sampleRate: Double, accumulatedSeconds: Double) -> Double`
  - `func hasSpeakableContent(_ text: String) -> Bool` — true iff the text contains a letter or number (wordless segments are skipped entirely by the CLI: no synthesis, no markers, so the zero-marker ceiling canary is not tripped by punctuation-only segments).

- [ ] **Step 1: Write the failing tests** (`NarrationJobTests.swift`)

```swift
import XCTest
@testable import SpikeCore

final class NarrationJobTests: XCTestCase {
    func testJobRoundTripsThroughJSON() throws {
        let job = NarrationJob(
            audioOutput: "/tmp/ch.m4a",
            segments: [NarrationSegment(
                voiceId: "com.apple.voice.enhanced.en-US.Nathan",
                text: "HUD sent a letter.",
                ipa: [IpaRange(start: 0, length: 3, notation: "hʌd")])])
        let data = try JSONEncoder().encode(job)
        let decoded = try JSONDecoder().decode(NarrationJob.self, from: data)
        XCTAssertEqual(decoded.segments[0].ipa[0].notation, "hʌd")
        XCTAssertEqual(decoded.audioOutput, "/tmp/ch.m4a")
    }

    func testMarkerSecondsConvertsNativeBytesAndAddsAccumulated() {
        // 44100 Hz float32 mono: 4 bytes/frame. 88200 bytes = 22050 frames = 0.5 s.
        let s = markerSeconds(byteOffset: 88_200, bytesPerFrame: 4, sampleRate: 44_100, accumulatedSeconds: 10.0)
        XCTAssertEqual(s, 10.5, accuracy: 1e-9)
    }

    func testHasSpeakableContent() {
        XCTAssertTrue(hasSpeakableContent("Hello."))
        XCTAssertTrue(hasSpeakableContent("… 42 …"))
        XCTAssertFalse(hasSpeakableContent(" — … \n\n"))
        XCTAssertFalse(hasSpeakableContent(""))
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd scripts/avspeech-spike && swift test`
Expected: compile FAILURE — types not defined.

- [ ] **Step 3: Implement** (`Sources/SpikeCore/NarrationJob.swift`)

```swift
import Foundation

/// Job specification consumed by the `narrate` executable: one chapter,
/// ordered voice segments whose concatenated text is the chapter's
/// narratable text (the TS orchestrator guarantees and asserts this).
public struct IpaRange: Codable, Equatable {
    /// UTF-16 offsets into the segment's own text.
    public let start: Int
    public let length: Int
    public let notation: String
    public init(start: Int, length: Int, notation: String) {
        self.start = start; self.length = length; self.notation = notation
    }
}

public struct NarrationSegment: Codable, Equatable {
    public let voiceId: String
    public let text: String
    public let ipa: [IpaRange]
    public init(voiceId: String, text: String, ipa: [IpaRange]) {
        self.voiceId = voiceId; self.text = text; self.ipa = ipa
    }
}

public struct NarrationJob: Codable, Equatable {
    public let audioOutput: String
    public let segments: [NarrationSegment]
    public init(audioOutput: String, segments: [NarrationSegment]) {
        self.audioOutput = audioOutput; self.segments = segments
    }
}

public struct ChapterBoundary: Codable, Equatable {
    public let text: String
    /// UTF-16 offset into the whole chapter's narratable text.
    public let textOffset: Int
    public let wordLength: Int
    public let clipBeginSeconds: Double
    public init(text: String, textOffset: Int, wordLength: Int, clipBeginSeconds: Double) {
        self.text = text; self.textOffset = textOffset
        self.wordLength = wordLength; self.clipBeginSeconds = clipBeginSeconds
    }
}

public struct BoundaryOutput: Codable, Equatable {
    public let totalDurationSeconds: Double
    public let boundaries: [ChapterBoundary]
    public init(totalDurationSeconds: Double, boundaries: [ChapterBoundary]) {
        self.totalDurationSeconds = totalDurationSeconds; self.boundaries = boundaries
    }
}

/// Marker byte offsets are relative to the *native* PCM stream of the
/// chunk that produced them; audio accumulates in the converted output
/// format. Converting to seconds at the native rate before adding the
/// accumulated output time keeps the two clocks consistent.
public func markerSeconds(byteOffset: Int, bytesPerFrame: Int, sampleRate: Double, accumulatedSeconds: Double) -> Double {
    accumulatedSeconds + Double(byteOffset) / Double(bytesPerFrame) / sampleRate
}

/// Wordless segments (pure punctuation/whitespace between voice spans)
/// are skipped by the CLI — synthesizing them would trip the zero-marker
/// ceiling canary, and there is nothing to say.
public func hasSpeakableContent(_ text: String) -> Bool {
    text.unicodeScalars.contains { CharacterSet.alphanumerics.contains($0) }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd scripts/avspeech-spike && swift test`
Expected: all tests pass (existing 12 + new 3).

- [ ] **Step 5: Commit**

```bash
git add scripts/avspeech-spike/Sources/SpikeCore/NarrationJob.swift scripts/avspeech-spike/Tests/SpikeCoreTests/NarrationJobTests.swift
git commit -m "feat(tts): SpikeCore narration job types and offset math

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: The `narrate` Swift executable

**Files:**
- Modify: `scripts/avspeech-spike/Package.swift` (add executable target)
- Create: `scripts/avspeech-spike/Sources/narrate/main.swift`
- Create: `scripts/avspeech-spike/fixtures/narrate-job-sample.json`
- Modify: `scripts/avspeech-spike/README.md` (document the new executable)

**Interfaces:**
- Consumes: everything from Task 7; `chunkText`, `reconcile`, `SpokenWordBoundary` from SpikeCore; patterns from the spike's `main.swift` (marker collection via `write(_:toBufferCallback:toMarkerCallback:)`).
- Produces: `swift run narrate <job.json>` → writes AAC `.m4a` to `job.audioOutput`, prints `BoundaryOutput` JSON to **stdout** (progress/diagnostics to stderr only), exits non-zero on any validation failure. This is the exact contract Task 9 shells out to.

Key behaviors (each mirrors the spec):
1. Resolve each segment's voice with `AVSpeechSynthesisVoice(identifier:)`; a nil result is a hard error that prints installed voice identifiers to stderr.
2. Skip segments where `!hasSpeakableContent(text)` — they advance text offsets (their UTF-16 length still counts) but produce no audio and no markers.
3. Per segment: `chunkText(text, maxUTF16Length: 1800)`; per chunk build an `NSAttributedString` applying `AVSpeechSynthesisIPANotationAttribute` for each `IpaRange` intersecting the chunk (range shifted by chunk start); synthesize collecting buffers + markers.
4. Convert every buffer to the target format (`AVAudioFormat(commonFormat: .pcmFormatFloat32, sampleRate: 44_100, channels: 1, interleaved: false)`) with `AVAudioConverter`; write to a single `AVAudioFile` opened once with AAC settings `[AVFormatIDKey: kAudioFormatMPEG4AAC, AVSampleRateKey: 44_100, AVNumberOfChannelsKey: 1, AVEncoderBitRateKey: 96_000]`.
5. Marker → whole-chapter coordinates: text = `marker.textRange.location + chunkStart + segmentStartUtf16`; audio = `markerSeconds(byteOffset:bytesPerFrame:sampleRate:accumulatedSeconds:)` where `bytesPerFrame`/`sampleRate` are the chunk's **native** format and `accumulatedSeconds` is output frames written before this chunk ÷ 44100. Feed `reconcile` with `SpokenWordBoundary(range: shiftedRange, byteOffset: Int(seconds * 10_000_000))` (ticks — reconcile only needs a monotonic Int axis).
6. Zero word markers from a speakable chunk → hard error (ceiling canary). After all segments: run the spike's validation on the reconciled list (in range of total text length, non-overlapping, text- and audio-monotonic); print reconciliation counts to stderr; exit non-zero on failure.

- [ ] **Step 1: Add the target** (`Package.swift`)

```swift
.executableTarget(
    name: "narrate",
    dependencies: ["SpikeCore"],
    path: "Sources/narrate"),
```

- [ ] **Step 2: Write the fixture job** (`fixtures/narrate-job-sample.json`)

```json
{
  "audioOutput": "dist/tts-spike/narrate-sample.m4a",
  "segments": [
    { "voiceId": "com.apple.voice.enhanced.en-US.Nathan",
      "text": "The lesson: documents have a geometry. ",
      "ipa": [] },
    { "voiceId": "com.apple.voice.premium.en-GB.Malcolm",
      "text": "One observes that HUD has already published the relevant guidance.",
      "ipa": [{ "start": 18, "length": 3, "notation": "hʌd" }] }
  ]
}
```

(Offset check for reviewers: in the second segment, "HUD" starts at UTF-16 offset 18.)

- [ ] **Step 3: Implement** (`Sources/narrate/main.swift`)

Structure (complete logic; error-message wording free):

```swift
import AVFoundation
import Foundation
import SpikeCore

func eprint(_ m: String) { FileHandle.standardError.write((m + "\n").data(using: .utf8)!) }
func die(_ m: String) -> Never { eprint("narrate: error: \(m)"); exit(1) }

// ── Parse job ────────────────────────────────────────────────────────
guard CommandLine.arguments.count == 2 else { die("usage: narrate <job.json>") }
let jobURL = URL(fileURLWithPath: CommandLine.arguments[1])
let job: NarrationJob
do { job = try JSONDecoder().decode(NarrationJob.self, from: Data(contentsOf: jobURL)) }
catch { die("cannot read job: \(error.localizedDescription)") }

// ── Resolve voices up front ──────────────────────────────────────────
var voices: [String: AVSpeechSynthesisVoice] = [:]
for segment in job.segments where voices[segment.voiceId] == nil {
    guard let v = AVSpeechSynthesisVoice(identifier: segment.voiceId) else {
        eprint("Voice not installed: \(segment.voiceId). Installed voices:")
        for v in AVSpeechSynthesisVoice.speechVoices() where v.language.hasPrefix("en") {
            eprint("  \(v.identifier)")
        }
        die("download the voice in System Settings → Accessibility → Spoken Content")
    }
    voices[segment.voiceId] = v
}

// ── Output file (AAC .m4a), converter state ──────────────────────────
let outURL = URL(fileURLWithPath: job.audioOutput)
try? FileManager.default.createDirectory(at: outURL.deletingLastPathComponent(), withIntermediateDirectories: true)
let targetFormat = AVAudioFormat(commonFormat: .pcmFormatFloat32, sampleRate: 44_100, channels: 1, interleaved: false)!
let aacSettings: [String: Any] = [
    AVFormatIDKey: kAudioFormatMPEG4AAC, AVSampleRateKey: 44_100,
    AVNumberOfChannelsKey: 1, AVEncoderBitRateKey: 96_000,
]
var audioFile: AVAudioFile? = nil // opened lazily on first buffer
var framesWritten: AVAudioFramePosition = 0
var converters: [String: AVAudioConverter] = [:] // keyed by native-format description

func writeConverted(_ pcm: AVAudioPCMBuffer) throws {
    if audioFile == nil {
        audioFile = try AVAudioFile(forWriting: outURL, settings: aacSettings,
                                    commonFormat: .pcmFormatFloat32, interleaved: false)
    }
    let native = pcm.format
    let out: AVAudioPCMBuffer
    if native == targetFormat {
        out = pcm
    } else {
        let key = native.description
        let converter = converters[key] ?? AVAudioConverter(from: native, to: targetFormat)!
        converters[key] = converter
        let capacity = AVAudioFrameCount(Double(pcm.frameLength) * targetFormat.sampleRate / native.sampleRate) + 64
        out = AVAudioPCMBuffer(pcmFormat: targetFormat, frameCapacity: capacity)!
        var fed = false
        var convError: NSError?
        converter.convert(to: out, error: &convError) { _, status in
            if fed { status.pointee = .noDataNow; return nil }
            fed = true; status.pointee = .haveData; return pcm
        }
        if let convError { throw convError }
    }
    try audioFile!.write(from: out)
    framesWritten += AVAudioFramePosition(out.frameLength)
}

// ── Synthesize ───────────────────────────────────────────────────────
let synthesizer = AVSpeechSynthesizer()
var allMarkers: [SpokenWordBoundary] = []
var segmentStart = 0 // UTF-16 offset of the current segment in chapter text
var totalCounts = (dupes: 0, merges: 0, drops: 0)

for segment in job.segments {
    defer { segmentStart += (segment.text as NSString).length }
    guard hasSpeakableContent(segment.text) else { continue }
    let voice = voices[segment.voiceId]!
    var segmentMarkers: [SpokenWordBoundary] = []

    for chunk in chunkText(segment.text, maxUTF16Length: 1800) {
        guard hasSpeakableContent(chunk.text) else { continue }
        let accumulatedSeconds = Double(framesWritten) / targetFormat.sampleRate
        let attributed = NSMutableAttributedString(string: chunk.text)
        for r in segment.ipa {
            let chunkRange = NSRange(location: r.start - chunk.startOffset, length: r.length)
            if chunkRange.location >= 0,
               chunkRange.location + chunkRange.length <= (chunk.text as NSString).length {
                attributed.addAttribute(.init(AVSpeechSynthesisIPANotationAttribute),
                                        value: r.notation, range: chunkRange)
            }
        }
        let utterance = AVSpeechUtterance(attributedString: attributed)
        utterance.voice = voice

        // Collect synchronously via semaphore — mirror the spike's driver:
        // write(_:toBufferCallback:toMarkerCallback:), buffers → writeConverted,
        // markers appended with native-format bookkeeping for markerSeconds.
        var chunkWordMarkers = 0
        var nativeFormat: AVAudioFormat? = nil
        let done = DispatchSemaphore(value: 0)
        var failure: Error? = nil
        synthesizer.write(utterance, toBufferCallback: { buffer in
            guard let pcm = buffer as? AVAudioPCMBuffer else {
                failure = NSError(domain: "narrate", code: 1,
                    userInfo: [NSLocalizedDescriptionKey: "unexpected buffer type"]); done.signal(); return
            }
            if pcm.frameLength == 0 { done.signal(); return } // end of utterance
            nativeFormat = pcm.format
            do { try writeConverted(pcm) } catch { failure = error; done.signal() }
        }, toMarkerCallback: { markers in
            guard let native = nativeFormat ?? markersNativeFormatFallback() else { return }
            let bytesPerFrame = Int(native.streamDescription.pointee.mBytesPerFrame)
            for marker in markers where marker.mark == .word {
                chunkWordMarkers += 1
                let seconds = markerSeconds(byteOffset: marker.byteSampleOffset,
                                            bytesPerFrame: bytesPerFrame,
                                            sampleRate: native.sampleRate,
                                            accumulatedSeconds: accumulatedSeconds)
                let shifted = NSRange(location: marker.textRange.location + chunk.startOffset + segmentStart,
                                      length: marker.textRange.length)
                segmentMarkers.append(SpokenWordBoundary(range: shifted,
                                                         byteOffset: Int(seconds * 10_000_000)))
            }
        })
        done.wait()
        if let failure { die("synthesis failed: \(failure.localizedDescription)") }
        if chunkWordMarkers == 0 {
            die("ceiling canary: chunk at \(chunk.startOffset) (+\(segmentStart)) produced zero word markers")
        }
    }

    let result = reconcile(segmentMarkers)
    totalCounts.dupes += result.duplicatesCollapsed
    totalCounts.merges += result.overlapsMerged
    totalCounts.drops += result.regressionsDropped
    allMarkers.append(contentsOf: result.boundaries)
}
```

**Implementation notes for the engineer** (these matter):
- The buffer/marker callback ordering, semaphore discipline, and the `frameLength == 0` end-of-utterance sentinel should be copied from the working spike `main.swift` (lines ~140–200) — including its run-loop handling. The spike is the reference implementation for "how to drive `write(...)` without deadlocking" (that deadlock was #174; don't rediscover it). If the spike signals completion differently (e.g. via a final zero-length buffer *and* a completion path), mirror it exactly.
- `markersNativeFormatFallback()` in the sketch stands for "markers can arrive before the first buffer": handle by deferring marker processing until native format is known — buffer the raw markers per chunk and convert after synthesis completes. The spike's ordering evidence says buffers arrive first in practice; the deferred conversion makes it correct either way.
- `AVSpeechSynthesisIPANotationAttribute` string: the spike's IPA path already uses the right attribute constant — copy from it.
- The final `BoundaryOutput` prints to stdout: convert each reconciled `SpokenWordBoundary` back to `ChapterBoundary(text: substring of chapter text, textOffset: range.location, wordLength: range.length, clipBeginSeconds: Double(byteOffset) / 10_000_000)`, `totalDurationSeconds = Double(framesWritten) / 44_100`. Chapter text = concatenation of segment texts.
- Validation before printing: boundaries within total UTF-16 length, non-overlapping, both axes monotonic (reuse the spike's check logic; extract into SpikeCore if that's cleaner than duplicating — implementer's choice, but tests stay green).

- [ ] **Step 4: Verify with the fixture (local Mac, voices installed)**

```bash
cd scripts/avspeech-spike
swift run narrate fixtures/narrate-job-sample.json > /tmp/narrate-out.json
echo "exit: $?"
python3 -c "import json;d=json.load(open('/tmp/narrate-out.json'));print(d['totalDurationSeconds'], len(d['boundaries']))"
ls -la dist/tts-spike/narrate-sample.m4a
```

Expected: exit 0; ~18 boundaries; duration > 5 s; `.m4a` exists and plays (spot-listen: Nathan then Jamie, "HUD" as one syllable). `textOffset` of the first Jamie boundary ≥ 39 (the first segment's UTF-16 length).

- [ ] **Step 5: Update the spike README** — add a `## narrate` section: the job JSON contract, stdout/stderr split, exit codes, and that wordless segments are skipped by design.

- [ ] **Step 6: Run Swift tests still green**

Run: `swift test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add Package.swift Sources/narrate/ fixtures/narrate-job-sample.json README.md
git commit -m "feat(tts): narrate executable — multi-voice chapter synthesis to m4a

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: `npm run narrate` orchestrator

**Files:**
- Create: `build/scripts/narrate.ts`
- Modify: `package.json` (add script `"narrate": "tsc && node dist/build/scripts/narrate.js"`)
- Modify: `.gitignore` (add `.cache/`)
- Test: live single-chapter run (Step 4); the pure logic is already unit-tested in Tasks 4–6.

**Interfaces:**
- Consumes: pipeline render prep (copy the exact pattern from `build/scripts/narration-plan.ts`: `discoverBriefs`/`prepareArtContext`/`discoverChapters`/`processChapterFromSource`/`buildRefRegistry`); `injectWordFragments`, `announceIllustrations`; `segmentVoices` (Task 4); `VOICE_MAP`, `serializeVoiceMap` (Task 3); `hashNarrationInputs`, `planNarrationRegeneration`, `updateManifest` (Task 5); `findIpaMatches`, `serializeIpaLexicon` (existing/Task 5); `crossCheckBoundaries` (Task 6); the `narrate` CLI (Task 8).
- Produces: `.cache/narration/<slug>/chapter.m4a` + `.cache/narration/<slug>/boundaries.json` (the CLI's `BoundaryOutput` verbatim) per synthesized chapter; updated `src/audio/manifest.json` entries `{ hash, charCount, durationSeconds }`. CLI flags: `--chapter <substring>` (filter), `--dry-run` (plan only, like `narration:plan`).

- [ ] **Step 1: Implement** (`build/scripts/narrate.ts`)

```ts
#!/usr/bin/env node
/**
 * `npm run narrate` — synthesize stale chapters' narration via the
 * scripts/avspeech-spike `narrate` executable (AVSpeech, local Mac only).
 *
 * Per the 2026-07-30 audiobook pipeline spec: incremental (manifest hash
 * = narratable text + voice map + IPA lexicon), abort-safe (manifest
 * updates only after a chapter fully validates), fail-loud (any CLI or
 * cross-check failure stops the run).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
// ...pipeline imports exactly as in narration-plan.ts...
import { injectWordFragments } from '../audio/word-fragments.js';
import { announceIllustrations } from '../audio/narrate-images.js';
import { segmentVoices } from '../audio/voice-segments.js';
import { VOICE_MAP, serializeVoiceMap } from '../audio/voices.js';
import { hashNarrationInputs, planNarrationRegeneration, updateManifest } from '../audio/narration-cache.js';
import { findIpaMatches, serializeIpaLexicon } from '../audio/ssml-lexicon.js';
import { crossCheckBoundaries } from '../audio/avspeech-boundaries.js';
import type { AvspeechBoundaryFile } from '../audio/avspeech-boundaries.js';

const CACHE_DIR = join(ROOT, '.cache', 'narration');
const MANIFEST_PATH = join(ROOT, 'src', 'audio', 'manifest.json');
const SPIKE_DIR = join(ROOT, 'scripts', 'avspeech-spike');
const UNMATCHED_THRESHOLD = 0.01;

const args = process.argv.slice(2);
const chapterFilter = args.includes('--chapter') ? args[args.indexOf('--chapter') + 1] : null;
const dryRun = args.includes('--dry-run');

async function main(): Promise<void> {
  // 1. Render chapters (identical prep to narration-plan.ts).
  //    For each chapter compute:
  const prepared = chapters.map((chapter) => {
    const narratedHtml = announceIllustrations(chapter.html);
    const { narratableText, fragments } = injectWordFragments(narratedHtml);
    const segments = segmentVoices(narratedHtml);
    const joined = segments.map((s) => s.text).join('');
    if (joined !== narratableText) {
      throw new Error(
        `${chapter.meta.slug}: segmenter invariant violated ` +
        `(segments ${joined.length} chars vs narratable ${narratableText.length})`,
      );
    }
    return { slug: chapter.meta.slug, narratableText, fragments, segments };
  });

  // 2. Plan against the manifest with the widened hash.
  const voiceKey = serializeVoiceMap();
  const lexiconKey = serializeIpaLexicon();
  const manifest = loadManifest(); // same try/catch-empty as narration-plan.ts
  const plan = planNarrationRegeneration(
    prepared.map((p) => ({
      slug: p.slug,
      hash: hashNarrationInputs(p.narratableText, voiceKey, lexiconKey),
      charCount: p.narratableText.length,
    })),
    manifest,
  );
  let work = plan.filter((p) => p.reason !== 'unchanged');
  if (chapterFilter) work = work.filter((p) => p.slug.includes(chapterFilter));
  console.log(`${work.length} chapter(s) to synthesize${dryRun ? ' (dry run)' : ''}`);
  if (dryRun || work.length === 0) return;

  // 3. Build the Swift CLI once, in release mode.
  execFileSync('swift', ['build', '-c', 'release', '--product', 'narrate'], {
    cwd: SPIKE_DIR, stdio: 'inherit',
  });
  const narrateBin = join(SPIKE_DIR, '.build', 'release', 'narrate');

  // 4. Synthesize each stale chapter; update manifest only after validation.
  for (const entry of work) {
    const p = prepared.find((c) => c.slug === entry.slug)!;
    const outDir = join(CACHE_DIR, p.slug);
    mkdirSync(outDir, { recursive: true });
    const jobPath = join(outDir, 'job.json');
    writeFileSync(jobPath, JSON.stringify({
      audioOutput: join(outDir, 'chapter.m4a'),
      segments: p.segments.map((s) => ({
        voiceId: VOICE_MAP[s.role].identifier,
        text: s.text,
        ipa: findIpaMatches(s.text).map((m) => ({
          start: m.charStart, length: m.charEnd - m.charStart, notation: m.ipa,
        })),
      })),
    }));

    console.log(`  synthesizing ${p.slug} (${entry.charCount} chars)…`);
    const stdout = execFileSync(narrateBin, [jobPath], { maxBuffer: 64 * 1024 * 1024 });
    const boundaries = JSON.parse(stdout.toString()) as AvspeechBoundaryFile;

    const { matched, unmatched } = crossCheckBoundaries(p.fragments, boundaries.boundaries);
    const total = boundaries.boundaries.length;
    if (total === 0 || unmatched.length / total > UNMATCHED_THRESHOLD) {
      throw new Error(
        `${p.slug}: boundary/fragment cross-check failed — ` +
        `${unmatched.length}/${total} unmatched (threshold ${UNMATCHED_THRESHOLD})`,
      );
    }
    writeFileSync(join(outDir, 'boundaries.json'), JSON.stringify(boundaries));

    const updated = updateManifest(loadManifest(), p.slug, {
      hash: hashNarrationInputs(p.narratableText, voiceKey, lexiconKey),
      charCount: p.narratableText.length,
      durationSeconds: boundaries.totalDurationSeconds,
    });
    mkdirSync(join(ROOT, 'src', 'audio'), { recursive: true });
    writeFileSync(MANIFEST_PATH, JSON.stringify(updated, null, 2) + '\n');
    console.log(`  ✓ ${p.slug}: ${matched}/${total} boundaries matched, ` +
      `${(boundaries.totalDurationSeconds / 60).toFixed(1)} min`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
```

(Adapt `updateManifest`'s exact signature from Task 5's final form; if it mutates or returns, follow the Task 5 tests. The `loadManifest` helper is the same 5-liner as `narration-plan.ts`.)

- [ ] **Step 2: Wire the npm script and gitignore**

`package.json` scripts: `"narrate": "tsc && node dist/build/scripts/narrate.js"`.
`.gitignore`: add a `.cache/` line.

- [ ] **Step 3: Type-check and full TS suite**

Run: `npx tsc --noEmit && npx vitest run`
Expected: clean.

- [ ] **Step 4: Live verification — dry run, then one chapter**

```bash
npm run narrate -- --dry-run
```
Expected: lists all 45 chapters as `new` (manifest empty/stale).

```bash
npm run narrate -- --chapter 04-home
```
Expected: builds the Swift CLI, synthesizes one chapter in a few minutes, prints the ✓ line with a boundary-match count near 100% and ~55–60 min duration; `.cache/narration/<slug>/chapter.m4a` + `boundaries.json` exist; `src/audio/manifest.json` has exactly one entry. Re-running the same command prints `0 chapter(s) to synthesize` (cache hit).

- [ ] **Step 5: Commit**

```bash
git add build/scripts/narrate.ts package.json .gitignore src/audio/manifest.json
git commit -m "feat(audio): npm run narrate — incremental multi-voice chapter synthesis

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: Media Overlay support in OPF templates and assembly

**Files:**
- Modify: `build/epub/templates.ts` (`contentOpf` gains an optional overlays parameter)
- Modify: `build/epub/assemble.ts` (`assembleEpub` gains optional overlay files + info)
- Modify: `src/styles/epub.css` (highlight rule)
- Test: `build/epub/templates.test.ts` (create if absent — `contentOpf` is a pure string builder, ideal for unit tests)

**Interfaces:**
- Consumes: existing `contentOpf(meta, chapters, hasCover, imageFiles)` / `assembleEpub(meta, chapters, cssPath, imagesDir, outputPath)`; `formatClockValue` from `build/audio/smil.ts`.
- Produces:
  - `interface ChapterOverlay { smilHref: string; audioHref: string; durationSeconds: number }` (exported from `templates.ts`)
  - `interface MediaOverlayInfo { bySlug: Map<string, ChapterOverlay>; narrator: string; activeClass: string }`
  - `contentOpf(meta, chapters, hasCover, imageFiles?, overlays?: MediaOverlayInfo)` — when `overlays` present: package `prefix` gains `media: http://www.idpf.org/epub/vocab/overlays/#`; each chapter item with an overlay gains `media-overlay="smil-<slug>"`; manifest gains `<item id="smil-<slug>" href="<smilHref>" media-type="application/smil+xml"/>` and `<item id="audio-<slug>" href="<audioHref>" media-type="audio/mp4"/>`; metadata gains `<meta property="media:duration" refines="#smil-<slug>">` per chapter (SMIL clock format via `formatClockValue`), a total `<meta property="media:duration">`, `<meta property="media:narrator">`, `<meta property="media:active-class">`, `<meta property="schema:accessMode">auditory</meta>`, and `<meta property="schema:accessibilityFeature">synchronizedAudioText</meta>`.
  - `assembleEpub(meta, chapters, cssPath, imagesDir, outputPath, overlays?: MediaOverlayInfo, overlayFiles?: Array<{ path: string; data: Buffer | string }>)` — overlay files (audio buffers, SMIL strings) are added to the zip at `OEBPS/<path>`; `overlays` is threaded to `contentOpf`.
- No behavior change when the new parameters are omitted — the text edition build (`build/index.ts`) is untouched.

- [ ] **Step 1: Write the failing tests** (`build/epub/templates.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { contentOpf } from './templates.js';
import { BOOK_META } from '../types.js';
import type { ProcessedChapter } from '../types.js';

const chapters = [
  { meta: { slug: 'ch-one', title: 'One' }, html: '<p>x</p>' },
  { meta: { slug: 'ch-two', title: 'Two' }, html: '<p>y</p>' },
] as unknown as ProcessedChapter[];

const overlays = {
  bySlug: new Map([
    ['ch-one', { smilHref: 'smil/ch-one.smil', audioHref: 'audio/ch-one.m4a', durationSeconds: 90 }],
  ]),
  narrator: 'Nathan (Enhanced) & Jamie (Premium)',
  activeClass: 'media-overlay-active',
};

describe('contentOpf with media overlays', () => {
  const opf = contentOpf(BOOK_META, chapters, false, [], overlays);

  it('declares the media prefix and per-chapter overlay wiring', () => {
    expect(opf).toContain('media: http://www.idpf.org/epub/vocab/overlays/#');
    expect(opf).toContain('media-overlay="smil-ch-one"');
    expect(opf).toContain('<item id="smil-ch-one" href="smil/ch-one.smil" media-type="application/smil+xml"/>');
    expect(opf).toContain('<item id="audio-ch-one" href="audio/ch-one.m4a" media-type="audio/mp4"/>');
    // ch-two has no overlay: no attribute, no items
    expect(opf).not.toContain('media-overlay="smil-ch-two"');
  });

  it('emits durations, narrator, active class, and a11y metadata', () => {
    expect(opf).toContain('<meta property="media:duration" refines="#smil-ch-one">0:01:30.000</meta>');
    expect(opf).toContain('<meta property="media:duration">0:01:30.000</meta>'); // total
    expect(opf).toContain('<meta property="media:narrator">Nathan (Enhanced) &amp; Jamie (Premium)</meta>');
    expect(opf).toContain('<meta property="media:active-class">media-overlay-active</meta>');
    expect(opf).toContain('<meta property="schema:accessMode">auditory</meta>');
    expect(opf).toContain('<meta property="schema:accessibilityFeature">synchronizedAudioText</meta>');
  });

  it('is unchanged when overlays are omitted', () => {
    const plain = contentOpf(BOOK_META, chapters, false, []);
    expect(plain).not.toContain('media-overlay');
    expect(plain).not.toContain('media:duration');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run build/epub/templates.test.ts`
Expected: FAIL — `contentOpf` doesn't accept a fifth argument / assertions unmet.

- [ ] **Step 3: Implement**

In `templates.ts`: add the two interfaces; in `contentOpf`, when `overlays` is present, build `chapterItems` with the conditional `media-overlay` attribute, append smil/audio `<item>`s for each `bySlug` entry, compute `totalDurationSeconds` as the sum over `bySlug` values, and insert the metadata block (durations via `formatClockValue(seconds)` imported from `../audio/smil.js`; narrator and active-class escaped with the module's existing `escapeXml`). Add `auditory` access mode and `synchronizedAudioText` feature only in the overlay branch.

In `assemble.ts`: append parameters `overlays?: MediaOverlayInfo, overlayFiles: Array<{ path: string; data: Buffer | string }> = []`; after images are collected, `for (const f of overlayFiles) zip.file(`OEBPS/${f.path}`, f.data);` and pass `overlays` through to `contentOpf`.

In `src/styles/epub.css`, append:

```css
/* EPUB 3 Media Overlays: reading systems apply this class (declared as
   media:active-class in the OPF) to the word currently being spoken. */
.media-overlay-active {
  background-color: #ffe9a8;
  border-radius: 0.15em;
}
```

- [ ] **Step 4: Run tests to verify they pass, plus the full suite**

Run: `npx vitest run && npx tsc --noEmit`
Expected: all green — including every pre-existing assemble/templates consumer (optional params, no call-site changes).

- [ ] **Step 5: Commit**

```bash
git add build/epub/templates.ts build/epub/templates.test.ts build/epub/assemble.ts src/styles/epub.css
git commit -m "feat(epub): Media Overlay support in OPF assembly (opt-in)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: `npm run build:audiobook` packager

**Files:**
- Create: `build/scripts/build-audiobook.ts`
- Modify: `package.json` (add `"build:audiobook": "tsc && node dist/build/scripts/build-audiobook.js"`)

**Interfaces:**
- Consumes: pipeline render prep (same as Tasks 9); `injectWordFragments`, `announceIllustrations`, `segmentVoices` not needed here; `buildSmil`, `groupEscapableFragments` (existing); `toWordBoundaryRecords` (Task 6); `hashNarrationInputs`, `serializeVoiceMap`, `serializeIpaLexicon` (Tasks 3/5); `assembleEpub` + `MediaOverlayInfo` (Task 10); `.cache/narration/` + `src/audio/manifest.json` (Task 9).
- Produces: `dist/majordomo-audio.epub`. Flag: `--allow-missing` (dev only) packages chapters lacking valid narration *without* overlays instead of failing — the error/warning names each one.

- [ ] **Step 1: Implement** (`build/scripts/build-audiobook.ts`)

```ts
#!/usr/bin/env node
/**
 * `npm run build:audiobook` — assemble dist/majordomo-audio.epub, the
 * read-along edition: the text edition plus per-chapter audio and SMIL
 * Media Overlays. Refuses to package stale narration (highlighting that
 * drifts is worse than none — #161). `--allow-missing` (dev only)
 * packages un-narrated chapters without overlays instead of failing.
 */
// ...imports per the Interfaces block above...

const CACHE_DIR = join(ROOT, '.cache', 'narration');
const OUTPUT_PATH = join(ROOT, 'dist', 'majordomo-audio.epub');
const allowMissing = process.argv.includes('--allow-missing');

async function main(): Promise<void> {
  // 1. Render chapters exactly as build/index.ts does for the text
  //    edition — including the fragment-id injection step:
  //    html: injectWordFragments(announceIllustrations(chapter.html)).html
  //    Keep the pre-injection narratedHtml too; both are needed below.

  const voiceKey = serializeVoiceMap();
  const lexiconKey = serializeIpaLexicon();
  const manifest = loadManifest();

  const bySlug = new Map<string, ChapterOverlay>();
  const overlayFiles: Array<{ path: string; data: Buffer | string }> = [];
  const missing: string[] = [];

  for (const chapter of processedChapters) {
    const slug = chapter.meta.slug;
    const narratedHtml = announceIllustrations(chapter.rawHtml); // pre-injection html
    const { narratableText, fragments } = injectWordFragments(narratedHtml);
    const expectedHash = hashNarrationInputs(narratableText, voiceKey, lexiconKey);
    const entry = manifest[slug];
    const audioPath = join(CACHE_DIR, slug, 'chapter.m4a');
    const boundariesPath = join(CACHE_DIR, slug, 'boundaries.json');

    if (!entry || entry.hash !== expectedHash || !existsSync(audioPath) || !existsSync(boundariesPath)) {
      missing.push(slug);
      continue;
    }

    const boundaryFile = JSON.parse(readFileSync(boundariesPath, 'utf-8')) as AvspeechBoundaryFile;
    const smil = buildSmil(
      fragments,
      toWordBoundaryRecords(boundaryFile),
      { chapterId: slug, textSrc: `../text/${slug}.xhtml`, audioSrc: `../audio/${slug}.m4a` },
      groupEscapableFragments(injectWordFragments(narratedHtml).html),
    );
    overlayFiles.push({ path: `smil/${slug}.smil`, data: smil });
    overlayFiles.push({ path: `audio/${slug}.m4a`, data: readFileSync(audioPath) });
    bySlug.set(slug, {
      smilHref: `smil/${slug}.smil`,
      audioHref: `audio/${slug}.m4a`,
      durationSeconds: entry.durationSeconds ?? boundaryFile.totalDurationSeconds,
    });
  }

  if (missing.length > 0 && !allowMissing) {
    throw new Error(
      `${missing.length} chapter(s) lack current narration (run \`npm run narrate\`): ${missing.join(', ')}`,
    );
  }
  if (missing.length > 0) {
    console.warn(`⚠ packaging ${missing.length} chapter(s) without overlays: ${missing.join(', ')}`);
  }

  await assembleEpub(BOOK_META, processedChapters, CSS_PATH, IMAGES_DIR, OUTPUT_PATH, {
    bySlug,
    narrator: 'Nathan (Enhanced) & Jamie (Premium)',
    activeClass: 'media-overlay-active',
  }, overlayFiles);
  console.log(`✓ ${OUTPUT_PATH} — ${bySlug.size}/${processedChapters.length} chapters with read-along audio`);
}

main().catch((err) => { console.error(err); process.exit(1); });
```

**Path note:** SMIL files live at `OEBPS/smil/`, chapters at `OEBPS/text/`, audio at `OEBPS/audio/` — hence the `../text/` and `../audio/` relative refs inside SMIL, but plain `smil/`/`audio/` hrefs in the OPF (which lives at `OEBPS/content.opf`). EPUBCheck validates all of these; if it complains, the refs are what to inspect first.

**buildSmil inputs note:** `groupEscapableFragments` expects the *fragment-injected* HTML (its groups reference `w{n}` ids), while `fragments` come from the same `injectWordFragments` call — call it once and reuse both outputs rather than the double call shown in the sketch.

- [ ] **Step 2: Type-check + full suite**

Run: `npx tsc --noEmit && npx vitest run`
Expected: clean.

- [ ] **Step 3: Live verification — partial audiobook (one narrated chapter from Task 9)**

```bash
npm run build:audiobook
```
Expected: hard error naming 44 chapters, telling you to run `npm run narrate`.

```bash
npm run build:audiobook -- --allow-missing
```
Expected: warning, then `✓ dist/majordomo-audio.epub — 1/45 chapters with read-along audio`.

- [ ] **Step 4: EPUBCheck the audiobook edition**

Run: `npx tsx build/scripts/epubcheck.ts dist/majordomo-audio.epub` — check how `npm run check:epub` invokes EPUBCheck first (`package.json`) and reuse that invocation against `dist/majordomo-audio.epub`; needs Java 11+.
Expected: **0 fatals / 0 errors** (same bar as the text edition). Media-overlay warnings about un-narrated chapters are acceptable only in `--allow-missing` dev builds.

- [ ] **Step 5: Commit**

```bash
git add build/scripts/build-audiobook.ts package.json
git commit -m "feat(audio): build:audiobook — the read-along ePub edition (#167)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 12: Acceptance — full narration, Apple Books, release prep

**Files:**
- Modify: `package.json` + `package-lock.json` (minor version bump)
- Modify: `docs/superpowers/specs/2026-07-30-audiobook-pipeline-design.md` only if reality diverged (spec-vs-content conflicts are fixed, not left — CLAUDE.md rule).

**Interfaces:** none new — this task proves the whole chain.

- [ ] **Step 1: Narrate the full book** (long-running, ~35+ min synthesis)

```bash
npm run narrate
```
Expected: 45/45 chapters synthesized (44 new + the Task 9 chapter already cached), each with ✓ and a boundary-match rate near 100%; `src/audio/manifest.json` has 45 entries with durations. Total duration should land in the ~16–19 h neighborhood.

- [ ] **Step 2: Build the complete audiobook**

```bash
npm run build:audiobook
```
Expected: `✓ dist/majordomo-audio.epub — 45/45 chapters with read-along audio`; file size in the several-hundred-MB range.

- [ ] **Step 3: EPUBCheck + Ace**

Run the repo's EPUBCheck invocation against `dist/majordomo-audio.epub` (0 fatals/errors required) and `npm run check:a11y` if it accepts a path argument (see `package.json`; if it's hardwired to the text edition, note that as a follow-up, don't rewire it here).

- [ ] **Step 4: Apple Books acceptance (human in the loop)**

Open `dist/majordomo-audio.epub` in Apple Books on this Mac, play a chapter, and confirm with the user: word-level highlight tracks the narration; Nathan/Jamie switch at a `*My Man Jeeves:*` passage; callouts/footnotes are skippable per the reading system's UI. **This step needs the user's eyes/ears — present it, don't self-certify.**

- [ ] **Step 5: Version bump + verify text edition untouched**

```bash
npm run build && npm run check:epub
npm version minor --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore: bump minor for the read-along audiobook pipeline

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

(Tagging happens at release per CLAUDE.md; leave tagging to the release flow.)

- [ ] **Step 6: Close-out** — comment on #161 (engine decision: AVSpeech, voices, evidence links) and #167 (remaining checkboxes → done, or explicitly re-scoped), or draft those comments for the user if issue-writing isn't authorized in the execution session.

---

## Self-Review Notes

- **Spec coverage:** decisions (Task 3 voices, Task 9 cache/storage, Task 11 separate edition), segmenter + invariant (Task 4), CLI contract incl. format conversion and always-on validation (Tasks 7–8), adapter (Task 6), widened cache key (Task 5), orchestrator + cross-check threshold (Task 9), OPF/SMIL/active-class (Tasks 10–11), error handling woven through, testing split CI-safe vs local (every task), prerequisites (Task 1 merge; voices assumed downloaded — verified in session). Follow-ups (prompt/agent voices, acronym listening pass, prosody) are deliberately not tasks, matching the spec's out-of-scope list.
- **Known judgment calls:** the Swift `main.swift` sketch in Task 8 defers callback-ordering details to the working spike implementation by explicit instruction (the #174 deadlock lesson); `updateManifest`'s exact signature is pinned by Task 5's tests rather than restated in Task 9.
- **Type consistency check:** `VoiceSegment.role: NarrationRole` (T3→T4→T9); `AvspeechBoundary{text,textOffset,wordLength,clipBeginSeconds}` (T6→T8's `ChapterBoundary` field-for-field→T9); `hashNarrationInputs(text, voiceKey, lexiconKey)` (T5→T9→T11); `MediaOverlayInfo{bySlug,narrator,activeClass}` + `ChapterOverlay{smilHref,audioHref,durationSeconds}` (T10→T11); `IpaMatch{charStart,charEnd,ipa}` → job `ipa{start,length,notation}` mapping in T9 matches T7's `IpaRange`.
