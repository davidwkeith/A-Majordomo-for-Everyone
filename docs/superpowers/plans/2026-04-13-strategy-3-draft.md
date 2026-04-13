# Strategy 3: Draft — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Draft the full content for Strategy 3: Draft — three worked examples with spec loops, callouts, and closing material, building on the existing opening block.

**Architecture:** Single Djot file (`src/content/01-strategies/03-strategy-3-draft/index.dj`). The opening block exists and needs tightening. Three worked examples chain back to Strategies 0 and 1. Callouts use Djot fenced div syntax. Footnotes use `[^s3-N]` format.

**Tech Stack:** Djot markup, editorial spec in `spec/editorial/`

**Reference files for voice, structure, and conventions:**
- `spec/editorial/voice-and-audience.md` — tonal guidelines, reader persona
- `spec/editorial/style-guide.md` — terminology, banned words, numbers, punctuation
- `spec/editorial/editorial-conventions.md` — callout types, entry anatomy, cross-references
- `spec/editorial/principles.md` — "The Library and the Life"
- `src/content/01-strategies/00-strategy-0-specify/index.dj` — reference: insurance denial example (chains into Example 2)
- `src/content/01-strategies/01-strategy-1-decode/index.dj` — reference: lease clause Example 2 (chains into Example 1), Measure H Example 3 (chains into Example 3)
- `src/content/01-strategies/02-strategy-2-prepare/index.dj` — reference: closest completed strategy for structural model
- `docs/superpowers/specs/2026-04-13-strategy-3-draft-design.md` — design spec

---

### Task 1: Tighten the opening block

**Files:**
- Modify: `src/content/01-strategies/03-strategy-3-draft/index.dj:1-56`

The existing opening has a duplicate Zeigarnik paragraph (pull-quote on line 25 + body prose on line 29 that repeats the same idea). Collapse into one treatment. Keep the body prose version (line 29), remove the pull-quote (line 25). Tighten the surrounding prose.

- [ ] **Step 1: Read the current file**

Read `src/content/01-strategies/03-strategy-3-draft/index.dj` in full. Confirm the duplicate Zeigarnik text at lines 25 and 29.

- [ ] **Step 2: Remove the pull-quote, keep the body prose**

Delete line 25 (the italic pull-quote starting with `_"The blank page is the most expensive..."`). This is the duplicate. The body prose at line 29 opens with the same sentence and does more work — keep that.

Remove the `---` horizontal rule that separated the pull-quote from the body prose (currently line 27), since collapsing the two sections eliminates the need for the divider between them.

The opening should now flow: lesson paragraph → `---` → body prose (starting with "The blank page is the most expensive piece of real estate...").

- [ ] **Step 3: Remove the placeholder line at the end**

Delete line 56: `_(Full worked examples with [SPEC] loops to be drafted)_` — we're about to write them.

- [ ] **Step 4: Verify the file structure**

Read the file back. Confirm:
- Frontmatter intact
- `## Strategy 3: Draft` + subtitle
- `---` → art reference → `---`
- Episode prose ("The episode:" / "The lesson:")
- `---`
- Body prose (Zeigarnik, single treatment)
- "What Draft is for" list
- Core spec pattern (`::: prompt` block)
- Science callout (Zeigarnik citation `[^s3-1]`)
- Footnote
- "Worked examples:" line
- No duplicate, no placeholder

- [ ] **Step 5: Commit**

```bash
git add src/content/01-strategies/03-strategy-3-draft/index.dj
git commit -m "refactor(content): tighten Strategy 3 opening, remove duplicate Zeigarnik paragraph"
```

---

### Task 2: Write Example 1 — The Landlord Counteroffer

**Files:**
- Modify: `src/content/01-strategies/03-strategy-3-draft/index.dj` (append after the "Worked examples" line)

**Chains from:** Strategy 1: Decode, Example 2 (lease renewal with early termination clause, `src/content/01-strategies/01-strategy-1-decode/index.dj:187-301`). The reader decoded a new early termination clause: $6,450 exit cost, landlord sole discretion to deny. The Agent offered to draft a counteroffer. Now the reader takes it up.

