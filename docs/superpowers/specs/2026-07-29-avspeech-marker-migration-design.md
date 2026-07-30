# AVSpeechSynthesizer Marker API Migration — Spike Upgrade

**Issue:** [#173](https://github.com/davidwkeith/Majordomo-epub/issues/173)
**Date:** 2026-07-29

## Scope

This upgrades `scripts/avspeech-spike` from the `willSpeakRangeOfSpeechString`
delegate to the macOS 13+ marker API, adds a deterministic boundary
reconciliation pass, and widens `build/audio/ssml-lexicon.ts` with an
engine-neutral acronym table. It does **not** decide AVSpeech vs Azure — it
removes boundary reliability as a factor in that decision, so the engine call
(still open from #161) can be made on voice quality and CI story alone.

## Evidence base

All measurements from #173's investigation (macOS 26, Apple Silicon, compact
Samantha unless noted), reproduced with a standalone harness against the two
reproduction snippets and a full ~46k-character chapter export:

| Finding | Result |
|---|---|
| ~2000-unit callback ceiling | Applies to markers too, and to the Eloquence engine — it's in the synthesis service. Chunking stays. |
| Marker audio offsets | Strictly monotonic across all 7,530 word markers of a full chapter. `byteSampleOffset` is **bytes** (verified against total audio duration twice). |
| Overlapping/duplicate ranges | Same raw noise as the delegate, but every anomaly is classifiable against the monotonic audio axis; three rules reconcile a full chapter to 0 overlaps, 0 ordering violations (7,466 boundaries / ~7,516 words). |
| Out-of-order delivery | 2 occurrences per chapter, detectable as text-range regressions while audio advances — droppable without masking anything. |
| Acronyms | `AVSpeechSynthesisIPANotationAttribute` works on macOS 26 (FB9298976's macOS breakage is fixed): "HUD" spoken as one syllable, text range unchanged at `[31,34)`. |
| Throughput | ~29× realtime (49.5 min of audio in ~104s), free, on-device. |

Apple has acknowledged the underlying range-noise mechanism on its developer
forums (internal text normalization re-reporting ranges against rewritten
text); defensive merging is the community-endorsed practice. The ceiling
itself appears publicly unreported.

## Design

### 1. Marker-based synthesis (spike, `main.swift`)

Replace the delegate with `write(_:toBufferCallback:toMarkerCallback:)`.
Chunking (`chunkText`, 1800-unit ceiling margin) is retained unchanged. Per
chunk, word markers are shifted into whole-text coordinates on both axes:

- text: `range.location + chunk.startOffset` (as today)
- audio: `byteSampleOffset + bytesWrittenBeforeChunk`, where
  `bytesWrittenBeforeChunk = totalFramesSoFar × bytesPerFrame`

Only `.word` marks are consumed; other mark types are counted and reported
for information. The delegate path is deleted, not kept as a fallback — it
cannot produce audio offsets, so it has no remaining role.

### 2. Reconciliation pass

A pure function over the shifted marker list, applying three ordered rules
per marker against the previously accepted one:

1. **Duplicate tokenization** (same text start *and* same audio offset):
   collapse into the union span. Covers the `credit cards,` /
   `credit cards` class.
2. **Forward overlap** (starts inside the previous span, audio advanced):
   merge into the union span, keeping the earlier audio offset. Covers the
   `(1-800` / `1-800-669-9777)` class.
3. **Regression** (starts before the previous span's start while audio
   advanced): drop the marker as a spurious re-report. Audio monotonicity is
   ground truth that the speech never went backwards, so this hides no
   ordering defect — unlike sorting delegate ranges, which the spike
   rightly refused to do.

The pass reports counts per rule. The spike's PASS/FAIL checks then run on
the reconciled list: in-range, non-overlapping, text- and audio-monotonic.

### 3. Output shape

The spike gains a JSON dump (`dist/tts-spike/avspeech-boundaries.json`) of
reconciled boundaries as `{ text, textOffset, wordLength, clipBeginSeconds }`,
where `clipBeginSeconds = byteOffset ÷ bytesPerFrame ÷ sampleRate`. This is
convertible to `smil.ts`'s `WordBoundaryRecord` (`audioOffsetTicks` =
seconds × 10⁷; `durationTicks` derived from the next word's `clipBegin`,
last word ends at audio end). Markers carry no durations; contiguous
`clipEnd = next clipBegin` is what read-along SMIL wants anyway.

### 4. Ceiling canary

Any chunk yielding **zero** word markers fails the run loudly, naming the
chunk offset and length. This is the guard against the undocumented ceiling
shifting under an OS update or a different voice — the failure mode is
silent by design, so the pipeline must make it loud.

### 5. Lexicon: engine-neutral acronym table (`build/audio/ssml-lexicon.ts`)

Add an acronym rule class alongside `PROPER_NOUN_RULES`, starting with the
occurrences the chapter run surfaced (`HUD`; audit the manuscript for
others). Each entry carries both realizations:

- **Azure:** existing `<sub alias>` mechanism, unchanged.
- **AVSpeech:** a new export mapping matches to IPA strings (e.g. `HUD` →
  `hʌd`), applied as `AVSpeechSynthesisIPANotationAttribute` ranges on an
  `NSAttributedString` — source text and therefore all boundary offsets
  stay untouched.

Existing rules (`Djot`, `ePub`, `Jeeves`, episode citations) are unchanged;
whether they also need IPA realizations is decided when the AVSpeech path
graduates from spike to pipeline, not now.

## Error handling

- Synthesis timeout, write errors, zero-marker chunks: fail the run with
  the chunk identified (existing spike behavior, extended to the canary).
- Reconciliation never throws; pathological inputs (e.g. all markers
  regressing) surface as FAIL via the post-reconciliation checks.

## Testing

- The two #173 reproduction snippets and the built-in smart-typography
  sample stay as the fast checks; the full-chapter export is the slow one.
- Expected results are pinned: snippets reconcile with rules 1–2 only; the
  chapter run must end at 0 overlaps / 0 violations with rule counts in the
  measured neighborhood (7 dupes / ~55 merges / ~2 drops — drift beyond an
  order of magnitude means the OS changed underneath us).
- Lexicon: unit tests in `ssml-lexicon.test.ts` extend to the acronym rules
  and the IPA export (offset invariance is the key property).

## Out of scope / follow-ups

- **Enhanced/premium voice marker check** — blocked on a manual voice
  download (System Settings → Accessibility → Spoken Content); the biggest
  remaining AVSpeech ship-risk, since marker emission is documented as
  per-voice optional.
- **Azure "HUD" default behavior** — blocked on `SPEECH_KEY`; low-risk
  (Azure documents `<say-as>`/lexicon overrides either way).
- **Apple Feedback** for the ceiling, with the bisected 2000/2003 repro.
- Engine decision and pipeline integration (#161, #167).
- The manuscript acronym audit found further word-read candidates without
  entries (ERISA, SAMHSA, POLST, WARN), and the FEMA/OSHA/SNAP entries are
  presumptive (only HUD was measured mis-read in #173) — both to be resolved
  in a listening pass when the AVSpeech path graduates to the pipeline.
