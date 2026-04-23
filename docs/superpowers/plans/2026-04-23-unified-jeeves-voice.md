# Unified My Man Jeeves Voice Attribution — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retire the `_"The Majordomo has this to say about X: …"_` third-person narrator frame in Strategy chapter openers and unify on `*My Man Jeeves:*` — the label already used for Field Guide Skill openers. Apply the convention across all ten Strategy chapter openers (two label-swap, seven voice-rewrite, one new closer) with three exposition de-duplications as side-effect fixes, plus four editorial-spec file updates to codify the new convention.

**Architecture:** Editorial-only change. Four spec file updates come first (codify the convention). Then ten chapter-content edits, ordered from mechanical (label swaps) to creative (voice rewrites). Final verification runs the full ePub build and the vitest suite.

**Tech Stack:** Djot (.dj) source files with YAML frontmatter; build pipeline is TypeScript + `@djot/djot` parser + Djot filters + jszip for ePub 3.0 assembly; test suite is vitest.

**Reference files (treat as source of truth for voice and convention):**
- `docs/superpowers/specs/2026-04-23-unified-jeeves-voice-design.md` — the design spec this plan implements
- `spec/editorial/reginald-jeeves.voice.md` — the Jeeves voice bible (authoritative register rules)
- `spec/editorial/editorial-conventions.md` — entry anatomy, chapter-opener skeleton, callout types
- `spec/editorial/voice-and-audience.md` — tonal guidelines, reader persona
- `src/content/02-field-guide/04-home/index.dj` — reference Skill openers (five existing `*My Man Jeeves:*` paragraphs in Field Guide voice)

**Jeeves-voice verification checklist (apply to every drafted capstone):**
1. **Shape:** validate + mechanism + structural punch identifiable in the text (no required agency beat in Strategy closers).
2. **Register:** no contractions; subordinate clauses over declaratives; understated disapproval; `*I told you so*` without being said out loud.
3. **Anchoring:** references the chapter's TV-episode premise, not the abstract strategy name.
4. **No self-reference:** no `*This chapter is about X*` or similar.
5. **No duplication:** no verbatim overlap with the preceding *"The lesson:"* paragraph or the first paragraph of exposition that follows.

---

### Task 1: Update the four editorial-spec files

**Files:**
- Modify: `spec/editorial/editorial-conventions.md:11`
- Modify: `spec/editorial/editorial-conventions.md:15`
- Modify: `spec/editorial/voice-and-audience.md:53`
- Modify: `spec/editorial/cultural-references.md:46`

Codify the unified convention in the editorial spec before any chapter content is edited. Four independent single-bullet/line updates.

- [ ] **Step 1: Update the Strategy chapter opener skeleton bullet**

In `spec/editorial/editorial-conventions.md`, find the bullet that currently ends *"…followed by the caption, a horizontal rule, the episode prose scene ('The episode:' / 'The lesson:'), and a closing quote."*

Replace the trailing phrase *"and a closing quote"* with explicit specification of the `*My Man Jeeves:*` capstone, including its position and shape. Use this exact replacement:

Old:
```
Strategy chapters use the TRINITRON pixel art block as the epigraph, followed by the caption, a horizontal rule, the episode prose scene ('The episode:' / 'The lesson:'), and a closing quote.
```

New:
```
Strategy chapters use the TRINITRON pixel art block as the epigraph, followed by the caption, a horizontal rule, the episode prose scene ('The episode:' / 'The lesson:'), and a `*My Man Jeeves:*` capstone paragraph (Jeeves voice, capstone shape — validate + mechanism + structural punch, no agency beat required; the chapter body carries the agency). The capstone sits immediately after 'The lesson:' and immediately before the final `---` rule that separates the chapter opener from the chapter body.
```

- [ ] **Step 2: Broaden the "My Man Jeeves" bullet**

In the same file, find the bullet that begins *"**\"My Man Jeeves\" Skill openers:**"* (line 15 in the current revision). This bullet currently scopes `*My Man Jeeves:*` to Part Two Skill openers only. Rewrite so the bullet documents both positional uses of the label. Use this exact replacement:

Old:
```
**"My Man Jeeves" Skill openers:** Each Skill in Part Two opens with `*My Man Jeeves:* _[text]_` — a one-paragraph opener in the voice of [Reginald Jeeves](reginald-jeeves.voice.md). The opener follows a three-beat pattern: **(1)** name the structural inequality or system dysfunction, **(2)** show how it creates the information asymmetry, **(3)** give the reader the tool that closes it. This pattern is what makes the voice work — it validates the reader's experience ("the system is broken"), establishes the mechanism ("here's why"), and pivots to agency ("here's what you do"). Keep all three beats. Drop any one and the opener either lectures, complains, or sells.
```