**Key details to match from Strategy 1's example:**
- Rent: $2,100 → $2,175
- Security deposit: $2,100
- Early termination penalty: 2 months rent ($4,350) + forfeiture of deposit ($2,100) = $6,450
- "Landlord's sole discretion" language
- Agent's suggestion: remove sole discretion, OR reduce penalty to one month, OR remove deposit forfeiture
- Agent ended with: "Want me to draft a response to your landlord proposing a modified early termination clause?"

- [ ] **Step 1: Write the situation and explicit chain**

Append a `### Example 1: The Landlord Counteroffer` section. Open with an explicit reference back to Strategy 1: "In Strategy 1: Decode, you found a new early termination clause in your lease renewal..." Describe the situation: the reader knows what's wrong (they decoded it), they want to push back, they cannot start the email.

Keep the situation paragraph to 4–6 sentences. Match the voice from Strategy 2's examples — dry, specific, no motivational language.

- [ ] **Step 2: Write the reader's opening message**

Write the `::: prompt` block. The reader references the decoded clause and asks for help drafting the counteroffer email. Realistic — not a spec-template, but a person typing what they'd actually type. Include:
- They've been in the apartment 2 years, good relationship with landlord
- They want to stay but won't sign the clause as-is
- They want to propose modifications (not reject the renewal)

Example tone: "My landlord sent a lease renewal with a new early termination clause that wasn't in my original lease. I had my Agent decode it and it's pretty aggressive — $6,450 to leave early, and the landlord can say no even after I pay. I want to push back on this but I don't want to torch the relationship. Can you draft an email proposing a modified version of the clause?"

- [ ] **Step 3: Write the Agent's clarifying questions**

Write the `::: agent` block. 4–5 questions focused on what the Agent needs to calibrate the draft:
1. Tone — firm but respectful? Direct? Conciliatory?
2. Relationship — have they had issues with the landlord, or is this otherwise good?
3. Leverage — are they willing to walk if the landlord won't budge?
4. Which parts to push on — all three (sole discretion, deposit forfeiture, penalty amount) or pick the most important?
5. Has the landlord shown flexibility before (e.g., on the rent increase)?

Keep the Agent voice consistent with Strategies 0–2: direct, no "Great question!", no filler.

- [ ] **Step 4: Write the reader's answers**

Write the `::: prompt` block. Realistic answers:
1. Firm but not hostile — they want to stay
2. Good relationship, landlord is responsive, no issues
3. They'd rather stay but could move if they had to — not desperate
4. The "sole discretion" is the worst part — they'd accept a reasonable exit fee but not one the landlord can deny
5. Landlord negotiated the rent increase down from $100 to $75 when they asked — some flexibility

- [ ] **Step 5: Write the Agent's draft email**

Write the `::: agent` block. The Agent drafts the actual email. Structure:
- Brief framing ("Here's a draft email. Read it, change anything that doesn't sound like you, then send it.")
- The email itself — addressed to the landlord by a placeholder name like "[Landlord's name]", from the reader
- Professional, warm, specific — references the specific clause, proposes specific modifications
- Proposes: remove "sole discretion" (make early termination automatic upon payment), reduce penalty from 2 months to 1 month, remove deposit forfeiture (keep it OR penalty, not both)
- Closes with "I'd like to renew and I hope we can find language that works for both of us"
- After the email: "Read this out loud before you send it. If any sentence doesn't sound like something you'd say, change it. The structure is right — the words should be yours."

- [ ] **Step 6: Write the reader's voice-editing follow-up**

Write a `::: prompt` block where the reader pushes back on the voice: "This is good but it sounds too formal. I usually just text my landlord. Can you make it more casual but keep the substance?" This is the core Draft teaching moment — the first draft exists, now the reader shapes it.

- [ ] **Step 7: Write the Agent's revision**

Write the `::: agent` block. The Agent produces a shorter, more casual version — still hitting all the same points but in a tone that matches texting a landlord you have a good relationship with. End with a note: "The casual tone works because you have a good relationship. If that changes — if they push back hard or get hostile — switch to the formal version. Formal language is a tool, not a personality. Use it when you need the distance."

- [ ] **Step 8: Write the TIP callout**

