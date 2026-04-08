# TODO — A Majordomo for Everyone

Last reviewed: 2026-04-08 against spec/ directory.

---

## Unwritten Content

These are the major gaps — content that doesn't exist yet.

### Strategy Worked Examples (Part 1)

Each strategy chapter needs 2–3 full [SPEC] loops (reader situation → clarifying questions → answers → proposed spec → review → execute → evaluate). Currently only Strategy 0 and Strategy 9 have them. Estimated scope: ~300 words per example × 2–3 examples × 8 chapters.

- [ ] **Strategy 1: Decode** — Understanding an insurance EOB. Decoding a lease clause. Translating a ballot measure.
- [ ] **Strategy 2: Prepare** — Before an oncology appointment. Before a salary negotiation. Before a contractor walkthrough.
- [ ] **Strategy 3: Draft** — A demand letter to a landlord. A Medicare denial appeal. A public comment for city council.
- [x] **Strategy 4: Navigate** — Filing for unemployment. Filing a first-level insurance appeal. Filing a small claims case.
- [ ] **Strategy 5: Decide** — Repair vs. replace an appliance. Roth vs. traditional IRA. Escalate vs. settle a landlord dispute.
- [x] **Strategy 6: Diagnose** — A washing machine grinding noise. Persistent headaches (triage). An HVAC quote that seems high.
- [ ] **Strategy 7: Research** — Before a surgical procedure. Before signing a non-compete. Between two college financial aid offers.
- [ ] **Strategy 8: Assert** — Tenant rights when landlord refuses repairs. Employee rights when let go. Consumer rights when disputing a charge.
- [ ] **Strategy 9: Create** — A mystery novel architecture interview. A branching short story. A game narrative prototype.

### Chapter 33: Advanced Free Tier Strategies (Part 3)

- [ ] **Write Ch 33** — status: "stub", body is placeholder only. Should cover advanced rotation techniques, context management, efficient prompting within free-tier limits. Extends Ch 3 (Free Tier Playbook) for Part 3 readers.

### New Field Guide Entries

- [ ] **Ho-?: Household Disaster Planning**

