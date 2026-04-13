# Strategy 7: Research — Worked Examples Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Draft three complete worked examples with [SPEC] loops, supporting callouts, and a closing paragraph for Strategy 7: Research.

**Architecture:** All content goes into a single file: `src/content/01-strategies/07-strategy-7-research/index.dj`. The existing skeleton (lines 1–55) stays as-is. New content replaces the placeholder on line 55. Content is Djot markup following patterns established in Strategy 3 (Draft) and Strategy 5 (Decide).

**Tech Stack:** Djot markup, `npm run build:check` for validation.

**Design spec:** `docs/superpowers/specs/2026-04-13-strategy-7-research-design.md`

**Reference files (read these before writing):**
- `spec/editorial/style-guide.md` — terminology, banned words, number rules, punctuation
- `spec/editorial/voice-and-audience.md` — reader persona, tonal voice
- `spec/editorial/editorial-conventions.md` — callout types, episode references, conservative-answer convention
- `src/content/01-strategies/05-strategy-5-decide/index.dj` — closest structural model (3 examples with escalating stakes)
- `src/content/01-strategies/03-strategy-3-draft/index.dj` — another complete strategy for voice/tone reference

**Key conventions:**
- Use `"your Agent"` not "AI," "chatbot," "assistant," "model," "LLM"
- Use `"spec"` not "prompt"
- Contractions are fine: "don't," "you're," "isn't"
- Oxford comma always
- Em dashes: `---` in Djot (no spaces around them)
- En dashes for ranges: `--` in Djot
- Numbers: spell out 1–9, digits for 10+. Always digits for dollar amounts, percentages, ages.
- Banned words: empower, journey, thrive, transform, leverage, utilize, unlock, game-changer, deep dive
- Footnote IDs: `[^s7-N]` (s7-1 already exists; continue from s7-2)
- Callout syntax: `::: science`, `::: tip`, `::: fairness`, `::: meme`, `::: also`, `::: prompt`, `::: agent`
- Blank line after closing `:::` of every callout
- Section headings for examples: `### Example N: Title`

---

### Task 1: Add the [TIP] callout and "Worked examples" line

**Files:**
- Modify: `src/content/01-strategies/07-strategy-7-research/index.dj:53-55`

This task replaces the placeholder and adds the opening [TIP] callout that sets up Research's signature move: "tell me what I should verify independently."

- [ ] **Step 1: Read the current file**

Read `src/content/01-strategies/07-strategy-7-research/index.dj` to confirm the current state. The placeholder line to replace is line 55: `_(Full worked examples with [SPEC] loops to be drafted)_`

- [ ] **Step 2: Replace the placeholder with [TIP] callout and worked examples line**

Replace lines 53–55 (the "Worked examples" paragraph and placeholder) with:

```djot
::: tip
"Tell me what I should verify independently before proceeding." This is the Research power move. It forces your Agent to sort its own knowledge into two categories: things it can explain confidently, and things that require a phone call, a second opinion, or a document you haven't read yet. Every Research spec should end with this line. It turns a question into a checklist.
:::


*Worked examples:* Before a knee arthroscopy. Before signing a non-compete clause. Between two college financial aid offers.
```

- [ ] **Step 3: Verify the build**

Run: `npm run build:check`
Expected: Clean type-check, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/content/01-strategies/07-strategy-7-research/index.dj
git commit -m "Add [TIP] callout and worked examples line to Strategy 7"
```

---

### Task 2: Write Example 1 — Before a Knee Arthroscopy

**Files:**
- Modify: `src/content/01-strategies/07-strategy-7-research/index.dj` (append after worked examples line)

**Design spec section:** Example 1: Before a Knee Arthroscopy

**Reader:** Mid-40s, orthopedist recommended arthroscopic surgery for torn meniscus. Outpatient, routine. Everything moving fast. Reader doesn't feel scared — feels handled.

**Information gap the Agent must surface:**
- Partial meniscectomy vs. meniscus repair are different procedures with different recovery timelines
- Physical therapy alone resolves many meniscus tears without surgery (Katz et al., 2013, NEJM)
- "Outpatient" doesn't mean cheap — facility fees, anesthesia, surgeon bill are separate; out-of-pocket depends on deductible
- Should ask surgeon's volume for this specific procedure

- [ ] **Step 1: Read the current file and Strategy 5 Example 1 for structural reference**

Read `src/content/01-strategies/07-strategy-7-research/index.dj` (full file) and `src/content/01-strategies/05-strategy-5-decide/index.dj` lines 52–168 (washing machine example) for structure/voice reference.

- [ ] **Step 2: Write the example**

Append after the "Worked examples" line. Follow this structure exactly:

```djot
### Example 1: Before a Knee Arthroscopy

