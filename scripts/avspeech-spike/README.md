# avspeech-spike

Local counterpart to `build/scripts/tts-spike.ts`, evaluating `AVSpeechSynthesizer`
(free, on-device, macOS) as a possible substitute for Azure Neural TTS — see
"Could I use my Mac Studio" discussion on #161. `AVSpeechSynthesizer`'s
`willSpeakRangeOfSpeechString` delegate callback fires per word with a
character range into the exact string handed to it, which is the same shape
of information Azure's `WordBoundary` event provides — if it holds up in
practice, it removes both the per-character Azure cost and the forced-alignment
risk that ruled out Piper in the original engine-choice writeup.

Treat a "PASS" as a necessary, not sufficient, signal: it confirms the
mechanism works and stays in bounds, not that the voice quality or timing
granularity is good enough to ship.

## Results

Run on macOS 26, Apple Silicon, with the default `en-US` compact voice
(Samantha):

- **Granularity is per-word.** The built-in sample (44 words) produced 40
  boundaries, all in range and sequential — this is the shape the book's
  read-along goal needs.
- **`willSpeakRangeOfSpeechString` silently stops firing above ~2000 UTF-16
  units of utterance text.** Not degraded, not slow — zero callbacks, while
  the audio still writes successfully. Bisected on this machine: 2000 UTF-16
  units passes, 2003 fails. This is undocumented by Apple and did not surface
  in the 44-word sample; it only showed up testing against real chapter-length
  text. **Worked around** by chunking: the script now splits input at
  whitespace boundaries into pieces safely under the ceiling (1800 units),
  synthesizes each in sequence into the same output file, and shifts each
  chunk's boundary ranges back into the full text's coordinate space so the
  reported boundaries read as one continuous set. Confirmed against a
  373-word real chapter excerpt (371/373 boundaries, no gaps or overlap across
  the chunk seam).
- **The original blocking-wait implementation deadlocked outright** — it used
  a raw `DispatchSemaphore.wait()` on the main thread, but
  `write(_:toBufferCallback:)` and the delegate callback are delivered as
  run-loop sources (XPC replies from the system speech-synthesis service). A
  kernel-level semaphore wait never pumps the run loop, so those replies queue
  up and are never delivered — a permanent hang, not a slow run. Fixed by
  spinning `RunLoop.current` with a timeout instead of blocking.
- **A full ~47k-character chapter (27 chunks) still fails the overlap check —
  20 overlaps out of 7,437 boundaries (~0.3%).** Chunking fixed the
  zero-boundary ceiling, but two independent, unfixed issues remain, both
  inherent to `willSpeakRangeOfSpeechString` itself rather than to this
  script's chunking:
  - **Punctuation/number-adjacent duplicate ranges** — most of the 20: a
    citation, footnote marker, phone number, or trailing-punctuation token
    gets reported twice with overlapping bounds (e.g. `credit cards,` then a
    second, shorter range for `credit cards`; `(1-800` then a separate,
    overlapping `1-800-669-9777)`). Looks like AVSpeechSynthesizer's own
    text normalization (phone numbers, dates-in-parens, footnote refs)
    reporting boundaries against more than one internal tokenization of the
    same span.
  - **At least one genuinely out-of-order callback**, not just an
    overlapping range: a boundary for a word from ~1,500 characters earlier
    in the same chunk arrived after several later boundaries had already
    been delivered and printed in sequence — confirmed via manual chunk-range
    reconstruction that both boundaries belong to the *same* chunk, so it
    isn't a chunk-seam artifact. `willSpeakRangeOfSpeechString` is not a
    strictly-ordered stream in practice.

  Neither issue is something this script can paper over without weakening
  the checks it exists to enforce (sorting boundaries before the overlap
  check would hide the out-of-order delivery, which is itself the finding).
  This is the load-bearing result for a ship/no-ship call: on real
  chapter-length text, ~0.3% of reported word positions can't be trusted at
  face value, which matters directly for the book's "words highlight as
  they're spoken" goal.

## Build & run

```sh
cd scripts/avspeech-spike
swift run                                            # built-in smart-typography sample
swift run avspeech-spike path/to/chapter-excerpt.txt  # check real book text
swift run avspeech-spike --list-voices                # see installed voice identifiers
swift run avspeech-spike --voice com.apple.voice.enhanced.en-US.Ava
```

Writes synthesized audio to `dist/tts-spike/avspeech-spike.caf` (relative to
wherever you run it from) for a listening check, alongside a dump of every
captured word boundary.

## What it checks

Unlike Azure's `WordBoundary`, `willSpeakRangeOfSpeechString` can't drift
against a separately-encoded source string — there's only one `String`
object involved, so it always indexes into it correctly by construction.
What's actually unverified is:

1. **Granularity** — does the callback fire per word, or per sentence/utterance?
   The book's stated goal ("words highlight as they're spoken") needs the
   former.
2. **Robustness around Djot's smart typography** — curly quotes, em/en dashes,
   ellipses — the same risk class the Azure spike checks for.
3. **Range validity** — every boundary's range should stay within the source
   text and not overlap the previous one.

Exits non-zero if any of those fail.

## Known gaps

- No cost/CI-reproducibility story yet: this only runs on macOS with a human
  present (or a self-hosted runner), which is a different shape than Azure's
  "call an API from any GitHub Actions runner." Worth resolving before this
  goes further than a spike.
- Chunking splits purely on whitespace, not sentence or clause boundaries, so
  a chunk seam can fall mid-sentence — worth checking whether that produces
  an audible prosody glitch (a flattened pitch reset) at the join, not just
  whether the audio and boundaries are technically continuous.
- The 1800-unit chunk ceiling was chosen as a safety margin under the
  measured ~2000-unit cutoff on this machine/OS/voice; it isn't confirmed
  stable across macOS versions or other voices, and Apple documents neither
  the limit nor this workaround.
- Each chunk starts a fresh `AVSpeechUtterance`, which resets prosody state
  (pitch, rate ramping) at every seam — acceptable for this spike's pass/fail
  checks, but a real narration pipeline would want to confirm that doesn't
  read as choppy over a full chapter.
