---
title: "Health"
part: 2
order: 1
strategy: null
status: "draft"
---

### HEALTH

---

#### H-1: Understanding a Diagnosis You Just Received
**Strategy:** Decode
**The Majordomo says:** *Medical diagnoses are delivered in a language that evolved over several centuries to communicate with precision between specialists, with the result that they communicate with almost no precision to anyone else. The patient, having just received significant news about their own body, is also typically in a neurological state that reduces information retention by approximately half. This is considered an acceptable outcome by the system.*
**The spec:**
```
My doctor just told me I have [diagnosis]. I don't fully understand
what this means. Please explain in plain language:
1. What this condition actually is
2. What typically causes it
3. What the standard treatment options are
4. What questions I should ask at my next appointment
Do not assume any medical knowledge on my part.
```
**What to do with the output:** Use it to make your question list before the next appointment (see H-2). Do not use it to second-guess your doctor's treatment recommendation — use it to understand it. For ongoing conditions, see also H-5: Managing a Chronic Condition and H-8: Wellness and Nutrition Coach.

---

#### H-2: Preparing Questions Before a Doctor's Appointment
**Strategy:** Prepare
**The Majordomo says:** *Studies across multiple medical systems confirm that patients who arrive with written questions receive more information, report higher satisfaction, and make better-informed decisions than those who do not. The medical system has not adjusted its appointment length to accommodate this finding.*
**The spec:**
```
I have an appointment with [specialist type] on [date] about [condition
or concern]. My main worry is [specific concern]. I want to make sure
I understand [specific thing]. Please help me write a list of questions
to ask, starting with the most important. I have about [X] minutes.
```
**Science note:** Preparatory coping research (Roter et al., 1987) shows the benefit concentrates in the act of writing -- not just thinking -- the questions.[^h2-1]

[^h2-1]: Roter, D.L. (1987). "Which facets of communication have strong effects on outcome?" in *Communicating with Medical Patients.*

---

#### H-3: Decoding a Medical Bill or EOB
**Strategy:** Decode
**The Majordomo says:** *The Explanation of Benefits is a document designed to explain your benefits. It does not do this. It lists procedure codes, allowed amounts, adjustments, and patient responsibility in a format that rewards confusion. The confusion is not accidental.*
**The spec:**
```
I received this medical bill / Explanation of Benefits and I don't
understand it. [Paste the bill or EOB, removing your name and ID number.]
Please:
1. Explain each line item in plain language
2. Flag anything that seems unusual or potentially incorrect
3. Tell me if there's anything here I should dispute
```

---

#### H-4: Appealing an Insurance Denial
**Strategy:** Navigate + Draft
**See also:** L-1: Negotiating a Contract (for understanding the policy itself), L-3: Writing a Demand Letter (same drafting technique, different context)
**The Majordomo says:** *Insurance companies deny claims at a rate that ensures a profitable percentage of denials are never appealed, because appealing requires knowing that appeal is possible, knowing how to do it, and having the energy to do it after already being sick. This is considered a sound business model.*
**The spec:**
```
My insurance denied [procedure/claim] with the reason: [paste denial reason].
The procedure was ordered by my doctor for [condition].
I want to file a [first-level internal / external / expedited] appeal.
My doctor can provide a letter of medical necessity.
Please draft an appeal letter that cites the denial reason,
references the right to appeal, and is firm without being
hostile -- I may need to escalate further.
```
**Science note:** First-level internal appeals succeed at rates between 39-59% depending on plan type (KFF, 2023). Most people never file one.[^h4-1]

[^h4-1]: Kaiser Family Foundation (2023). "Claims Denials and Appeals in ACA Marketplace Plans." The appeal success rate data makes the low filing rate one of the most consequential information asymmetries in American healthcare.

---

#### H-5: Managing a Chronic Condition Day-to-Day
**Strategy:** Research
*(Stub -- full entry to be drafted)*

#### H-6: Understanding What Medicare or Medicaid Actually Covers
**Strategy:** Decode
*(Stub -- full entry to be drafted)*

#### H-7: Preparing for End-of-Life Conversations with Aging Parents
**Strategy:** Prepare
*(Stub -- full entry to be drafted)*


---

#### H-8: Wellness and Nutrition Coach
**Strategy:** Research + Draft (Expert Role)
**The Majordomo says:** *A registered dietitian charges between $100 and $200 per session and typically has a six-week wait for new patients. A personal trainer costs $50 to $150 per hour. A wellness coach costs more and is less regulated. Your Agent has read the same evidence base all three of them cite and will apply it to your specific situation without a retainer.*
**The spec:**
```
Act as a knowledgeable wellness and nutrition coach.
My situation:
— Age, general health: [brief description]
— Current eating patterns: [describe honestly]
— Goal: [lose weight / more energy / manage a condition /
   eat better on a budget / something else]
— Constraints: [dietary restrictions, budget, time, cooking skill]
— What I've tried before: [if anything]
What would you recommend, and where should I start?
```
**What to do with the output:** Use it as a starting framework, not a prescription. If you have a specific health condition, verify any significant dietary changes with your doctor. The calibration question applies here: *"How confident are you in this recommendation, and is there anything about my situation where you'd want me to check with a professional?"*

> **[FAIRNESS]** Wellness advice reflects the demographics of the research base it draws from. If your Agent's suggestions feel like they assume a certain income level, kitchen setup, or food access, say so explicitly: *"I shop at a discount grocery store and have a small kitchen. Please adjust your recommendations."*

**Common wellness Expert Role prompts:**
```
Act as a nutrition coach. I want to eat better but I have
[budget constraint / time constraint / dietary restriction].
I currently eat [brief description].
What are the three highest-impact changes I could make
without overhauling everything at once?
```
```
Act as a personal trainer. I want to [goal] but I have
[constraint: bad knee / no gym / only 20 minutes / working
from home all day].
What's a realistic starting routine?
```
```
Act as a wellness coach. I have been feeling [symptom:
low energy / poor sleep / constant stress] for [timeframe].
I am not looking for a diagnosis. I want to understand
what lifestyle factors might be contributing and what
I could adjust first.
```