- [ ] **Li-? or IRL-?: Roleplay in Practice — Everyday Scenarios**
  - Focus: real people, daily situations — customer service, restaurants, retail, phone calls, complaints
  - NOT professional/corporate training — the person *on the receiving end* of those systems
  - Debrief loop: "What worked? What didn't? How did they feel at each stage?"
  - Source material:
    - [iSpring: 13 Customer Service Roleplay Scenarios](https://www.ispringsolutions.com/blog/role-playing-scenarios-for-customer-service-training)
    - [Foodie Coaches: Restaurant Roleplay Training](https://www.foodiecoaches.com/role-play/)
    - [HubSpot: 12 Customer Service Roleplay Scripts](https://blog.hubspot.com/service/customer-service-role-play)
    - [Defuse: De-Escalation Roleplay Scenarios](https://deescalation-training.com/2024/07/de-escalation-roleplay-scenarios/)
    - [Exec Learn: Conflict Resolution Roleplay](https://www.exec.com/learn/conflict-resolution-roleplay)
  - Status: waiting on full draft upload from author
  - Assign entry ID once domain slot confirmed

- [ ] **WB-0: Working With Text — The Token-Saving Strategy** *(domain intro entry)*
  - Core idea: AI agents work in text. The closer your deliverable starts to plain text, the cheaper, faster, and more editable it stays throughout the spec loop. Only render to final format at the end.
  - The principle: every rendered format (PPTX, PDF, DOCX, HTML) is a lossy translation from text. Keep everything upstream of that translation editable for as long as possible. Don't pour concrete until the framing is right.
  - Token framing: a 20-slide deck as Markdown is ~2,000 tokens. As PPTX XML it's 50,000+. Your agent reads the Markdown; you export the PPTX.
  - Examples:

    | Deliverable | Don't start with | Start with instead |
    |---|---|---|
    | Presentation / slide deck | Asking for a PowerPoint | CommonMark outline with one-line art briefs per slide; export to PPTX at the end |
    | Website | "Build me a website" | Requirements doc + flat list of pages with purpose, nav, and rough content per page; generate HTML page-by-page |
    | Resume | Uploading a PDF to reformat | Plain text or Markdown version first; styling pass at the end |
    | Email newsletter | Asking for a designed template | Write body copy in plain text; drop into template only after copy is approved |
    | Spreadsheet / budget | Asking for a filled .xlsx | CSV or Markdown table first; import or format once the data is right |
    | Database schema | "Design me a database" | Entity list in plain English → Markdown table of fields + types → SQL only after structure is confirmed |
    | Legal / contract draft | Uploading a formatted doc | Plain prose outline of clauses; negotiate structure before formatting |
    | Video script | Storyboard or slide deck | Scene-by-scene Markdown with speaker notes; visuals brief inline |
    | App / software feature | "Build this app" | User story in plain English → acceptance criteria list → spec → code |
    | Recipe or meal plan | Asking for a formatted cookbook | Plain ingredient + step list; format for print at the end |

  - The workflow — same one professional teams use: (1) Build the outline, get the story right. (2) Build piece one. (3) Iterate until right. (4) Update the plan — did the story change? (5) Build piece two. Repeat. (6) The finished product is the *last* thing you ask for, not the first.
  - This is how screenwriters, architects, software teams, and ad agencies work. The "just make me the whole thing" instinct is what produces generic output you can't fix.
  - Candidate anchor episode: *Home Improvement* — Tim skips the plan, applies power, rebuilds from scratch. The spec loop is the plan.
  - Strategy: **Specify** + **Draft**; cross-ref WB entries for each deliverable type

### Field Guide Stubs (Part 2)

- [ ] **Ho-5** — stub, full entry to be drafted
- [ ] **Ho-7** — stub, full entry to be drafted
- [ ] **Ch-1: Shopping Your Values** — stub
- [ ] **Ch-2: Understanding a Contractor Bid** — stub
- [ ] **Ch-3: Identifying and Caring for House Plants** — stub
- [ ] **Ch-6: Optimizing Manual Chores** — stub

### Appendix B: Spec Interview Starters

- [ ] **Complete Appendix B** — 8 of ~50 starters written. 42 more needed, organized by Field Guide domain. Must be print-ready at 8.5×11.

---

## Needs Revisiting

Content that exists but could be stronger, more complete, or better connected.

### Part 1: Thin Strategy Chapters

Strategies 4 (Navigate, 47 lines) and 6 (Diagnose, 49 lines) are the thinnest. Once worked examples are added they'll fill out, but the explanatory prose is also lighter than peers like Strategy 5 (Decide) or Strategy 8 (Assert).

### Part 1: Missing Cross-References to Field Guide

No strategy chapter cross-references Field Guide entries by ID. Strategy 8 (Assert) should reference H-4, L-1, W-2; Strategy 1 (Decode) should reference H-3, M-2, L-1; etc.

### Part 1: Conservative-Answer Convention

Present in Strategy 8 but missing from Strategy 2 (Prepare, medical context) and Strategy 7 (Research, financial context) where the spec expects it.

### Part 1: [ALSO] Callout Coverage

Only Strategy 0 has an [ALSO] callout. Other strategies reference Claude-specific features without cross-tool translation.

### Part 2: Domain Size Imbalance

Target is ~80 entries total. Current count by domain:

| Domain | Count | Notes |
|--------|-------|-------|
| Health (H-) | 19 | Strong |
| Life (Li-) | 8–11 | Moderate |
| Online/Web (WB-) | 8 | Moderate |
| Work (W-) | 7 | Moderate |
| Civic (C-) | 7 | Moderate |
| Money (M-) | 6 | Light — financial complexity warrants 10+ |
| Home (Ho-) | 8 listed, 2 stubs | Partially stubbed |
| Chores (Ch-) | 6 listed, 4 stubs | Mostly stubbed |
| Legal (L-) | 4 | Light — expand to 6–8 |
| Transportation (Tr-) | 4 | Light |
| IRL (IRL-) | 3 | Light |
| **Total** | **~68** | **~85% of target** |

Domains that most need expansion: Money, Legal, IRL.

### Part 2: WB-* Entry Numbering

Online Presence entries are numbered non-sequentially (WB-8, 9, 10, 1, 2, 3). Rationalize numbering.

### Part 3: "Recognizing a Correct Spec"

The architecture spec says Part 3 should teach "How to recognize a correct spec when Claude proposes one." No chapter covers this explicitly. Ch 30 teaches the Five-Part Frame but not the "when is it good enough?" judgment call.

### Part 3: Ch 31 → Ch 32 Connection

Ch 31 (When to Use a Human) doesn't preview or reference the calibration question, which is the core of Ch 32. These should be linked.

### Part 3: Ch 34 Art Brief

Comment references Al Borland pixel art but no `.art.md` sidecar exists in the chapter directory.

### Part 2: Jargon Links in Introduction

"A Note Before You Start" introduces CPT code, EOB, and IRA without linking them on first mention. Spec requires Wikipedia links for all jargon.

### Cross-Reference Self-Help Books Into Relevant Entries

Place as `See also:` or footnote citations where they fit:

| Book | Author | Where it fits |
|------|--------|---------------|
| [Four Thousand Weeks](https://www.amazon.com/Four-Thousand-Weeks-Management-Mortals/dp/0374159122) | Oliver Burkeman | Time/prioritization entries; intro framing |
| [The Happiness Trap](https://www.amazon.com/Happiness-Trap-Stop-Struggling-Start/dp/1590305841) | Russ Harris | Emotional regulation during high-stakes conversations |
| Personality communication frameworks (monkey/T-rex/lion/mouse — [Guardian piece](https://www.theguardian.com/books/2026/jan/17/read-this-and-you-will-be-happier-experts-pick-the-self-help-books-that-really-work)) | forensic psych authors | Reading your counterpart in roleplay / IRL negotiations |

- [ ] Go through full draft and tag `See also:` placements for above

---

## Research Needed

126 `<!-- RESEARCH NEEDED -->` comments across Part 2, including 70 tagged `(HUMAN CONDITION)`.

Distribution:

| Domain | RESEARCH NEEDED | HUMAN CONDITION |
|--------|----------------|-----------------|
| Life | 40 | 25 |
| Civic | 24 | 11 |
| Work | 18 | 10 |
| Money | 14 | 7 |
| Health | 10 | 8 |
| Transportation | 8 | 3 |
| Legal | 7 | 3 |
| IRL | 5 | 3 |

Parts 0, 1, 3, and 4 have zero research comments — clean.

---

## Pre-Publication Checklist

- [ ] All `[companion URL TBD]` resolved
- [ ] All `<!-- RESEARCH NEEDED -->` resolved or removed
- [ ] All stubs drafted
- [ ] Appendix B complete (50 starters)
- [ ] Appendix A reflects final entry list
- [ ] All art briefs have corresponding images in `src/images/`
- [ ] XMP metadata embedded in all images
- [ ] Version bumped and tagged
- [ ] `npm run build` produces clean ePub
- [ ] `npm test` passes

---

## Pending

- [ ] Assign entry IDs for new entries (Ho-?, Li/IRL-?) once domain slots confirmed
- [ ] Cross-reference new entries against existing Field Guide index in Appendix A
- [ ] Author to upload full roleplay entry draft
