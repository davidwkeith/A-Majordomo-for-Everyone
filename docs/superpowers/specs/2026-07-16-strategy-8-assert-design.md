# Strategy 8: Assert — Worked Examples Design

**Date:** 2026-07-16
**Status:** Approved
**Scope:** Three worked examples with [SPEC] loops, supporting callouts, and closing paragraph for Strategy 8: Assert — the last stub in the manuscript.

---

## Core Framing

Assert closes the **action gap**, not the information gap (that's Research, Strategy 7). The reader in these examples already suspects something is wrong — they don't need help discovering the problem, they need help converting "I think I'm being treated unfairly" into a specific right, a specific deadline, and a specific document. The unifying pattern across all three examples: an institution (landlord, employer, debt collector) is betting the reader doesn't know what the law actually says, and has structured the interaction — the notice period, the severance deadline, the collection call — to profit from that ignorance if the reader doesn't push back in time.

This distinguishes Assert from its neighbors: Decode (Strategy 1) explains what a document says; Research (Strategy 7) fills a knowledge gap before a decision; Assert is what happens after you already know (or suspect) you have a right — it's the exercise of that right against a counterparty who assumed you wouldn't.

## Structure

The existing skeleton (title through the `[^s8-1]` footnote and the "In the Field Guide" cross-ref line) stays as-is. New content replaces the placeholder line `_(Full worked examples with [SPEC] loops to be drafted)_`.

### Insertion point

Immediately after the existing cross-reference line (`_In the Field Guide: ..._`), new content begins with the three worked examples in this order:

1. **Example 1: A Landlord Who Won't Fix the Heat** (housing — Ho-4)
2. **Example 2: Let Go With No Clear Reason** (employment — W-2)
3. **Example 3: A Collections Call About a Debt You Don't Recognize** (consumer/collections — M-4)
4. **Closing paragraph** — callback to the Al Bundy epigraph

### Callout distribution

Matches Diagnose's pattern (1 / 2 / 2 split, five callouts total, no run longer than two, each anchored beside the passage it comments on):

| Callout | Placement | Content |
|---------|-----------|---------|
| [FAIRNESS] | After Example 1 | HUD's 2012 paired-testing study — landlords give white callers more information and more shown units than Black, Hispanic, and Asian callers presenting as equally qualified. Directly on-theme: the other party's advantage is informational, and it is measured, not anecdotal. |
| [SCIENCE] | After Example 2 (first of pair) | Bowles, Babcock & Lai (2007) on the social cost of negotiating — women (and, by extension, anyone socialized to avoid seeming demanding) face real social penalties for initiating negotiation, which suppresses the very asking Assert is trying to unblock. |
| [TIP] | After Example 2 (second of pair) | The specific negotiating phrase the Agent can hand the reader — asking what the standard severance formula is before reacting to the number offered. |
| [TIP] | After Example 3 (first of pair) | Real-time FDCPA violation check — the reader can ask the Agent, mid-dispute, whether what the collector just did (call time, workplace contact, threat) is itself a violation worth *more* than the debt. |
| [ALSO] | After Example 3 (second of pair) | Tool-translation: paste a screenshot of the caller-ID log or the collection letter — file upload works the same across Claude/ChatGPT/Gemini/Copilot. |

Note on avoiding duplication with the Field Guide: Ho-4 already teaches "document everything, send by certified mail" and cites Eviction Lab filing-rate data; M-4 already fully covers the debt-validation-letter mechanic and statute-of-limitations trap. Per the DRY cross-reference principle, these worked examples teach something the corresponding Skill doesn't already cover in depth — Example 1's callout uses a different citation (paired-testing, not eviction filings) to make a related but distinct point; Example 3 teaches the real-time violation-recognition move rather than re-explaining validation letters, which M-4 already owns.

### Conservative-answer convention

Appears in all three examples' opening [SPEC] prompt, per the chapter's own core spec pattern and matching the phrasing already used in Ho-4, W-2, and M-4 respectively:
- Example 1: "I will verify with a tenant rights organization or attorney."
- Example 2: "I will verify with an employment attorney or legal aid organization."
- Example 3: "I will verify with a consumer rights attorney."

---

## Example 1: A Landlord Who Won't Fix the Heat

### Reader

A renter. The heat has been out for eleven days in a cold-weather state. Three text messages to the landlord, no response beyond "I'll look into it." The reader doesn't want to sue anyone — they want the heat fixed, or to know what happens if they fix it themselves and take it out of rent.

### Information gap → action gap

The reader already suspects this is illegal (it usually is — implied warranty of habitability). What they don't have is: the specific mechanism their state actually provides (Ohio does *not* allow tenant self-help repair-and-deduct — the real route is depositing rent in escrow with the clerk of courts, which is a meaningfully different and more procedural step than most people assume "repair and deduct" means), the notice requirement that has to be satisfied first, and the retaliation protection that covers them once they invoke it.

### [SPEC] loop

- **Opening message:** "My landlord hasn't fixed my heat in 11 days. I've texted three times. It's [state], it's been below freezing. What can I actually do?"
- **Clarifying questions:** State and city, lease type (month-to-month vs. fixed term), whether prior requests were in writing or only texted, whether the unit has any written notice-of-defect requirement in the lease, how the reader would prefer to resolve this (get it fixed fast vs. preserve the option to break the lease).
- **Answers:** Ohio, month-to-month, texts only so far, lease doesn't mention a repair process, wants it fixed fast but isn't ruling out moving.
- **Agent response:** Confirms Ohio law requires landlords to supply reasonable heat and recognizes an implied warranty of habitability, and that texts likely count as notice but a dated written notice (email or certified letter) starts the legal clock cleanly. Corrects a common assumption up front: Ohio does not let tenants simply withhold rent or pay for repairs themselves and deduct the cost — the actual mechanism (ORC § 5321.07) is depositing the rent with the clerk of courts after the landlord gets written notice and fails to fix a health-threatening condition within a reasonable time, which courts and tenant advocates treat as roughly 14 days for something like no heat in winter rather than the ordinary 30-day window for less urgent repairs. Once the rent is deposited with the court, the tenant can ask the court to order the repair, authorize repair-and-deduct, or release funds — the self-help version of repair-and-deduct isn't available before that step. Flags retaliation protection: the landlord can't respond to the repair request with a rent increase, a non-renewal, or a sudden eviction filing within a protected window. Tells the reader what to send today: a written notice, dated, describing the outage and citing the statute, with a deadline, so the 14-day clock is unambiguous. Conservative-answer convention: "I will verify with a tenant rights organization or attorney."
- **Follow-up:** "I sent the written notice. Landlord texted back 'stop harassing me, I'll get to it when I get to it.' Is that retaliation?"
- **Agent:** Explains that hostility alone isn't retaliation in the legal sense — retaliation is a specific adverse action (eviction notice, rent hike, service cutoff) taken because the tenant asserted a right. The dismissive text is worth saving as a timestamp and as evidence of unresponsiveness, but the clock the reader cares about is the 14-day cure period, not the tone of the reply. Restates the deadline and what happens the day after it passes — depositing rent with the clerk of courts rather than just stopping payment, which matters because stopping payment outright can expose the tenant to an eviction filing that depositing with the court avoids.

---

## Example 2: Let Go With No Clear Reason

### Reader

Been at the company four years. Called into a meeting with HR and a manager, told the position is "being restructured," handed a severance agreement and a pen, told "we'd like this back by Friday" — three business days out. No mention of why the reader specifically, no WARN Act notice, no time to think.

### Information gap → action gap

The reader already knows something feels off about "sign by Friday." What they need is the actual number (OWBPA gives them 21 days, not 3), whether this was a mass layoff that should have triggered a WARN Act notice, and language for asking for more without torching the relationship or the severance itself.

### [SPEC] loop

- **Opening message:** "I was let go today. Restructuring, they said. I have a severance agreement and they want it back Friday — that's three days. Is that normal?"
- **Clarifying questions:** State, approximate company size and whether others were let go the same day (and roughly how many), whether age 40+ (changes which waiver rules apply), what the severance offer actually contains (amount, continued benefits, non-disparagement or non-compete language), whether anything was said about the reason beyond "restructuring."
- **Answers:** California, company has about 300 employees at this location and the reader believes around 60 people were let go today, over 40, offer is four weeks' pay plus a release of claims, nothing else specific was said about why.
- **Agent response:** States plainly that federal law (OWBPA) gives the reader 21 days to consider a severance agreement that includes a release of age-discrimination claims — not 3 — and a 7-day revocation window after signing; the Friday deadline is not enforceable against that floor. On the layoff itself: federal WARN requires 100+ full-time employees at the company and, for a workforce this size, a mass layoff generally has to hit both a 50-employee floor and a one-third-of-the-site-workforce threshold — 60 out of 300 is short of that percentage, so federal WARN likely doesn't apply here. California's Cal-WARN Act is broader on exactly this point: it applies to employers with 75+ employees and requires 60 days' notice for a layoff of 50 or more employees, full stop, with no percentage-of-site test. At around 60 people, this layoff likely clears the Cal-WARN trigger even though it may not clear the federal one — and if 60 days' notice wasn't given, affected employees may be owed back pay and benefits for the notice period, independent of anything in the severance agreement. Lays out what not to sign yet, and drafts a short email asking for the full 21-day period and a written explanation of how the severance amount was calculated. Conservative-answer convention: "I will verify with an employment attorney or legal aid organization."
- **Follow-up:** "They came back and said four weeks is 'the standard formula, one week per year.' I was here four years and four months. Does the extra four months count?"
- **Agent:** Notes that "one week per year, rounded down" is a choice the employer made, not a law of physics — ask directly whether partial years are prorated or rounded, since four months is a meaningful fraction of a year at this formula. Suggests the exact question to ask HR in writing, and reminds the reader that asking for the calculation to be shown in writing, once, is normal and does not jeopardize the offer.

::: science
Bowles, Babcock, and Lai found that women who initiated salary negotiations were penalized more socially than men who did the identical thing — evaluators rated them as less nice and less desirable to work with, even though the ask itself was scripted identically across conditions.[^s8-2] The chilling effect isn't confined to salary negotiations or to women; anyone raised to read pushing back as rude absorbs the same signal. Assert doesn't require the reader to enjoy the conversation. It requires them to have it anyway, in writing, with the actual deadline instead of the one they were handed.
:::

::: tip
Before responding to any severance number: ask what the standard formula is company-wide, not whether your specific number can go up. _"What is the standard severance formula for someone with my tenure, and does it round partial years up or down?"_ turns a request for charity into a request for consistency — and a request for consistency is much harder to refuse.
:::

---

## Example 3: A Collections Call About a Debt You Don't Recognize

### Reader

A call from a number the reader doesn't recognize, three times in two days, including once at their workplace after they asked the caller not to call there. The person on the phone says the reader owes $890 to a company the reader has never heard of, for an account the reader doesn't remember opening. The reader is rattled and close to just paying it to make it stop.

### Information gap → action gap

The reader isn't sure whether they owe this at all, which is exactly the position the FDCPA anticipates — but they also don't know that what just happened on the phone (repeat workplace calls after being told not to) may itself be a violation worth pursuing, independent of whether the underlying debt is real.

### [SPEC] loop

- **Opening message:** "A debt collector keeps calling about $890 I don't recognize. They called my work today after I told them yesterday not to call there. I don't know if I owe this or what to do."
- **Clarifying questions:** What the caller said the debt is for and the original creditor's name if given, whether the reader has received anything in writing yet, what state the reader lives in, the exact wording used when the reader told them not to call at work and whether that was said on a recorded or documented call, and whether the reader has ever had an account with the named creditor.
- **Answers:** Caller said it's an old cell phone account from a company the reader switched away from six years ago, nothing in writing yet, Illinois, told the caller directly on yesterday's call "please don't call me at work," reader isn't sure if they still owed anything when they switched providers.
- **Agent response:** States the reader's immediate right under the FDCPA: they can demand written validation of the debt, and until the collector provides it in writing, collection activity should stop — this request should go in writing within 30 days of the collector's first written notice (which hasn't arrived yet, so the reader should watch for it). Separately and just as important: calling the reader's workplace after being explicitly told not to is very likely its own FDCPA violation, regardless of whether the $890 turns out to be valid — and each violation can carry statutory damages up to $1,000 plus attorney's fees, which is a real financial claim the reader currently has no idea they're sitting on. Notes the six-year gap raises a statute-of-limitations question worth checking against Illinois's rules once the debt is confirmed. Tells the reader exactly what to do next: send the validation request in writing today, keep a log of every call (date, time, number, what was said), and do not make a payment or verbally acknowledge the debt as valid before validation arrives — a partial payment can restart a limitations clock the reader hasn't even confirmed is running. Conservative-answer convention: "I will verify with a consumer rights attorney."
- **Follow-up:** "They just called again, at work again, and said if I don't pay by Friday they'll 'take further action.' Is that allowed?"
- **Agent:** Explains that a vague threat of "further action" isn't automatically illegal, but a third workplace call after being told twice not to call there is a strong, specific FDCPA violation on its own, and a threat of action the collector doesn't actually intend or have the legal standing to take is separately prohibited. Tells the reader to log this call the same way as the others — date, time, exact words — because that log is what turns "this is annoying" into a claim with a dollar value attached.

::: tip
Mid-call, the reader doesn't need to know the FDCPA by heart — they need to describe what just happened and ask. _"A debt collector just called my workplace for the third time after I told them twice not to. Is that legal, and what should I do right now?"_ Your Agent can flag the violation in real time, which matters more than it sounds: a violation logged the day it happens is worth far more, as evidence, than one reconstructed from memory weeks later.
:::

::: also
If the collector has sent anything in writing — a letter, a text, an email — paste it or upload a photo directly into the conversation. File upload works the same way in Claude, Gemini, ChatGPT, and Copilot; your Agent will read every line the collector is legally required to include and flag what's missing.
:::

---

## Closing Paragraph

Brief callback to the Al Bundy epigraph. Al knew, every episode, that the shoe store, the neighbors, the DMV clerk had the better hand. He was right about that more often than he was wrong. What he never had was the form, the deadline, or the phrase that turned "this isn't fair" into a claim someone else had to answer. The heat gets fixed, or the deduction is legal. The severance clock is 21 days, not 3. The phone call that rattled the reader is itself worth something, on paper, dated. None of that required a lawyer on retainer. It required knowing what the other side already knew.

---

## Research Requirements

Footnote numbering follows order of appearance in the finished text, continuing from the existing `[^s8-1]`:

- `[^s8-2]` — Ohio ORC § 5321.07 (Example 1, agent-response prose, first new footnote to appear)
- `[^s8-3]` — HUD 2012 paired-testing study (Example 1, [FAIRNESS] callout)
- `[^s8-4]` — Federal WARN / Cal-WARN statutes (Example 2, agent-response prose)
- `[^s8-5]` — Bowles, Babcock & Lai 2007 (Example 2, [SCIENCE] callout)

Both new [SCIENCE]/[FAIRNESS] citations verified via web search before drafting (not reconstructed from memory):

- **Example 1 [FAIRNESS], `[^s8-3]`:** Turner, M.A., Levy, D.K., Wissoker, D.A., Aranda, C.L., et al. (2013). "Housing Discrimination Against Racial and Ethnic Minorities 2012." U.S. Department of Housing and Urban Development, Office of Policy Development and Research. Link: `https://www.huduser.gov/portal/Publications/fairhsg/hsg_discrimination_2012.html`.
- **Example 2 [SCIENCE], `[^s8-5]`:** Bowles, H.R., Babcock, L., & Lai, L. (2007). "Social Incentives for Gender Differences in the Propensity to Initiate Negotiations: Sometimes It Does Hurt to Ask." *Organizational Behavior and Human Decision Processes*, 103(1), 84–103. DOI confirmed: `10.1016/j.obhdp.2006.09.001`.

Legal specifics (Ohio implied warranty of habitability and repair-and-deduct mechanics; OWBPA 21/7-day windows, already cited at `[^w2-1]` in W-2 — reuse the same underlying statute, new footnote in this chapter per the per-chapter footnote numbering convention; FDCPA statutory damages) are stated at the level of well-established federal/state statutory mechanics already used elsewhere in the manuscript (W-2 and M-4 cite the same OWBPA and FDCPA provisions) — no new legal citation risk beyond what's already fact-checked in those Skills.

**WARN Act thresholds — verified via web search, not reused from an existing Skill (this is new to the manuscript):** federal WARN applies to employers with 100+ full-time employees and, at that size, a mass layoff generally must affect both 50+ employees and at least 33% of the site's workforce. California's Cal-WARN Act is broader: it applies to employers with 75+ employees (full- and part-time) and triggers on a layoff of 50+ employees with no percentage-of-site test. The Example 2 scenario (300-employee site, ~60 laid off) is calibrated so federal WARN likely does *not* apply (60/300 = 20%, under the 33% test) while Cal-WARN likely *does* — a real and citable distinction, not a simplification. Footnote `[^s8-4]` cites California EDD's WARN guidance page and the federal WARN statute (29 U.S.C. § 2101 et seq.).

**Ohio landlord repair remedy — verified via web search:** Ohio does *not* recognize tenant self-help repair-and-deduct. The actual mechanism under ORC § 5321.07 is depositing rent with the clerk of courts after written notice and a failed cure period (~30 days generally, shorter — commonly cited as ~14 days — for a health-threatening condition like no heat in winter); from there the court can order the repair, authorize repair-and-deduct, or release the funds. This is a meaningfully different (and more accurate) mechanism than the generic "repair and deduct" framing most readers assume applies everywhere, and the example is written to correct that assumption rather than reinforce it. Footnote `[^s8-2]` cites Ohio Revised Code § 5321.07 directly (`https://codes.ohio.gov/ohio-revised-code/section-5321.07`).

---

## Tone Checklist

- [ ] Validates that the reader's suspicion of unfairness is correct and structural, not personal failure
- [ ] Class analysis frame present (the other party's advantage is *information*, not superior legal standing)
- [ ] Dry wit, specific over inspirational
- [ ] No banned words (empower, journey, transform, leverage as a verb, etc.)
- [ ] Contractions used freely
- [ ] "Your Agent" not "AI" / "chatbot" / "bot"
- [ ] Conservative-answer convention in all three examples (all touch legal/financial stakes)
- [ ] No duplication of Ho-4 / W-2 / M-4 content — each worked example teaches a technique or angle the Skill doesn't already own
- [ ] Callout density: 5 total, max run of 2, each anchored beside its passage, matching Diagnose's precedent
