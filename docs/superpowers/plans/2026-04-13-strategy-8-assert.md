# Strategy 8: Assert — Worked Examples Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Draft three complete worked examples with [SPEC] loops, supporting callouts, and a closing paragraph for Strategy 8: Assert.

**Architecture:** All content goes into a single file: `src/content/01-strategies/08-strategy-8-assert/index.dj`. The existing skeleton (lines 1–60) stays as-is. New content replaces the placeholder on line 60. Content is Djot markup following patterns established in Strategy 5 (Decide) and Strategy 7 (Research).

**Tech Stack:** Djot markup, `npm run build:check` for validation.

**Design spec:** `docs/superpowers/specs/2026-04-13-strategy-8-assert-design.md`

**Reference files (read these before writing):**
- `spec/editorial/style-guide.md` — terminology, banned words, number rules, punctuation
- `spec/editorial/voice-and-audience.md` — reader persona, tonal voice
- `spec/editorial/editorial-conventions.md` — callout types, conservative-answer convention
- `src/content/01-strategies/05-strategy-5-decide/index.dj` — closest structural model (3 examples, escalating stakes, legal content)
- `src/content/01-strategies/07-strategy-7-research/index.dj` — most recently drafted strategy for voice/tone reference

**Key conventions:**
- Use `"your Agent"` not "AI," "chatbot," "assistant," "model," "LLM"
- Use `"spec"` not "prompt"
- Contractions are fine: "don't," "you're," "isn't"
- Oxford comma always — including conjunction before final list item
- Em dashes: `---` in Djot (NO SPACES around them)
- En dashes for ranges: `--` in Djot
- Numbers: spell out 1–9, digits for 10+. Always digits for dollar amounts, percentages, ages.
- Banned words: empower, journey, thrive, transform, leverage, utilize, unlock, game-changer, deep dive
- Footnote IDs: `[^s8-N]` (s8-1 already exists; continue from s8-2)
- Callout syntax: `::: science`, `::: tip`, `::: fairness`, `::: meme`, `::: also`, `::: prompt`, `::: agent`
- Blank line after closing `:::` of every callout
- Section headings for examples: `### Example N: Title`
- Lines in prompt/agent blocks wrapped at ~55 characters
- Use `—` for list bullets inside agent blocks (matching Strategy 5 pattern)

---

### Task 1: Update "Worked examples" line

**Files:**
- Modify: `src/content/01-strategies/08-strategy-8-assert/index.dj:58-60`

This task updates the worked examples line and removes the placeholder.

- [ ] **Step 1: Read the current file**

Read `src/content/01-strategies/08-strategy-8-assert/index.dj` to confirm the current state. Lines 58–60 should be:

```
*Worked examples:* Tenant rights when a landlord refuses repairs. Employee rights when let go without a clear reason. Consumer rights when disputing a charge.

_(Full worked examples with [SPEC] loops to be drafted)_
```

- [ ] **Step 2: Replace lines 58–60**

Replace those three lines with:

```djot
*Worked examples:* Disputing a gym membership that keeps charging after cancellation. Getting your security deposit back. Understanding your rights after being let go.
```

- [ ] **Step 3: Verify the build**

Run: `npm run build:check`
Expected: Clean type-check, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/content/01-strategies/08-strategy-8-assert/index.dj
git commit -m "Update worked examples line for Strategy 8: Assert"
```

---

### Task 2: Write Example 1 — Disputing a Gym Membership Charge

**Files:**
- Modify: `src/content/01-strategies/08-strategy-8-assert/index.dj` (append after worked examples line)

**Design spec section:** Example 1: Disputing a Gym Membership Charge

**Reader:** Cancelled gym three months ago by phone. Gym continues charging $49/month to credit card. Three charges ($147) since cancellation. Called again, run around — told to come in person with a form. $49/month doesn't feel like enough to fight over. It is.

**Information gap the Agent must surface:**
- Fair Credit Billing Act (FCBA) gives formal dispute process through credit card issuer, not merchant
- Chargeback is a regulated process with timelines, not "calling your bank to complain"
- State automatic renewal laws (Illinois 815 ILCS 601) may make the charges void if gym didn't follow required cancellation procedures
- Can dispute all three charges, not just the most recent
- Credit card company is legally required to investigate

- [ ] **Step 1: Read the current file and reference examples**

Read `src/content/01-strategies/08-strategy-8-assert/index.dj` (full file) and `src/content/01-strategies/05-strategy-5-decide/index.dj` lines 322–504 (landlord dispute example) for structure/voice reference on legal content.

- [ ] **Step 2: Write the example**

Append after the "Worked examples" line. Follow this structure exactly:

```djot
### Example 1: Disputing a Gym Membership Charge