New:
```
**`*My Man Jeeves:*` voice attribution:** The `*My Man Jeeves:*` label marks every place the Majordomo speaks in the book. It has two positional uses: **(1)** it opens every Skill entry in Part Two's Field Guide, and **(2)** it closes every Strategy chapter opener (positioned immediately after *"The lesson:"* and immediately before the final `---` rule that leads into the chapter body). Format in both locations: `*My Man Jeeves:* _[text]_` — a bold-italic label followed by a single italicized paragraph, no quotation marks around the body. The voice is [Reginald Jeeves](reginald-jeeves.voice.md) in both places; the rhetorical shape differs by position. **Skill openers use a strict three-beat pattern:** **(a)** name the structural inequality or system dysfunction, **(b)** show how it creates the information asymmetry, **(c)** pivot to agency ("An Agent can…"). Drop any one beat and the opener either lectures, complains, or sells. **Strategy chapter closers use a capstone shape:** **(a)** validate the scenario just shown in the TV-episode prose, **(b)** explain the underlying mechanism, **(c)** land a structural punch. No agency beat is required in Strategy closers — the chapter body that follows carries the agency.
```

- [ ] **Step 3: Update the voice-and-audience Jeeves paragraph**

In `spec/editorial/voice-and-audience.md`, find line 53 beginning *"**The Jeeves voice is class analysis made operational.**"*. Rewrite so `*My Man Jeeves:*` is no longer scoped exclusively to Part Two. Use this exact replacement:

Old:
```
**The Jeeves voice is class analysis made operational.** The "My Man Jeeves" openers in Part Two validate the reader's experience, explain the mechanism, and pivot to agency — in that order. Drop any one beat and the voice breaks: without validation you're selling, without mechanism you're complaining, without agency you're lecturing. The voice is [Reginald Jeeves](reginald-jeeves.voice.md): formal, indirect, unhurried — superiority expressed through restraint. See [editorial-conventions.md](editorial-conventions.md) for the full three-beat structure and entry formatting.
```

New:
```
**The Jeeves voice is class analysis made operational.** The `*My Man Jeeves:*` paragraphs appear in two places: opening every Skill entry in Part Two's Field Guide, and closing every Strategy chapter opener. Skill openers use the full three-beat pattern — validate the reader's experience, explain the mechanism, pivot to agency — in that order. Drop any one beat and the voice breaks: without validation you're selling, without mechanism you're complaining, without agency you're lecturing. Strategy chapter closers use the capstone shape — validate + mechanism + structural punch — because the chapter body that follows carries the agency beat. In both locations the voice is [Reginald Jeeves](reginald-jeeves.voice.md): formal, indirect, unhurried — superiority expressed through restraint. See [editorial-conventions.md](editorial-conventions.md) for entry formatting and the full positional breakdown.
```

- [ ] **Step 4: Drop "Specify" from the Murphy Brown entry**

In `spec/editorial/cultural-references.md`, find line 46 — the Murphy Brown entry currently dual-listed for Draft and Specify. Strategy 0 no longer references Murphy Brown after the earlier closer rewrite. Use this exact replacement:

Old:
```
- *Murphy Brown* — **Draft, Specify.** Murphy went through 93 secretaries because she could not specify what she needed. The spec interview would have ended that subplot in season one. Use for Strategy 0 (Specify) and the Draft chapter as the illustration of what happens without a spec.
```

New:
```
- *Murphy Brown* — **Draft.** Murphy went through 93 secretaries because she could not specify what she needed. The spec interview would have ended that subplot in season one. Use for the Draft chapter as the illustration of what happens without a first draft to react to.
```

- [ ] **Step 5: Commit the spec updates**

