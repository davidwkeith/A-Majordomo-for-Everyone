# TODO — Majordomo

Last reviewed: 2026-04-22 against spec/ directory and codebase.

---

## Recommended Next Steps

1. **Continue resolving RESEARCH NEEDED items** — 5 domains remain, down from 12. The smallest domains (Creative, Chores) are the fastest wins. The domain-by-domain triage order in "Pending" below is still the right sequence.

2. **Generate missing illustrations** — 25 art briefs have no corresponding images. Field Guide entries are the biggest gap (annotated documents, diagrams, icons). Run `npm run build -- --generate` to invoke image generation for missing art, then embed XMP metadata with `npx tsx build/embed-xmp.ts`.

3. **Apple Books highlights sync** (issue #23) — tooling task, independent of editorial work. Can be picked up as a change-of-pace from content triage.

4. **Full editorial consistency pass** — all 47 chapters are in "draft" status. Before 1.0, the manuscript needs a cover-to-cover pass for voice consistency, cross-reference accuracy, and callout density. This should happen after the RESEARCH NEEDED triage is substantially complete.

---

## Editorial Notes

64 `<!-- RESEARCH NEEDED: ... -->` and 58 `<!-- RESEARCH NEEDED (HUMAN CONDITION): ... -->` comments remain across Part 2 (down from 134 + 98 = 232 at last count). Of the 64 standard RESEARCH NEEDED, the Health entries are the 3 `Veterans integration ---` markers. These are author memos: background research directions, sociological context, and expansion ideas. They do not appear in the built ePub and do not correspond to unverified claims in the text. They should be reviewed before publication to decide what gets surfaced, expanded, or removed.

There are also 5 `<!-- EDITORIAL: ... -->` comments (Chores) and 3 `<!-- BRAINSTORM: ... -->` comments (Civic, Life, Computer & Web).

| Domain | RESEARCH NEEDED | HUMAN CONDITION | Total |
|--------|-----------------|-----------------|-------|
| Life | 16 | 25 | 41 |
| Transportation | 17 | 7 | 24 |
| IRL | 9 | 11 | 20 |
| Chores | 12 | 5 | 17 |
| Creative | 7 | 8 | 15 |
| Health | 3 | 0 | 3 |
| Home | 0 | 2 | 2 |
| Money | 0 | 0 | 0 |
| Legal | 0 | 0 | 0 |
| Civic | 0 | 0 | 0 |
| Work | 0 | 0 | 0 |
| Computer & Web | 0 | 0 | 0 |
| **Total** | **64** | **58** | **122** |

Health resolved 2026-04-20. Home resolved 2026-04-21 (2 HUMAN CONDITION planning memos remain in Ho-4 and Ho-6). Work resolved 2026-04-21 (20 RN + 14 HC surfaced into callouts, footnotes, and reordered entries). Money resolved 2026-04-21 (19 RN + 12 HC surfaced into callouts, footnotes, and prose). Legal resolved 2026-04-21 (16 RN + 2 HC). Civic resolved 2026-04-21 (15 RN + 12 HC; entries reordered by impact). The remaining Health memos are the three Veterans-integration markers for H-4, H-12, and H-13.

---

## Health Chapter Editorial Review (2026-04-21)

Systematic issues (em dashes, number formatting, footnote IDs) fixed. The following remain.

### Citation Issues

- [x] **Missing citation for tobacco/alcohol funding claim (drugs intro):** Split into `[^hd-2]` citing Buchanan & Wallack (1998), _Journal of Drug Issues_.
- [x] **Footnote h15-1 is a status note, not a citation:** Replaced with 89 Fed. Reg. 44597 (proposed May 21, 2024) and current status (ALJ retired August 2025, rulemaking stalled).
- [x] **H-4 Science Note range formatting:** Fixed hyphen to en dash (`39--59%`).

### Structural Issues

- [x] **Missing "What to do with the Output"** in H-12, H-13, H-14, H-16. Added concrete next steps to all four.
- [x] **"Drugs: What the Egg Should Have Been" heading level:** Changed from h4 to h3.
- [x] **Domain heading ALL CAPS:** Changed to `### Health`.
- [x] **Conservative-answer convention:** Added guard language to specs in H-1, H-5, H-6, H-8, H-11, H-13, H-14.
- [x] **H-7 tip callout (Five Wishes state requirements):** Retyped from `::: tip` to `::: science`.

### Density / Readability

- [x] **H-6 fairness callout split:** Nursing home math stays in `::: fairness`; VA Aid & Attendance moved to its own `::: also` (following H-7 pattern for veterans benefits).
- [x] **H-6 split into H-6 + H-6b:** H-6 now covers Medicare (enrollment, Part D, Medicare Advantage, Medigap, SHIP). H-6b covers Medicaid (eligibility, work requirements, long-term care, spend-down, VA pension). Each has its own Jeeves opener, spec, and footnotes. Cross-references updated.

---

## Pre-Publication Checklist

- [ ] Editorial notes reviewed --- 122 `RESEARCH NEEDED` comments remain (58 `HUMAN CONDITION`, 3 `Veterans integration`) to surface or remove
- [ ] All art briefs have corresponding images in `src/images/` (25 of 45 missing)
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

- [ ] Editorial notes triage --- domain-by-domain, smallest first (Health, Home, Work, Money, Legal, Civic, and Computer & Web complete):
  1. Creative (15)
  2. Chores (17 + 5 EDITORIAL)
  3. IRL (20)
  4. Transportation (24)
  5. Life (41 + 1 BRAINSTORM)
- [ ] Kidlin's Law ("If you can write the problem down clearly, you're halfway to solving it") --- it's essentially the premise of Strategy 0 and Chapter 4. Decide whether to surface it. Current spec blocks dropping it in as a Strategy 0 epigraph two ways: `spec/editorial/editorial-conventions.md:11` reserves the strategy-chapter epigraph slot for the TRINITRON block, and the same rule bans motivational quotes. Options: (1) add it as a pull-quote between the italic subtitle and the `---` rule, keeping TRINITRON as the epigraph; (2) replace the Seinfeld TRINITRON; (3) amend the spec to allow a second short epigraph on strategy chapters and carve out an aphorism exception. Provenance is also uncertain --- no reliable primary source.