[Situation paragraph: ~100 words. Reader cancelled gym three months ago. Called the front desk, was told it was taken care of. Gym charged $49/month three more times---$147 total. Called again, put on hold, transferred, told they need to come in person with a written cancellation form. The reader feels like they're being run around, and they're right. $49/month doesn't feel like enough to fight over. But the gym is counting on exactly that---that the amount is small enough to discourage you from learning that there is a formal process designed for exactly this situation, and it does not involve going back to the gym.]

*Your opening message:*
::: prompt
My gym keeps charging me after I cancelled. I called
twice. They say I need to come in with a form. It's
$49/month and I've been charged three times since I
cancelled. What can I do?
:::

*Your Agent's clarifying questions:*
::: agent
[Agent asks 5 questions:
1. How did you cancel---phone, email, in person? Do you have any record of the cancellation (date, who you spoke to)?
2. What state are you in?
3. Are you paying by credit card or debit card? (This matters for the dispute process.)
4. Did you sign a contract with automatic renewal terms when you joined?
5. Has the gym put anything in writing---a cancellation policy, a membership agreement, anything that describes how cancellation is supposed to work?]
:::

*Your answers:*
::: prompt
[Reader answers:
1. Called the front desk. No written confirmation. I remember the date---it was January 8.
2. Illinois.
3. Credit card.
4. Yes, signed a one-year contract that auto-renewed. The year ended in November.
5. I have the original membership agreement somewhere. I think it says something about written notice.]
:::

*Your Agent:*
::: agent
[Agent response with ALL-CAPS headers. ~300-350 words. Key sections:

YOU HAVE TWO PATHS---USE BOTH
Path 1 is through your credit card company. Path 2 is through Illinois state law. They are independent---you can and should pursue both.

PATH 1: CREDIT CARD DISPUTE (FAIR CREDIT BILLING ACT)
— The FCBA (15 U.S.C. § 1666) gives you the right to dispute charges through your credit card issuer. This is a formal process called a chargeback---not just a phone complaint.
— Call your credit card company and say: "I want to file a formal dispute under the Fair Credit Billing Act for three unauthorized charges from [gym name]. I cancelled my membership on January 8 and they have continued to charge me."
— The credit card company is legally required to investigate. During the investigation, you don't have to pay the disputed amount.
— Dispute all three charges. You are not limited to the most recent one.

PATH 2: ILLINOIS AUTOMATIC RENEWAL LAW (815 ILCS 601)
— Illinois requires businesses with automatic renewal contracts to provide a clear and simple cancellation mechanism. If the gym's cancellation process isn't clear, simple, and disclosed in the contract, the auto-renewal may be unenforceable.
— A phone call to the front desk is a reasonable cancellation method. "Come in person with a written form" after the fact is exactly the kind of barrier this law was designed to prevent.
— If the gym didn't comply with the disclosure requirements, you may be entitled to a refund of all charges after your cancellation.

WHAT TO DOCUMENT NOW:
— Write down the January 8 call: date, approximate time, what you said, what they said.
— Pull your credit card statements showing the three charges.
— Find the membership agreement. Check the cancellation clause.
— Save any texts, emails, or records from the second call.

Give me the most conservative answer. I will verify with my state attorney general's consumer protection division before acting.]
:::

*Your follow-up:*
::: prompt
Wait---I can dispute charges from two months ago?
I thought there was a deadline.
:::

*Your Agent:*
::: agent
[Agent response: ~100-120 words.
— The FCBA's standard window for billing error disputes is 60 days from the statement date. Your oldest charge may be near that edge.
— But: charges made after a cancellation are not the same as billing errors. They are unauthorized charges---you revoked permission to charge your card. Unauthorized charges have stronger protections.
— Call your credit card company today. The sooner you file, the less the timeline matters.
— Going forward: put every cancellation in writing. Email creates a timestamp. Text creates a timestamp. A phone call creates a memory. The email is better evidence.]
:::
```

Note: Write all Agent responses in full prose, not bracketed descriptions. The brackets above specify content beats. Match Strategy 5's landlord dispute voice---specific statutes, plain language, no condescension.

- [ ] **Step 3: Add the [TIP] callout after Example 1**

```djot
::: tip
"Cite the statute." This is the Assert power move. "I'm disputing this charge" gets a form response. "I'm disputing this charge under the Fair Credit Billing Act, 15 U.S.C. § 1666" gets a different response. Your Agent knows the statute number. The other party already does too---they just weren't expecting you to.
:::

```

- [ ] **Step 4: Verify the build**

Run: `npm run build:check`
Expected: Clean type-check, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/content/01-strategies/08-strategy-8-assert/index.dj
git commit -m "Draft Example 1: Disputing a Gym Membership Charge (Strategy 8)"
```

---

### Task 3: Write Example 2 — Getting Your Security Deposit Back

**Files:**
- Modify: `src/content/01-strategies/08-strategy-8-assert/index.dj` (append after Example 1's [TIP] callout)

**Design spec section:** Example 2: Getting Your Security Deposit Back

**Reader:** Moved out after two years. Left apartment clean. Got a letter 45 days later with check for $380 of $1,800 deposit. Deductions: $520 "cleaning," $400 "carpet replacement," $500 "paint and repair." No receipts, no photos, no real itemization. Angry but doesn't know if this is legal.

**Information gap the Agent must surface:**
- Most states have statutory deadlines (typically 14��30 days)---45 days may already violate the law
- Most states require itemized statement with receipts---three vague lines may not meet the standard
- "Normal wear and tear" is a legal term---carpet after two years is wear, not damage
- Paint after two years is wear---repainting is a landlord cost
- Many states impose double or triple penalties for noncompliance
- Demand letter citing statute is first step; small claims court is designed for this amount

- [ ] **Step 1: Read the current file to find insertion point**

Read `src/content/01-strategies/08-strategy-8-assert/index.dj` to confirm where Example 1 ends.

- [ ] **Step 2: Write the example**

Append after Example 1's [TIP] callout. Follow this structure:

```djot
### Example 2: Getting Your Security Deposit Back

[Situation paragraph: ~100 words. Reader moved out after two years. Left it clean---patched nail holes, scrubbed the kitchen, had the carpets professionally cleaned. Got a letter 45 days later with a check for $380 of the $1,800 deposit. The deductions: $520 for "cleaning," $400 for "carpet replacement," $500 for "paint and repair." No receipts. No photos. No itemization beyond those three lines. The reader is angry but also uncertain. Maybe this is just how it works. Maybe landlords can charge whatever they want. They can't. The reader just doesn't know that yet.]

*Your opening message:*
::: prompt
My landlord kept $1,420 of my $1,800 security deposit.
The deductions are for cleaning, carpet, and paint but
there are no receipts. I left the apartment clean.
Is this legal?
:::

*Your Agent's clarifying questions:*
::: agent
[Agent asks 5 questions:
1. What state are you in?
2. How long did you live there?
3. Do you have photos or a move-in checklist from when you moved in? (Some landlords provide these.)
4. When did you move out, and when did you receive the letter with the check?
5. Did the landlord offer a walkthrough before you moved out?]
:::

*Your answers:*
::: prompt
[Reader answers:
1. Ohio.
2. Two years.
3. No move-in photos. I didn't know I should take them.
4. Moved out March 1. Got the letter April 15---45 days.
5. No walkthrough. Nobody offered one.]
:::

*Your Agent:*
::: agent
[Agent response with ALL-CAPS headers. ~400-450 words. Key sections:

OHIO'S DEPOSIT RETURN LAW (ORC §5321.16)
— Ohio requires landlords to return the security deposit within 30 days of move-out, with an itemized list of deductions and receipts or estimates for each.
— Your landlord sent the letter on day 45---15 days past the statutory deadline.
— In Ohio, failure to return the deposit within 30 days with a proper itemization means the tenant can recover the full deposit amount plus reasonable attorney's fees. The landlord forfeits the right to claim deductions.

THE DEDUCTIONS DON'T HOLD UP
Even if the landlord had met the deadline, the deductions have problems:
— "Cleaning: $520" --- You left the apartment clean. Cleaning between tenants is a landlord cost unless the unit was left in significantly worse condition than normal.
— "Carpet replacement: $400" --- Carpet that has been walked on for two years shows wear. That's normal wear and tear---a legal term meaning the landlord absorbs the cost. Carpet has a typical useful life of 5--10 years. At two years, charging full replacement to a tenant is almost certainly unjustified.
— "Paint and repair: $500" --- Paint fades. Walls get minor scuffs from furniture and daily life. After two years, repainting is expected landlord maintenance, not tenant damage.
— No receipts. Ohio requires them. Three vague line items without supporting documentation doesn't meet the statute's itemization requirement.

WHAT TO DO NEXT
1. Send a formal demand letter. It should cite ORC §5321.16 by name, note the 30-day deadline violation, challenge each deduction as normal wear and tear, and demand the return of the full $1,800 deposit. Set a response deadline of 14 days.
2. Send it certified mail---you want proof of delivery and the date received.
3. If the landlord doesn't respond or refuses, file in small claims court. Ohio small claims handles claims up to $6,000. Filing fee is roughly $50. You don't need a lawyer.

THE LANDLORD'S MOST LIKELY RESPONSE:
If you send a letter citing the statute and the deadline violation, the landlord's most rational move is to settle---probably returning some or all of the remaining $1,420---rather than defend a case they've already lost on procedural grounds. They missed the deadline. The law is not ambiguous about what that means.

Give me the most conservative, legally accurate answer. I will verify with a legal aid organization before acting.]
:::

*Your follow-up:*
::: prompt
I don't have move-in photos. Does that kill my case?
:::

*Your Agent:*
::: agent
[Agent response: ~120-140 words.
— No. The burden of proof for security deposit deductions is on the landlord, not the tenant. The landlord must prove the damage existed and that it exceeded normal wear and tear.
— Your landlord provided no receipts, no photos, and three vague line items. That's the landlord's documentation problem, not yours.
— Move-in photos would strengthen your position, but their absence doesn't eliminate your claim. The 30-day deadline violation is an independent basis---in Ohio, missing the deadline means the landlord forfeits the right to claim deductions regardless of their merit.
— If you have photos from any point during your tenancy (texted to a friend, posted on social media, real estate listing photos from when you rented), those can help establish baseline condition.]
:::
```

Note: Write in full prose, not bracketed descriptions. Match the voice of Strategy 5's landlord mold dispute but stay in Assert's lane---this is about knowing the right exists, not choosing between options.

- [ ] **Step 3: Add the [ALSO] callout after Example 2**

```djot
::: also
All four major tools can draft formal demand letters. Claude and ChatGPT generate well-structured letters when given the statute, the facts, and the tone. Gemini integrates with Google Docs for direct editing. Copilot works within Word. The letter is the easy part---knowing which statute to cite is where your Agent earns its keep.
:::

```

- [ ] **Step 4: Verify the build**

Run: `npm run build:check`
Expected: Clean type-check, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/content/01-strategies/08-strategy-8-assert/index.dj
git commit -m "Draft Example 2: Getting Your Security Deposit Back (Strategy 8)"
```

---

### Task 4: Write Example 3 — Understanding Your Rights After Being Let Go

**Files:**
- Modify: `src/content/01-strategies/08-strategy-8-assert/index.dj` (append after Example 2's [ALSO] callout)

**Design spec section:** Example 3: Understanding Your Rights After Being Let Go

**Reader:** Called into meeting, manager + unfamiliar HR person. Told "going in a different direction," "not performance-related." Handed severance paper with release of claims. Walked out in 20 minutes. Now sitting at home, stunned, with no income and a paper they didn't sign.

**Information gap the Agent must surface:**
- Whether fired or laid off matters for unemployment, severance, legal claims
- "At-will" doesn't mean employer can do literally anything---retaliation, discrimination, public policy violations still illegal
- Severance agreement is negotiable; signing waives right to sue
- OWBPA gives 21-day consideration period (over 40) plus 7-day revocation
- Final paycheck has state-mandated deadline
- Should file for unemployment immediately
- Should document everything while fresh
- Reader complained about unpaid overtime two months ago---timing of termination is relevant

- [ ] **Step 1: Read the current file to find insertion point**

Read `src/content/01-strategies/08-strategy-8-assert/index.dj` to confirm where Example 2 ends.

- [ ] **Step 2: Write the example**

Append after Example 2's [ALSO] callout. Follow this structure:

```djot
### Example 3: Understanding Your Rights After Being Let Go

[Situation paragraph: ~120 words. Reader got called into a meeting. Manager and an HR person they'd never met. Told "we're going in a different direction" and "this isn't performance-related." Handed a paper---something about a severance payment and a release of claims. Walked to their desk to collect their things and escorted out. The whole thing took 20 minutes. They're now sitting at home, stunned, with no income, a paper they didn't sign, and no idea what just happened or what they're entitled to. The speed was the point. The employer wants you disoriented. They want you to sign the paper before you've had time to understand what it says or what you'd be giving up.]

*Your opening message:*
::: prompt
I just got let go from my job. They said "we're going
in a different direction" and it's not
performance-related. They gave me a paper to sign
about severance but I didn't sign it. I don't know
what my rights are or what I should do first.
:::

*Your Agent's clarifying questions:*
::: agent
[Agent asks 5-6 questions:
1. What state are you in?
2. How long did you work there?
3. How old are you? (This affects a specific legal protection around severance agreements.)
4. Were you the only person let go, or was this part of a larger round of layoffs?
5. In the past few months, did you file any complaints---about discrimination, safety, pay, or anything else?
6. What does the severance paper say, specifically? How much are they offering, and what does it ask you to give up?]
:::

*Your answers:*
::: prompt
[Reader answers:
1. Michigan.
2. Four years.
3. 52.
4. Just me, as far as I know.
5. Yes---I complained to HR about unpaid overtime about two months ago.
6. It offers two weeks' pay. It says I agree to a "general release of all claims" and won't sue. There's also something about not saying anything negative about the company.]
:::

*Your Agent:*
::: agent
[Agent response---the longest and most layered in the chapter. ~500-550 words with ALL-CAPS headers:

FIRST---WHAT TO DO THIS WEEK
— Do not sign the severance agreement yet. You're 52---the Older Workers Benefit Protection Act (OWBPA) gives you a minimum of 21 days to consider any severance agreement that includes a release of age-related claims. You also get 7 days to revoke after signing. A deadline shorter than 21 days makes the waiver unenforceable.
— File for unemployment today at michigan.gov/uia. Do not wait. The employer said it's "not performance-related"---that supports your eligibility. The determination is made by the state, not your employer.
— Write down everything you remember about the meeting, the overtime complaint, and the last few months. Dates, names, what was said. Memory degrades fast. Write it down now.
— Secure documentation: pay stubs, the overtime complaint (email, form, anything), any emails about your performance, and the severance agreement.

THE OVERTIME COMPLAINT MATTERS
— You complained about unpaid overtime two months ago. Then you were let go. Michigan law and federal law (FLSA, 29 U.S.C. § 215(a)(3)) prohibit retaliation against employees who complain about wage violations.
— "Going in a different direction" and "not performance-related" are not explanations. They are the absence of an explanation. When an employee files a wage complaint and is terminated shortly after, with no documented performance reason, an employment attorney would call that a fact pattern worth investigating.
— This does not mean you were illegally retaliated against. It means the question is worth asking before you sign a document that eliminates your right to ask it.

THE SEVERANCE AGREEMENT
— Two weeks' pay for four years of employment is on the low end. Severance isn't legally required in most situations---it's offered in exchange for the release of claims. The employer is buying your signature.
— "General release of all claims" means you give up the right to pursue any legal action related to your employment. That includes the overtime complaint. That includes any retaliation claim. That includes any age discrimination claim.
— The non-disparagement clause means you can't say anything negative about the company. Note that this is one-directional---they can say whatever they want about you unless you negotiate a mutual clause.
— This agreement is negotiable. You can ask for more weeks of severance, a COBRA subsidy for health insurance continuation, a neutral reference letter, mutual non-disparagement, and removal of any non-compete clause. The employer offered this agreement because they want you to sign it. That is leverage.

YOUR FINAL PAYCHECK
— Michigan requires final wages to be paid by the next regular payday.
— Check your employee handbook for accrued vacation. Michigan doesn't require vacation payout by statute, but company policy may create an obligation.

WHAT TO VERIFY INDEPENDENTLY
— Call a Michigan employment attorney. Many offer free initial consultations. The overtime complaint plus termination timing is the kind of fact pattern they evaluate quickly.
— File for unemployment at michigan.gov/uia. Do not wait for the severance question to resolve---these are independent.
— Do not sign the agreement until you've spoken to an attorney or, at minimum, let the 21 days run while you gather information.

Give me the most conservative, legally accurate answer. I will verify with an employment attorney before acting.]
:::

*Your follow-up:*
::: prompt
They said I have to sign within a week or the offer
expires. Can they do that?
:::

*Your Agent:*
::: agent
[Agent response: ~100-120 words.
— No. You are 52 years old. The Older Workers Benefit Protection Act requires a minimum 21-day consideration period for any severance agreement that includes a release of age-related claims. You also get 7 days after signing to change your mind.
— A deadline shorter than 21 days makes the age-related waiver unenforceable. If they told you one week, they either don't know the law or they're hoping you don't.
— You have 21 days. Take them. Use them to talk to an attorney, file for unemployment, and decide whether two weeks' pay is worth giving up every claim you might have.
— The paper will still be there on day 20.]
:::
```

Note: This is the emotional peak of the chapter. The reader is scared, not just angry. The voice should be calm, specific, and empowering through information---not through cheerleading. Match Strategy 7's financial aid example for length and care, and Strategy 5's landlord dispute for legal specificity. Write in full prose, not brackets.

- [ ] **Step 3: Add the [SCIENCE] callout and footnote**

After the example, add:

```djot
::: science
Most American workers believe "at-will employment" means their employer can terminate them for any reason with no legal consequences. The reality is narrower---at-will employment has well-established exceptions for discrimination, retaliation, violations of public policy, and implied contracts. The gap between what workers believe "at-will" means and what it actually means is one of the most consequential information asymmetries in American employment law. Your Agent knows the exceptions. Your employer's legal department does too.[^s8-2]
:::


[^s8-2]: Kim, P.T. (1997). "[Bargaining with Imperfect Information: A Study of Worker Perceptions of Legal Protection in an At-Will World](https://doi.org/10.2307/1073592)." _Cornell Law Review_, 83, 105-160.
```

The `[^s8-2]` inline reference should appear in the [SCIENCE] callout where the Kim study finding is described.

- [ ] **Step 4: Verify the build**

Run: `npm run build:check`
Expected: Clean type-check, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/content/01-strategies/08-strategy-8-assert/index.dj
git commit -m "Draft Example 3: Understanding Your Rights After Being Let Go (Strategy 8)"
```

---

### Task 5: Write the closing [MEME] callout and closing paragraph

**Files:**
- Modify: `src/content/01-strategies/08-strategy-8-assert/index.dj` (append after Example 3's footnote)

- [ ] **Step 1: Read the current file to find insertion point**

Read the end of `src/content/01-strategies/08-strategy-8-assert/index.dj` to confirm where Example 3 ends.

- [ ] **Step 2: Write the closing [MEME] callout**

Append after Example 3's footnote:

```djot
::: meme
Al at the shoe store counter, making his point to no one in particular. Al was right about the overtime, right about the unfairness, right about the system. He never cited the statute. He never filed the complaint. He never asked what the law actually said. He just knew it was wrong and said so loudly, to the wrong audience, in the wrong format. Knowing your rights and exercising them are two different skills. This chapter is about the second one.
:::

```

- [ ] **Step 3: Write the closing paragraph**

Append after the [MEME] callout:

```djot
---

Al Bundy sold shoes for 11 seasons and suspected, correctly, that the systems around him were not designed in his favor. The difference between Al and the reader who just finished this chapter is not knowledge---Al knew. The difference is the citation. The landlord, the gym, and the employer all operated on the assumption that you didn't know what the law said. Now you do. The other party already knew. Now you're even.
```

- [ ] **Step 4: Verify the build**

Run: `npm run build:check`
Expected: Clean type-check, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/content/01-strategies/08-strategy-8-assert/index.dj
git commit -m "Add closing meme and paragraph to Strategy 8: Assert"
```

---

### Task 6: Full build verification and final review

**Files:**
- Review: `src/content/01-strategies/08-strategy-8-assert/index.dj` (full file)

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
- "Spec" used for specifications (not "prompt" except in `::: prompt` blocks)
- Numbers follow the rule: spell out 1–9, digits for 10+, always digits for dollar amounts
- Oxford comma present in all lists (including conjunction before final item)
- Em dashes have no spaces (`---` not ` --- `)
- Contractions used naturally
- All footnotes have matching inline references
- Conservative-answer convention present in Examples 2 and 3
- Blank line after every closing `:::`

- [ ] **Step 4: Verify callout distribution matches the design spec**

Check that these callouts appear in this order (after the existing [SCIENCE] and [FAIRNESS] from the skeleton):
1. [TIP] — after Example 1
2. [ALSO] — after Example 2
3. [SCIENCE] — after Example 3
4. [MEME] — closing

- [ ] **Step 5: Commit any fixes**

If the spot-check or build found issues, fix them and commit:

```bash
git add src/content/01-strategies/08-strategy-8-assert/index.dj
git commit -m "Fix style guide violations in Strategy 8: Assert"
```

If no fixes needed, skip this step.
