# TODO — Majordomo

Last reviewed: 2026-04-23. Full `RESEARCH NEEDED` sweep completed.

---

## Recommended Next Steps

1. ~~**Resolve remaining RESEARCH NEEDED items**~~ — Done. A second sweep on 2026-04-23 resolved 62 additional comments surfaced across 26 files after the 2026-04-22 triage.

2. **Generate missing illustrations** — 24 art briefs have no corresponding images. Field Guide Skills are the biggest gap (annotated documents, diagrams, icons). Run `npm run build -- --generate` to invoke image generation for missing art, then embed XMP metadata with `npx tsx build/embed-xmp.ts`.

3. **Apple Books highlights sync** (issue #23) — tooling task, independent of editorial work. Can be picked up as a change-of-pace from content triage.

4. **Full editorial consistency pass** — all chapters are in "draft" status. Before 1.0, the manuscript needs a cover-to-cover pass for voice consistency, cross-reference accuracy, and callout density.

---

## Editorial Notes

All `<!-- RESEARCH NEEDED: ... -->` and `<!-- RESEARCH NEEDED (HUMAN CONDITION): ... -->` comments have been resolved. Resolution history:

- 232 → 3 standard comments by 2026-04-22 (original 12-domain triage)
- New Skills Li-13 and WB-10 added post-triage with 9 additional comments
- 3 Health veterans-integration markers (H-4, H-12, H-13) resolved with integrated veterans content
- 12 remaining comments from that triage resolved 2026-04-22
- A full-file sweep on 2026-04-23 found and resolved an additional 62 comments (Field Guide chapters, Strategy chapters, AI-tool-dependent pricing/feature claims in intro + Appendix G, and citation-needed items across Appendix D/E/I/J, the epigraph, and Chapter 32)

Notable corrections during the 2026-04-23 pass:
- Women share of unpaid eldercare: 75% → 59% per AARP/NAC 2020.
- Renters without insurance: 55% → ~43% per III.
- Average primary-care appointment framing: "seven-minute" → "fifteen-minute."
- Cost-related non-adherence deaths: 100,000 (unsourced) → reframed around the ~125,000 Osterberg/Blaschke figure for non-adherence overall.
- Credit card APR: 24.99% (late-2024 peak) → ~21% current average.
- Gemini settings panel: "Saved Info" → "Personalization."

There is also 1 `<!-- EDITORIAL: ... -->` comment (Chores, Ch-5 expansion note) and 3 `<!-- BRAINSTORM: ... -->` comments (Civic, Life, Computer & Web). These are retained as author memos for future expansion.

---

## Pre-Publication Checklist

- [x] Editorial notes reviewed --- all `RESEARCH NEEDED` comments resolved (0 remain)
- [ ] All art briefs have corresponding images in `src/images/` (24 of 44 missing)
- [x] XMP metadata embedded in all existing images (27 of 27)
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