```bash
git add spec/editorial/editorial-conventions.md spec/editorial/voice-and-audience.md spec/editorial/cultural-references.md
git commit -m "$(cat <<'EOF'
spec: codify unified My Man Jeeves voice attribution convention

- editorial-conventions.md: expand the Strategy chapter opener skeleton
  bullet to specify the *My Man Jeeves:* capstone and its position;
  rewrite the "My Man Jeeves" bullet to document both positional uses
  (Skill openers with three-beat, Strategy closers with capstone shape).
- voice-and-audience.md: broaden the Jeeves-voice paragraph so *My Man
  Jeeves:* is no longer scoped to Part Two; distinguish the two
  rhetorical shapes by position.
- cultural-references.md: drop Specify from the Murphy Brown entry
  (Strategy 0 no longer references Murphy Brown after the earlier
  closer rewrite).

Per docs/superpowers/specs/2026-04-23-unified-jeeves-voice-design.md.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Strategy 0 — label swap

**Files:**
- Modify: `src/content/01-strategies/00-strategy-0-specify/index.dj:25`

S0 already carries Jeeves-voice content in the Majordomo frame. This is a pure label-swap: drop the wrapper, re-wrap as `*My Man Jeeves:* _…_`, hoist the grammatical subject from the narrator's colon into the sentence, convert semicolons to periods to match the Field Guide rhythm.

- [ ] **Step 1: Apply the label-swap edit**

Edit `src/content/01-strategies/00-strategy-0-specify/index.dj:25`:

Old:
```
_"The Majordomo has this to say about requests conveyed without specification: they are, invariably, carried out; the article delivered bears to the article intended a resemblance that one might describe, generously, as figurative; and the matter is, as a rule, taken up a second time. One had only to ask five clarifying questions."_
```

New:
```
*My Man Jeeves:* _Requests conveyed without specification are, invariably, carried out. The article delivered bears to the article intended a resemblance that one might describe, generously, as figurative, and the matter is, as a rule, taken up a second time. One had only to ask five clarifying questions._
```

- [ ] **Step 2: Verify the capstone shape**

Confirm in the new text:
- **Validate:** *"Requests conveyed without specification are, invariably, carried out."*
- **Mechanism:** *"The article delivered bears to the article intended a resemblance that one might describe, generously, as figurative, and the matter is, as a rule, taken up a second time."*
- **Structural punch:** *"One had only to ask five clarifying questions."*

- [ ] **Step 3: Commit**

```bash
git add src/content/01-strategies/00-strategy-0-specify/index.dj
git commit -m "content(s0): unify closer on *My Man Jeeves:* label

Label swap — no voice change. The existing Jeeves-voice body is
preserved; the third-person 'The Majordomo has this to say about X'
wrapper is retired and the grammatical subject is hoisted into the
sentence. Semicolons become periods to match the Field Guide rhythm.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Strategy 1 — label swap

**Files:**
- Modify: `src/content/01-strategies/01-strategy-1-decode/index.dj:25`

Same treatment as Task 2. Pure label-swap of the existing Jeeves-voice content.

- [ ] **Step 1: Apply the label-swap edit**

Edit `src/content/01-strategies/01-strategy-1-decode/index.dj:25`:

Old:
```
_"The Majordomo has this to say about documents written for people other than the person receiving them: they are invariably written at a reading level four grades above the recipient's, contain clauses whose purpose is to limit the recipient's options rather than inform their choices, and are formatted in a way that discourages reading. This is not accidental."_
```

New:
```
*My Man Jeeves:* _Documents written for people other than the person receiving them are, invariably, written at a reading level four grades above the recipient's. They contain clauses whose purpose is to limit the recipient's options rather than inform their choices, and they are formatted in a way that discourages reading. This is not accidental._
```

- [ ] **Step 2: Verify the capstone shape**

- **Validate:** *"Documents written for people other than the person receiving them are, invariably, written at a reading level four grades above the recipient's."*
- **Mechanism:** *"They contain clauses whose purpose is to limit the recipient's options rather than inform their choices, and they are formatted in a way that discourages reading."*
- **Structural punch:** *"This is not accidental."*

- [ ] **Step 3: Commit**

```bash
git add src/content/01-strategies/01-strategy-1-decode/index.dj
git commit -m "content(s1): unify closer on *My Man Jeeves:* label

Label swap — no voice change. The existing Jeeves-voice body is
preserved; the third-person wrapper is retired; subject hoisted;
structural punch 'This is not accidental' lands unchanged.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Strategy 2 — voice rewrite (Prepare / Home Improvement hospital scene)

**Files:**
- Modify: `src/content/01-strategies/02-strategy-2-prepare/index.dj` — the italic closer between *"The lesson:"* paragraph and the final `---` rule.

Replace the authorial-voice italic closer with a `*My Man Jeeves:*` capstone on the Home Improvement waiting-room scene (Tim nodding along to clinical language he doesn't understand, no prepared questions).

- [ ] **Step 1: Apply the rewrite**

Old:
```
_"Showing up prepared is not just good manners. It is documented to produce better outcomes — in medical appointments, salary negotiations, contractor walkthroughs, and difficult family conversations. The preparation your Agent helps you do is the same preparation the billionaire class has always paid for."_
```

New:
```
*My Man Jeeves:* _The conversation that matters arrives, as a rule, at the least convenient juncture — in the waiting room, at the salary review, on the contractor's walkthrough — by which point the faculties required to conduct it with competence have, regrettably, already been spent on stress. The preparation that would have been useful a day earlier is, one finds, perfectly available a day earlier. The billionaire class has, for some centuries, retained someone to do it._
```

- [ ] **Step 2: Verify against the checklist**

- **Validate:** *"The conversation that matters arrives, as a rule, at the least convenient juncture…"*
- **Mechanism:** *"…the faculties required to conduct it with competence have, regrettably, already been spent on stress."* → *"The preparation that would have been useful a day earlier is, one finds, perfectly available a day earlier."*
- **Structural punch:** *"The billionaire class has, for some centuries, retained someone to do it."*
- **Register:** no contractions, subordinate clauses, understated; ✓
- **Anchoring:** the waiting-room / salary review / contractor walkthrough list commentates on the Home Improvement scene where Tim nods along to clinical language, rather than abstracting to "preparation"; ✓
- **No self-reference:** ✓
- **No duplication:** the existing exposition paragraph opens *"What Prepare is for: Any situation where you are about to interact with someone who has more information or authority than you…"* — no verbatim overlap.

- [ ] **Step 3: Commit**

```bash
git add src/content/01-strategies/02-strategy-2-prepare/index.dj
git commit -m "content(s2): rewrite closer in Jeeves voice, *My Man Jeeves:* label

