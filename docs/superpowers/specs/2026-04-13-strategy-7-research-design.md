# Strategy 7: Research — Worked Examples Design

**Date:** 2026-04-13
**Status:** Approved
**Scope:** Three worked examples with [SPEC] loops, supporting callouts, and closing paragraph for Strategy 7: Research

---

## Core Framing

Research closes the **information gap** — the reader doesn't know what they don't know. This is distinct from Decide (Strategy 5), which maps tradeoffs between known options. Research is upstream of Decide: you can't weigh options you haven't discovered yet.

The unifying pattern across all three examples: an institution (hospital, employer, university) controls the information, the reader is expected to commit without it, and the cost of that asymmetry falls entirely on the reader. The Agent's role is to surface what the reader should be asking before they sign, schedule, or deposit.

---

## Structure

The existing skeleton (epigraph through first [SCIENCE] callout and footnote) stays as-is. New content replaces the placeholder line `_(Full worked examples with [SPEC] loops to be drafted)_`.

### Insertion point

After the existing `[^s7-1]` footnote, new content begins with:

1. **[TIP] callout** — the "verify independently" pattern. Research specs should always end with "tell me what I should verify independently before proceeding." This forces the Agent to distinguish between what it's confident about and what requires human confirmation. This is the move that separates Research from just asking a question.

2. **Example 1: Before a Knee Arthroscopy** (low stakes, high frequency)
3. **Example 2: Before Signing a Non-Compete Clause** (medium stakes, hidden complexity)
4. **Example 3: Between Two College Financial Aid Letters** (high stakes, deliberately obscured)
5. **Closing paragraph** — callback to the Roseanne kitchen table epigraph

### Callout distribution

| Callout | Placement | Content |
|---------|-----------|---------|
| [TIP] | Before Example 1 | "Verify independently" as the Research power move |
| [ALSO] | After Example 1 | Cross-tool comparison for document upload/analysis |
| [FAIRNESS] | After Example 2 | Non-competes disproportionately burden low-wage workers |
| [SCIENCE] | After Example 3 | First-gen information asymmetry in college choice (Perna 2006) |
| [MEME] | Closing | Roseanne and the financial aid letters at the kitchen table |

### Conservative-answer convention

Appears in Example 1 (medical: "I will verify with my orthopedist before deciding") and Example 3 (financial: "I will verify these figures with each school's financial aid office before committing").

---

## Example 1: Before a Knee Arthroscopy

### Reader

Mid-40s, active enough that a torn meniscus matters. Their orthopedist looked at the MRI and recommended arthroscopic surgery. It's outpatient, routine, the scheduler is already calling to book it. The reader doesn't feel scared — they feel handled. Everything is moving fast and nobody asked them if they had questions.

### Information gap

The reader doesn't know that:
- Partial meniscectomy vs. meniscus repair are different procedures with different recovery timelines and long-term outcomes
- Physical therapy alone resolves many meniscus tears without surgery (solid research supports this)
- "Outpatient" doesn't mean cheap — facility fees, anesthesia, and the surgeon bill are separate charges; out-of-pocket depends on deductible status
- They should ask about the surgeon's volume for this specific procedure

### [SPEC] loop