Write a `::: tip` block: Ask your Agent for two or three tone variants — formal, conversational, matter-of-fact — and pick the one closest to your voice. You can always ask "make this more [adjective]" and your Agent will adjust without losing the substance. Editing down from a draft is always easier than generating from nothing.

- [ ] **Step 9: Write the ALSO callout**

Write an `::: also` block: Platform note on inline editing. Claude's "edit" feature lets you revise a previous response in place. ChatGPT and Gemini let you regenerate or edit your prompt. In all tools, the fastest revision workflow is: paste the draft back, say what to change, get the revision. One to two sentences.

- [ ] **Step 10: Commit**

```bash
git add src/content/01-strategies/03-strategy-3-draft/index.dj
git commit -m "feat(content): add Strategy 3 Example 1 — landlord counteroffer"
```

---

### Task 3: Write Example 2 — The Medicare Denial Appeal Letter

**Files:**
- Modify: `src/content/01-strategies/03-strategy-3-draft/index.dj` (append after Example 1)

**Chains from:** Strategy 0: Specify, full example (`src/content/01-strategies/00-strategy-0-specify/index.dj:69-135`). The reader decoded an insurance denial for an MRI (prior authorization, "not medically necessary"). The Agent helped them understand the denial and draft a first-level internal appeal. That appeal was denied. Now they need to write a formal second-level appeal letter.

**Key details to match from Strategy 0's example:**
- MRI ordered by doctor
- Denial reason: "not medically necessary"
- Insurance: Anthem (mentioned in clarifying questions)
- Doctor's office can provide a letter of medical necessity
- Reader asked about incorporating the doctor's letter — Agent confirmed

- [ ] **Step 1: Write the situation and explicit chain**

Append `### Example 2: The Medicare Denial Appeal Letter` section. Open with explicit chain: "In Strategy 0: Specify, you decoded an insurance denial — an MRI your doctor ordered, denied as 'not medically necessary.' Your Agent helped you file a first-level internal appeal. The appeal was denied. Now you need to write the next one."

Describe the situation: the reader has been through the decode step, has been through the first appeal, and now faces a formal written appeal — a document with real requirements and a real audience (a medical reviewer). The blank page is harder this time because the stakes are higher and the format is less familiar.

4–6 sentences. Acknowledge the emotional weight — this person has been fighting their insurance company for weeks.

- [ ] **Step 2: Write the reader's opening message**

Write the `::: prompt` block. The reader references Strategy 0, describes where they are in the process:
- The internal appeal was denied
- The second denial letter says the same thing — "not medically necessary"
- Their doctor has now written a letter of medical necessity
- They have 60 days to file an external appeal (or next-level internal, depending on the plan)
- They need help drafting the appeal letter
- They don't know how formal it needs to be or what to include

- [ ] **Step 3: Write the Agent's clarifying questions**

Write the `::: agent` block. 4–5 questions:
1. What exactly did the second denial say? (Same reason, or new language?)
2. Do you have the letter of medical necessity from your doctor? What does it say specifically?
3. Is this an external appeal (to an independent reviewer) or a second internal appeal? (Check the denial letter — it should say)
4. What's the deadline? (The clock matters)
5. What's the procedure — MRI of what body part, and what symptoms led your doctor to order it?

- [ ] **Step 4: Write the reader's answers**

Write the `::: prompt` block. Realistic answers:
1. Same reason: "not medically necessary." The letter adds: "The documentation provided does not support medical necessity for the requested service."
2. Yes — the doctor's letter says the MRI is needed to rule out a lumbar disc herniation based on 8 weeks of radiculopathy that hasn't responded to conservative treatment
3. The denial letter says "You may request an external review by an independent review organization" — so external
4. 60 days from the denial date (letter dated 3 weeks ago)
5. MRI of the lumbar spine. They've had shooting pain down their left leg for 2 months. Physical therapy hasn't helped.

- [ ] **Step 5: Write the Agent's draft appeal letter**

