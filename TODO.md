# TODO — A Majordomo for Everyone

Last reviewed: 2026-04-21 against spec/ directory and codebase.

---

## Editorial Notes

145 `<!-- RESEARCH NEEDED: ... -->` and 101 `<!-- RESEARCH NEEDED (HUMAN CONDITION): ... -->` comments remain across Part 2. Of the 145 standard RESEARCH NEEDED, 18 carry the `Veterans integration ---` prefix per the convention in `spec/editorial/editorial-conventions.md`. These are author memos: background research directions, sociological context, and expansion ideas. They do not appear in the built ePub and do not correspond to unverified claims in the text. They should be reviewed before publication to decide what gets surfaced, expanded, or removed.

There are also 5 `<!-- EDITORIAL: ... -->` comments (Chores) and 3 `<!-- BRAINSTORM: ... -->` comments (Civic, Life, Computer & Web).

| Domain | RESEARCH NEEDED | HUMAN CONDITION | Total |
|--------|-----------------|-----------------|-------|
| Life | 16 | 25 | 41 |
| Work | 20 | 14 | 34 |
| Money | 19 | 12 | 31 |
| Civic | 15 | 12 | 27 |
| Transportation | 17 | 7 | 24 |
| IRL | 9 | 11 | 20 |
| Legal | 16 | 2 | 18 |
| Chores | 12 | 5 | 17 |
| Home | 11 | 5 | 16 |
| Creative | 7 | 8 | 15 |
| Health | 3 | 0 | 3 |
| Computer & Web | 0 | 0 | 0 |
| **Total** | **145** | **101** | **246** |

Health resolved in the 2026-04-20 session: all 10 original memos surfaced into prose, callouts, or a restructured TIP (H-5 Charmaz paragraph + spoon theory MEME + community prompt; H-6 retirement-savings / long-term-care FAIRNESS + Medicare Advantage SCIENCE + SHIP ALSO; H-7 consolidated FAIRNESS on cultural variation and disparities + SCIENCE on ambiguous loss + extended TIP for sibling dynamics + VA burial/honors ALSO). H-17 and H-19 merged; H-13 and H-18 merged; H-3 absorbed the H-24 brainstorm on negotiation. H-22 Mental Health First Aid drafted 2026-04-21. The remaining Health memos are the three Veterans-integration markers for H-4, H-12, and H-13.

---

## Health Chapter Editorial Review (2026-04-21)

Systematic issues (em dashes, number formatting, footnote IDs) fixed. The following remain.

### Citation Issues

- [ ] **Missing citation for tobacco/alcohol funding claim (drugs intro):** "The campaign was funded in part by Philip Morris, Anheuser-Busch, and RJ Reynolds" shares `[^hd-1]` with the DARE effectiveness claim, but the footnote only covers West & O'Neal (2004). The funding claim needs its own source.
- [ ] **Footnote h15-1 is a status note, not a citation:** "The DEA initiated a review to potentially reschedule cannabis from Schedule I to Schedule III in 2024. As of this writing, the process is ongoing." Either cite the DEA/DOJ announcement or convert to `<!-- RESEARCH NEEDED -->`.
- [ ] **H-4 Science Note range formatting:** "39-59%" uses a hyphen; style guide says en dash for numeric ranges (`39--59%`).

### Structural Issues

- [ ] **Missing "What to do with the Output"** in H-12 (Pain Management), H-13 (Understanding Addiction), H-14 (Harm Reduction), H-16 (Evaluating Psychedelic Therapy). All high-stakes entries where a concrete next step matters.
- [ ] **"Drugs: What the Egg Should Have Been" heading level:** Currently h4 (`####`), same level as entries. This is a thematic section divider parallel to `### HEALTH` --- should be h3 (`###`).
- [ ] **Domain heading ALL CAPS:** `### HEALTH` should be `### Health` per title case convention.
- [ ] **Conservative-answer convention underused:** H-1, H-5, H-6, H-8, H-11, H-13, H-14 are high-stakes entries whose specs lack the guard language ("Give me the most conservative answer" / "I will verify with [professional type]").
- [ ] **H-7 tip callout (Five Wishes state requirements) is mistyped:** Tagged `::: tip` but contains detailed legal/regulatory information (state acceptance, witness/notarization rules, POLST distinction). Reads as `::: science` or `::: also`.

### Density / Readability

- [ ] **H-6 fairness callout (nursing home / VA pension) is doing too much:** Single callout covers Medicaid spend-down, 60-month look-back, community spouse protections, AND VA Aid & Attendance. Consider splitting into two callouts.
- [ ] **H-6 is functionally three entries:** Covers Medicare, Medicaid, Medicare Advantage, Medigap, dual eligibility, and the One Big Beautiful Bill Act. 10 footnotes, 6 callouts. Consider whether Medicare and Medicaid deserve separate entries.

---

## Pre-Publication Checklist

- [ ] Editorial notes reviewed --- 246 `RESEARCH NEEDED` comments (101 `HUMAN CONDITION`, 18 `Veterans integration`) to surface or remove
- [ ] All art briefs have corresponding images in `src/images/` (24 of 44 missing)
- [ ] XMP metadata embedded in all images
- [ ] Version bumped and tagged
- [ ] `npm run build` produces clean ePub
- [ ] `npm test` passes

---

## Planned Future Entries

### Health (Part 2)

Carried from the former BRAINSTORM comment in `src/content/02-field-guide/01-health/index.dj`:

- **H-20: Navigating Pregnancy and Childbirth** --- the billing labyrinth, birth plans, postpartum care. The most medicalized natural process in American life.
- **H-21: Dental and Vision Insurance** --- separate systems, separate rules, separate frustrations. Why your teeth are apparently not part of your body.
- **H-23: Disability Benefits (SSI/SSDI)** --- the application process is designed to deny first, approve on appeal. Understanding the system before you enter it.

(H-22 Mental Health First Aid drafted 2026-04-21; see `src/content/02-field-guide/01-health/index.dj`.)

---

## Pending

- [ ] Editorial notes triage --- domain-by-domain, smallest first (Health substantially complete; Computer & Web has no memos):
  1. Creative (15)
  2. Home (16)
  3. Chores (17)
  4. Legal (18)
  5. IRL (20)
  6. Transportation (24)
  7. Civic (27)
  8. Money (31)
  9. Work (34)
  10. Life (41)
- [ ] Kidlin's Law ("If you can write the problem down clearly, you're halfway to solving it") --- it's essentially the premise of Strategy 0 and Chapter 4. Decide whether to surface it. Current spec blocks dropping it in as a Strategy 0 epigraph two ways: `spec/editorial/editorial-conventions.md:11` reserves the strategy-chapter epigraph slot for the TRINITRON block, and the same rule bans motivational quotes. Options: (1) add it as a pull-quote between the italic subtitle and the `---` rule, keeping TRINITRON as the epigraph; (2) replace the Seinfeld TRINITRON; (3) amend the spec to allow a second short epigraph on strategy chapters and carve out an aphorism exception. Provenance is also uncertain --- no reliable primary source.