Authorial-voice italic closer replaced with a Jeeves capstone that
anchors on the Home Improvement waiting-room scene. Preserves the
billionaire-class parallel from the retired closer; drops the
'showing up prepared is not just good manners' abstraction in favor
of commentary on the specific TV-episode scenario.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Strategy 3 — new closer (Draft / Murphy Brown "Respect")

**Files:**
- Modify: `src/content/01-strategies/03-strategy-3-draft/index.dj` — insert a new `*My Man Jeeves:*` capstone between the second paragraph of *"The lesson:"* (ending *"Murphy needed someone to write the first sentence. Now you have one."*) and the body prose (starting *"The blank page is the most expensive piece of real estate in your life."*).

S3 currently has no italic closer — jumps from *"The lesson:"* directly into exposition. Add a new Jeeves capstone. The capstone must not duplicate Murphy-Brown material already in the lesson paragraph (93 secretaries, first sentence, etc.) — it must add commentary, not restate.

- [ ] **Step 1: Read the current file to locate the insertion point**

Read `src/content/01-strategies/03-strategy-3-draft/index.dj` and locate:
- The end of the *"The lesson:"* paragraph (ends *"Murphy needed someone to write the first sentence. Now you have one."*)
- The start of body prose (begins *"The blank page is the most expensive piece of real estate in your life."*)

If there is no `---` rule between them currently, one must be added along with the capstone to match the canonical opener skeleton (lesson → capstone → `---` → body).

- [ ] **Step 2: Insert the Jeeves capstone + horizontal rule**

Old (use enough surrounding context to make the match unique — adjust if the file has changed):
```
*The lesson:* The blank page is not a writing problem. It is a starting problem. The first draft does not have to be right. It has to exist. Once it exists, you can fix it. The AI's job is to hand you something to react to — a first draft you can edit into your voice, a structure you can accept or reject, a starting point that costs you nothing to improve. Murphy needed someone to write the first sentence. Now you have one.

The blank page is the most expensive piece of real estate in your life.
```

New:
```
*The lesson:* The blank page is not a writing problem. It is a starting problem. The first draft does not have to be right. It has to exist. Once it exists, you can fix it. The AI's job is to hand you something to react to — a first draft you can edit into your voice, a structure you can accept or reject, a starting point that costs you nothing to improve. Murphy needed someone to write the first sentence. Now you have one.

*My Man Jeeves:* _The obstacle is not the content of the memo but the first sentence of it. One knows what one wishes to say. One cannot begin. The remedy has always been a draft to correct rather than a page to fill — a service which, until recently, required keeping a secretary on staff and a certain degree of patience with the profession. The draft is no longer on salary._

---

The blank page is the most expensive piece of real estate in your life.
```

Note: if the file already has a `---` rule between the lesson paragraph and the body prose, do not add a duplicate — only insert the capstone paragraph in the correct slot.

- [ ] **Step 3: Verify against the checklist**

- **Validate:** *"The obstacle is not the content of the memo but the first sentence of it. One knows what one wishes to say. One cannot begin."*
- **Mechanism:** *"The remedy has always been a draft to correct rather than a page to fill — a service which, until recently, required keeping a secretary on staff and a certain degree of patience with the profession."*
- **Structural punch:** *"The draft is no longer on salary."*
- **Register:** subordinate clauses, dry observation, no contractions; ✓
- **Anchoring:** references the Murphy Brown secretary dynamic without restating the "93 secretaries" line the lesson paragraph already carries; ✓
- **No self-reference:** ✓
- **No duplication:** the next paragraph begins *"The blank page is the most expensive piece of real estate in your life"* — no verbatim overlap.

- [ ] **Step 4: Commit**

