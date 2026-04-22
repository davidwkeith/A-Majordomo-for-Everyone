# Strategy 3: Draft — Design Spec

## Summary

Draft the full content for Strategy 3: Draft ("Get past the blank page"). The chapter teaches readers to use their Agent to produce a first draft they can edit — breaking through the blank-page paralysis that stops people from writing demand letters, appeal letters, public comments, and other high-stakes documents.

The chapter follows the established structure from Strategies 0–2: episode frame, lesson, core spec pattern, three full worked examples with spec loops, callouts, and a strong closing line.

## Design Decisions

### Example chaining

All three worked examples link explicitly back to scenarios the reader encountered in earlier strategy chapters. This builds a connected mental model: the strategies compose rather than standing alone.

| Example | Chains from | Connection |
|---------|------------|------------|
| 1. Landlord counteroffer | Strategy 1, Example 2 (lease clause decode) | Reader decoded the aggressive early termination clause. Now they draft the email proposing modifications. |
| 2. Medicare denial appeal | Strategy 0, full example (MRI prior auth denial) | Reader decoded the denial. The internal appeal failed. Now they draft the formal written appeal letter. |
| 3. Zoning public comment | Strategy 1, Example 3 (Measure H ballot decode) | Reader decoded the ballot measure. Now they draft their two-minute spoken comment for the city council hearing. |

### Single-source examples

The full worked spec loops live here in Strategy 3. When Field Guide Skills cover these domains (Ho-X renter negotiation, H-X insurance appeals, C-X civic participation), they provide the Majordomo opener, domain-specific spec template, and "what to do with the output" — then cross-reference back to Strategy 3 for the full pedagogical arc. No duplication.

### Zeigarnik treatment

The current draft has the Zeigarnik effect mentioned twice — once as a pull-quote, once as body prose repeating the same idea. Collapse into a single treatment in the body prose, with the science callout providing the citation.

### Strong-line closing

The chapter ends with: "The AI brings the library. You bring the life. The draft is where they meet." This follows the pattern established in Strategy 1 ("Your Agent reads the geometry. You decide whether the couch fits.").

## Chapter Structure

### Opening block (tighten existing content)

- `## Strategy 3: Draft` + subtitle "_Get past the blank page._"
- Horizontal rule
- Murphy Brown Trinitron art with caption
- Horizontal rule
- Episode prose ("The episode:" / "The lesson:")
- Majordomo-voice quote (the one about the Zeigarnik effect, collapsed to single treatment)
- Horizontal rule
- Body prose: what the blank page costs, what the Agent does (first draft to react to), "your voice emerges in the editing"
- "What Draft is for" list
- Core spec pattern (`::: prompt` block)
- Science callout: Zeigarnik (existing, keep)

### Example 1: The Landlord Counteroffer

**Situation:** The reader decoded their lease renewal in Strategy 1 and found the early termination clause — $6,450 exit cost with landlord discretion to deny. The Agent offered to draft a counteroffer. Now the reader takes it up. They know exactly what's wrong with the clause. They cannot start the email.

**Explicit chain:** Open with "In Strategy 1: Decode, you found a new early termination clause..." — name the connection directly.

**Spec loop:**
- Opening message: references the decoded clause, asks for a counteroffer email
- Clarifying questions: tone (firm but not adversarial?), relationship with landlord (good/neutral/bad?), how much leverage (willing to walk?), which parts to push on (sole discretion? deposit forfeiture? penalty amount?)
- Agent drafts the email
- Reader follow-up: "this sounds too formal / too aggressive / not like me" — the voice-editing moment
- Agent revises with guidance

**Callouts:**
- TIP: Ask for two or three tone variants — firm, conciliatory, matter-of-fact — and pick the one closest to your voice. Editing down is easier than generating up.
- ALSO: Platform note on editing/revision workflows across tools.

### Example 2: The Medicare Denial Appeal Letter

**Situation:** The reader decoded their insurance denial in Strategy 0. The Agent helped them understand what "not medically necessary" means and how to file a first-level internal appeal. That appeal was denied. Now they're drafting a formal written appeal — a document with specific requirements, a specific audience (a medical reviewer, not a customer service rep), and real consequences.

