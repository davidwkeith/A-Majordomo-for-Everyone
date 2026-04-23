# Unified `*My Man Jeeves:*` Voice Attribution

**Date:** 2026-04-23

## Goal

Retire the `_"The Majordomo has this to say about X: …"_` third-person narrator frame currently used in Strategy chapter openers and unify on the `*My Man Jeeves:*` label already in use for Field Guide Skill openers. The result: a single attribution style everywhere the Majordomo (Reginald Jeeves) speaks in the book, with two rhetorical jobs keyed to position.

## The Convention

The `*My Man Jeeves:*` label marks every place the Majordomo speaks. It opens every Skill entry in the Field Guide and closes every Strategy chapter opener — positioned immediately after the *"The lesson:"* paragraph and immediately before the final `---` rule that separates the chapter opener from the chapter body.

**Two positional jobs, one voice:**

| Location | Function | Rhetorical shape |
|---|---|---|
| Skill entry (Field Guide) | Opens the entry | Strict three-beat: validate → mechanism → agency (*"An Agent can…"*) |
| Strategy chapter opener | Closes the opener, leads into exposition | Capstone on the TV-episode premise: validate + mechanism + structural punch. No agency beat required (the chapter body carries it). |

**Format in both locations:** `*My Man Jeeves:* _[Jeeves-voice text]_` — a single italicized paragraph following the `*My Man Jeeves:*` label inline. No quotation marks around the italic body. Voice conforms to `spec/editorial/reginald-jeeves.voice.md` in both places.

## Components

### 1. Spec file updates

**`spec/editorial/editorial-conventions.md` line 11 — Strategy chapter opener skeleton**

Update the closing element from generic *"a closing quote"* to explicit *`*My Man Jeeves:*` capstone paragraph* (Jeeves voice, capstone shape, positioned between *"The lesson:"* and the `---` rule).

**`spec/editorial/editorial-conventions.md` line 15 — "My Man Jeeves" bullet**

Broaden scope from Skill openers only to cover both uses. One bullet documents that the label marks any Majordomo speech in the book, with two rhetorical shapes keyed to position:

- **Three-beat** for Skill openers (validate → mechanism → agency), because Skills are problem-and-answer entries and need the *"An Agent can…"* pivot.
- **Capstone** for Strategy chapter closers (validate + mechanism + structural punch), because the chapter body that follows carries the agency beat; the capstone's job is commentary on the TV-episode premise.

**`spec/editorial/voice-and-audience.md` line 53 — Jeeves voice paragraph**

Rework so `*My Man Jeeves:*` is no longer scoped to Part Two. The three-beat pattern description stays, tagged as Skill-opener-specific, with a second clause noting that Strategy chapter closers use the capstone shape.

**`spec/editorial/cultural-references.md` line 46 — Murphy Brown entry**

Drop *Specify* from the "Use for" list. The Strategy 0 closer was earlier rewritten and no longer references Murphy Brown. Entry becomes *"Draft only."* Included in this pass for editorial-spec consistency.

### 2. Chapter rewrites (ten Strategy chapters)

| # | Chapter | Current state | Work type |
|---|---|---|---|
| S0 | Specify | Majordomo frame, Jeeves voice | **Label swap** — drop wrapper, rewrap body as `*My Man Jeeves:* _…_`. Voice already conforms. |
| S1 | Decode | Majordomo frame, Jeeves voice | **Label swap** — same treatment as S0. |
| S2 | Prepare | Authorial italic closer | **Voice rewrite** — same substance (the billionaire-class parallel), rewritten in Jeeves. |
| S3 | Draft | No closer | **New closer** — write a Jeeves capstone on the Murphy Brown premise (blank page is a starting problem, not a writing problem). |
| S4 | Navigate | Authorial italic closer + duplicates the paragraph below | **Voice rewrite + de-dup** — rewrite in Jeeves; remove the duplicated paragraph from the following exposition. |
| S5 | Decide | Authorial italic closer + duplicates the paragraph below | **Voice rewrite + de-dup** — same treatment as S4. |
| S6 | Diagnose | Authorial italic closer, ends with *"This chapter is about being Al"* | **Voice rewrite** — drop the chapter-self-reference; let Jeeves land the observation sideways. |
| S7 | Research | Authorial italic closer (Conners commentary) | **Voice rewrite** — preserve the Conners-as-structural-argument substance; translate delivery to Jeeves. |
| S8 | Assert | Authorial italic closer, ends with *"This chapter is about the second one"* | **Voice rewrite** — drop the self-reference. |
| S9 | Create | Authorial italic closer + duplicates the paragraph below | **Voice rewrite + de-dup** — same treatment as S4/S5. |

### 3. Shared rewrite principles