- **Opening message:** "My doctor says I need knee surgery for a torn meniscus. It's arthroscopic, outpatient. They want to schedule it for next month. What should I know before I say yes?"
- **Clarifying questions:** Type of tear, MRI findings, whether PT was tried first, insurance/deductible status, physical demands of their job
- **Answers:** Medial meniscus tear, no PT tried, $1,200 left on deductible, on their feet for work
- **Agent response:** Lays out what the reader should know — PT-first evidence, questions to ask the surgeon (repair vs. removal, their annual volume, facility fee estimate), what to verify independently (call insurance for pre-auth and cost estimate, ask about PT trial first). Conservative-answer convention: "I will verify with my orthopedist before deciding."
- **Follow-up:** "Wait — my doctor didn't mention physical therapy as an option. Is that normal?"
- **Agent:** Explains that surgeons recommend surgery (that's their specialty), it doesn't mean PT won't work, and the research supports asking. Not adversarial — just informed.

### [ALSO] callout

All four major tools can analyze medical documents. If you upload your MRI report, Claude/ChatGPT/Gemini/Copilot can translate the radiology terminology. Feature names differ (document analysis, file upload, etc.).

---

## Example 2: Before Signing a Non-Compete Clause

### Reader

A veterinary technician offered a job at a new clinic — better pay, better hours. They received the employment agreement by email to review before their start date. Something about the non-compete paragraph made them uneasy: "shall not engage in competitive employment within a radius of twenty (20) miles for a period of eighteen (18) months." They don't know if this is normal or a problem.

### Information gap

The reader doesn't know that:
- Non-compete enforceability varies wildly by state — some (California, Minnesota, Oklahoma, North Dakota) ban them outright for most workers; others enforce strictly
- Even in enforcement states, courts often narrow scope — 20 miles and 18 months might get reduced
- They can negotiate the clause before signing (most people don't realize employment agreements are negotiable at this level)
- The clause might prevent them from working in their field anywhere in their metro area
- Some states have passed laws limiting non-competes for workers under a salary threshold

### [SPEC] loop

- **Opening message:** "I'm starting a new job as a vet tech and the contract has a non-compete. 18 months, 20 miles. Is this normal? Should I be worried?"
- **Clarifying questions:** State, salary, whether the clause defines "competitive employment," whether there's a signing bonus or other consideration tied to it, whether they've signed yet
- **Answers:** Texas, $48,000, clause says "veterinary services," no signing bonus, haven't signed yet
- **Agent response:** Explains Texas enforceability requirements (must be ancillary to an otherwise enforceable agreement, must include consideration, must be reasonable in scope). 20 miles in Dallas–Fort Worth covers dozens of clinics. Lays out what the reader should know: this is negotiable, they can ask to narrow the radius or shorten the duration, they can request a carve-out for general vet tech work vs. specialized services. What to verify independently: look up Texas Business & Commerce Code §15.50, consider a one-time consultation with an employment attorney (many offer free 30-minute consultations).
- **Follow-up:** "Can I actually negotiate this? I'm a vet tech, not a lawyer. I don't want to lose the job offer."
- **Agent:** Validates the fear, explains that asking to modify a clause is not the same as rejecting the offer. Suggests specific language: "I'm excited about the role. Could we adjust the non-compete radius to 10 miles and 12 months? That feels fair for both of us." Notes that if the employer refuses any modification, that tells the reader something about the employer.

### [FAIRNESS] callout

Non-competes disproportionately bind workers with the least negotiating power. A senior veterinarian with a client book can negotiate or absorb the restriction. A vet tech making $48,000 cannot afford to be unemployable within 20 miles for 18 months. The same clause applied to both workers has radically different impacts. Several states have recognized this and passed salary thresholds below which non-competes are unenforceable. Your Agent can tell you whether your state is one of them.

---

## Example 3: Between Two College Financial Aid Letters

### Reader

A parent — or a 17-year-old, or both at the kitchen table together. First-generation college family. The kid got into two schools. Both sent financial aid award letters. The letters look generous. The family is trying to figure out which school costs less. They can't tell, because the letters are designed to make that comparison difficult.

### Information gap

This is the deepest of the three. The reader doesn't know that:
- "Award" letters include loans — which aren't awards, they're debt. Schools list Federal Direct Loans alongside grants to inflate the apparent aid package.
- "Institutional grant: $18,000/year" may not renew at the same level. Some schools reduce institutional aid after freshman year; renewal criteria are buried in a different document.
- Federal Work-Study is listed as aid but requires the student to find a qualifying job and work the hours. If they don't, that "aid" is $0.
- "Cost of Attendance" includes estimated living expenses that may not reflect reality — and schools define this differently, making comparison misleading.
- Net price — what you actually pay out of pocket each year — is the only number that matters, and neither letter states it clearly.
- One school's higher sticker price with better grants can be significantly cheaper than another school's lower sticker price with a loan-heavy package.

### [SPEC] loop

- **Opening message:** "My daughter got into two colleges. Both sent financial aid packages. I can't figure out which one actually costs less. Can you help me compare them?" — followed by a summary of both award letters with realistic line items (tuition, fees, room/board, grants, loans, work-study) for two fictitious schools. The numbers should be specific and internally consistent, with School A being the genuinely cheaper option once loans are stripped out, despite School B appearing cheaper at first glance.
- **Clarifying questions:** State/residency (in-state vs. out-of-state), family income bracket (Pell Grant eligibility), whether the student plans to live on campus or commute, whether either school listed renewal conditions, whether the family has savings (529) or expects to take Parent PLUS loans.
- **Answers:** In-state for School A, out-of-state for School B, household income ~$55,000, campus housing at both, no 529, no idea about renewal conditions.
- **Agent response:** Rebuilds both letters side by side, stripping out loans and work-study to show actual gift aid (money you don't pay back). Calculates real annual out-of-pocket for each school. Flags that School B's institutional grant has no published renewal guarantee — the family should call the financial aid office and ask: "Is this grant guaranteed for four years at the same level if my daughter maintains a 2.0 GPA?" Flags that School A's package includes $5,500 in Federal Direct Loans listed as "aid." Shows four-year total cost under realistic assumptions. Identifies what to verify independently: call both financial aid offices with specific questions (renewal criteria, summer aid, cost of attendance breakdown). Conservative-answer convention: "I will verify these figures with each school's financial aid office before committing."
- **Follow-up:** "School B looks cheaper in year one but you're saying it might not be in year two?"
- **Agent:** Explains the bait-and-switch pattern — some schools front-load institutional aid to attract enrollment, then reduce it. Not all schools do this, but the reader needs to ask. Provides the exact question to ask and what a good answer vs. a red-flag answer sounds like.

### [SCIENCE] callout

Research on information asymmetry in college choice. Perna (2006) showed that first-generation families systematically overestimate aid and underestimate true cost. The financial aid letter is the single most consequential document most 17-year-olds encounter, and it is written to be misunderstood.

### [MEME] callout (closing)

Tie back to Roseanne. The Conners at the kitchen table with the financial aid letters. The information existed. The financial aid office wasn't going to volunteer it. Roseanne would have called both schools and asked every question on the list. Now you have the list.

---

## Closing Paragraph

Brief callback to the epigraph. The kitchen table still has the papers spread across it. But now there's a library sitting next to the coffee cups. The information asymmetry hasn't disappeared — institutions still know more than you do. But the cost of closing the gap dropped to zero. The Conners deserved that. So do you.

---

## Research Requirements

All [SCIENCE] callouts need real peer-reviewed citations with DOIs or stable URLs:
- **Example 1:** PT-first vs. surgery evidence for meniscus tears (Katz et al., 2013, NEJM is the landmark study)
- **Example 2:** Non-compete prevalence and wage effects (Starr, Prescott & Bishara, 2021)
- **Example 3:** First-gen information asymmetry (Perna, 2006; also Dynarski & Scott-Clayton on aid complexity)

Legal information (Example 2) should note state-specific variation and recommend verification. Medical information (Example 1) should defer to the reader's physician.

---

## Tone Checklist

- [ ] Validates that information asymmetry is structural, not personal failure
- [ ] Class analysis frame present (billionaire class has always had this infrastructure)
- [ ] Dry wit, specific over inspirational
- [ ] No banned words (empower, journey, transform, leverage, etc.)
- [ ] Contractions used freely
- [ ] "Your Agent" not "AI" / "chatbot" / "bot"
- [ ] Conservative-answer convention in medical and financial examples
- [ ] Majordomo three-beat voice where applicable (validate → explain → pivot to agency)
