# Read-Along Audiobook Pipeline — End-to-End Wiring

**Issues:** [#161](https://github.com/davidwkeith/Majordomo-epub/issues/161) (engine), [#167](https://github.com/davidwkeith/Majordomo-epub/issues/167) (SMIL/pipeline)
**Date:** 2026-07-30

## Decisions this spec locks in

- **Engine: AVSpeechSynthesizer** (macOS marker API). The per-voice
  marker-emission risk was retired on 2026-07-30: all six downloaded
  enhanced/premium voices emit word markers and pass the spike's
  validation, including a full-chapter run through the real pipeline
  extraction (see `scripts/avspeech-spike/README.md`). Azure remains the
  documented fallback (`2026-07-27-azure-tts-engine-design.md`) but no
  Azure code path is wired here.
- **Voices:** narrator, `::: prompt`, and `::: agent` blocks are all read
  by **Nathan** (`com.apple.voice.enhanced.en-US.Nathan`); Jeeves passages
  by **Jamie (Premium)** — identifier
  `com.apple.voice.premium.en-GB.Malcolm` (Apple renamed the display name
  but kept the identifier; always pin identifiers, not names). Both were
  approved by listening check. Distinct prompt/agent voices are deliberately
  deferred; the segmenter carries all four roles from day one so enabling
  them later is a config change plus re-synthesis (free, local, ~35 min).
- **Distribution: separate audiobook edition.** `npm run build` output is
  untouched. A new `npm run build:audiobook` emits
  `dist/majordomo-audio.epub` (~800 MB with full narration). Readers choose
  their download; the text edition keeps its existing flows (notes sync,
  EPUBCheck, releases).
- **Audio storage: local untracked cache** (`.cache/narration/`,
  gitignored). Only `src/audio/manifest.json` is committed. Any Mac with
  the two voices downloaded regenerates on demand; the audiobook ePub ships
  as a release artifact. CI keeps building the text edition only — this
  matches AVSpeech's on-device reality and was chosen over git LFS
  (quota cost, 40 MB re-uploads per changed chapter) and direct commit
  (unbounded history growth).
- **Audio format: AAC-LC in `.m4a`** (`audio/mp4`), one file per chapter,
  44.1 kHz mono — an EPUB 3 core media type, natively encodable via
  AVFoundation.

## Architecture

Swift synthesizes; TypeScript does everything else. The Swift surface — the
one part not testable in CI — stays as small as the already-proven spike.
Deterministic logic (segmentation, offsets, SMIL, OPF assembly, caching)
lives in unit-tested TS.

```
render chapter HTML ──▶ injectWordFragments ──▶ narratableText + fragments
                                   │
                     segmentVoices(html) ──▶ [{role, text, charStart, charEnd}]
                                   │  (concat(text) === narratableText — invariant)
                                   ▼
              job JSON {audioOutput, segments:[{voiceId, text, ipa[]}]}
                                   │
                    scripts/narrate (Swift CLI, SpikeCore) ──▶ ch.m4a
                                   │                            + boundaries JSON
                                   ▼
        adapter ──▶ WordBoundaryRecord[] ──▶ buildSmil(fragments, records,
                                              opts, escapableGroups) ──▶ ch.smil
                                   │
                 build:audiobook ──▶ dist/majordomo-audio.epub
```

## Components

### 1. `build/audio/voice-segments.ts` (new)

`segmentVoices(html)` walks the same rendered chapter HTML that
`injectWordFragments` walks and classifies character ranges of the
narratable text by role, emitting ordered
`{role, text, charStart, charEnd}` segments.

**Invariant:** the concatenation of segment texts is character-identical to
`injectWordFragments(html).narratableText`. This is what keeps
whole-chapter boundary offsets valid across voice switches, and it is
enforced by a runtime assertion in the orchestrator, not just by tests.

Role rules (all structural, no text heuristics beyond the label):

- `<div data-conversation="prompt">` → `prompt`; `"agent"` → `agent`
  (attribute set by `build/filters/conversations.ts`).
- A `<p>` whose first child is `<strong>My Man Jeeves:</strong>` splits:
  the label text stays `narrator`; the following `<em>` body is `jeeves`.
  The label is still narrated and highlighted — the voice switch itself is
  the attribution.
- Everything else → `narrator`.

Roles: `narrator | prompt | agent | jeeves`. The role→voice map lives in
`build/audio/voices.ts` with the identifier-vs-display-name warning
documented at the definition site.

### 2. `scripts/narrate` (Swift, new executable target in the spike package)

A second SwiftPM executable beside `avspeech-spike`, sharing `SpikeCore`
(chunking at the 1800-unit margin and three-rule reconciliation,
unchanged). Contract:

- **Input:** path to a job JSON:
  `{ audioOutput, segments: [{ voiceId, text, ipa: [{start, length, notation}] }] }`.
  IPA ranges are computed on the TS side by the existing `findIpaMatches`
  (offsets relative to the segment's text).
- **Output:** one AAC `.m4a` at `audioOutput`; boundaries JSON on stdout:
  `{ totalDurationSeconds, boundaries: [{ text, textOffset, wordLength, clipBeginSeconds }] }`
  with `textOffset` in whole-chapter narratable-text coordinates (UTF-16
  code units, which is what both NSRange markers and JS string offsets
  natively use — the two sides agree by construction).
- **Format conversion:** voices differ in native PCM format, so every
  buffer is converted to the target format (44.1 kHz mono) via
  `AVAudioConverter`. Audio offsets are therefore tracked in **seconds**,
  not bytes: within a chunk, marker `byteSampleOffset ÷ native
  bytesPerFrame ÷ native sampleRate`; across chunks and segments, plus the
  accumulated written duration.
- **Validation always on:** the spike's PASS checks (boundaries in range,
  non-overlapping, text- and audio-monotonic, zero-marker ceiling canary)
  run on every production synthesis. Any failure → non-zero exit, no
  partial output treated as success. A missing/undownloaded voice
  identifier is a hard error that lists installed voices.

### 3. `build/audio/avspeech-boundaries.ts` (new)

Parses the CLI's boundaries JSON into `smil.ts`'s `WordBoundaryRecord[]`:
`audioOffsetTicks = clipBeginSeconds × 10⁷`; `durationTicks` = next
boundary's clipBegin minus this one's, the last word ending at
`totalDurationSeconds`. Contiguous clips are what read-along SMIL wants —
markers carry no durations, and gaps would flicker the highlight off
between words.

### 4. `npm run narrate` — `build/scripts/narrate.ts` (new)

Orchestrates per-chapter synthesis with the incremental cache:

1. Render all chapters exactly as `narration-plan.ts` does; compute
   `narratableText`, fragments, and voice segments.
2. **Cache key widened** (change to `narration-cache.ts` + manifest
   schema): `hash(narratableText + serialized role→voice map + serialized
   IPA lexicon entries)` instead of content hash alone — a voice swap or
   lexicon edit must invalidate, or stale audio ships silently. Serializing
   the actual entries (not a hand-bumped version constant) means forgetting
   to bump can't happen.
3. For each `new`/`changed` chapter: write job JSON, run the CLI, then
   **cross-check** returned boundaries against `injectWordFragments`'
   offsets — every boundary must overlap a fragment; unmatched boundaries
   above a small threshold (1%) fail the chapter. (This makes #167's
   "validate real WordBoundary output against fragment offsets" a permanent
   pipeline property, not a one-off spike.)
4. Store `.m4a` + boundaries JSON in `.cache/narration/<slug>/`; update
   `src/audio/manifest.json` (hash, `durationSeconds`) only after the
   chapter fully validates — abort-safe by construction.

`--chapter <slug-substring>` narrates a single chapter for dev loops.

### 5. `npm run build:audiobook` — `build/scripts/build-audiobook.ts` (new)

Runs the existing ePub assembly, then per chapter:

- copy `.cache/narration/<slug>/ch.m4a` → `OEBPS/audio/`;
- `buildSmil(fragments, records, {chapterId, textSrc, audioSrc},
  groupEscapableFragments(html))` → `OEBPS/smil/<slug>.smil`;
- OPF: manifest entries (`application/smil+xml`, `audio/mp4`),
  `media-overlay="..."` on each XHTML item, `media:duration` per overlay
  plus book total, `media:active-class` (with the corresponding highlight
  rule added to the stylesheet).

Output: `dist/majordomo-audio.epub`. **Refuses to package** any chapter
whose manifest hash doesn't match the current narratable text — the error
says "run `npm run narrate`". Per #161's rationale: highlighting that
drifts is worse than no highlighting; stale audio never ships.

## Error handling

Fail loudly, never package stale. CLI validation failure → no manifest
update. Voice not installed → hard error listing installed voices.
Hash mismatch at packaging → hard error. The single soft path is
`buildSmil`'s existing behavior: a fragment with no boundary is skipped
(no highlight), never emitted with invented timing.

## Testing

- **TS (CI-safe, vitest):** segmenter role rules + concatenation invariant
  on fixture HTML covering all four roles and the label split; adapter
  tick/duration math; widened cache key (voice-map change → hash change);
  OPF/SMIL assembly on a small fixture book.
- **Swift (XCTest):** offset accumulation across segments with format
  conversion (pure math parts); existing SpikeCore fixtures unchanged.
- **Live (local Mac):** `npm run narrate -- --chapter 02-field-guide/04-home`;
  EPUBCheck on `dist/majordomo-audio.epub` at the same 0-error bar as the
  text edition; acceptance is the chapter playing in Apple Books with
  visible word-level highlighting.

## Out of scope / follow-ups

- Distinct prompt/agent voices (config change + re-synthesis when chosen).
- Acronym listening pass (ERISA, SAMHSA, POLST, WARN; FEMA/OSHA/SNAP
  entries are presumptive) — during first full-book narration.
- Prosody tuning at chunk/segment seams (flat pitch resets) and loudness
  level-matching between Nathan and Jamie — evaluate on the first
  full-chapter listen, tune after.
- Narrator/label treatment refinements (e.g. whether callout titles get an
  audible cue) — editorial, post-first-listen.

## Prerequisites

- Merge `main` (PR #177's backlink-glyph exclusion changes narratable text
  and therefore every cache hash — merge before generating real narration).
- Nathan (Enhanced) and Jamie (Premium) downloaded on the narrating Mac.