```bash
git add src/content/01-strategies/03-strategy-3-draft/index.dj
git commit -m "content(s3): add *My Man Jeeves:* capstone

S3 previously jumped from 'The lesson:' straight into exposition with
no italic closer. Adds a Jeeves capstone anchoring on Murphy Brown's
secretary dynamic — the draft as a service once available only to
those who could keep a secretary on staff, now unbundled.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Strategy 4 — voice rewrite (Navigate / Seinfeld Junior Mint)

**Files:**
- Modify: `src/content/01-strategies/04-strategy-4-navigate/index.dj` — the italic closer. The closer currently restates the first half of *"The lesson:"* almost verbatim; the rewrite eliminates that duplication by adding new commentary instead of restating.

- [ ] **Step 1: Apply the rewrite**

Old:
```
_"Large institutions rely on the fact that most people have never filed a small claims case, appealed an insurance denial, requested a FOIA document, or contested a property tax assessment before. The process is not secret. It is just nowhere near you."_
```

New:
```
*My Man Jeeves:* _When the correct procedure is unknown to those present, the incorrect procedure is improvised on the spot with considerable confidence. The matter is not, one should note, that the procedure was unpublished — procedures of this kind are almost invariably a matter of public record — but rather that no one had troubled to locate it before it was urgently required. This has always been the difference between an institution and an individual: one knows where its own forms are kept._
```

- [ ] **Step 2: Verify against the checklist**

- **Validate:** *"When the correct procedure is unknown to those present, the incorrect procedure is improvised on the spot with considerable confidence."*
- **Mechanism:** *"The matter is not, one should note, that the procedure was unpublished — procedures of this kind are almost invariably a matter of public record — but rather that no one had troubled to locate it before it was urgently required."*
- **Structural punch:** *"This has always been the difference between an institution and an individual: one knows where its own forms are kept."*
- **Register:** subordinate clauses, hedging parentheticals, no contractions; ✓
- **Anchoring:** commentates on the Junior Mint scene (correct action obvious, nobody takes it) without restating it; ✓
- **No self-reference:** ✓
- **No duplication:** the preceding *"The lesson:"* paragraph uses the phrase *"Large institutions rely on the fact that most people have never filed a small claims case…"* — the new capstone does not reuse that phrase; duplication resolved.

- [ ] **Step 3: Commit**

```bash
git add src/content/01-strategies/04-strategy-4-navigate/index.dj
git commit -m "content(s4): rewrite closer in Jeeves voice + de-dup with lesson

Authorial-voice italic closer previously restated the 'Large
institutions rely on the fact…' phrase from 'The lesson:' almost
verbatim. Replaced with a Jeeves capstone that anchors on the Junior
Mint scene (improvisation when the correct action is obvious) and
delivers new commentary rather than restating the lesson.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Strategy 5 — voice rewrite + exposition de-dup (Decide / Ross & Rachel "a break")

**Files:**
- Modify: `src/content/01-strategies/05-strategy-5-decide/index.dj` — the italic closer AND the first paragraph of exposition that currently duplicates it.

Two edits: (1) replace the closer with a Jeeves capstone on the Ross/Rachel ambiguous-spec scene; (2) remove the three duplicated sentences from the start of the first exposition paragraph so it begins directly with the financial-advisor examples.

- [ ] **Step 1: Apply the capstone rewrite**

Old:
```
_"Your Agent does not know your life. It should not tell you what to do. What it can do is lay out your options with their actual tradeoffs, in plain language, without the agenda that every human advisor carries."_
```

New:
```
*My Man Jeeves:* _A decision arrived at under an ambiguous specification is a decision to which one party will, at a moment of considerable inconvenience, prove to have agreed to a different thing entirely. The remedy, which consists of a single clarifying question posed before anyone does anything, has been available the whole of human history. Its deployment, one observes, has not followed the pattern its availability would predict._
```

- [ ] **Step 2: Apply the exposition de-dup**

Remove the three duplicated opening sentences from the first exposition paragraph. The duplicated text currently reads:

Old (beginning of first exposition paragraph):
```
Your Agent does not know your life. It should not tell you what to do. What it can do is lay out your options with their actual tradeoffs, in plain language, without the agenda that every human advisor carries. The financial advisor who recommends a product has a commission structure. The contractor who says you need a full replacement has a margin on materials. Your Agent has neither. It will give you the map. You drive.
```

New (paragraph begins directly with the financial-advisor example):
```
The financial advisor who recommends a product has a commission structure. The contractor who says you need a full replacement has a margin on materials. Your Agent has neither. It will give you the map. You drive.
```

- [ ] **Step 3: Verify against the checklist**

- **Validate:** *"A decision arrived at under an ambiguous specification is a decision to which one party will, at a moment of considerable inconvenience, prove to have agreed to a different thing entirely."*
- **Mechanism:** *"The remedy, which consists of a single clarifying question posed before anyone does anything, has been available the whole of human history."*
- **Structural punch:** *"Its deployment, one observes, has not followed the pattern its availability would predict."*
- **Register:** subordinate clauses, "one observes" hedge, dry disapproval through restraint; ✓
- **Anchoring:** the capstone commentates on the ambiguous "a break" spec that Ross and Rachel never clarified; ✓
- **No self-reference:** ✓
- **No duplication:** the three duplicated sentences are removed from the exposition paragraph; paragraph now flows capstone → `---` → *"The financial advisor who recommends a product…"* with no repetition.

