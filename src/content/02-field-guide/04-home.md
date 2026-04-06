---
title: "Home"
part: 2
order: 4
strategy: null
status: "draft"
---

### HOME

> **[MEME]** Every episode of *[Home Improvement](https://en.wikipedia.org/wiki/Home_Improvement_(TV_series))* followed the same structure: Tim had a theory, the theory was wrong, the drill came out, something structural failed. Al knew what the problem was from the beginning. Al said so. Tim did not listen. The third act was always preventable. The entries in this domain are Al Borland. You are a version of Tim who is actually going to listen.

---

#### Ho-1: Maintaining Your Home
**Strategy:** Diagnose
**See also:** Ho-2: Home Repair and DIY (for specific repairs), Ho-3: Right-to-Repair (for products designed to resist repair), Ch-1: Shopping Your Values (before replacing anything)
**The Majordomo says:** *You can't afford a full maintenance team for your humble mansion. You know the importance of preventive maintenance. You just need a system that works for you in order to keep your home to your standards.*
**The spec:**
```
My [appliance/system] is [describing the behavior: making a noise /
not working / leaking / etc.]. It started [when].
[Any relevant context: age of unit, recent changes, what I've tried.]
Please tell me:
1. What are the most likely causes, from most to least likely?
2. Which of these can I fix myself, and how?
3. If I do need a professional, what type, and what should I
   tell them when I call?
4. Are there any safety concerns I need to address immediately?
```
**What to do with the output:** If there's a safety concern, handle that first — your Agent will tell you if something needs to be turned off, unplugged, or evacuated from immediately. For everything else, try the simplest fix your Agent suggests before calling a professional. Most service calls start at $150 just to show up.

> **[ALSO]** Paste or upload your document directly — file upload works in Claude, Gemini, ChatGPT, and Copilot. See [Appendix G](06-appendix-g-feature-table.xhtml).

- Stain Removal
- DIY or Contractor
- Emergency Service
- Surface cleaning
- Tools
- Assistance programs
- Accessibility upgrades

---

#### Ho-2: Home Repair and DIY
**Strategy:** Diagnose + Navigate (Expert Role)
**See also:** Ho-1: Maintaining Your Home (for diagnosing first), Ho-3: Right-to-Repair (for products designed to resist repair), Ch-2: Understanding a Contractor Bid (when to hire instead)
**The Majordomo says:** *Home repair knowledge was once transmitted intergenerationally, in the same way that knowing how to change a tire or hem a pair of pants was once considered a baseline life skill. Several decades of planned obsolescence and the gradual replacement of fixable things with disposable ones have interrupted that transmission. Your Agent received it anyway.*
**The spec:**
```
Act as an experienced home repair advisor.
The task or problem: [describe specifically]
My home: [approximate age, owned or rented]
My skill level: [never done repairs / basic / comfortable with tools]
Tools I have: [basic hand tools / power tools / neither]
Is this urgent (affecting habitability or safety)? [yes/no]
What do I need to know before I start, and what are the steps?
```
**What to do with the output:** Read the full list of steps before you start — not while you're holding a wrench. If there's a part you need, your Agent can help you find it by name and part number. Take a photo of what you're working on before you take anything apart. Future you will thank present you.

> **[ALSO]** Checking current information requires web search, which is free in Gemini, ChatGPT, and Copilot. In Claude, web search requires the paid tier. See [Appendix G](06-appendix-g-feature-table.xhtml).

**Common home repair Expert Role specs:**
```
Act as a home repair advisor. I need to [patch a hole in drywall /
fix a running toilet / caulk a bathtub / replace a light switch /
fix a leaking faucet]. I have never done this before.
What do I need, and walk me through it step by step.
```
```
Act as a home repair advisor. I'm trying to figure out
whether I can do this myself or need a professional:
[describe the repair]. My skill level is [beginner/intermediate].
Give me an honest assessment.
```

---

#### Ho-3: Right-to-Repair
**Strategy:** Diagnose + Navigate (Expert Role)
**See also:** Ho-2: Home Repair and DIY (for the repair itself), Ho-1: Maintaining Your Home (for preventive maintenance)
**The Majordomo says:** *Call it Enshitification, planned obsolesce, buyer-lock-in. By making unrepairable products companies are able to sell us more stuff padding the pockets of Billionaires. Your Agent can work at your skill level to figure out when to repair or replace. And recommend more durable products to upgrade to. Capitalism as it is supposed to work in theory, we're just removing the information asymmetry.*
**The spec:**
```
Act as an experienced right-to-repair technician.
The item I'm trying to fix: [make, model, year if applicable]
The problem: [describe exactly what it's doing or not doing]
What I've already tried: [if anything]
Tools I have available: [basic / moderate / well-equipped]
My comfort level with disassembly: [never done it / done basic repairs /
comfortable with electronics / comfortable with appliances]
What is likely wrong, and what are my repair options
from easiest to most involved?
```
**What to do with the output:** Before ordering any parts, verify part numbers against the manufacturer's parts diagram if available. [iFixit.com](https://www.ifixit.com) and YouTube are the best secondary sources for your specific model once your Agent has identified what needs fixing.

> **[MEME]** "It's not a bug, it's a feature." The manufacturer calling your appliance "unrepairable" is a business model, not a technical assessment. Start with your Agent's diagnosis before accepting the quote for a replacement.

**Common right-to-repair Expert Role specs:**
```
Act as a right-to-repair technician. My [washing machine /
dishwasher / refrigerator / dryer] is [symptom].
It is a [brand] [model if known], approximately [age] years old.
Walk me through diagnosing this step by step.
```
```
Act as a bicycle mechanic. My [component] is [symptom].
The bike is a [type: road/mountain/hybrid], [approximate age].
What needs adjustment or replacement, and can I do it myself
with basic tools?
```
```
Act as a small engine repair technician. My [lawn mower /
generator / chainsaw] [symptom]. It was last serviced [when].
What should I check first?
```

---

#### Ho-5: Knowing Your Rights as a Renter or Homeowner
**Strategy:** Assert + Decode
**See also:** L-1: Negotiating a Contract (for reading your lease or mortgage), C-7: Understanding Your Rights as a Citizen or Resident (for rights that vary by jurisdiction), C-4: Advocating for Change (for changing the rules)
*(Stub -- full entry to be drafted)*

- In general give two common examples, in one city what the person wants is legal, the other it isn't, and at what level of government that law can be changed. US Focused examples, still thinking globally.
- Combine this with having your Agent understanding the contract of your current Lease or Mortgage. If they can find it, another great exercise if they just want to learn.

**HOA & Common Areas**
- Changing HOA by-laws, municipal laws and regulations, State, Federal. Constitutional. Examples of housing Rights as defined by Universal Declaration of Human Rights that US Citizens don't have, those are Amendments, but they start local.
- Dissolving HOAs
- Common areas rules & responsibilities (HOA, Rental, Roads, Sidewalks)
- Homeowner & HOA disputes
- Fighting a dispute with HOA or Landlord

**Landlord & Lease**
- Combine this with having your Agent understanding the contract of your current Lease or Mortgage. If they can find it, another great exercise if they just want to learn.

**Property & Land**
- Property tax assessments, How does Georgeism prevent empty lots by changing the way we tax land? Which system benefits me the most?
- Trespassing and The Right to Roam.
- Water rights
- Mineral Rights, "I drank your Milkshake"

**Environmental**
- Pollution. Channel Erin Brockovich.

**Accommodations & Accessibility**
- Accommodations, including service animals. (HOA may disallow Pit-bull's. Owner has one which is a trained service animal under the law)
- Accessibility: rights, support programs, etc

**Pets**
- Pets. Limits, legality of even owning a Zebra, Raccoon, or Squirrel (RIP Peanut)
- Pets & Assistance Animals (applies to both renters and owners)

**Energy & Sustainability**
- Solar installation, plugin was just made legal in one municipality in the US, great example for renters. HOAs have different rules, some legal, some not.
- Car charging outlets (Rent/HOA)

**Financial Assistance**
- Financial Assistance for housing
- Support for the unhoused.

**Historical Districts**
- Historical District Considerations including forming or brainstorming how to modify your home within the constraints.

---

#### Ho-6: Understanding Your Utility Bill and Energy Options
**Strategy:** Decode + Research
**See also:** M-6: Financial Coach (for budgeting utilities), Li-9: Making a Household Budget That Holds (utilities as a budget category)
**The Majordomo says:** *Energy cost burden -- the percentage of household income spent on utilities -- falls hardest on low-income households, who spend nearly three times the proportion of their income on energy that median-income households do, and who have the least access to the rebate programs designed to address this. The programs exist. Finding them is the obstacle.*
**The spec:**
```
I want to understand my utility bill and find out if there are
programs that could lower my costs. I'm in [state].
My situation: [renter/homeowner], household income approximately
[$range or "low income"], type of housing [apartment/house/mobile home].
Please:
1. Explain what the main charges on a typical utility bill mean
2. Tell me what rebate or assistance programs I likely qualify for
3. Give me the steps to apply for the most impactful one
```
**What to do with the output:** Apply for the program your Agent identifies first — the one with the biggest impact and the simplest application. Most assistance programs are first-come, first-served and have enrollment windows. Do it today, not next billing cycle.

<!-- art
file: utility-bill-annotated.png
size: full
alt: A utility bill with labeled arrows pointing to key charges: base rate, usage tiers, delivery charges, taxes, and fees
brief: Hand-drawn #2 pencil sketch of a one-page utility bill, key line items circled with ballpoint pen annotations explaining each charge, transparent background
-->

> **[ALSO]** Paste or upload your document directly — file upload works in Claude, Gemini, ChatGPT, and Copilot. See [Appendix G](06-appendix-g-feature-table.xhtml).

- Assistance programs
- Rebates & Incentives
- Installing solar and renewables
- Going off-grid

---

#### Ho-7: Getting a Home
**Strategy:** Navigate + Research
**See also:** M-3: Mortgages, M-6: Financial Coach, L-1: Negotiating a Contract, Ho-5: Knowing Your Rights
*(Stub -- full entry to be drafted)*

- Homeless
- First-time buyers
- Mortgages, your Death Pledge.
- Refinancing
- Renting & Leasing

---

#### Ho-8: Gardening & Landscaping
**Strategy:** Diagnose + Research (Expert Role)
**See also:** Ch-3: Identifying and Caring for Plants (for houseplants), Ho-1: Maintaining Your Home (for broader property care)
**The Majordomo says:** *Master Gardeners are volunteers trained by the agricultural extension system to answer exactly the questions you have about why your tomatoes look like that. They are free. They are also available by appointment, two weeks from Tuesday, during business hours. Your Agent is available now.*
**The spec:**
```
Act as an experienced Master Gardener.
Here is my situation:
— Location / climate zone: [e.g., Zone 9b, Northern California]
— What I'm growing: [plant, variety if known]
— The problem: [describe what you're seeing — yellowing leaves,
   spots, wilting, not producing, pest damage, etc.]
— How long it's been going on: [timeframe]
— Recent changes: [new fertilizer, watering change, weather event, etc.]
What is likely causing this, and what should I do?
```
**What to do with the output:** Start with the least invasive intervention your Agent suggests. If the problem persists after one week, come back and describe what changed (or didn't). The refinement loop applies to plants as well as paperwork.

> **[TIP]** Add your soil type, sun exposure, and recent rainfall to the spec if you have it. The more specific the situation, the more specific the advice.

> **[ALSO]** To make this Expert Role persistent across sessions, save it as a **Project** (Claude), **Gem** (Gemini), or **Custom GPT** (ChatGPT). See [Appendix G](06-appendix-g-feature-table.xhtml).

**Extended Expert Role specs for gardening:**
```
Act as a Master Gardener. I want to start a vegetable garden in
[location, climate zone]. I have [square footage / container space].
I want to grow [goals: food for family / cut flowers / low maintenance].
My experience level is [beginner/intermediate].
What should I plant, when, and in what order of priority?
```
```
Act as a Master Gardener specializing in soil health.
My soil is [clay/sandy/unknown]. My plants seem to be
[struggling / doing fine but I want to improve].
What amendments should I add, and how do I apply them?
```
