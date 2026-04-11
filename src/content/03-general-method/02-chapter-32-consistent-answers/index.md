---
title: "Getting Consistent, Reliable Answers"
part: 3
order: 2
strategy: null
status: "draft"
---

## Chapter 32: Getting Consistent, Reliable Answers

Claude does not always give identical answers to identical questions. This is by design -- the same way two conversations with the same knowledgeable friend might go differently depending on how the question was framed. For most tasks in this book, that variability is fine. For others -- when you need a checklist, a step-by-step process, or a conservative interpretation of something with real stakes -- you want to reduce variability and increase reliability.

Here is how.

### Ask for numbered steps when sequence matters

If the order of operations is important -- a legal process, a repair procedure, a medical preparation checklist -- ask explicitly for numbered steps. Claude will default to numbered steps only if you ask for them.

```
Please give me numbered steps, in the order I should do them,
with no steps combined.
```

### Ask Claude to show its work

For factual claims with real stakes, ask Claude to identify the basis for each main point and flag any areas where it is less certain. This is not about doubting Claude -- it is about knowing where to verify independently.

```
For each main point in your answer, please tell me briefly
what it is based on, and flag anything I should independently
verify with a professional.
```

### Ask for the most conservative interpretation

For legal, medical, and financial questions:

```
Please give me the most cautious, conservative interpretation.
I would rather over-prepare than be caught off guard.
```

### Ask for a checklist instead of advice

When you need to act on something -- not just understand it -- ask Claude to convert its answer into a yes/no or done/not-done checklist.

```
Can you turn that into a checklist I can print out and work
through item by item?
```

### Ask your Agent to review its own answer

For important questions, ask your Agent to take a second pass before you act on the answer:

```
Now review what you just told me. What did you get wrong,
oversimplify, or leave out? What would change if my situation
were slightly different?
```

Your Agent will often catch its own oversights — a missed exception, an assumption it made about your circumstances, a detail it glossed over for brevity. This is not a sign the first answer was unreliable. It is the same principle as rereading a contract before signing: the second read catches what the first read missed. For high-stakes questions — legal, medical, financial — a self-review followed by the calibration question below gives you two layers of error-checking before you act.

### The calibration question

After any important answer, before you close the conversation:

```
How confident are you in this answer, and what are the two
or three things I should independently verify before acting on it?
```

This single question will consistently improve the quality of the guidance you receive. Claude will tell you where its answer is reliable and where it is extrapolating. That boundary is exactly where you should apply your own judgment -- or pick up the phone and call a professional.

> **[SCIENCE]** Research on *algorithm aversion* -- the human tendency to distrust algorithmic recommendations even when they are demonstrably more accurate -- shows that people accept algorithmic guidance more readily when they can see the reasoning behind it (Dietvorst et al., 2018). Asking Claude to show its work is not just practically useful. It also addresses the well-documented psychological resistance to following advice from a source you cannot fully understand.[^32-1]

> **[SCIENCE]** The inverse phenomenon, *automation bias* -- over-trusting algorithmic output -- is equally documented and arguably more dangerous (Cummings, 2004). The calibration question ("how confident are you, and what should I verify?") is a structured defense against automation bias. It keeps the human in the loop at exactly the moment when the stakes are highest.[^32-2]

[^32-1]: Dietvorst, B.J., Logg, J.M., & Lonati, S. (2018). "Algorithm aversion: People erroneously avoid algorithms after seeing them err." *Journal of Experimental Psychology: General*, 144(1), 114-126.

[^32-2]: Cummings, M.L. (2004). "Automation bias in intelligent time critical decision support systems." *AIAA 1st Intelligent Systems Technical Conference.*
