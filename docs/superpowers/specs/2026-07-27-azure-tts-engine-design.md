# Azure Neural TTS Engine — Decision & Configuration

**Issue:** [#161](https://github.com/davidwkeith/Majordomo-epub/issues/161)
**Date:** 2026-07-27

## Scope

This settles the TTS **engine** for the read-along audiobook edition (EPUB 3 Media
Overlays). SMIL generation, callout/footnote skippability tagging, illustration
handling, and the build pipeline itself are separate, later work — see #161 for
the full non-goals list.

## Blockers — resolved

### Licensing

Azure's [Product Terms](https://www.microsoft.com/licensing/terms/product/ForOnlineServices/MCA)
(the governing document for Azure AI Services, incorporated into the Microsoft
Customer Agreement) state plainly:

> Output Content is Customer Data. Microsoft does not own Customer's Output Content.

The only use-based restriction on Output Content is a prohibition on using it to
generate synthetic training data for competing AI models — irrelevant here. Since
Microsoft does not claim ownership or a retained license over the synthesized
audio, the customer (this project) is free to redistribute and relicense it,
including under CC BY-SA 4.0. This matches the general community understanding
documented in Microsoft's own Q&A threads on [commercial usage](https://learn.microsoft.com/en-us/answers/questions/460557/microsoft-azure-text-to-speech-commercial-usage)
of TTS output ("no permission, separate license, or royalty owed to Microsoft,
provided the input text is your own or rightfully licensed content" — true here,
since the input is this book's own prose).

Two conditions apply regardless of licensing:

1. **Paid tier required.** Output-use rights attach to the paid (S0) resource
   tier, not the free (F0) tier. The free tier is fine for the spike/audition
   phase but the production run needs a paid resource.
2. **Disclosure.** Microsoft's [Responsible Deployment Guidelines](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/concepts-guidelines-responsible-deployment-synthetic)
   require disclosing that a voice is synthetic. This is a one-line colophon/credits
   note, not a design obstacle — CC BY-SA 4.0 attribution already puts a credits
   page in scope.

**Verdict: Azure is cleared to redistribute under CC BY-SA 4.0.** This blocker is
resolved; the alternative (Piper + forced alignment) is not needed on licensing
grounds.

### Pricing

Current (2026) pay-as-you-go Azure Neural TTS pricing:

| Tier | Price |
|---|---|
| Standard neural voices | ~$16 / 1M characters |
| Neural HD voices | ~$22 / 1M characters (down from $30 pre-2026) |
| Free tier | 500K characters/month, no output-redistribution rights |
| Commitment tiers | as low as ~$7.50 / 1M characters at volume |

For a ~1.05M-character full run (~169k words), a **single full synthesis pass
costs roughly $17–23** on pay-as-you-go standard neural voices — not the
significant expense the issue anticipated. This changes the cost-control
framing: incremental, hash-based regeneration (per #161, deferred to the
pipeline work) is still the right call because this is a living document
under active revision, but the absolute dollar risk of an occasional full
re-render is low. It doesn't need to be treated as a rare, expensive event to
avoid at all costs — just something to not do on every typo-fix commit.

**Verdict: cost is not a blocker.** Standard neural tier is the right default;
HD voices are not worth the ~40% premium for this use case.

## Configuration decisions

### Region & resource

No strong technical reason to prefer one Azure region over another for this
workload (batch synthesis, not real-time/interactive). Recommend `eastus` —
Azure's speech capabilities generally land there first, and it minimizes the
chance of hitting a region without the voices this project wants.

This is still a provisioning step for a human with Azure account access — not
something this pass can create.

### Secrets

Convention matches the existing `GOOGLE_API_KEY` / `IMAGE_BACKEND` pattern in
`.env.example` (see `build/generate-art.ts`):

- `SPEECH_KEY` — Azure Speech resource key. Local dev: `.env` (gitignored).
  CI: GitHub Actions repository secret, never committed.
- `SPEECH_REGION` — e.g. `eastus`. Not sensitive, but kept alongside the key
  for parity with the SDK's constructor signature.

Added placeholders to `.env.example` in this change.

### Voices

Three voices needed, level-matched against each other: narrator (body prose),
`::: prompt` (reader), `::: agent` (Claude). 409 conversation blocks total
(331 prompt / 78 agent).

The issue is explicit that this must avoid "a gendered human-vs-robot cliché."
The safest way to do that is to differentiate prompt/agent by **register and
pacing**, not by making one voice sound synthetic — both are equally "real,"
they just carry different conversational energy (reader voice: curious,
slightly faster, rising inflection on questions; agent voice: measured,
slightly slower, declarative).

This is a listening decision and can't be made from a spec doc — it needs a
human to audition candidates against actual conversation-block text. Shortlist
to audition (Azure's `*MultilingualNeural` line — the most natural-sounding
current generation, en-US locale to match the book's American Gen-X voice
per `spec/editorial/voice-and-audience.md`):

- **Narrator:** `en-US-AndrewMultilingualNeural` — warm, conversational,
  reads as "knowledgeable friend" rather than corporate-narrator.
- **Prompt (reader):** `en-US-EmmaMultilingualNeural` — natural, slightly
  brighter register, works well for questions.
- **Agent (Claude):** `en-US-BrianMultilingualNeural` — calm, measured,
  differentiated from the narrator by pacing rather than by sounding robotic.

These are starting candidates, not final picks. **Action for the project
owner:** synthesize a few conversation blocks and a paragraph of body prose
with each candidate, listen for distinguishability and fit, adjust the
shortlist as needed.

### SSML baseline

To be authored alongside the voice picks (depends on which voices are chosen,
since prosody defaults vary per voice):

- **Rate:** slightly below each voice's default (`rate="-5%"` as a starting
  point) — read-along needs to be trackable by eye, not radio-fast.
- **Pauses:** explicit `<break>` at section breaks (`hr` in the source) and
  scene-level pauses already present in the prose; no break insertion at
  ordinary sentence boundaries (the voice's own prosody handles that).
- **Pronunciation overrides (`<phoneme>` / lexicon):** recurring proper nouns
  that neural voices are prone to mis-stress: *Djot*, *ePub*, *Jeeves*, and
  the Star Trek episode titles referenced throughout (`spec/editorial/cultural-references.md`
  has the full episode index). These should be captured as a single shared
  SSML lexicon file once the pipeline work starts, not hand-repeated per
  chapter.

This is a pipeline-adjacent task (SSML gets generated from the built XHTML) and
is deferred along with the rest of the pipeline design, per #161's stated
scope.

### Spike

The issue asks for: synthesize one chapter end-to-end, capture `WordBoundary`
output, confirm character offsets map cleanly onto text fragment IDs in the
built XHTML.

That last part is currently **blocked on the pipeline work being explicitly
out of scope for this issue**: the build's XHTML output (`build/epub/`,
`build/pipeline.ts`) does not yet assign any per-word or per-sentence fragment
IDs — there's nothing for a `WordBoundary` character offset to map onto yet.
Running the spike meaningfully requires at least a minimal fragment-ID scheme
in the render output, which is pipeline design and belongs to the follow-up
issue, not this one.

What *can* be confirmed now, and should be, once a paid Speech resource and
`SPEECH_KEY`/`SPEECH_REGION` exist: that the `WordBoundary` event's
`textOffset` actually lines up 1:1 against the plain-text string handed to
`speakTextAsync`/SSML input, with no silent drift from smart-typography
substitution (curly quotes, em-dashes) happening between the Djot source and
the string sent to Azure. That's a narrow, engine-only check and doesn't
require the pipeline to exist first — it just needs a human with credentials
to run it against a paragraph of already-built chapter text.

`npm run tts:spike` (`build/scripts/tts-spike.ts`) is scaffolded for exactly
this: it synthesizes a sample paragraph deliberately exercising Djot's
smart-typography substitutions and proper nouns, captures every
`WordBoundary` event, and verifies each one's `textOffset`/`wordLength`
slices back to the expected word in the source string — flagging any drift
and writing the synthesized audio to `dist/tts-spike/spike.mp3` for a
listening check. It exits non-zero on mismatch. Pass a text file
(`npm run tts:spike -- path/to/file.txt`) to check a real chapter excerpt
instead of the built-in sample. Not yet run against live Azure output —
needs `SPEECH_KEY`/`SPEECH_REGION` from the provisioned resource.

## Remaining work (not done in this pass)

These require either Azure account access, human listening judgment, or the
(explicitly out-of-scope) pipeline work, so they're left as follow-up:

- [ ] Provision the Azure Speech resource (paid tier, `eastus`)
- [ ] Add `SPEECH_KEY` / `SPEECH_REGION` as GitHub Actions secrets
- [ ] Audition the voice shortlist above and lock in three final voices
- [ ] Run `npm run tts:spike` against live Azure output and confirm `WordBoundary`
      offsets hold (script scaffolded; needs a provisioned resource to execute)
- [ ] Author the SSML lexicon for recurring proper nouns, once voices are locked
- [ ] Pipeline design issue: fragment IDs, SMIL generation, incremental
      hash-based regeneration, skippability tagging (tracked separately)
