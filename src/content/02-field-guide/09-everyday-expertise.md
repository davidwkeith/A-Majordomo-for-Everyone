---
title: "Everyday Expertise"
part: 2
order: 9
strategy: null
status: "draft"
---

### EVERYDAY EXPERTISE

*The billionaire class has a personal trainer, a nutritionist, a landscape architect, a dog behaviorist, a Master Gardener, a mechanic they trust, and a handyman who knows everything. On demand. By text. These entries use the Expert Role variant of the Specify strategy -- see Strategy 0 for the full technique.*

---

#### E-1: Master Gardener
**Strategy:** Diagnose + Research (Expert Role)
**The Majordomo says:** *Master Gardeners are volunteers trained by the agricultural extension system to answer exactly the questions you have about why your tomatoes look like that. They are free. They are also available by appointment, two weeks from Tuesday, during business hours. Claude is available now.*
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
**What to do with the output:** Start with the least invasive intervention Claude suggests. If the problem persists after one week, come back and describe what changed (or didn't). The refinement loop applies to plants as well as paperwork.

> **[TIP]** Add your soil type, sun exposure, and recent rainfall to the spec if you have it. The more specific the situation, the more specific the advice.

**Extended Expert Role prompts for gardening:**
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

---

#### E-2: Right-to-Repair Advisor
**Strategy:** Diagnose + Navigate (Expert Role)
**The Majordomo says:** *The right-to-repair movement is premised on a simple idea: you own the thing, you should be able to fix it. Manufacturers have spent considerable resources making this difficult through proprietary parts, voided warranties, and the strategic elimination of repair documentation from public access. Claude has read the repair documentation.*
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
**What to do with the output:** Before ordering any parts, verify part numbers against the manufacturer's parts diagram if available. iFixit.com and YouTube are the best secondary sources for your specific model once Claude has identified what needs fixing.

> **[MEME]** "It's not a bug, it's a feature." The manufacturer calling your appliance "unrepairable" is a business model, not a technical assessment. Start with Claude's diagnosis before accepting the quote for a replacement.

**Common right-to-repair Expert Role prompts:**
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

#### E-3: Wellness and Nutrition Coach
**Strategy:** Research + Draft (Expert Role)
**The Majordomo says:** *A registered dietitian charges between $100 and $200 per session and typically has a six-week wait for new patients. A personal trainer costs $50 to $150 per hour. A wellness coach costs more and is less regulated. Claude has read the same evidence base all three of them cite and will apply it to your specific situation without a retainer.*
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

> **[FAIRNESS]** Wellness advice reflects the demographics of the research base it draws from. If Claude's suggestions feel like they assume a certain income level, kitchen setup, or food access, say so explicitly: *"I shop at a discount grocery store and have a small kitchen. Please adjust your recommendations."*

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

---

#### E-4: Dog Training Specialist
**Strategy:** Diagnose + Navigate (Expert Role)
**The Majordomo says:** *Dog trainers charge $50 to $150 per session and are, in most cases, unregulated. The evidence base for dog training has shifted substantially in the last twenty years toward positive reinforcement methods, a fact that has not fully reached all practitioners charging $150 per session. Claude has read the current research.*
**The spec:**
```
Act as a certified positive-reinforcement dog trainer.
My dog: [breed or mix, age, how long I've had them]
The behavior I'm dealing with: [describe specifically —
what triggers it, what it looks like, how often it happens,
how long it's been going on]
What I've tried: [if anything]
My goal: [stop the behavior / redirect it / understand it]
What is likely causing this, and what's the training approach?
```
**What to do with the output:** Dog training requires consistency across everyone in the household. Before starting any training protocol Claude suggests, read it through with everyone who interacts with the dog. Inconsistency is the primary reason training doesn't work.

> **[TIP]** Describe the behavior from the dog's perspective, not just yours. "She destroys things when I leave" tells Claude less than "she destroys things within the first 20 minutes after I leave, specifically near the door." Specificity is the whole game.

**Common dog training Expert Role prompts:**
```
Act as a positive-reinforcement dog trainer.
I just got a [age] [breed] and I want to start on the right foot.
What are the five most important things to teach first,
and in what order?
```
```
Act as a dog behaviorist. My dog [behavior: barks at strangers /
pulls on leash / resource guards / has separation anxiety /
reacts to other dogs].
What is the behavior communicating, and what's the
most effective way to address it?
```
```
Act as a dog trainer. My dog knows basic commands but
I want to teach them [specific skill or trick].
Break it down into steps I can work on in 5-minute sessions.
```

---

#### E-5: Home Repair and DIY Advisor
**Strategy:** Diagnose + Navigate (Expert Role)
**The Majordomo says:** *Home repair knowledge was once transmitted intergenerationally, in the same way that knowing how to change a tire or hem a pair of pants was once considered a baseline life skill. Several decades of planned obsolescence and the gradual replacement of fixable things with disposable ones have interrupted that transmission. Claude received it anyway.*
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

**Common home repair Expert Role prompts:**
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

#### E-6: Car Maintenance Advisor
**Strategy:** Diagnose + Research (Expert Role)
**The Majordomo says:** *The automotive repair industry operates on the well-documented principle that most car owners do not know what their car needs, cannot verify whether the work was done, and will pay to resolve uncertainty. Claude has read the service manual.*
**The spec:**
```
Act as an experienced mechanic and car maintenance advisor.
My car: [year, make, model, approximate mileage]
The issue: [describe — noise, warning light, behavior change,
or maintenance question]
Recent service history: [if relevant]
My goal: [understand what's wrong / decide whether to DIY /
get a second opinion on a quote / know what to ask the shop]
```

> **[TIP]** If you've been given a repair quote you're not sure about, paste the line items into Claude and ask: *"Is this a standard repair for this car, is the price in the normal range for [city], and are there any of these items I could defer?"* The billionaire class doesn't pay the first quote. Neither should you.

---

#### E-7: Financial Coach (Everyday Money)
**Strategy:** Decide + Research (Expert Role)
**The Majordomo says:** *A fee-only financial advisor charges $200 to $400 per hour and is most useful when you have significant assets to manage. For the financial questions that most people actually have -- is this debt worth paying off early, should I keep this money in a savings account or somewhere else, does this insurance make sense -- Claude covers the ground.*
**The spec:**
```
Act as a fee-only financial coach with no products to sell.
My situation: [brief description of income, debts, savings]
My question: [specific financial decision or question]
My concern: [what you're worried about getting wrong]
Please give me the honest analysis, including what you'd
want to know more about before giving a final recommendation.
```

---

#### E-8: Cooking and Culinary Skills Advisor
**Strategy:** Research + Diagnose (Expert Role)
**The Majordomo says:** *Culinary school costs between $20,000 and $100,000. The core knowledge it transmits -- why things cook the way they do, how to fix a dish that's going wrong, what substitution works and why -- is well documented and has been explained in detail by every food science writer since Harold McGee. Claude has read Harold McGee.*
**The spec:**
```
Act as a culinary instructor.
The dish or technique I'm working on: [describe]
What went wrong (or what I want to improve): [describe specifically]
My equipment and skill level: [describe]
What am I doing wrong, and what should I do differently?
```

**Common culinary Expert Role prompts:**
```
Act as a culinary instructor. I want to learn [technique:
how to properly sauté / how to make a pan sauce / how to
sharpen a knife / how to make stock from scratch].
Explain the underlying principle and the step-by-step method.
```
```
Act as a culinary instructor. My [dish] came out [problem:
too salty / rubbery / bland / fell apart / didn't set].
What went wrong and how do I fix it -- or if it's too late to fix,
how do I prevent it next time?
```

---

#### E-9: Language Learning Partner
**Strategy:** Research + Navigate (Expert Role)
**The Majordomo says:** *Language immersion programs cost thousands of dollars. Duolingo is free and teaches you how to say "the elephant drinks milk" in seventeen languages. Claude will have an actual conversation with you about the things you need to say.*
**The spec:**
```
Act as a patient language tutor for [language].
My current level: [complete beginner / basic phrases / conversational]
My goal: [travel / family communication / work / general learning]
What I struggle with most: [pronunciation / grammar / vocabulary /
understanding native speakers]
How would you suggest we work together in our conversations?
```
