# Full Editorial Review — 2026-07-09

> **Status:** all §1 (Critical) items were fixed on this branch on 2026-07-09, including
> the license correction to CC BY-SA 4.0, plus the matching `episode-index.md` Strategy 2
> spec entry and Strategy 8's `status: stub`. Verified: type-check, 110/110 tests, clean
> ePub build, footnote ref/def balance. Sections 2–6 (systemic rulings, renumbering
> debris, draft debris, citation metadata, style mechanics) remain open.

Eight parallel review passes over the entire manuscript (45 chapters, ~14,200 lines, 131
Field Guide Skills, 286 footnotes, 159 science callouts), each grounded in the `spec/`
directory as source of truth: four part-by-part style/consistency reviews, a Jeeves voice
review of all 146 Majordomo passages, a web-verified episode/cultural fact-check, a
web-verified citation/claims fact-check (59 citations and 33 claims checked live), and a
structural audit including a full build.

**Build health:** `build:check` clean, 110/110 tests pass, ePub builds with zero ref
warnings. 131 `ref:` anchors registered, zero dangling. No Djot block-boundary hazards.

**Overall verdict:** the book is in strong shape at the sentence level — voice,
callout discipline, banned-word hygiene, em-dash spacing, and exclamation-point
abstinence are all nearly spotless, and the Jeeves corpus is genuinely Jeeves, not
butler pastiche. The problems cluster into five repairable groups: (1) verified factual
errors, mostly in citations and episode references; (2) renumbering debris from the
Skill-ID renumber (790b971); (3) two unfinished terminology passes ("the AI"→"your
Agent", "Claude"→"your Agent", "prompt"→"spec"); (4) a handful of spec-vs-content
conflicts that need a policy ruling, not an edit; (5) stale self-description
(Appendix H documents a production system the book no longer uses; Appendix E references
a Skill numbering that no longer exists).

---

## 1. Critical — factual errors and reader-facing breakage

### License contradiction (one-line fix, highest consequence)
- `src/content/03-general-method/04-chapter-34-teaching/index.dj:112` says the book is
  **CC BY 4.0** with the CC BY deed link. Appendix H (line 128), the Field Guide
  (`10-computer-and-web/index.dj:532`), and CLAUDE.md all say **CC BY-SA 4.0**. Chapter 34
  also omits the share-alike obligation it describes.

### Verified-wrong episode references (web-checked, sources in agent report)
- `01-strategies/02-strategy-2-prepare/index.dj:15` — "The Longest Day" is Home
  Improvement **S5E22, 1996**, not S3E12, 1993. Also: **Jill** takes the boys to the
  check-up, not Tim (caption and line 19 lean on Tim). `spec/editorial/episode-index.md`
  entry ("Season 4, approximate") is also wrong.
- `02-field-guide/04-home/index.dj:577` — wrong three ways: actual S4E1 title is "Back in
  the Saddle Shoes Again"; its plot has no security system; the security-system episode is
  **"Alarmed by Burglars", S5E25, 1996**. URL also 404s (`Home_Improvement_(season_4)`).
- `02-field-guide/04-home/index.dj:500` — Friends "The One on the Last Night" aired
  **1999**, not 2000, and the described plot (Monica reorganizing before Chandler moves
  in) is not this episode.
- `02-field-guide/02-money/index.dj:743` — the Simpsons stock joke is **inverted**: Homer
  sold for $25 and spent it on beer; $5,200 is what coworkers who *held* collected.
- `01-strategies/04-strategy-4-navigate/index.dj:19` — the Junior Mint surgeon never
  learns about the mint; he credits "something from above" (that's the joke).
- `00-introduction/01-a-note-before-you-start/index.dj:185` — Alexa was **not** codenamed
  "Majel" (that was Google's project; Amazon's was "Doppler"). Same footnote's
  `Computer_voice` Wikipedia link 404s. Also verify "every Star Trek series from 1966" —
  Enterprise-era voicing is doubtful per one checker (the other checker accepted it;
  verify before fixing).

### Broken URLs (verified 404)
- `01-strategies/09-strategy-9-create/index.dj:15, 671` — both `Moriarty_(Star_Trek)`
  links 404. Use `Ship_in_a_Bottle_(Star_Trek:_The_Next_Generation)`.
- `02-field-guide/09-irl-interactions/index.dj:330` —
  `Home_Improvement_(TV_series)_(season_1)` → use `Home_Improvement_season_1`.
- `02-field-guide/04-home/index.dj:577` — see above.

### Citation errors — unsupported / fabricated attributions (high)
- `02-field-guide/01-health/index.dj:784` `[^h16-1]` — cited FDA press release does not
  exist (404). The Aug 2024 MDMA decision was a Complete Response Letter announced by
  Lykos Therapeutics; FDA published the CRL Sept 2025.
- `02-field-guide/08-chores/index.dj:144,154` `[^ch3-1]` — Rihn et al. 2015 contains no
  "42% maintenance barrier" finding; attribution appears hallucinated.
- `02-field-guide/99-transportation/index.dj:376,398` `[^tr9-1]` — NCD 2024 Progress
  Report contains none of the paratransit wait/on-time statistics attributed to it.
- `02-field-guide/99-transportation/index.dj:493,503` `[^tr11-1]` — no NMMA/RVIA source
  found for "30–40% of boats/RVs resold within 36 months." Remove or re-source.
- `02-field-guide/06-work/index.dj:394,439` `[^w11-1]` — $1,336 uncollected-match figure
  is Financial Engines (2015), not Vanguard HAS 2023; it's 1-in-4 (not 33%) and an
  average (not median).
- `02-field-guide/01-health/index.dj:214` `[^h5-3]` — JAMA article is Fang & Selvin 2023,
  329(19), not "Yan, D. et al." 329(9); the 16.5% insulin-rationing figure traces to
  Gaffney et al., Annals of Internal Medicine 2022.
- `02-field-guide/10-computer-and-web/index.dj:160` `[^wb9-1]` — arXiv:2512.05666 is by
  Irene Weber (2025), not "Gargioni, L. et al. (2024)".
- `02-field-guide/10-computer-and-web/index.dj:600,605` `[^wb6-2]` — Perma paper is 2014,
  Harvard Law Review Forum 127; cited DOI doesn't resolve; the "25% of NYT links broken"
  finding is from Zittrain/Bowers/Stanton 2021, a different paper.
- `03-general-method/01-chapter-31-ai-vs-human/index.dj:46` `[^31-1]` — Berland et al.
  2001 does not support the "embarrassment" claim.
- `03-general-method/02-chapter-32-consistent-answers/index.dj:149,158` `[^32-1]` — body
  says 2018, footnote says 2015, and neither Dietvorst paper supports the claim as
  worded. The existing RESEARCH NEEDED flag is warranted; reword or re-source.
- `01-strategies/05-strategy-5-decide/index.dj:46` — ego depletion presented as "one of
  the most replicated findings in behavioral economics"; it is a replication-crisis
  casualty (2016 registered replication failed) and Danziger 2011 has published
  critiques. Hedge and re-source.

### Build-affecting footnote collision
- `02-field-guide/10-computer-and-web/index.dj:297` vs `:673` — `[^wb10-1]` defined twice
  (Ericsson 1993 for WB-4; Tetlock 2015 for WB-10). One citation is silently lost in the
  built ePub. Independently found by three reviewers.

### Content errors
- `01-strategies/03-strategy-3-draft/index.dj:55,242` — "Medicare Denial Appeal Letter"
  example actually describes an ACA/ERISA external review, not Medicare appeals; the KFF
  citation (line 451) is marketplace-plan data. Retitle or rewrite.
- `02-field-guide/02-money/index.dj:266` (M-4) vs `03-legal/index.dj:409,417` (L-7) —
  contradictory FDCPA debt-validation advice: the cessation duty attaches to a **written**
  request; M-4 implies a phone request suffices. Align on L-7's framing.
- `01-strategies/07-strategy-7-research/index.dj:25` — garbled Jeeves capstone sentence
  ("without the reading public the other party had already retained") — doesn't parse;
  found independently by two reviewers. Suggested: "without the professional readers the
  other party had already retained."
- `04-appendices/07-final-note/index.dj:28` — "The the book is the seed."
- Agent blocks ending in the reader's voice (copy-paste error class; grep book-wide):
  `05-strategy-5-decide/index.dj:467-468`, `07-strategy-7-research/index.dj:171-172` and
  `:537-538` — "Give me the most conservative answer. I will verify…" belongs at the end
  of the reader's spec, not inside the `::: agent` block.

### Stale self-description (appendices describing a system that no longer exists)
- **Appendix E** (`04-appendices/04-appendix-e-sdg-alignment/index.dj:16-24`) — entire SDG
  table references Skills by a numeric scheme (#26, #74-79, #104-110) that doesn't exist,
  plus a nonexistent "Chapter 35." Needs a full rewrite of the Skills column.
- **Appendix H** (`04-appendices/07-appendix-h-writing-guide/index.dj:20,44,59,86-94,138`)
  — claims the book is CommonMark (it's Djot) and that art briefs are HTML comments
  (they're `.art.md` sidecars); line 46 sample is fenced as `markdown` with CommonMark
  emphasis conventions. Also missing its `## Appendix H:` h2 heading (body starts at h3).

---

## 2. Systemic — one decision, then a mechanical sweep

Each of these is a spec-vs-content conflict. Per CLAUDE.md, fix one side; don't leave
them disagreeing.

1. **"the AI" vs "your Agent"** — pervasive in `01-a-note-before-you-start` (30+ uses),
   Chapter 1's "Library and the Life" section, strategy-chapter *lesson* paragraphs
   (S0/S3/S4/S5/S7/S9), Chapter 33/34, Appendices D and I. Some may be sanctioned
   meta-register (principles.md itself says "AI brings the library") — rule on it, then
   sweep.
2. **"prompt" vs "spec"** — Chapter 4 (How to Ask) teaches the core skill using "prompt"
   throughout (lines 36, 60, 104, 141, 167); neighbors say "spec."
3. **"Claude" vs "your Agent"** — unfinished conversion in Chapters 30–32 (~28 uses in
   instructional prose) and Appendix D. Chapter 32 is half-converted mid-file.
4. **Subheading case** — every `###` subheading in Parts 0/1 is Title Case; style guide
   says sentence case. Bulk fix or amend the spec table.
5. **Majordomo address form** — "One's Agent" (~78), "Your Agent" (~19), "The reader's
   Agent" (3), "The reader has an Agent" (5); several passages switch mid-sentence
   (worst: `03-legal/index.dj:230`). Add a ruling to the voice bible, then normalize.
   "One's Agent" is the majority and most Jeevesian form.
6. **British vs American spelling in Jeeves passages** — tyre/fortnight/favour vs
   favorable/neighborhood/behavioral coexist. One line in the voice bible, then sweep.
7. **Alt-text length** — 34 of 44 sidecars exceed the style guide's 125-char max (worst
   322). Either trim / adopt the aria-describedby long-description mechanism, or amend
   the spec.
8. **SPEC-loop beats** — architecture.md mandates propose-spec → review → correct in
   every worked example; only Strategy 0 and S4-Ex1 show those beats. Either compress the
   requirement in architecture.md or add the beats.
9. **Numeric ranges** — hyphens vs `--` en dashes are split roughly 50/50 across the book
   ($72,000-78,000, 30-180 days, 1-2%…). One normalization pass.
10. **Appendix lettering** — no Appendix A, no Appendix F, nothing references them
    (verified). Reletter B→A etc. or document the gaps before 1.0. Also rename
    `07-final-note/` → `10-final-note/` to match its `order: 10` (cosmetic; build sorts
    by frontmatter).
11. **architecture.md drift** — says "~80 Skills" (there are 131); Part Three contents
    don't include Chapter 33 (Advanced Free Tier); Chapter 4 title differs. Update spec.
12. **Epigraphs off-registry** — Shaw, Bowie, Kraftwerk, Laurie Anderson, Gibson, Björk,
    Hockney, Paik aren't in cultural-references.md; three Field Guide domains open with
    epigraphs though architecture says one italic paragraph, no heading. Bless or remove.

---

## 3. Renumbering debris (from Skill-ID renumber, commit 790b971)

- **~45 stale footnote prefixes** — headings were renumbered, footnote labels weren't:
  H-18 uses `[^h22-*]`; L-9/L-10 use `[^l10-*]`/`[^l11-*]`; Work W-7..W-10 shifted by
  one; Chores Ch-5..Ch-10 shifted by one; Computer & Web WB-1..WB-9 scrambled; Creative
  Cr-4..Cr-10 shifted; Transportation Tr-6..Tr-10 shifted. (Full line-by-line list in the
  Field Guide agent report; all resolve at build time — naming-only except `wb10-1`.)
- **Wrong cross-ref IDs (dangling for readers):** `05-life/index.dj:180` Tr-2 should be
  Tr-3; `10-computer-and-web/index.dj:39` "W-5: Learning a New Professional Skill" (W-5
  is Unions); `99-transportation/index.dj:352` "C-7: Disability Rights" (C-7 is Jury
  Duty; no disability-rights Skill exists).
- **Stale cross-ref titles (ID right, title wrong):** ~12 instances — Tr-1 "Buying a
  Car"→"Car Ownership"; M-1/M-2/IRL-2 titles in Chores; W-7, M-10, Li-4, M-2, H-6, M-8
  titles elsewhere; WB-5/WB-7 called by two different wrong names; strategy chapters'
  `[W-2 (If You're Let Go)]` and `[W-1 (Job Search)]` labels.
- **Work domain file order scrambled:** W-8, W-9, W-2, W-1, W-3, W-6, W-10, W-5, W-4,
  W-7. Reorder the file.

---

## 4. Draft debris rendered as content

- `04-home/index.dj:45-51` and `:272-275` — orphan topic-stub bullet lists at the end of
  Ho-1 and Ho-5.
- `10-computer-and-web/index.dj:281` and `:511` — sentence fragments in WB-4 and WB-8
  bodies.
- `07-civic/index.dj:422` — file ends with empty heading `### Starting a non-profit`.
- `10-computer-and-web/index.dj:23-31` — unnumbered pseudo-Skill "#### IT Support" whose
  entire body is an art-caption span; domain also uses italic one-liner section dividers
  where Health uses a real heading.
- `02-field-guide/11-creative/worn-hitchhikers.art.md` — orphan sidecar; no chapter
  references the stem.
- `04-appendices/07-appendix-h-writing-guide/eob-annotated-appendix.art.md` — its only
  `{.art}` reference is inside a code fence, so the image never renders.
- `04-appendices/03-appendix-d-real-professional/index.dj:48-50` — doubled `---` rule.
- **Strategy 8 (Assert) is a stub**: zero worked examples
  (`08-strategy-8-assert/index.dj:62` "(Full worked examples with [SPEC] loops to be
  drafted)") but `status: "draft"` — should be `"stub"` until drafted.

---

## 5. Citation details wrong (real sources, wrong metadata)

- Wrong DOIs on real papers: `07-civic/index.dj:359` (Robertson), `:412` (Coglianese),
  `11-creative/index.dj:615` (Balbag), `04-home/index.dj:238` (Hepburn link points to
  Gromis 2022 PNAS).
- `00-introduction/04-chapter-02.../index.dj:81` — Humphrey et al. is 92(3), not 92(1).
- `01-strategies/02-strategy-2-prepare/index.dj:42` vs `:47` — in-text "(Roter et al.,
  1987; Street et al., 2009)" vs footnote "Roter (1989)".
- `00-introduction/03-chapter-01.../index.dj:107` — Patel piece is a Decoder essay, not a
  Vergecast episode; quote wording slightly off.
- Stat corrections (medium): CFPB debt-collection figures stale/misread
  (`03-legal/index.dj:411`); naloxone OTC was approved March 2023, on shelves Sept 2023
  (`01-health/index.dj:704`); NFPA smoke-alarm figures outdated
  (`04-home/index.dj:556,583`); credit-card averages misattributed
  (`02-money/index.dj:105`); BLS transportation figure matches neither year
  (`99-transportation/index.dj:46`); eviction "majority never appear" overstates
  (`03-legal/index.dj:273`); Edison podcast stat mixes metrics
  (`11-creative/index.dj:293`); cannabis scheduling outdated after April 2026 Schedule III
  move (`01-health/index.dj:746,750`); CR brand-report order (`02-money/index.dj:757`);
  PSLF "first decade" (`02-money/index.dj:649`); ICI year-end 2025 impossible from 2025
  Fact Book (`02-money/index.dj:392`); Kasparov freestyle-chess cite likely 2010 NYRB
  essay, not the 2007 book (`03-general-method/01.../index.dj:48`); nursing-home cost
  figures disagree between H-6b and Li-4; same $12,182 stat attributed to both BLS and
  AAA (Tr-1 vs Tr-3 vs M-10's $11,577).
- IRA limit `01-strategies/05.../index.dj:227` — "$7,000 (2026)" is the 2024–25 limit;
  verify 2026 indexing. Hemingway "first draft" quote is apocryphal
  (`09-strategy-9-create/index.dj:219`).
- Unlinked citations (spec requires hyperlink): Cummings `[^32-2]`, Thorsteinson
  `[^w9-1]`, Eisenberger `[^w10-3]`, Dazzi `[^h22-3]`, Washington `[^h7-3]`, Emery
  `[^l6-2]`, Pierson `[^l4-1]`, Shelby County `[^c2-1]`, IEA `[^wb1-1]`, Compeau &
  Higgins `[^34-1]`, Omura `[^ch6-1]`; homepage-only links in `[^l7-1]`, `[^l10-1]`,
  `[^l10-2]`, `[^l11-1]`, `[^m9-1]`; Amazon links for books (should be
  author-page/bookshop.org): Life 21/301/451/506, Work 91, Chores 201; unlinked statutes
  in S4:319 and S7:264-266,305.
- Non-author-date formats: `03-legal/index.dj:290`, `:448`, `:519`, `:588`, `:590`.

---

## 6. Smaller style/mechanics (single-pass fixes)

- "above/below" (banned): `04-chapter-02:18`, `00-general-spec-method:73`,
  `02-chapter-32:70,98`, `03-chapter-33:56`, `03-appendix-d:56`, `06-appendix-g:13`,
  `01-strategies/01:191`, `05:298,399,466`.
- Banned words: "unlock" (`08-appendix-i:19`), "utilize" (`01-chapter-31:46`), "thrive"
  (`06-work:549`), "the model" (`02-chapter-32:38`), "the chatbot"
  (`01-a-note:90,107`), "the user" (`00-strategy-0:136`, `01-a-note:27`).
- "Good question —" agent opener (`01-strategies/01:340`) — same register as banned
  "Great question!".
- Cross-refs by bare chapter number outside Part 3: `06-chapter-04:162`,
  `03-chapter-01:105`, `03-chapter-33:14,56,67`, `04-chapter-34:100,114`,
  `06-appendix-g:104`.
- Hardcoded `.xhtml` links to Appendix G: `00-strategy-0:158`, `03-chapter-33:108` (plus
  the Part 0 instances); brittle if appendices reletter.
- Episode-ref format: `03-legal:193` (unlinked, no year), `09-irl:88` (no year),
  `02-money:743` (italicized show name), `04-home:500,577` (italic-wrapped form).
- Number style: ordinal dates (`00-general-spec-method:37,38,77,79`), "sixty days"
  (`02-chapter-32:108`), "forty-seven" vs "47" (`09-appendix-j:31` vs `:56`), "ninety
  seconds"/"fourteen times" (foreword 15/23), ordinals "8th/9th/6th/5th grade"
  (`08-appendix-i`), "$X to $Y" digit ranges (`09-create:214,666`).
- Nonconforming footnote IDs (spec gap — define appendix/section formats):
  `[^jeeves-1..3]`, `[^hd-1..3]`, `[^li4-0a/0b/0c]`, `[^tr-wc-1]`, `[^32-cot]`,
  `[^j-litm]`, `[^h-1]` (App H — collides visually with Health), `[^fn-1]`; Note-Before-
  You-Start reuses Chapter 1's `[^1-*]` prefix (cross-file collision risk).
- Voice nits: "enshittification" needs Jeeves's distancing apparatus (`04-home:99`); one
  contraction ("doesn't", `11-creative:196`); Agent as "They" (`99-transportation:300`);
  stat-stacking opener reads as performance (H-22, `01-health:852`); S1 capstone skips
  the validate-scenario beat.
- Structure nits: domain headings ALL-CAPS vs mixed case (8 vs 4); Civic domain intro is
  two paragraphs; Skill-anatomy ordering drift (callouts vs Expert Role position, ~7
  Skills); H-1 has no callout; H-18 sits under the `### Drugs` heading; two Skill titles
  lowercase ("Learn a language", "Write in CommonMark, the language of AI"); Appendix B's
  50 starters are blockquotes with quotation marks instead of spec blocks (readers will
  copy the quotes); Appendix D directory entries unlinked and bold/italic likely
  inverted; frontmatter/heading title mismatches (Appendices E, J); Chapter 4's epigraph
  anatomy differs from Chapters 1–3; `order: -1` on epigraph out of schema;
  "echo-back" defined two incompatible ways (Ch. 32 vs Ch. 4/34/App I); Ch. 33 science
  callout contradicts its own footnote `[^33-1]` on independence; MRI-denial story
  timeline resets in S4 after S3 resolved it; S0/S6/S8 lesson-vs-body near-duplicate
  paragraphs; Appendix G lists Claude "Custom Instructions" (ChatGPT's name) and DALL-E
  (retired); `_spec.md` in field-guide isn't a part-level spec (it's the qualifying-
  questions source material); gendered "She" for unnamed chief of staff
  (`09-appendix-j:64`); missing art inventory: 15 placeholder images.

---

## 7. Suggested fix order

1. License contradiction (Ch. 34), `[^wb10-1]` collision, "The the" typo — minutes each.
2. Verified factual errors: episode refs (§1), citations flagged fabricated/unsupported
   (§1), FDCPA M-4/L-7 conflict, Medicare mislabel, garbled S7 Jeeves line, agent-block
   voice leaks.
3. Renumbering-debris sweep (§3) — scriptable; then re-run build + spot check.
4. The twelve systemic rulings (§2) — each is one spec edit + one mechanical sweep.
5. Appendix E rewrite, Appendix H factual pass, Strategy 8 drafting (or status: stub).
6. Citation-metadata and link-policy cleanup (§5), then style mechanics (§6).
7. Spec updates: episode-index.md corrections (Strategy 2/7/8 entries), architecture.md
   Skill count / Part 3 contents, voice-bible rulings (address form, orthography),
   footnote-format table additions, cultural-references registry additions.