1. **Capstone shape, not three-beat.** Each line does validate + mechanism + structural punch. No *"An Agent can…"* agency beat. The chapter body carries the agency.
2. **No chapter self-reference.** Remove phrases like *"This chapter is about X"* — the chapter speaks for itself; Jeeves doesn't need to announce it.
3. **No duplication of adjacent paragraphs.** The Jeeves capstone and the first paragraph of exposition must do different rhetorical work. If the draft repeats prose, the exposition paragraph is the one to cut or rewrite (the capstone is fixed by the convention; the exposition is flexible).
4. **Voice conforms to the Jeeves bible.** Formal, indirect, unhurried; subordinate clauses over declaratives; understated structural punch; *"I told you so"* without saying it.
5. **Each line anchors on the chapter's TV episode, not on the strategy's abstract concept.** S2's capstone commentates on the Home Improvement hospital scene, not on "preparation" as a topic. This is what makes it a *capstone* rather than a *summary*.

### 4. Cadence variation

Ten Jeeves paragraphs in short order creates a monoculture risk: the reader starts to hear the voice-machinery rather than the voice. Mitigation during implementation:

- Vary sentence length across chapters (not every capstone is three long subordinate-clause sentences).
- Vary the register of disapproval (some lines *observe*, some *note*, some *remark*).
- Vary the verb of the structural punch (not every line closes with *"This is not accidental"* or *"One had only to ask…"*).

The Jeeves bible supports this range — the risk is drift toward a single tic, not the voice itself.

## Pattern Validation (Sample Rewrites)

The two label-swap cases (S0 and S1) demonstrate the typographic transformation. The voice-rewrite cases (S2, S4–S9) and the new-closer case (S3) will be drafted during implementation against this reference pattern.

**Typographic change:** the current wrapper `_"The Majordomo has this to say about X: …"_` carries three pieces of formatting — italic body, quote marks, narrator frame. All three go. The new format is `*My Man Jeeves:*` (bold label) followed by a single italic paragraph with no quote marks.

**Strategy 0 — before:**

```
_"The Majordomo has this to say about requests conveyed without specification: they are, invariably, carried out; the article delivered bears to the article intended a resemblance that one might describe, generously, as figurative; and the matter is, as a rule, taken up a second time. One had only to ask five clarifying questions."_
```

**Strategy 0 — after:**

```
*My Man Jeeves:* _Requests conveyed without specification are, invariably, carried out. The article delivered bears to the article intended a resemblance that one might describe, generously, as figurative, and the matter is, as a rule, taken up a second time. One had only to ask five clarifying questions._
```

Changes: label swap; wrapper dropped; subject (*"requests conveyed without specification"*) hoisted from the narrator's colon into the sentence as its own grammatical subject; semicolons converted to periods to match the period-separated rhythm the Field Guide Jeeves paragraphs use.

**Strategy 1 — before:**

```
_"The Majordomo has this to say about documents written for people other than the person receiving them: they are invariably written at a reading level four grades above the recipient's, contain clauses whose purpose is to limit the recipient's options rather than inform their choices, and are formatted in a way that discourages reading. This is not accidental."_
```

**Strategy 1 — after:**

```
*My Man Jeeves:* _Documents written for people other than the person receiving them are, invariably, written at a reading level four grades above the recipient's. They contain clauses whose purpose is to limit the recipient's options rather than inform their choices, and they are formatted in a way that discourages reading. This is not accidental._
```

**Capstone-shape check on both after-rewrites:**

| Beat | S0 after | S1 after |
|---|---|---|
| **Validate** | *"Requests conveyed without specification are, invariably, carried out."* | *"Documents written for people other than the person receiving them are, invariably, written at a reading level four grades above the recipient's."* |
| **Mechanism** | *"The article delivered bears to the article intended a resemblance … generously, as figurative … taken up a second time."* | *"They contain clauses whose purpose is to limit … formatted in a way that discourages reading."* |
| **Structural punch** | *"One had only to ask five clarifying questions."* | *"This is not accidental."* |

Both land the shape.

## Out of Scope

- Field Guide Skill openers stay as-is (already `*My Man Jeeves:*`, already three-beat, already Jeeves voice).
- TRINITRON art and episode/lesson prose are unchanged; only the closer element is edited.
- Chapter exposition bodies are edited only where they duplicate the capstone (S4, S5, S9) — otherwise untouched.
- Content changes to the TV-episode references themselves (except the Murphy Brown cross-reference flagged under spec updates).

## Success Criteria

1. Every Strategy chapter (S0–S9) ends its opener with a `*My Man Jeeves:*` paragraph in Jeeves voice, capstone shape.
2. Every Skill entry in the Field Guide continues to open with a `*My Man Jeeves:*` paragraph in Jeeves voice, three-beat shape. No Skill opener regressions.
3. The four spec files listed above accurately describe the new convention, and the book's editorial spec is internally consistent (no sentence anywhere scopes `*My Man Jeeves:*` to Part Two only).
4. Duplication between capstone and exposition (S4, S5, S9) is resolved — the two paragraphs do different rhetorical work.
5. No chapter self-reference (*"This chapter is about X"*) survives in any Jeeves capstone.
6. The ePub build (`npm run build`) succeeds and the ten rewritten capstones render correctly in the output.