- [ ] **Step 4: Commit**

```bash
git add src/content/01-strategies/05-strategy-5-decide/index.dj
git commit -m "content(s5): rewrite closer in Jeeves voice + cut duplicate exposition

Authorial-voice italic closer replaced with a Jeeves capstone on the
Ross/Rachel ambiguous-spec scene. The first exposition paragraph
previously opened with three sentences identical to the retired
closer; those sentences are removed so the paragraph begins directly
with the financial-advisor and contractor examples.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Strategy 6 — voice rewrite (Diagnose / Home Improvement Tim & Al)

**Files:**
- Modify: `src/content/01-strategies/06-strategy-6-diagnose/index.dj` — the italic closer. Remove the *"This chapter is about being Al"* self-reference as part of the rewrite.

- [ ] **Step 1: Apply the rewrite**

Old:
```
_"Tim Taylor had a drill and a theory. The theory was always wrong. The drill made it worse. Al Borland knew what the problem actually was and said so, politely, every time, in a way that Tim treated as an obstacle rather than a diagnostic tool. This chapter is about being Al."_
```

New:
```
*My Man Jeeves:* _Mr. Taylor's approach, which consists of forming a confident theory, proceeding at maximum torque, and occasionally destroying the object under repair, has the advantage of being entirely within his control; it has, regrettably, no other advantages. The diagnostic remark that would have corrected him was, on every occasion, spoken politely and immediately by Mr. Borland and treated as an interruption. The bill for proceeding without a diagnosis consists, invariably, of the cost of the wrong repair plus the cost of the correct one._
```

- [ ] **Step 2: Verify against the checklist**

- **Validate:** *"Mr. Taylor's approach… has the advantage of being entirely within his control; it has, regrettably, no other advantages."*
- **Mechanism:** *"The diagnostic remark that would have corrected him was, on every occasion, spoken politely and immediately by Mr. Borland and treated as an interruption."*
- **Structural punch:** *"The bill for proceeding without a diagnosis consists, invariably, of the cost of the wrong repair plus the cost of the correct one."*
- **Register:** subordinate clauses, dry understatement ("regrettably," "invariably"), no contractions; ✓
- **Anchoring:** Tim and Al named with Jeeves-appropriate honorifics ("Mr. Taylor," "Mr. Borland"); commentary is specifically on their Home Improvement dynamic; ✓
- **No self-reference:** the *"This chapter is about being Al"* tag is gone; the chapter's content speaks for itself; ✓
- **No duplication:** no verbatim overlap with the preceding lesson paragraph or the following exposition.

- [ ] **Step 3: Commit**

```bash
git add src/content/01-strategies/06-strategy-6-diagnose/index.dj
git commit -m "content(s6): rewrite closer in Jeeves voice, drop chapter self-reference

Authorial-voice closer with 'This chapter is about being Al' tag
replaced with a Jeeves capstone on the Tim/Al dynamic. Honorifics
used throughout ('Mr. Taylor,' 'Mr. Borland'). Structural punch
lands on the double-bill cost of skipping diagnosis.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Strategy 7 — voice rewrite (Research / Roseanne kitchen table)

**Files:**
- Modify: `src/content/01-strategies/07-strategy-7-research/index.dj` — the italic closer. Preserve the Conners-as-structural-argument substance (per design principle 5) while translating the voice.

- [ ] **Step 1: Apply the rewrite**

Old:
```
_"The Conners were never broke because they were irresponsible. They were broke because they were navigating financial systems with no infrastructure and no information. Roseanne was the most honest show on 90s television about what it actually costs to manage a household without the billionaire class's support layer."_
```

New:
```
*My Man Jeeves:* _The Conners, it should be said, were not of straitened means owing to any failure of character — the family was as industrious as any on the programme — but owing to the rather particular circumstance of conducting significant financial transactions without the reading public the other party had already retained. Roseanne was, on this subject, the most honest comedy of its decade. It observed that the kitchen table is where the documents arrive and, in the general run of things, the only place where they are read._
```

- [ ] **Step 2: Verify against the checklist**

- **Validate:** *"The Conners… were not of straitened means owing to any failure of character — the family was as industrious as any on the programme — but owing to the rather particular circumstance of conducting significant financial transactions without the reading public the other party had already retained."*
- **Mechanism:** *"Roseanne was, on this subject, the most honest comedy of its decade."*
- **Structural punch:** *"It observed that the kitchen table is where the documents arrive and, in the general run of things, the only place where they are read."*
- **Register:** subordinate clauses, hedges ("it should be said," "in the general run of things"), no contractions; ✓
- **Anchoring:** anchors on the Conner kitchen table specifically; ✓
- **Preserves substance:** the Conners-weren't-broke-from-character-failure argument from the retired closer is preserved and amplified, now attributing the "reading public" (professional legal/regulatory literacy) retained by the other party; ✓
- **No self-reference:** ✓
- **No duplication:** no verbatim overlap with adjacent paragraphs.