Write the `::: agent` block. The Agent drafts the formal appeal letter. Structure:
- Brief framing: "Here's the appeal letter. It's addressed to the external review organization. Read it carefully — every claim in this letter must be true and supported by your medical records."
- The letter itself — formal, structured, citing the specific denial, the specific policy language, the doctor's clinical findings, the treatment history, and the letter of medical necessity
- Key elements: patient name/ID, plan information, date of denial, specific procedure (CPT code 72148 for lumbar MRI), reason for denial quoted verbatim, why the denial is wrong (clinical evidence), what documentation is attached (doctor's letter, treatment records), request for expedited review if applicable
- Tone: firm, clinical, specific — this is written for a medical reviewer, not a customer service rep
- After the letter: "Print this. Attach your doctor's letter of medical necessity and your physical therapy records. Send it certified mail — you want proof of delivery and the date. Keep copies of everything."

- [ ] **Step 6: Write the reader's follow-up**

Write a `::: prompt` block: "This is really long. Will someone actually read all of this?" — a real concern that lets the Agent teach about the audience.

- [ ] **Step 7: Write the Agent's response about what reviewers look for**

Write the `::: agent` block. The Agent explains:
- External reviewers are physicians — they will read it, but they read dozens of these
- What they look for: the specific clinical question (what is the MRI trying to answer?), the treatment history (what was tried first?), and the supporting documentation (is the doctor's rationale attached?)
- What can be shorter: the personal narrative. The reviewer doesn't need to know how the pain affects your daily life (that's for internal appeals). They need the clinical case.
- Offer to trim: "Want me to cut this to one page? I can keep the clinical argument and remove the background."

- [ ] **Step 8: Write the SCIENCE callout**

Write a `::: science` block on appeal success rates and specificity. Research needed — use `<!-- RESEARCH NEEDED -->` comment for the specific citation, but write the callout text:

Appeals that cite specific policy language and attach supporting clinical documentation succeed at significantly higher rates than form letters or generic appeals. The external review process exists because internal reviews are conducted by the insurer's own medical directors — the external reviewer is independent. The system is adversarial by design. The appeal letter is your brief.[^s3-2]

Add footnote `[^s3-2]` with a `<!-- RESEARCH NEEDED: find citation on external appeal overturn rates and correlation with documentation specificity -->` comment.

- [ ] **Step 9: Write the FAIRNESS callout**

Write a `::: fairness` block:

The appeal letter that wins is written at a level most patients cannot produce without help. It requires clinical vocabulary, policy citation, and a structured argument — skills the denial letter itself does not teach. The system requires a document the system's own communications make impossible to write. Your Agent closes this gap. The gap is structural, not personal — and closing it does not make the system fair. It makes you less disadvantaged within an unfair system.

- [ ] **Step 10: Commit**

```bash
git add src/content/01-strategies/03-strategy-3-draft/index.dj
git commit -m "feat(content): add Strategy 3 Example 2 — Medicare denial appeal letter"
```

---

### Task 4: Write Example 3 — The Zoning Public Comment

**Files:**
- Modify: `src/content/01-strategies/03-strategy-3-draft/index.dj` (append after Example 2)

**Chains from:** Strategy 1: Decode, Example 3 (Measure H ballot measure, `src/content/01-strategies/01-strategy-1-decode/index.dj:303-438`). The reader decoded a zoning downzone measure. They learned it would reduce housing supply in their R-3 zone, that they're a renter who would be affected, and that the "predatory developer" framing was campaign language, not policy.

**Key details to match from Strategy 1's example:**
- Measure H: downzones R-3 parcels near single-family zones to R-1.5
- Limits: 8 units/acre cap, conditional use permit for 4+ units, 35-foot height limit
- Reader is a renter in an R-3 zone
- Reader learned: existing building grandfathered, but future supply reduced → rents stay higher
- "Predatory developer" is campaign framing, not a legal term
- The measure benefits existing single-family homeowners; failure benefits future renters

- [ ] **Step 1: Write the situation and explicit chain**

Append `### Example 3: The Zoning Public Comment` section. Open with explicit chain: "In Strategy 1: Decode, you translated Measure H — a zoning downzone that would reduce housing supply in your neighborhood..."

Describe the situation: the city council is holding a public hearing before the vote. The reader has two minutes at the microphone. They've never spoken at a public hearing. They know what they think — the measure hurts renters. They cannot get past the first sentence.

4–6 sentences. Capture the specific anxiety of public speaking at a government meeting — the room, the timer, the formality, the fact that your name and address go on the record.

- [ ] **Step 2: Write the reader's opening message**

Write the `::: prompt` block. The reader references the Measure H decode:
- I decoded Measure H — it's a downzone that would reduce housing near my apartment
- The city council is holding a public hearing next Tuesday
- I want to speak against it
- I have two minutes
- I've never spoken at a public hearing and I don't know how to start
- I don't want to sound like a policy wonk — I want to sound like a person who lives here

- [ ] **Step 3: Write the Agent's clarifying questions**

Write the `::: agent` block. 4–5 questions:
1. What's your personal stake — are you a renter in the affected zone? How long have you lived there?
2. Do you want to speak from notes or memorize? (Notes are better — memorized comments fall apart under nerves)
3. What's the one thing you want the council members to remember after you sit down?
4. Are you comfortable being identified by name and address? (Public comment is public record in most jurisdictions)
5. Is anyone else speaking against the measure, or will you be the only renter voice?

- [ ] **Step 4: Write the reader's answers**

Write the `::: prompt` block. Realistic answers:
1. Renter in an R-3 zone, 4 years in the apartment, neighborhood is where they want to stay long-term
2. Notes on phone — they'll freeze if they try to memorize
3. "I want them to know that renters live here too and this measure protects homeowners at our expense"
4. Yes, fine with name and address
5. Not sure — they don't know anyone else going

- [ ] **Step 5: Write the Agent's draft comment**

Write the `::: agent` block. The Agent drafts a two-minute spoken comment. Structure:
- Brief framing: "Here's a two-minute comment written for speaking, not reading. Practice it once out loud — time yourself. If it runs over 1:45, we'll cut."
- The comment itself — conversational, first-person, structured for oral delivery:
  - Personal opening: who you are, where you live, how long (10 seconds)
  - The problem in one sentence: this measure reduces housing supply in my neighborhood (10 seconds)
  - The personal stake: as a renter, fewer units means less competition for landlords, which means my rent goes up faster (20 seconds)
  - The structural point: the measure is framed as protecting neighborhoods, but it protects homeowners — the people in this room who already own property — at the expense of renters who want to stay in the neighborhood (20 seconds)
  - The ask: I'm asking the council to vote no on Measure H (5 seconds)
  - Thank you. Sit down. (~1:05 total — leaves margin)
- After the comment: "This runs about a minute and five seconds. You have margin. Do not fill it — short and clear beats long and thorough at a public hearing. The council has heard a hundred of these tonight. Yours needs to be the one they remember because it was specific and human, not because it was comprehensive."

- [ ] **Step 6: Write the reader's voice-editing follow-up**

Write a `::: prompt` block: "This sounds like a policy paper. I want to sound like a person who lives in the neighborhood, not someone who studied zoning law." This is the same teaching moment as Example 1 — the reader pushes the draft toward their voice.

- [ ] **Step 7: Write the Agent's revision**

Write the `::: agent` block. The Agent revises — shorter sentences, a more personal opening (maybe starts with the specific street or how long they've walked to the coffee shop on the corner), strips the policy vocabulary, keeps the one structural point in plain language. End with: "Read this version out loud. If you stumble on a sentence, it's too long. Shorten it until you can say it without thinking about the words. At the microphone, you want to be thinking about the council members' faces, not your script."

- [ ] **Step 8: Write the MEME callout**

Write a `::: meme` block:

Murphy Brown could interview a senator without notes. She could not start the memo. You can have a strong opinion about zoning and still freeze at the microphone. These are different skills. Draft handles the second one.

- [ ] **Step 9: Write the TIP callout**

Write a `::: tip` block:

When drafting something you'll say out loud, tell your Agent "write this for speaking, not reading." Spoken language uses shorter sentences, more repetition, and fewer subordinate clauses than written prose. Read the draft aloud before the hearing — if you stumble on a sentence, the sentence is too long.

- [ ] **Step 10: Commit**

```bash
git add src/content/01-strategies/03-strategy-3-draft/index.dj
git commit -m "feat(content): add Strategy 3 Example 3 — zoning public comment"
```

---

### Task 5: Write the closing

**Files:**
- Modify: `src/content/01-strategies/03-strategy-3-draft/index.dj` (append after Example 3)

- [ ] **Step 1: Write the closing paragraph**

Append a short closing paragraph (3–5 sentences). Hit the pattern: the three examples show the same thing — Decode tells you what the document says, Draft gets you past the blank page. The landlord clause, the insurance denial, the ballot measure — you already understood the problem. The obstacle was never comprehension. It was the first sentence. The strategies compose. You will use them together more often than you use them alone.

Do not summarize the examples — the reader just read them. Make the structural point and move to the closing line.

- [ ] **Step 2: Write the closing meme callout**

Write a `::: meme` block tying back to Murphy Brown — but only if it earns its place. The meme should compress the chapter's thesis, not repeat it. Something like:

Murphy went through 93 secretaries. The problem was never the secretary. It was the blank page between Murphy and the work she could already do. Your Agent is secretary number 94. It will not quit. And it does not need you to know the first sentence — it will write one for you to cross out.

If the meme doesn't do enough work beyond what the closing paragraph already says, skip it. The closing line is stronger without a meme weakening the landing.

- [ ] **Step 3: Write the closing line**

The final line of the chapter, standing alone:

_The AI brings the library. You bring the life. The draft is where they meet._

This mirrors Strategy 1's closing: "Your Agent reads the geometry. You decide whether the couch fits." Italic, standalone, final.

- [ ] **Step 4: Verify the complete chapter structure**

Read the full file. Verify against the design spec:
- [ ] Frontmatter correct (title, part: 1, order: 3, strategy: 3, status: "draft")
- [ ] Opening block: heading → art → episode → lesson → body prose → "What Draft is for" → core spec → science callout → footnote
- [ ] No duplicate Zeigarnik paragraph
- [ ] No placeholder text
- [ ] Example 1: chains from Strategy 1 Example 2, full spec loop, TIP + ALSO callouts
- [ ] Example 2: chains from Strategy 0 full example, full spec loop, SCIENCE + FAIRNESS callouts
- [ ] Example 3: chains from Strategy 1 Example 3, full spec loop, MEME + TIP callouts
- [ ] Closing paragraph + closing line
- [ ] All footnotes use `[^s3-N]` format
- [ ] Cross-references use entry ID format (Strategy 0, Strategy 1)
- [ ] No banned words (empower, journey, thrive, transform, leverage, utilize, etc.)
- [ ] Djot syntax correct: `_italic_`, `*bold*`, `::: type` / `:::` fenced divs, `::: prompt` / `::: agent` for spec loops

- [ ] **Step 5: Commit**

```bash
git add src/content/01-strategies/03-strategy-3-draft/index.dj
git commit -m "feat(content): add Strategy 3 closing — the draft is where they meet"
```

---

### Task 6: Final review and commit

- [ ] **Step 1: Check callout distribution**

Verify the chapter has:
- 1 SCIENCE in intro (Zeigarnik — `[^s3-1]`)
- 1 SCIENCE in Example 2 (appeal rates — `[^s3-2]`)
- 1 FAIRNESS in Example 2 (literacy barrier)
- 1 MEME in Example 3 (Murphy Brown / microphone)
- 2 TIP (Example 1: tone variants; Example 3: speaking vs. reading)
- 1 ALSO (Example 1: platform editing)
- Optional MEME in closing

Total: 7–8 callouts. Strategy 1 has 7. Strategy 2 has 5. This is in range.

- [ ] **Step 2: Check chaining references**

Verify each example's opening sentence names the specific strategy and example it chains from. Verify the details match (dollar amounts, clause language, measure name, denial reason).

- [ ] **Step 3: Check for RESEARCH NEEDED comments**

At minimum, Example 2 needs a `<!-- RESEARCH NEEDED -->` for the appeal success rate citation (`[^s3-2]`). Flag any other claims that need sources.

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add src/content/01-strategies/03-strategy-3-draft/index.dj
git commit -m "fix(content): Strategy 3 review fixes"
```
