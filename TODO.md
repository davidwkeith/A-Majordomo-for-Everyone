# TODO — A Majordomo for Everyone

Last reviewed: 2026-04-15 against spec/ directory and codebase.

---

## Editorial Notes

129 `<!-- RESEARCH NEEDED: ... -->` and 111 `<!-- RESEARCH NEEDED (HUMAN CONDITION): ... -->` comments remain across Part 2. These are author memos: background research directions, sociological context, and expansion ideas. They do not appear in the built ePub and do not correspond to unverified claims in the text. They should be reviewed before publication to decide what gets surfaced, expanded, or removed.

There are also 5 `<!-- EDITORIAL: ... -->` comments (Chores) and 4 `<!-- BRAINSTORM: ... -->` comments (Health, Life, Civic, Computer & Web).

| Domain | RESEARCH NEEDED | HUMAN CONDITION | Total |
|--------|-----------------|-----------------|-------|
| Life | 14 | 25 | 39 |
| Work | 17 | 14 | 31 |
| Civic | 15 | 12 | 27 |
| Money | 15 | 12 | 27 |
| Transportation | 16 | 7 | 23 |
| IRL | 9 | 11 | 20 |
| Chores | 12 | 7 | 19 |
| Creative | 7 | 8 | 15 |
| Legal | 13 | 2 | 15 |
| Home | 9 | 5 | 14 |
| Health | 2 | 8 | 10 |
| **Total** | **129** | **111** | **240** |

---

## Pre-Publication Checklist

- [ ] Editorial notes reviewed — 240 `RESEARCH NEEDED` + `HUMAN CONDITION` comments to surface or remove
- [ ] All art briefs have corresponding images in `src/images/` (24 of 44 missing)
- [ ] XMP metadata embedded in all images
- [ ] Version bumped and tagged
- [ ] `npm run build` produces clean ePub
- [ ] `npm test` passes

---

## Pending

- [ ] Editorial notes triage — domain-by-domain, smallest first:
  1. Health (10)
  2. Home (14)
  3. Legal (15)
  4. Creative (15)
  5. Chores (19)
  6. IRL (20)
  7. Transportation (23)
  8. Money (27)
  9. Civic (27)
  10. Work (31)
  11. Life (39)
- [ ] Kidlin's Law ("If you can write the problem down clearly, you're halfway to solving it") — it's essentially the premise of Strategy 0 and Chapter 4. Decide whether to surface it. Current spec blocks dropping it in as a Strategy 0 epigraph two ways: `spec/editorial/editorial-conventions.md:11` reserves the strategy-chapter epigraph slot for the TRINITRON block, and the same rule bans motivational quotes. Options: (1) add it as a pull-quote between the italic subtitle and the `---` rule, keeping TRINITRON as the epigraph; (2) replace the Seinfeld TRINITRON; (3) amend the spec to allow a second short epigraph on strategy chapters and carve out an aphorism exception. Provenance is also uncertain — no reliable primary source.
