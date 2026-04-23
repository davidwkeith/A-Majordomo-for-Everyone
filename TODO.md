# TODO — Majordomo

Last reviewed: 2026-04-22 against spec/ directory and codebase.

---

## Recommended Next Steps

1. **Resolve remaining RESEARCH NEEDED items** — 12 comments remain across 3 domains (Life: 6, Health: 3, Computer & Web: 3), down from 232. Life and Computer & Web comments are from new Skills (Li-13, WB-10) added after the triage pass; Health comments are Veterans-integration markers.

2. **Generate missing illustrations** — 24 art briefs have no corresponding images. Field Guide Skills are the biggest gap (annotated documents, diagrams, icons). Run `npm run build -- --generate` to invoke image generation for missing art, then embed XMP metadata with `npx tsx build/embed-xmp.ts`.

3. **Apple Books highlights sync** (issue #23) — tooling task, independent of editorial work. Can be picked up as a change-of-pace from content triage.

4. **Full editorial consistency pass** — all chapters are in "draft" status. Before 1.0, the manuscript needs a cover-to-cover pass for voice consistency, cross-reference accuracy, and callout density. The RESEARCH NEEDED triage is substantially complete.

---

## Editorial Notes

12 `<!-- RESEARCH NEEDED: ... -->` comments remain across Part 2 (down from 232 at last count): 8 standard and 4 HUMAN CONDITION. Of the 8 standard, 3 are Veterans-integration markers in Health and 5 are from new Skills added after the triage pass (Li-13, WB-10). These are author memos. They do not appear in the built ePub and do not correspond to unverified claims in the text.

There is also 1 `<!-- EDITORIAL: ... -->` comment (Chores, Ch-5 expansion note) and 3 `<!-- BRAINSTORM: ... -->` comments (Civic, Life, Computer & Web).

| Domain | RESEARCH NEEDED | HUMAN CONDITION | Total |
|--------|-----------------|-----------------|-------|
| Life | 4 | 2 | 6 |
| Health | 3 | 0 | 3 |
| Computer & Web | 1 | 2 | 3 |
| **Total** | **8** | **4** | **12** |

All 12 original domains triaged (232 → 3 by 2026-04-22). New Skills Li-13 (Using Your Public and Academic Library) and WB-10 (Doing Real Research with Your Agent) were added post-triage and carry their own RESEARCH NEEDED comments (6 and 3 respectively). The 3 Health comments are Veterans-integration markers for H-4, H-12, and H-13.

---

## Pre-Publication Checklist

- [ ] Editorial notes reviewed --- 12 `RESEARCH NEEDED` comments remain (3 Veterans-integration in Health, 6 from Li-13, 3 from WB-10)
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

- [ ] Kidlin's Law ("If you can write the problem down clearly, you're halfway to solving it") --- it's essentially the premise of Strategy 0 and Chapter 4. Decide whether to surface it. Current spec blocks dropping it in as a Strategy 0 epigraph two ways: `spec/editorial/editorial-conventions.md:11` reserves the strategy-chapter epigraph slot for the TRINITRON block, and the same rule bans motivational quotes. Options: (1) add it as a pull-quote between the italic subtitle and the `---` rule, keeping TRINITRON as the epigraph; (2) replace the Seinfeld TRINITRON; (3) amend the spec to allow a second short epigraph on strategy chapters and carve out an aphorism exception. Provenance is also uncertain --- no reliable primary source.
