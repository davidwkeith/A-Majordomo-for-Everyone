# TODO — A Majordomo for Everyone

Last reviewed: 2026-04-21 against spec/ directory and codebase.

---

## Editorial Notes

134 `<!-- RESEARCH NEEDED: ... -->` and 98 `<!-- RESEARCH NEEDED (HUMAN CONDITION): ... -->` comments remain across Part 2. Of the 134 standard RESEARCH NEEDED, 16 carry the `Veterans integration ---` prefix per the convention in `spec/editorial/editorial-conventions.md`. These are author memos: background research directions, sociological context, and expansion ideas. They do not appear in the built ePub and do not correspond to unverified claims in the text. They should be reviewed before publication to decide what gets surfaced, expanded, or removed.

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
| Creative | 7 | 8 | 15 |
| Health | 3 | 0 | 3 |
| Home | 0 | 2 | 2 |
| Computer & Web | 0 | 0 | 0 |
| **Total** | **134** | **98** | **232** |

Health resolved in the 2026-04-20 session: all 10 original memos surfaced into prose, callouts, or a restructured TIP (H-5 Charmaz paragraph + spoon theory MEME + community prompt; H-6 retirement-savings / long-term-care FAIRNESS + Medicare Advantage SCIENCE + SHIP ALSO; H-7 consolidated FAIRNESS on cultural variation and disparities + SCIENCE on ambiguous loss + extended TIP for sibling dynamics + VA burial/honors ALSO). H-17 and H-19 merged; H-13 and H-18 merged; H-3 absorbed the H-24 brainstorm on negotiation. H-22 Mental Health First Aid drafted 2026-04-21. The remaining Health memos are the three Veterans-integration markers for H-4, H-12, and H-13.

Home resolved in the 2026-04-21 session: 14 of 16 original memos surfaced into cited callouts and footnotes. Ho-4 expanded the eviction FAIRNESS with Eviction Lab 2024 data + a new SCRA ALSO callout (50 U.S.C. §§ 3901--4043). Ho-6 added a SCIENCE on NLIHC _Out of Reach 2025_ and an ALSO on VA home loans (funding fee, IRRRL, Blue Water Navy Act). Ho-8 updated the FEMA footnote to the 2024 National Household Survey and added a FAIRNESS citing Klinenberg's _Heat Wave_ and Bullard & Wright on Katrina. Ho-9 added a hoarding-disorder FAIRNESS with DSM-5 prevalence (2.5%) and referral to the IOCDF directory. Ho-10 swapped the unverified $56B industry figure for the IBISWorld $38.6B citation, updated the NFPA footnote to the 2024 report (ownership and testing rates), added a balanced SCIENCE on CCTV deterrent research (Welsh & Farrington; Piza et al.), and extended the DV FAIRNESS with The Hotline's technology-facilitated-abuse resource. The remaining two Home memos are HUMAN CONDITION planning lists in Ho-4 and Ho-6 that sketch future standalone entries.

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

- [ ] Editorial notes triage --- domain-by-domain, smallest first (Health and Home substantially complete; Computer & Web has no memos):
  1. Creative (15)
  2. Chores (17)
  3. Legal (18)
  4. IRL (20)
  5. Transportation (24)
  6. Civic (27)
  7. Money (31)
  8. Work (34)
  9. Life (41)
- [ ] Kidlin's Law ("If you can write the problem down clearly, you're halfway to solving it") --- it's essentially the premise of Strategy 0 and Chapter 4. Decide whether to surface it. Current spec blocks dropping it in as a Strategy 0 epigraph two ways: `spec/editorial/editorial-conventions.md:11` reserves the strategy-chapter epigraph slot for the TRINITRON block, and the same rule bans motivational quotes. Options: (1) add it as a pull-quote between the italic subtitle and the `---` rule, keeping TRINITRON as the epigraph; (2) replace the Seinfeld TRINITRON; (3) amend the spec to allow a second short epigraph on strategy chapters and carve out an aphorism exception. Provenance is also uncertain --- no reliable primary source.
