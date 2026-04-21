# TODO — Majordomo

Last reviewed: 2026-04-21 against spec/ directory and codebase.

---

## Editorial Notes

79 `<!-- RESEARCH NEEDED: ... -->` and 68 `<!-- RESEARCH NEEDED (HUMAN CONDITION): ... -->` comments remain across Part 2. Of the 79 standard RESEARCH NEEDED, 6 carry the `Veterans integration ---` prefix per the convention in `spec/editorial/editorial-conventions.md`. These are author memos: background research directions, sociological context, and expansion ideas. They do not appear in the built ePub and do not correspond to unverified claims in the text. They should be reviewed before publication to decide what gets surfaced, expanded, or removed.

There are also 5 `<!-- EDITORIAL: ... -->` comments (Chores) and 3 `<!-- BRAINSTORM: ... -->` comments (Civic, Life, Computer & Web).

| Domain | RESEARCH NEEDED | HUMAN CONDITION | Total |
|--------|-----------------|-----------------|-------|
| Life | 16 | 25 | 41 |
| Civic | 15 | 12 | 27 |
| Transportation | 17 | 7 | 24 |
| IRL | 9 | 11 | 20 |
| Chores | 12 | 5 | 17 |
| Creative | 7 | 8 | 15 |
| Health | 3 | 0 | 3 |
| Home | 0 | 0 | 0 |
| Legal | 0 | 0 | 0 |
| Money | 0 | 0 | 0 |
| Work | 0 | 0 | 0 |
| Computer & Web | 0 | 0 | 0 |
| **Total** | **79** | **68** | **147** |

Health resolved in the 2026-04-20 session: all 10 original memos surfaced into prose, callouts, or a restructured TIP (H-5 Charmaz paragraph + spoon theory MEME + community prompt; H-6 retirement-savings / long-term-care FAIRNESS + Medicare Advantage SCIENCE + SHIP ALSO; H-7 consolidated FAIRNESS on cultural variation and disparities + SCIENCE on ambiguous loss + extended TIP for sibling dynamics + VA burial/honors ALSO). H-17 and H-19 merged; H-13 and H-18 merged; H-3 absorbed the H-24 brainstorm on negotiation. H-22 Mental Health First Aid drafted 2026-04-21. The remaining Health memos are the three Veterans-integration markers for H-4, H-12, and H-13.

Work resolved in the 2026-04-21 session: all 34 original memos surfaced into cited callouts and footnotes, and the entries were reordered from employment-lifecycle order (W-1 ... W-11) to a least-liked-first order (W-9, W-10, W-2, W-1, W-3, W-6, W-11, W-5, W-4, W-8). Stable W-N IDs preserved. W-1 added five callouts (Paul & Moser unemployment meta-analysis; Babcock & Laschever + racial gap FAIRNESS; Dastin 2018 on Amazon's scrapped recruiting AI; Cappelli "skills gap" reframe; federal Veterans' Preference / VEOA / VRA / GI Bill ALSO). W-2 added USERRA ALSO. W-3 added two callouts (HR-mandate FAIRNESS; Title VII / EEOC documentation SCIENCE with 180/300-day deadlines). W-4 added three (class-dimension FAIRNESS; collaboration-vs-control SCIENCE; Surgeon General loneliness advisory FAIRNESS). W-5 added four (NLRA Section 7 SCIENCE on wage discussion; Bronfenbrenner 34% retaliation FAIRNESS; Western & Rosenfeld wage-inequality SCIENCE + Gallup 2023; resurgence MEME). W-6 added three (AFL-CIO _Death on the Job_ OSHA capacity SCIENCE; immigration-intersection FAIRNESS; workers' comp appeal TIP paralleling H-4). W-8 added two (Upwork freelancer loneliness FAIRNESS; SE-tax / 1040-ES SCIENCE with the quote-the-rate prompt). W-9 added three (annual-review reversal SCIENCE; Clance & Imes impostor-phenomenon FAIRNESS; PIP-as-termination TIP). W-10 added two (APA + Eisenberger social-pain SCIENCE; up/across/down managing TIP). W-11 added four (SSA disability SCIENCE; TIAA P-Fin FAIRNESS on benefits-as-design; HSA/FSA TIP; ERISA vesting SCIENCE) plus TRICARE/TSP/BRS/SBP ALSO. Footnotes renumbered within W-5 and W-6 to start at 1.

Home resolved in the 2026-04-21 session: 14 of 16 original memos surfaced into cited callouts and footnotes. Ho-4 expanded the eviction FAIRNESS with Eviction Lab 2024 data + a new SCRA ALSO callout (50 U.S.C. §§ 3901--4043). Ho-6 added a SCIENCE on NLIHC _Out of Reach 2025_ and an ALSO on VA home loans (funding fee, IRRRL, Blue Water Navy Act). Ho-8 updated the FEMA footnote to the 2024 National Household Survey and added a FAIRNESS citing Klinenberg's _Heat Wave_ and Bullard & Wright on Katrina. Ho-9 added a hoarding-disorder FAIRNESS with DSM-5 prevalence (2.5%) and referral to the IOCDF directory. Ho-10 swapped the unverified $56B industry figure for the IBISWorld $38.6B citation, updated the NFPA footnote to the 2024 report (ownership and testing rates), added a balanced SCIENCE on CCTV deterrent research (Welsh & Farrington; Piza et al.), and extended the DV FAIRNESS with The Hotline's technology-facilitated-abuse resource. The remaining two Home memos are HUMAN CONDITION planning lists in Ho-4 and Ho-6 that sketch future standalone entries.

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

- [ ] Editorial notes reviewed --- 232 `RESEARCH NEEDED` comments (98 `HUMAN CONDITION`, 16 `Veterans integration`) to surface or remove
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

- [ ] Editorial notes triage --- domain-by-domain, smallest first (Health, Home, and Work substantially complete; Computer & Web has no memos):
  1. Creative (15)
  2. Chores (17)
  3. Legal (18)
  4. IRL (20)
  5. Transportation (24)
  6. Civic (27)
  7. Money (31)
  8. Life (41)
- [ ] Kidlin's Law ("If you can write the problem down clearly, you're halfway to solving it") --- it's essentially the premise of Strategy 0 and Chapter 4. Decide whether to surface it. Current spec blocks dropping it in as a Strategy 0 epigraph two ways: `spec/editorial/editorial-conventions.md:11` reserves the strategy-chapter epigraph slot for the TRINITRON block, and the same rule bans motivational quotes. Options: (1) add it as a pull-quote between the italic subtitle and the `---` rule, keeping TRINITRON as the epigraph; (2) replace the Seinfeld TRINITRON; (3) amend the spec to allow a second short epigraph on strategy chapters and carve out an aphorism exception. Provenance is also uncertain --- no reliable primary source.