**Explicit chain:** Open with "In Strategy 0: Specify, you decoded an insurance denial..." — name the two-step process.

**Spec loop:**
- Opening message: the internal appeal failed, here's what the second denial says, doctor has a letter of medical necessity, need to draft the next-level appeal
- Clarifying questions: what did the second denial say specifically, do you have the letter of medical necessity in hand, is there a deadline, what's the procedure name and CPT code
- Agent drafts the appeal letter — formal, citing the specific denial reason, referencing the doctor's supporting documentation, requesting expedited review
- Reader follow-up: "is this too long? will someone actually read all of this?"
- Agent guidance on what reviewers look for, what to cut, what must stay

**Callouts:**
- SCIENCE: Appeal success rates and specificity — letters that cite specific policy language and attach supporting documentation succeed at meaningfully higher rates than generic appeals. Citation needed.
- FAIRNESS: The appeal letter that wins is written at a reading level most patients cannot produce without help. The system requires a document the system's own communications make difficult to write. Your Agent closes this gap — but the gap is structural, not personal.

### Example 3: The Zoning Public Comment

**Situation:** The reader decoded Measure H in Strategy 1. The city council is holding a public hearing. The reader has two minutes at the microphone. They know what they think — as a renter in an R-3 zone, the downzoning affects them directly. They have never spoken at a public hearing. They cannot get past the first sentence.

**Explicit chain:** Open with "In Strategy 1: Decode, you translated Measure H..." — connect the reader's knowledge to the new task.

**Spec loop:**
- Opening message: I decoded Measure H, I want to speak against it at the hearing, I have two minutes, I've never done this before
- Clarifying questions: what's your personal stake (renter in affected zone?), do you want to speak from notes or memorize, what's the one thing you want the council to remember, are you comfortable being identified by name and address (public record)
- Agent drafts a two-minute spoken comment — conversational, not a policy brief, structured for oral delivery
- Reader follow-up: "this sounds like a policy paper, not like a person talking" — the critical Draft moment where the reader pushes for their voice
- Agent revises: shorter sentences, a personal opening, the policy point in plain language

**Callouts:**
- MEME: Murphy Brown could interview a senator without notes. She could not start the memo. You can have a strong opinion about zoning and still freeze at the microphone. These are different skills. Draft handles the second one.
- TIP: When drafting something you'll say out loud, tell your Agent "write this for speaking, not reading." Spoken language uses shorter sentences, more repetition, and fewer subordinate clauses. Read the draft aloud before the hearing — if you stumble, the sentence is too long.

### Closing

- Short paragraph: the pattern across all three examples. Decode told you what the document says. Draft gets you past the blank page. The strategies compose — you will use them together more often than you use them alone.
- Closing line: "The AI brings the library. You bring the life. The draft is where they meet."
- Closing meme callout tying back to Murphy Brown (optional — only if it earns its place).

## Editorial Conventions to Add

Three new conventions for `spec/editorial/editorial-conventions.md`:

1. **Strong-line closing:** Each strategy chapter ends with the chapter's thesis compressed into a single memorable line. This line appears last — after the final example, after the closing paragraph. It is the sentence the reader remembers. Examples: "Your Agent reads the geometry. You decide whether the couch fits." (Strategy 1), "The AI brings the library. You bring the life. The draft is where they meet." (Strategy 3).

2. **Example chaining:** Worked examples in strategy chapters link explicitly back to scenarios from earlier chapters, building a connected mental model. The reader who decoded a lease clause in Strategy 1 drafts the counteroffer in Strategy 3. Name the connection directly in the opening sentence of the example. The strategies are tools that compose — the examples should demonstrate this.

3. **Single-source examples:** Each worked scenario lives in one canonical location. Strategy chapters own the full spec-loop pedagogy (the teaching arc). Field Guide Skills own the domain-specific application (Majordomo opener, spec template, "what to do with the output"). Neither duplicates the other. The Skill cross-references the Strategy example for the full loop; the Strategy example cross-references the Skill for the domain context. This keeps content in sync without tooling and follows the DRY principle already stated in the cross-reference convention.

## Footnote IDs

Strategy 3 footnotes use the format `[^s3-N]`. One exists already (`[^s3-1]` for Zeigarnik). New footnotes start at `[^s3-2]`.
