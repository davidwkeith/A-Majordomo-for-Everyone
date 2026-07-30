# avspeech-spike

Local counterpart to `build/scripts/tts-spike.ts`, evaluating `AVSpeechSynthesizer`
(free, on-device, macOS) as a possible substitute for Azure Neural TTS — see
"Could I use my Mac Studio" discussion on #161. The spike drives
`write(_:toBufferCallback:toMarkerCallback:)`, the macOS 13+ marker API, rather
than the older `willSpeakRangeOfSpeechString` delegate: markers carry a
`byteSampleOffset` into the audio stream alongside the text range, which is
audio-timing data the delegate never provided and which ePub Media Overlays
(SMIL clip times) need. If it holds up in practice, AVSpeech removes both the
per-character Azure cost and the forced-alignment risk that ruled out Piper in
the original engine-choice writeup.

Treat a "PASS" as a necessary, not sufficient, signal: it confirms the
mechanism works and stays in bounds, not that the voice quality or timing
granularity is good enough to ship.

## Results

Full findings, evidence, and rule-by-rule rationale live in
[#173](https://github.com/davidwkeith/Majordomo-epub/issues/173) and
[`docs/superpowers/specs/2026-07-29-avspeech-marker-migration-design.md`](../../docs/superpowers/specs/2026-07-29-avspeech-marker-migration-design.md).
Summary, not a restatement:

- **The ~2000-UTF-16-unit word-marker ceiling is service-level, not
  API-level.** It affects the marker callback the same as the old delegate,
  and reproduces on the Eloquence engine family as well as the default
  voice — this lives below both public APIs, in the synthesis service
  itself. Chunking (1800-unit safety margin) stays as the workaround. A
  chunk that yields zero word markers now fails the run loudly (a canary
  check) instead of silently under-reporting, since the ceiling shifting
  under an OS or voice change would otherwise fail silently by design.
- **A three-rule reconciliation pass** (`Sources/SpikeCore/Reconcile.swift`)
  resolves the same tokenization noise the delegate exhibited — duplicate
  tokenizations collapsed, split tokens merged, regressing re-reports
  dropped — using audio-offset monotonicity as ground truth: the speech
  itself never goes backwards, so classifying each anomaly against that axis
  doesn't paper over anything (unlike sorting delegate ranges, which the
  original spike rightly refused to do). Audio offsets were strictly
  monotonic across all 7,530 markers of the full-chapter investigation run.
- **Full-chapter verification** (this task, macOS 26, Apple Silicon, compact
  Samantha), exporting `src/content/02-field-guide/04-home/index.dj` to
  plain text (~7,484 words / 46,273 UTF-16 units, 26 chunks): 7,534 raw word
  markers reconciled to 7,470 boundaries — 7 duplicate tokenizations
  collapsed, 55 split tokens merged, 2 regressing re-reports dropped.
  **PASS** in well under the ~2-minute synthesis budget. The merge count is
  inflated by endnote-backlink `↩` glyphs this crude export keeps; that's
  expected, not a regression. Counts land in the same neighborhood as the
  #173 investigation run, which is the point — an order-of-magnitude drift
  here would mean the OS changed underneath us.
- **Fixtures pin the two reconciliation classes independently of the slow
  full-chapter run**: `fixtures/credit-cards.txt` (duplicate tokenization,
  e.g. `credit cards,` / `credit cards`) reconciles at 1 duplicate / 0
  merges / 0 drops; `fixtures/hud-phone.txt` (split-token merge, e.g.
  `(1-800` / `1-800-669-9777)`) reconciles at 1 duplicate / 1 merge / 0
  drops. Both PASS.
- **Enhanced and premium voices emit word markers.** Ava (Premium), Ava
  (Enhanced), Evan (Enhanced), and Zoe (Premium) all PASS the fixtures with
  reconciliation counts identical to compact Samantha, and Ava (Premium)
  PASSES a full-chapter run through the real pipeline extraction
  (`injectWordFragments(...).narratableText`, 7,763 words / 49,071 chars
  including callout and illustration narration): 7,754 reconciled
  boundaries, ~57.4 minutes of audio, 0 overlaps, 0 ordering violations.
  Nathan (Enhanced, `en-US`) and Jamie (Premium, `en-GB`) also PASS both
  fixtures — Jamie with *zero* reconciliation noise, the cleanest tokenizer
  measured. Note Jamie's identifier is `com.apple.voice.premium.en-GB.Malcolm`
  (Apple renamed the voice but kept the old ID) — pin the identifier, not
  the display name, in any pipeline config. This retires the per-voice
  marker-emission ship-risk for the installed voices; any newly downloaded
  voice still needs its own fixture pass before use, since Apple documents
  marker support as per-voice optional.