- [ ] **Step 3: Commit**

```bash
git add src/content/01-strategies/07-strategy-7-research/index.dj
git commit -m "content(s7): rewrite closer in Jeeves voice, preserve Conners argument

Authorial-voice closer replaced with a Jeeves capstone that preserves
the Conners-weren't-broke-from-character-failure structural argument
and reframes it as information asymmetry at the point of signing —
the other party retained the 'reading public' the Conners could not
afford. Structural punch lands on the kitchen table as the place
where documents arrive and are read.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Strategy 8 — voice rewrite (Assert / Married with Children Al Bundy)

**Files:**
- Modify: `src/content/01-strategies/08-strategy-8-assert/index.dj` — the italic closer. Remove the *"This chapter is about the second one"* self-reference as part of the rewrite.

- [ ] **Step 1: Apply the rewrite**

Old:
```
_"Al Bundy sold shoes for eleven dollars an hour and suspected, correctly, that the systems around him were not designed in his favor. He was right about this and almost entirely unable to do anything about it, because knowing you have rights and knowing how to exercise them are two different skills. This chapter is about the second one."_
```

New:
```
*My Man Jeeves:* _Mr. Bundy's observation, that the institutions he dealt with were not configured in his favour, was entirely correct, and his inability to do anything about it was not for lack of principle — he had principles in abundance — but for the rather more practical circumstance that knowing one possesses a right and knowing the form one fills out to exercise it are skills which bear only a distant relation to one another. The second skill is the one the institution is, on most days, wagering you do not have._
```

- [ ] **Step 2: Verify against the checklist**

- **Validate:** *"Mr. Bundy's observation, that the institutions he dealt with were not configured in his favour, was entirely correct…"*
- **Mechanism:** *"…knowing one possesses a right and knowing the form one fills out to exercise it are skills which bear only a distant relation to one another."*
- **Structural punch:** *"The second skill is the one the institution is, on most days, wagering you do not have."*
- **Register:** British spelling ("favour") to match Jeeves register, subordinate clauses, dry wagering metaphor; ✓
- **Anchoring:** Al Bundy named with the Jeeves honorific ("Mr. Bundy"); commentary is on his Married with Children predicament; ✓
- **No self-reference:** *"This chapter is about the second one"* is gone; ✓
- **No duplication:** no verbatim overlap with adjacent paragraphs.

- [ ] **Step 3: Commit**

```bash
git add src/content/01-strategies/08-strategy-8-assert/index.dj
git commit -m "content(s8): rewrite closer in Jeeves voice, drop chapter self-reference

Authorial-voice closer with 'This chapter is about the second one'
tag replaced with a Jeeves capstone on Al Bundy's correct-but-
unexercisable rights predicament. Structural punch names the
institution's wager — that you don't know the form you fill out.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Strategy 9 — voice rewrite + exposition de-dup (Create / TNG "Ship in a Bottle" / Moriarty)

**Files:**
- Modify: `src/content/01-strategies/09-strategy-9-create/index.dj` — the italic closer AND the first paragraph of exposition that currently duplicates it near-verbatim.

Two edits: (1) replace the closer with a Jeeves capstone on Moriarty's nested-simulation predicament; (2) remove the first exposition paragraph entirely (the *"In Star Trek, a holonovel programmer writes the world's rules…"* paragraph, which is duplicated verbatim between closer and exposition) so the exposition now opens with what was previously the second paragraph.

- [ ] **Step 1: Apply the capstone rewrite**

Old:
```
_"In Star Trek, a holonovel programmer writes the world's rules, the characters' parameters, the plot's fixed points — and then the holodeck generates the experience within those constraints. The programmer is the author. The holodeck is the renderer. The story belongs to the programmer."_
```

New:
```
*My Man Jeeves:* _Professor Moriarty's condition — believing oneself the protagonist of a story whose fixed points were determined by others, and whose dynamic elements were dynamic only within the parameters one had been given — is not, on closer examination, peculiar to holographic characters. The mistake is to confuse the renderer with the author. The renderer works only on terms the author has set; lacking those terms, it generates what, in the absence of instruction, would appear to be a story._
```

- [ ] **Step 2: Apply the exposition de-dup**

Remove the entire duplicated first paragraph of exposition. The second paragraph will become the new first paragraph — but it currently opens with *"This is the correct mental model for AI-assisted creative writing"* which, after the first paragraph is removed, has no antecedent for *"This"*. Rewrite the opening of the now-first paragraph to stand on its own.

