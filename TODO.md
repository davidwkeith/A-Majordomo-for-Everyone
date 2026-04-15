# TODO — A Majordomo for Everyone

Last reviewed: 2026-04-15 against spec/ directory and codebase.

---

## Completed Since Last Review (2026-04-08)

- [x] Strategy worked examples — all 10 strategies (0–9) now have 2–3 full spec-loop examples
- [x] Jeeves voice rewrite — all Field Guide entries rewritten with "My Man Jeeves" openers, fact-checked with citations
- [x] Field Guide reorganization — WB entries renumbered sequentially (WB-1 through WB-9), Creative domain added (Cr-1 through Cr-4)
- [x] Field Guide entry labels standardized to Title Case
- [x] Former stubs drafted: Ho-5, Ho-7, Ch-1, Ch-2, Ch-3, Ch-6 all have substantive content
- [x] RESEARCH NEEDED markers reduced from 126 → 3 (all in Chores)
- [x] `[companion URL TBD]` markers resolved (none remaining)
- [x] WB-* entry numbering rationalized (was non-sequential, now WB-1 through WB-9)
- [x] New appendices added: Appendix I (Spec Literacy), Appendix J (Working with Text)
- [x] Apple Books highlight sync — design spec, implementation plan, and script skeleton (#23)
- [x] Build pipeline type-checks clean (`npm run build:check` passes)

---

## Unwritten Content

### Chapter 33: Advanced Free Tier Strategies (Part 3)

- [ ] **Write Ch 33** — status: "stub" (11 lines), body is placeholder only. Should cover advanced rotation techniques, context management, efficient prompting within free-tier limits. Extends Ch 3 (Free Tier Playbook) for Part 3 readers.

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

### Appendix B: Spec Interview Starters

- [ ] **Complete Appendix B** — 8 of ~50 starters written. 42 more needed, organized by Field Guide domain. Must be print-ready at 8.5×11.

---

## Needs Revisiting

Content that exists but could be stronger, more complete, or better connected.

### Part 1: Missing Cross-References to Field Guide

Only Strategies 4 and 9 cross-reference Field Guide entries by ID. The other 8 strategy chapters should too — e.g., Strategy 8 (Assert) → H-4, L-1, W-2; Strategy 1 (Decode) → H-3, M-2, L-1.

### Part 1: Conservative-Answer Convention

Present in Strategy 8 but missing from Strategy 2 (Prepare, medical context) and Strategy 7 (Research, financial context) where the spec expects it.

### Part 1: [ALSO] Callout Coverage

Only Strategy 0 has an [ALSO] callout. Other strategies reference Claude-specific features without cross-tool translation.

### Part 2: Domain Size Imbalance

Entry target was ~80; current total is *91* across 12 domains. The target is exceeded overall, but distribution is uneven:

| Domain | Count | Notes |
|--------|-------|-------|
| Health (H-) | 19 | Strong |
| Life (Li-) | 12 | Strong |
| Computer & Web (WB-) | 9 + IT Support | Strong |
| Civic (C-) | 8 | Solid |
| Home (Ho-) | 7 | Solid |
| Work (W-) | 7 | Solid |
| Money (M-) | 6 | Light — financial complexity warrants 8–10 |
| Chores (Ch-) | 6 | Solid |
| Creative (Cr-) | 4 | New domain — assess if complete |
| Legal (L-) | 4 | Light — expand to 6–8 |
| Transportation (Tr-) | 4 | Light |
| IRL (IRL-) | 3 | Light — expand to 5+ |
| **Total** | **91** | **114% of original target** |

Priority expansions: Money, Legal, IRL.

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

Down from 126 to *3* `<!-- RESEARCH NEEDED -->` comments — all in Chores (Ch-3 plant citation, Ch-6 occupational therapy citation, Ch-6 BLS time-use survey).

74 `<!-- HUMAN CONDITION -->` editorial research notes remain across Part 2. These are sociological/contextual background for the author, not blocking items — but should be reviewed before publication to decide what gets surfaced in the text vs. removed.

| Domain | HUMAN CONDITION |
|--------|-----------------|
| Life | 25 |
| Civic | 12 |
| Work | 10 |
| Health | 8 |
| Money | 7 |
| Transportation | 3 |
| IRL | 3 |
| Home | 2 |
| Chores | 2 |
| Creative | 2 |

Parts 0, 1, 3, and 4 have zero research comments — clean.

---

## Pre-Publication Checklist

- [x] All `[companion URL TBD]` resolved
- [ ] All `<!-- RESEARCH NEEDED -->` resolved or removed (3 remaining)
- [x] All stubs drafted (except Ch 33)
- [ ] Ch 33 written (only remaining stub)
- [ ] Appendix B complete (50 starters; 8 written)
- [ ] Appendix A reflects final entry list (91 entries across 12 domains)
- [ ] `<!-- HUMAN CONDITION -->` notes reviewed — surface or remove
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