- **The pipeline's narratable text still carries endnote-backlink `↩`
  glyphs** — 14 of them in the full-chapter export, each synthesized and
  assigned a word boundary. Navigation chrome, not content; the narration
  extraction should strip them before synthesis.
- **The IPA attribute fixes acronym reading.**
  `AVSpeechSynthesisIPANotationAttribute` (applied via `NSAttributedString`)
  is verified working on macOS 26 — "HUD" is spoken as one syllable instead
  of three letters, with the underlying text range unchanged. This is what
  lets the acronym lexicon apply a pronunciation override without touching
  boundary offsets.
- **byteSampleOffset is bytes**, not frames or samples — confirmed
  empirically against total audio duration (seconds = bytes ÷ bytesPerFrame
  ÷ sampleRate). Synthesis ran at roughly 29× realtime on this machine.
- **JSON output**: reconciled boundaries are dumped to
  `dist/tts-spike/avspeech-boundaries.json` as an array of
  `{ text, textOffset, wordLength, clipBeginSeconds }` records — the shape a
  `smil.ts` adapter would consume directly for read-along clip times.

## Build & run

```sh
cd scripts/avspeech-spike
swift run                                             # built-in smart-typography sample
swift run avspeech-spike fixtures/credit-cards.txt     # duplicate-tokenization fixture
swift run avspeech-spike fixtures/hud-phone.txt        # split-token / acronym fixture
swift run avspeech-spike path/to/chapter-excerpt.txt   # check real book text
swift run avspeech-spike --list-voices                 # see installed voice identifiers
swift run avspeech-spike --voice com.apple.voice.enhanced.en-US.Ava
```

Writes synthesized audio to `dist/tts-spike/avspeech-spike.caf` (relative to
wherever you run it from) for a listening check, alongside
`dist/tts-spike/avspeech-boundaries.json` (the reconciled word boundaries) and
a console dump of every boundary with its text range and `clipBeginSeconds`.

## narrate

`narrate` is the production sibling of the spike: same marker API and same
reconciliation pass, but it takes a whole chapter as ordered *voice segments*
and emits one audio file plus one boundary document. It is the process
`npm run narrate` shells out to, so its I/O contract is load-bearing.

```sh
cd scripts/avspeech-spike
swift run narrate fixtures/narrate-job-sample.json > boundaries.json
```

### Job JSON (argument)

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

The segments' `text` values concatenated — *including* the ones that get
skipped — are the chapter's narratable text, and every `textOffset` in the
output indexes into that concatenation. `ipa` offsets are relative to the
segment's own text and are applied as `AVSpeechSynthesisIPANotationAttribute`
ranges, which change pronunciation without moving a single text offset.
`voiceId` must be an installed voice's identifier (not its display name —
Jamie is still `com.apple.voice.premium.en-GB.Malcolm`).

### Output

**stdout is the JSON document and nothing else** — no progress lines, no
warnings — because the TS side parses it verbatim:

```json
{ "totalDurationSeconds": 5.962,
  "boundaries": [{ "text": "The", "textOffset": 0, "wordLength": 3, "clipBeginSeconds": 0 }] }
```

All progress, reconciliation counts, and errors go to **stderr**. Audio is
written to `audioOutput` as 44.1 kHz mono AAC (96 kbps) `.m4a` — each voice's
native buffers are resampled through `AVAudioConverter` into one continuous
file, so a voice change mid-chapter doesn't change the container format or
reset the timeline.

Exit codes: `0` only when the boundary list passed validation (in range of
the chapter text, non-overlapping, monotonic in both text and audio). `1` for
everything else: unreadable job, uninstalled voice (which prints the
installed English voice identifiers to stderr), synthesis failure, per-chunk
timeout, a validation failure, or the ceiling canary.

### Deliberate behaviors

- **Wordless segments are skipped, not synthesized.** A segment of pure
  punctuation or whitespace between two voice spans still advances the text
  cursor by its UTF-16 length, but produces no audio and no markers.
  Synthesizing it would trip the zero-marker ceiling canary over text that has
  nothing to say. The canary therefore applies only to chunks actually sent to
  the synthesizer.
