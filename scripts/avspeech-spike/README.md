# avspeech-spike

Local counterpart to `build/scripts/tts-spike.ts`, evaluating `AVSpeechSynthesizer`
(free, on-device, macOS) as a possible substitute for Azure Neural TTS — see
"Could I use my Mac Studio" discussion on #161. `AVSpeechSynthesizer`'s
`willSpeakRangeOfSpeechString` delegate callback fires per word with a
character range into the exact string handed to it, which is the same shape
of information Azure's `WordBoundary` event provides — if it holds up in
practice, it removes both the per-character Azure cost and the forced-alignment
risk that ruled out Piper in the original engine-choice writeup.

This has not been run yet — it needs a Mac to build and execute. Treat a
"PASS" as a necessary, not sufficient, signal: it confirms the mechanism
works and stays in bounds, not that the voice quality or timing granularity
is good enough to ship.

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

- Delegate callbacks and `write(_:toBufferCallback:)` are exercised together
  here on the assumption that `willSpeakRangeOfSpeechString` still fires
  during offline (file) synthesis, not just live playback. That assumption
  is exactly what this spike tests — if boundaries come back empty, that's
  the answer, not a bug in this script.
- No cost/CI-reproducibility story yet: this only runs on macOS with a human
  present (or a self-hosted runner), which is a different shape than Azure's
  "call an API from any GitHub Actions runner." Worth resolving before this
  goes further than a spike.