[Situation paragraph: ~80 words. Reader is mid-40s. Orthopedist looked at MRI, recommended arthroscopic surgery for a medial meniscus tear. Outpatient, routine. The scheduler called to book it before the reader left the office. Reader doesn't feel scared — feels handled. Everything is moving and nobody asked if they had questions. The gap here is not fear. It is speed. The institution is optimized to move you from diagnosis to operating room. Your job is to slow down long enough to find out whether the operating room is the right next step.]

*Your opening message:*
::: prompt
My doctor says I need knee surgery for a torn meniscus.
It's arthroscopic, outpatient. They want to schedule it
for next month. What should I know before I say yes?
:::

*Your Agent's clarifying questions:*
::: agent
[Agent asks 5 questions:
1. Type of tear (from MRI report) — meniscectomy and repair have different outcomes
2. Has physical therapy been tried or discussed?
3. Insurance — where are you in your deductible this year?
4. Physical demands of your job — recovery timeline matters differently for desk work vs. on-your-feet work
5. How soon does this need to happen — is there a medical reason for urgency, or is this scheduling convenience?]
:::

*Your answers:*
::: prompt
[Reader answers:
1. MRI says medial meniscus tear. Didn't say what kind of surgery.
2. Nobody mentioned PT. Went straight to "you need surgery."
3. $1,200 left on my deductible. I have an 80/20 plan after that.
4. I'm on my feet most of the day — I work in a warehouse.
5. No urgency mentioned. Just "let's get you scheduled."]
:::

*Your Agent:*
::: agent
[Agent response — NOT a recommendation, but what the reader needs to know before saying yes. Structure with clear headers like Strategy 5. Key sections:

WHAT YOUR MRI MEANS:
— Medial meniscus tear is the most common knee injury. Not all tears require surgery.

TWO DIFFERENT SURGERIES:
— Partial meniscectomy (removal): shorter recovery (2–6 weeks), but removes cushioning permanently. Higher risk of osteoarthritis later.
— Meniscus repair (stitching): longer recovery (3–6 months, restricted weight-bearing), but preserves the tissue. Better long-term outcomes for younger, active patients.
— You need to know which one your surgeon is planning. If they haven't said, ask.

THE PHYSICAL THERAPY QUESTION:
— A 2013 NEJM study (Katz et al.) randomized patients with meniscus tears and found that physical therapy produced outcomes comparable to surgery at 6 and 12 months for many tear types. PT is not a lesser option — it is a first-line treatment that your surgeon may not have mentioned because surgeons do surgery.
— This does not mean surgery is wrong. It means PT-first is a reasonable path your doctor may not have presented.

QUESTIONS TO ASK YOUR SURGEON:
1. Is this a meniscectomy or a repair?
2. How many of these do you do per month?
3. What is your expected recovery timeline for someone with my job?
4. Would you support a 6-week PT trial before surgery?
5. What is the facility fee for outpatient arthroscopy at this center?

THE COST QUESTION:
— Outpatient arthroscopy: $5,000–$15,000 total (surgeon + facility + anesthesia), depending on location and facility type.
— With $1,200 remaining on your deductible and 80/20 coinsurance, your out-of-pocket could be $1,200 + 20% of the rest. Ask the surgical center for a cost estimate before scheduling.
— An ambulatory surgery center is typically 30–50% cheaper than a hospital outpatient department for the same procedure.

WHAT TO VERIFY INDEPENDENTLY:
— Call your insurance: get a pre-authorization and a cost estimate before scheduling.
— Ask the surgeon about PT-first. If they dismiss it without explanation, that's information too.
— If you want a second opinion, your insurance covers it. A second orthopedist may have a different recommendation.

Give me the most conservative answer. I will verify with my orthopedist before deciding.]
:::

*Your follow-up:*
::: prompt
Wait — my doctor didn't mention physical therapy as an
option. Is that normal?
:::

*Your Agent:*
::: agent
[Agent explains: Yes, this is common. Orthopedic surgeons recommend surgery — that is their training and their practice. It does not mean PT won't work. It means a surgeon's default recommendation is the tool they specialize in.

This is not adversarial. Your surgeon is not trying to mislead you. But their recommendation starts from their expertise, and their expertise is surgery. A physical therapist's recommendation would start from a different expertise.

The research supports asking. The Katz et al. study is not obscure — it is one of the most-cited papers in orthopedic medicine. If your surgeon is not familiar with it or dismisses it without engaging the question, consider the second opinion.

You are not challenging your doctor by asking questions. You are doing what the billionaire class has always done: showing up informed.]
:::
```

Note: The Agent's responses should be written in full prose, not as bracketed descriptions. The bracketed content above specifies what each section must contain. Write it in the same voice as Strategy 5's washing machine and IRA examples — specific numbers, plain language, no jargon without explanation.

- [ ] **Step 3: Add the [ALSO] callout after Example 1**

```djot
::: also
All four major AI tools can read medical documents. If you have your MRI report as a PDF or photo, upload it and ask your Agent to translate it. Claude calls this document analysis. ChatGPT calls it file upload. Gemini reads documents natively in conversation. Copilot handles PDFs in Microsoft Edge. The radiology terminology is the same across all of them — the feature name is the only thing that changes.
:::

```

- [ ] **Step 4: Add the footnote for Katz et al.**

Place the footnote after the [ALSO] callout (footnotes go after the section that references them, following the pattern in Strategy 5):

```djot
[^s7-2]: Katz, J.N. et al. (2013). "[Surgery versus Physical Therapy for a Meniscal Tear and Osteoarthritis](https://doi.org/10.1056/NEJMoa1301408)." _New England Journal of Medicine_, 368(18), 1675-1684.
```

The `[^s7-2]` reference should appear inline in the Agent's response where the Katz study is first mentioned.

- [ ] **Step 5: Verify the build**

Run: `npm run build:check`
Expected: Clean type-check, no errors.

- [ ] **Step 6: Commit**

```bash
git add src/content/01-strategies/07-strategy-7-research/index.dj
git commit -m "Draft Example 1: Before a Knee Arthroscopy (Strategy 7)"
```

---

### Task 3: Write Example 2 — Before Signing a Non-Compete Clause

**Files:**
- Modify: `src/content/01-strategies/07-strategy-7-research/index.dj` (append after Example 1's footnote)

**Design spec section:** Example 2: Before Signing a Non-Compete Clause

**Reader:** Veterinary technician, new job at a better clinic. Received employment agreement by email before start date. Noticed non-compete clause: "shall not engage in competitive employment within a radius of twenty (20) miles for a period of eighteen (18) months." Uneasy but doesn't know if it's normal.

**Information gap the Agent must surface:**
- Enforceability varies wildly by state (some ban outright, others enforce strictly)
- Courts often narrow scope even in enforcement states
- The clause is negotiable (most people don't realize this)
- 20 miles in a metro area could cover dozens of clinics — effectively preventing work in their field
- Some states have salary thresholds below which non-competes are unenforceable

- [ ] **Step 1: Read the current file to find insertion point**

Read `src/content/01-strategies/07-strategy-7-research/index.dj` to confirm where Example 1 ends.

- [ ] **Step 2: Write the example**

Append after Example 1's footnote. Follow this structure:

```djot
### Example 2: Before Signing a Non-Compete Clause

[Situation paragraph: ~100 words. Vet tech, offered a new job. Better pay, better hours, better commute. The employment agreement arrived by email — "please review and sign before your start date." Standard onboarding language. Page 6, paragraph 14: a non-compete clause. The reader noticed it because the language was unusually specific: "shall not engage in competitive employment within a radius of twenty (20) miles for a period of eighteen (18) months following termination of employment." They don't know if this is standard, aggressive, or meaningless. They don't want to make trouble before their first day. They also don't want to sign something that could prevent them from working if this job doesn't work out.]

*Your opening message:*
::: prompt
I'm starting a new job as a vet tech and the employment
agreement has a non-compete clause. It says I can't work
in veterinary services within 20 miles for 18 months if
I leave. Is this normal? Should I be worried?
:::

*Your Agent's clarifying questions:*
::: agent
[Agent asks 5 questions:
1. What state are you in? Non-compete law varies dramatically by state.
2. What's your salary at this new position?
3. Does the clause define "competitive employment" or "veterinary services" more specifically? Does it cover all vet work, or just specific specialties?
4. Is there a signing bonus, training investment, or other consideration specifically tied to the non-compete? (Some states require this for enforceability.)
5. Have you signed yet, or are you reviewing before your start date?]
:::

*Your answers:*
::: prompt
[Reader answers:
1. Texas.
2. $48,000.
3. It says "veterinary services" — no further definition.
4. No signing bonus. No training clause. Just the standard employment agreement.
5. Haven't signed yet. Start date is in two weeks.]
:::

*Your Agent:*
::: agent
[Agent response. Structure with clear headers:

TEXAS NON-COMPETE LAW — THE SHORT VERSION:
— Texas does enforce non-competes, but with significant requirements. Under the Texas Business & Commerce Code §15.50, a non-compete must be (1) ancillary to an otherwise enforceable agreement, (2) supported by consideration (something of value given to you in exchange), and (3) reasonable in scope, geography, and duration.
— "Reasonable" is where courts have room to push back. 20 miles and 18 months is on the aggressive end for a vet tech — not unheard of, but not conservative either.

WHAT 20 MILES ACTUALLY MEANS:
— In a metro area like Dallas–Fort Worth, a 20-mile radius from the clinic covers [rough count — dozens] of veterinary clinics. If you leave this job and the non-compete is enforced, you'd need to commute outside that radius or leave veterinary work entirely for 18 months.
— For a senior veterinarian with a portable client book, this is an inconvenience. For a vet tech making $48,000, this is a career freeze.

THE CONSIDERATION PROBLEM:
— Texas requires that the non-compete be tied to consideration — something of value you're receiving in exchange for agreeing to the restriction. A signing bonus, access to proprietary training, or trade secrets can qualify. A standard employment agreement without additional consideration may make the non-compete unenforceable.
— You said there's no signing bonus and no special training clause. That's relevant. It doesn't mean the clause is automatically void, but it weakens it.

YOU CAN NEGOTIATE THIS:
— Employment agreements are not take-it-or-leave-it documents, even for non-executive positions. You can ask to modify the clause before signing.
— Reasonable modifications: reduce the radius from 20 to 10 miles, shorten the duration from 18 to 12 months, narrow "veterinary services" to the specific specialty practiced at this clinic (e.g., emergency/specialty vs. general practice).
— Suggested language for your email: "I'm excited about the role and looking forward to starting. Before I sign, I'd like to discuss the non-compete clause on page 6. Would you be open to adjusting the radius to 10 miles and the duration to 12 months? I think that's fair for both of us."

WHAT TO VERIFY INDEPENDENTLY:
— Read Texas Business & Commerce Code §15.50 — it's short and readable.
— Many employment attorneys offer a free 30-minute consultation. One call can tell you whether this specific clause would likely be enforced in your county.
— Ask the clinic directly: "Has this clause ever been enforced against a departing employee?" The answer tells you whether this is a genuine business concern or boilerplate.]
:::

*Your follow-up:*
::: prompt
Can I actually negotiate this? I'm a vet tech, not a
lawyer. I don't want to lose the job offer by making
waves before I even start.
:::

*Your Agent:*
::: agent
[Agent response:
— Validates the fear: this is a real concern, and the power dynamic is real. You need the job. They have many applicants.
— But: asking to modify a clause is not the same as rejecting the offer. Employers expect some negotiation on employment terms. If they don't, that's information about the employer.
— The suggested language above is deliberately non-confrontational. It opens with enthusiasm ("excited about the role"), frames the request as mutual ("fair for both of us"), and asks a question rather than making a demand.
— If the employer refuses any modification — won't change a word — you have learned something important about how they treat employees. A workplace that insists on maximum legal restriction before you've started is telling you how they'll handle disagreements after you've started.
— Either way, you're making the decision with information instead of without it. That's what Research is for.]
:::
```

Note: Same as Task 2 — write in full prose, not bracketed descriptions. Match Strategy 5's voice.

- [ ] **Step 3: Add the [FAIRNESS] callout after Example 2**

```djot
::: fairness
Non-competes disproportionately bind workers with the least negotiating power. A senior veterinarian with a portable client book can negotiate the clause, absorb the restriction, or hire a lawyer to challenge it. A vet tech making $48,000 cannot afford 18 months of career freeze within a 20-mile radius. The same clause applied to both workers has radically different impacts. Several states have recognized this asymmetry and passed salary thresholds below which non-competes are unenforceable. Your Agent can tell you whether your state is one of them — and what your options are if it isn't.
:::

```

- [ ] **Step 4: Verify the build**

Run: `npm run build:check`
Expected: Clean type-check, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/content/01-strategies/07-strategy-7-research/index.dj
git commit -m "Draft Example 2: Before Signing a Non-Compete (Strategy 7)"
```

---

### Task 4: Write Example 3 — Between Two College Financial Aid Letters

**Files:**
- Modify: `src/content/01-strategies/07-strategy-7-research/index.dj` (append after Example 2's [FAIRNESS] callout)

**Design spec section:** Example 3: Between Two College Financial Aid Letters

**Reader:** First-generation college family. Parent and 17-year-old at the kitchen table. Kid got into two schools. Both sent award letters. Letters look generous. Family can't tell which costs less because the letters are designed to make comparison difficult.

**Information gap the Agent must surface:**
- "Award" letters include loans — debt listed as aid
- Institutional grants may not renew after freshman year
- Federal Work-Study = $0 if student doesn't find a qualifying job
- "Cost of Attendance" definitions differ between schools
- Net price (actual out-of-pocket) is the only number that matters
- Higher sticker price + better grants can be cheaper than lower sticker + loans

**The award letters must include specific, realistic numbers for two fictitious schools.** School A appears more expensive at first glance but is genuinely cheaper when loans are stripped out. School B's package front-loads institutional aid with no published renewal guarantee.

- [ ] **Step 1: Read the current file to find insertion point**

Read `src/content/01-strategies/07-strategy-7-research/index.dj` to confirm where Example 2 ends.

- [ ] **Step 2: Design the two fictitious award letters**

Before writing the example, design internally consistent financials for two schools. These numbers appear in the reader's opening message and the Agent's analysis. They must be realistic and add up correctly.

**School A (State University — in-state):**
- Cost of Attendance: $26,400/year (tuition $9,400, fees $1,200, room/board $12,800, books/supplies $1,200, personal/transportation $1,800)
- Financial Aid "Award": Pell Grant $6,895, State need-based grant $2,500, Institutional scholarship $4,000, Federal Direct Subsidized Loan $3,500, Federal Direct Unsubsidized Loan $2,000
- Apparent "aid total": $18,895
- Actual gift aid (money you don't repay): $13,395
- Actual annual out-of-pocket (COA minus gift aid): $13,005
- Loan portion listed as "aid": $5,500

**School B (Private College — out-of-state):**
- Cost of Attendance: $52,800/year (tuition $38,000, fees $1,800, room/board $11,200, books/supplies $1,000, personal/transportation $800)
- Financial Aid "Award": Pell Grant $6,895, Institutional Grant $28,000, Federal Work-Study $3,000, Federal Direct Subsidized Loan $3,500, Federal Direct Unsubsidized Loan $2,000
- Apparent "aid total": $43,395
- Apparent "remaining cost": $9,405 (looks cheaper than School A!)
- Actual gift aid: $34,895 (Pell + institutional grant only; work-study and loans are not gift aid)
- Actual annual out-of-pocket (COA minus gift aid): $17,905
- But: institutional grant renewal not guaranteed. If reduced by $10,000 in year 2 (common pattern), year 2 out-of-pocket jumps to $27,905.

**Four-year comparison:**
- School A: ~$52,000 total out-of-pocket + $22,000 in loans = ~$74,000 total cost (stable year-to-year)
- School B optimistic (grant renews): ~$71,600 out-of-pocket + $22,000 in loans = ~$93,600 total cost
- School B realistic (grant drops $10K after year 1): ~$101,600 out-of-pocket + $22,000 in loans = ~$123,600 total cost

- [ ] **Step 3: Write the example**

Append after Example 2's [FAIRNESS] callout. Follow this structure:

```djot
### Example 3: Between Two College Financial Aid Letters

[Situation paragraph: ~120 words. First-generation college family. Parent at the kitchen table — maybe with the kid, maybe alone at midnight after the kid went to bed. Two acceptance letters. Two financial aid award letters. Both look generous. School B's package covers more of the sticker price. But the parent can't shake the feeling that something doesn't add up — the numbers in the two letters don't seem to mean the same things. One school calls it "Institutional Grant." The other calls it "Merit Scholarship." One includes "Federal Work-Study" in the total. The other doesn't. The parent is trying to compare two documents that were designed, by two different institutions, to resist comparison. This is the deepest information gap in the chapter.]

*Your opening message:*
::: prompt
My daughter got into two colleges. Both sent financial
aid packages. I can't figure out which one actually
costs less. Here's what they sent:

School A (State University, in-state):
  Cost of Attendance: $26,400
  Pell Grant: $6,895
  State Grant: $2,500
  Institutional Scholarship: $4,000
  Federal Direct Subsidized Loan: $3,500
  Federal Direct Unsubsidized Loan: $2,000
  Total Aid: $18,895
  Remaining Cost: $7,505

School B (Private College):
  Cost of Attendance: $52,800
  Pell Grant: $6,895
  Institutional Grant: $28,000
  Federal Work-Study: $3,000
  Federal Direct Subsidized Loan: $3,500
  Federal Direct Unsubsidized Loan: $2,000
  Total Aid: $43,395
  Remaining Cost: $9,405

School B looks like a better deal — it covers more.
But something feels off. Can you help me figure out
what I'm actually looking at?
:::

*Your Agent's clarifying questions:*
::: agent
[Agent asks 4–5 questions:
1. Is your daughter in-state for School A? (Confirms tuition rate.)
2. What's your household income, approximately? (Affects whether Pell amount is likely to stay stable.)
3. Does either letter mention renewal conditions — does the grant or scholarship continue at the same level for all four years?
4. Does your daughter plan to live on campus at both schools?
5. Do you have a 529 plan or other savings set aside, or would the remaining cost come from income and loans?]
:::

*Your answers:*
::: prompt
[Reader answers:
1. Yes, in-state for School A. School B is out of state.
2. About $55,000 household.
3. I don't know. Neither letter says anything about that.
4. On campus at both — she wants the full experience.
5. No 529. No savings. Whatever isn't covered, we'd have to figure out — loans, I guess.]
:::

*Your Agent:*
::: agent
[Agent response — this is the longest Agent response in the chapter. It needs to be thorough because the information gap is the widest. Structure with clear headers:

FIRST — LET'S SEPARATE REAL AID FROM DEBT:
— Both letters list Federal Direct Loans as "aid." Loans are not aid. They are debt your daughter will repay with interest after graduation.
— Both letters include $5,500 in federal loans. Strip those out.
— School B also lists Federal Work-Study ($3,000) as aid. Work-Study means your daughter can apply for a qualifying on-campus job and earn up to $3,000 over the year. If she doesn't get a qualifying job, or doesn't work the full hours, that number is $0. It is not guaranteed money.

THE REAL COMPARISON — GIFT AID ONLY:
(Rebuild both letters side by side showing only money that doesn't have to be repaid)

School A gift aid: $13,395 (Pell $6,895 + State $2,500 + Institutional $4,000)
School A real annual cost: $26,400 − $13,395 = $13,005

School B gift aid: $34,895 (Pell $6,895 + Institutional Grant $28,000)
School B real annual cost: $52,800 − $34,895 = $17,905

School A is $4,900/year cheaper — the opposite of what the letters suggest.

BUT THE REAL QUESTION IS YEAR 2:
— School A's Pell Grant renews automatically based on income (yours will likely stay stable at $55,000). The state grant typically renews if she maintains satisfactory academic progress. The $4,000 institutional scholarship — check: is it renewable?
— School B's $28,000 institutional grant is the variable. "Institutional Grant" is the school's own money. Some schools guarantee it for four years. Others reduce it after freshman year — this is sometimes called the "tuition discount bait-and-switch" and it is not rare.
— Neither letter says whether the grant renews. This is the single most important question you haven't been able to answer yet.

THE FOUR-YEAR PICTURE:
— School A (assuming aid stays stable): ~$52,000 over four years out of pocket, plus $22,000 in federal loans. Total: ~$74,000.
— School B if the grant renews at $28,000 all four years: ~$71,600 over four years out of pocket, plus $22,000 in loans. Total: ~$93,600.
— School B if the grant drops by $10,000 after freshman year (a common pattern): year 1 out-of-pocket is $17,905, years 2–4 are $27,905 each. Four-year out-of-pocket: ~$101,600, plus $22,000 in loans. Total: ~$123,600.

WHAT TO VERIFY BEFORE YOU COMMIT:
1. Call School B's financial aid office and ask: "Is the institutional grant of $28,000 guaranteed for all four years if my daughter maintains a 2.0 GPA?" Listen carefully. "We expect it to be similar" is not "yes." "It's reviewed annually" is closer to "no."
2. Call School A and ask the same about the $4,000 scholarship.
3. Ask both schools: "What was the average change in institutional aid from freshman to sophomore year for students in our income bracket?"
4. Ask both schools for a net price estimate for all four years, not just year one.

I will verify these figures with each school's financial aid office before committing.]
:::

*Your follow-up:*
::: prompt
School B looks cheaper in year one but you're saying it
might not be in year two?
:::

*Your Agent:*
::: agent
[Agent response:
— Explains the front-loading pattern clearly. Some schools — not all, but enough — use large institutional grants in year one to attract enrollment, then reduce aid in subsequent years. The student is already enrolled, has friends, has credits that may not transfer. Leaving is expensive. The school knows this.
— The reader's instinct that "something feels off" was correct. The two letters don't mean the same thing because they weren't designed to. One school's math is straightforward. The other's requires a phone call to decode.
— Provides the exact question to ask and what the answers mean:
  - "Yes, it's guaranteed for four years at the same level" — good answer. Get it in writing (email is fine).
  - "It's reviewed annually based on academic performance and financial need" — this means it can change. Ask: "What percentage of students in our income bracket received the same institutional grant in their sophomore year as their freshman year?"
  - "I can't give you a specific number for future years" — this is the answer that should concern you most. It means the school will not commit.
— Closes with: The financial aid letter is the single most consequential document most 17-year-olds will encounter. It is not designed to be understood. It is designed to look generous. Your job is to call the number on the letter and ask the questions the letter didn't answer.]
:::
```

Note: Write all Agent responses in full prose. The bracketed content specifies content beats. Match Strategy 5's IRA example for voice — specific numbers, plain language, no condescension.

- [ ] **Step 4: Add the [SCIENCE] callout and footnote**

After the example, add:

```djot
::: science
First-generation college students and their families consistently overestimate the value of financial aid packages and underestimate the true cost of attendance. Perna (2006) found that information asymmetry in college choice is not random — it falls along class and race lines, with low-income and first-generation families receiving less effective financial counseling at every stage of the process. The financial aid letter is where this asymmetry does its most expensive work.[^s7-3]
:::


[^s7-3]: Perna, L.W. (2006). "[Studying College Access and Choice: A Proposed Conceptual Model](https://doi.org/10.1007/1-4020-4512-3_5)." In J.C. Smart (Ed.), _Higher Education: Handbook of Theory and Research_, Vol. 21, 99-157.
```

- [ ] **Step 5: Verify the build**

Run: `npm run build:check`
Expected: Clean type-check, no errors.

- [ ] **Step 6: Commit**

```bash
git add src/content/01-strategies/07-strategy-7-research/index.dj
git commit -m "Draft Example 3: Between Two College Financial Aid Letters (Strategy 7)"
```

---

### Task 5: Write the closing [MEME] callout and closing paragraph

**Files:**
- Modify: `src/content/01-strategies/07-strategy-7-research/index.dj` (append after Example 3's footnote)

- [ ] **Step 1: Read the current file to find insertion point**

Read the end of `src/content/01-strategies/07-strategy-7-research/index.dj` to confirm where Example 3 ends.

- [ ] **Step 2: Write the closing [MEME] callout**

Append after Example 3's footnote:

```djot
::: meme
The Conners at the kitchen table. Papers spread out between them. Coffee going cold. Roseanne doing the math on the back of an envelope while Dan reads the fine print with his glasses pushed up on his forehead. The information existed — the grant renewal policy, the surgical alternative, the non-compete case law in their state. The financial aid office was not going to volunteer it. The surgeon's scheduler was not going to mention physical therapy. The HR department was not going to flag that the clause might be unenforceable. Roseanne would have called every number on the list. Now you have the list.
:::

```

- [ ] **Step 3: Write the closing paragraph**

Append after the [MEME] callout:

```djot
---

Three examples. Three commitments — a surgery, a job, a four-year investment — each one with an institution on the other side that knew more than the person signing. The kitchen table still has the papers spread across it. But now there's a library sitting next to the coffee cups. The information asymmetry hasn't disappeared — institutions still know more than you do. But the cost of closing the gap dropped to zero. The Conners deserved that. So do you.
```

- [ ] **Step 4: Verify the build**

Run: `npm run build:check`
Expected: Clean type-check, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/content/01-strategies/07-strategy-7-research/index.dj
git commit -m "Add closing meme and paragraph to Strategy 7: Research"
```

---

### Task 6: Full build verification and final review

**Files:**
- Review: `src/content/01-strategies/07-strategy-7-research/index.dj` (full file)

- [ ] **Step 1: Run the full build**

Run: `npm run build`
Expected: Clean build, ePub produced in `dist/`.

- [ ] **Step 2: Run the test suite**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 3: Style guide spot-check**

Read the complete file and verify:
- No banned words (empower, journey, thrive, transform, leverage, utilize, unlock, game-changer, deep dive)
- "Your Agent" used consistently (not "AI," "chatbot," "assistant," "model," "LLM")
- "Spec" used for specifications (not "prompt" except in the `::: prompt` blocks which are fine)
- Numbers follow the rule: spell out 1–9, digits for 10+, always digits for dollar amounts
- Oxford comma present in all lists
- Em dashes have no spaces
- Contractions used naturally
- All footnotes have matching inline references
- Conservative-answer convention present in Examples 1 and 3
- Blank line after every closing `:::`

- [ ] **Step 4: Verify callout distribution matches the design spec**

Check that these callouts appear in this order:
1. [TIP] — before Example 1
2. [ALSO] — after Example 1
3. [FAIRNESS] — after Example 2
4. [SCIENCE] — after Example 3
5. [MEME] — closing

- [ ] **Step 5: Commit any fixes**

If the spot-check or build found issues, fix them and commit:

```bash
git add src/content/01-strategies/07-strategy-7-research/index.dj
git commit -m "Fix style guide violations in Strategy 7: Research"
```

If no fixes needed, skip this step.