- **Reconciliation runs per segment**, not across the whole chapter: a segment
  seam is a real voice change, and merging a split token across it would fuse
  two different speakers' words into one boundary.
- **Marker byte offsets are converted at the chunk's native sample rate**,
  then added to the accumulated *output* duration (`markerSeconds`). The two
  clocks differ whenever a voice doesn't synthesize at 44.1 kHz, and mixing
  them is how the timeline silently drifts.
- **One `AVAudioConverter` is held for as long as the native format lasts**,
  rebuilt only when the format actually changes. A converter carries resampler
  state, so rebuilding it per buffer silently discards ~12 ms of priming
  residual each time — worth ~6% of the audio, and a progressively worsening
  read-along skew *within* a chunk. Note that any cache keyed on something
  derived from the `AVAudioFormat` object misses every time: the synthesizer
  hands out a fresh instance per buffer and `description` embeds its pointer.
  `AVAudioFormat`'s own `==` compares stream descriptions, which is the
  comparison that means what you want. The stderr line reports how many
  resamplers were built — for a whole chapter that should be a small number
  (one per distinct voice format), never one per buffer.
- **Markers are buffered raw and converted only after the chunk completes**,
  since the native format is knowable only from a buffer and markers may in
  principle arrive first.
- Like the spike, the synthesis driver spins the run loop rather than blocking
  on a semaphore — both callbacks arrive as run-loop sources, so blocking
  deadlocks (#174).

Verified against the fixture on macOS 26 / Apple Silicon: exit 0, 16
boundaries for 16 words across the two voices, 5.962 s of audio, the first
Jamie boundary at `textOffset` 39 (exactly the first segment's UTF-16
length), and `afinfo` reporting the same 5.962086 s the JSON does. The IPA path
is confirmed live: substituting a five-syllable notation for `HUD` stretches
that word's span from 0.192 s to 1.415 s while its `textOffset`/`wordLength`
stay at 18/3.

## What it checks

Unlike Azure's `WordBoundary`, the marker callback can't drift against a
separately-encoded source string — there's only one `String` object involved,
so text ranges always index into it correctly by construction. What's
actually unverified is:

1. **Granularity** — does the callback fire per word, or per sentence/utterance?
   The book's stated goal ("words highlight as they're spoken") needs the
   former.
2. **Robustness around Djot's smart typography** — curly quotes, em/en dashes,
   ellipses — the same risk class the Azure spike checks for.
3. **Range validity** — every reconciled boundary's text range should stay
   within the source text and not overlap the previous one.
4. **Audio monotonicity** — reconciled boundaries' `byteSampleOffset` values
   must never go backwards; this is also the ground truth the reconciliation
   pass itself relies on.
5. **Ceiling canary** — any chunk producing zero word markers is a hard
   failure, not a silent gap, since the undocumented ~2000-unit ceiling
   shifting under an OS or voice change would otherwise be invisible.

Exits non-zero if any of those fail.

## Known gaps

- ~~Enhanced/premium `en-US` voice marker support is untested.~~ Resolved —
  see Results: all four downloaded enhanced/premium `en-US` voices emit
  markers and PASS. The per-voice caveat stands for voices not yet checked
  (notably any future `en-GB` download for the Jeeves passages).
- **Ceiling stability across macOS versions is unconfirmed.** The
  ~2000-unit cutoff (1800-unit chunk margin) is only measured on this
  machine/OS; Apple documents neither the limit nor the chunking workaround.
- **No cost/CI-reproducibility story yet**: this only runs on macOS with a
  human present (or a self-hosted runner), which is a different shape than
  Azure's "call an API from any GitHub Actions runner." Worth resolving
  before this goes further than a spike.
- Chunking splits purely on whitespace, not sentence or clause boundaries, so
  a chunk seam can fall mid-sentence — worth checking whether that produces
  an audible prosody glitch (a flattened pitch reset) at the join, not just
  whether the audio and boundaries are technically continuous.
- Each chunk starts a fresh `AVSpeechUtterance`, which resets prosody state
  (pitch, rate ramping) at every seam — acceptable for this spike's pass/fail
  checks, but a real narration pipeline would want to confirm that doesn't
  read as choppy over a full chapter.
- When input text begins with punctuation (e.g. a literal `...`), the
  engine's first word marker starts at offset 1 rather than 0 — a future
  SMIL adapter consuming `avspeech-boundaries.json` will see a one-character
  gap at the very start. (This is observed engine behavior; the
  `fixtures/hud-phone.txt` run exercises it.)