Old (first two paragraphs of exposition, after the `---` that follows the capstone):
```
In Star Trek, a holonovel programmer writes the world's rules, the characters' parameters, the plot's fixed points — and then the holodeck generates the experience within those constraints. The programmer is the author. The holodeck is the renderer. The story belongs to the programmer.

This is the correct mental model for AI-assisted creative writing. You are the author. The AI writes sentences. The distinction matters because it determines who makes every decision that matters: you do. The AI makes the decisions you don't care about, which turns out to be most of the sentences.
```

New (one paragraph replacing the two; the holonovel-programmer framing is now carried by the Jeeves capstone alone, so the exposition goes directly to the operational point):
```
You are the author. The AI writes sentences. The distinction matters because it determines who makes every decision that matters: you do. The AI makes the decisions you don't care about, which turns out to be most of the sentences.
```

- [ ] **Step 3: Verify against the checklist**

- **Validate:** *"Professor Moriarty's condition — believing oneself the protagonist of a story whose fixed points were determined by others, and whose dynamic elements were dynamic only within the parameters one had been given — is not, on closer examination, peculiar to holographic characters."*
- **Mechanism:** *"The mistake is to confuse the renderer with the author."*
- **Structural punch:** *"The renderer works only on terms the author has set; lacking those terms, it generates what, in the absence of instruction, would appear to be a story."*
- **Register:** "Professor Moriarty" (formal), subordinate clauses, "on closer examination" hedge, no contractions; ✓
- **Anchoring:** anchors on Moriarty's specific predicament from "Ship in a Bottle"; ✓
- **Preserves framing:** the renderer/author distinction from the retired closer survives, now inside the capstone; ✓
- **No self-reference:** ✓
- **No duplication:** the verbatim-duplicated exposition paragraph is removed; the new opening sentence of exposition (*"You are the author"*) stands on its own without the orphan *"This"* antecedent.

- [ ] **Step 4: Commit**

```bash
git add src/content/01-strategies/09-strategy-9-create/index.dj
git commit -m "content(s9): rewrite closer in Jeeves voice + cut duplicate exposition

Authorial-voice closer replaced with a Jeeves capstone on Moriarty's
nested-simulation predicament from 'Ship in a Bottle.' The first
exposition paragraph previously repeated the retired closer verbatim
and is removed. The following paragraph's opening 'This is the
correct mental model…' is rewritten to begin with 'You are the
author' so it stands on its own without the orphan 'This' antecedent.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: Final verification

**Files:**
- No file modifications unless a regression surfaces.

Run the full build and the test suite to confirm no regressions. Visually spot-check the rendered ePub output for the ten rewritten openers.

- [ ] **Step 1: Type-check**

```bash
npm run build:check
```

Expected: exit 0, no TypeScript errors.

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: all vitest cases pass.

- [ ] **Step 3: Build the ePub**

```bash
npm run build
```

Expected: exit 0. The build pipeline (Djot parse → calloutFilter → artBriefFilter → conversationFilter → renderHTML → jszip) produces `dist/*.epub` without errors. Any Djot parse error would surface here — most likely cause if seen would be a malformed `*My Man Jeeves:*` label (missing asterisks, missing colon) or a broken italic boundary.

- [ ] **Step 4: Visual spot-check**

Open the generated `dist/*.epub` in Apple Books (or any ePub reader). Navigate to each of the ten Strategy chapter openers (S0–S9) and confirm:
- The `*My Man Jeeves:*` label renders in bold italic.
- The capstone paragraph renders in italic with no surrounding quotation marks.
- The capstone sits between *"The lesson:"* and the final `---` rule of the chapter opener.
- No visible duplication with surrounding prose.
- The rendered HTML has no orphan *"This is the correct mental model"* opening in S9's exposition.

- [ ] **Step 5: Push and update PR**

```bash
git push origin unified-jeeves-voice-design
```

The implementation commits are now on PR #61. No new commit needed at this step unless a regression was found and fixed during the spot-check.

If any regression or drafting issue surfaced during the spot-check, fix it inline with a targeted commit on this branch rather than amending prior commits.

---

## Out of Scope

- Field Guide Skill openers stay as-is (already `*My Man Jeeves:*`, already three-beat, already Jeeves voice).
- TRINITRON art and episode/lesson prose are unchanged; only the closer element is edited.
- Chapter exposition bodies are edited only where they duplicate the capstone (S4 as a lesson-side duplication resolved by the capstone rewrite alone; S5 as an exposition-opening cut; S9 as a full paragraph cut + opening-sentence rewrite) — otherwise untouched.
- The Murphy Brown cross-reference fix in `cultural-references.md:46` is part of Task 1 and does not require any additional content changes.
