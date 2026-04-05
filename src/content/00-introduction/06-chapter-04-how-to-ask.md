---
title: "How to Ask for What You Actually Want"
part: 0
order: 6
strategy: null
status: "draft"
---

## Chapter 4: How to Ask for What You Actually Want

*"Could you please clarify what you mean by 'normal'?"*
*— Data, probably, in every episode*

This is the most important chapter in the book. The difference between a frustrating Claude conversation and a genuinely useful one almost always comes down to how the question was asked.

Most people ask questions the way they type them into Google: short, keyword-heavy, no context. That works for search engines, which are matching your words to documents. It does not work for Claude, which is trying to understand your situation. Claude does not guess at what you mean. It answers what you asked. Ask a vague question, get a vague answer.

> **[MEME]** "Instructions unclear." That is what Claude produces when you type "help with insurance." It is not Claude's fault. Give it something to work with.

The good news: getting specific is a learnable skill, and this chapter gives you a template that works for virtually every situation in this book.

### The Core Template

```
I am [who you are in this situation].
I need [what you want to accomplish].
Here is the situation: [the specific facts].
I want to avoid [the outcome you're worried about].
Please give me [the format you need: a letter, a list, an explanation, options].
```

You do not need to use these exact words. But every good prompt has these five elements somewhere in it. Here is the same template applied to a real situation:

```
I am a tenant whose landlord has not fixed a leaking roof for six weeks
despite two verbal requests. I need to send a formal written notice
before I can pursue any other options. The leak is in my bedroom ceiling
and has damaged a lamp I own. I want to be firm without being aggressive,
because I plan to renew my lease if this gets resolved. Please write me
a one-page demand letter in plain language.
```

Compare that to: *"Help me write a letter to my landlord."*

Both take about fifteen seconds to type. The first one produces something you can actually send.[^4-1]

### Give Context First, Question Second

Claude reads your entire message before it starts answering. Front-load the context. Put your question at the end, after Claude has everything it needs to answer it well.

### Ask for a Specific Format

If you need a list, ask for a list. If you need a letter, ask for a letter. If you need someone to explain something in plain language, say "plain language." If you need step-by-step instructions, ask for numbered steps. Claude will default to prose paragraphs if you don't specify.

> **[TIP]** Adding "please use plain language, no jargon" to any medical, legal, or financial prompt will dramatically improve the readability of the response.

### Ask for Options, Not Just Answers

When you are making a decision, ask Claude for options rather than a single recommendation. Claude does not know your full situation. Asking for three options and asking it to explain the tradeoffs of each gives you better material to work with than asking "what should I do?"

```
I'm trying to decide whether to repair or replace my 12-year-old
dishwasher. The repair quote is $340. Can you give me three ways
to think about this decision, with the tradeoffs of each?
```

### Ask for the Conservative Answer When Stakes Are High

For medical, legal, and financial questions, add: *"Please give me the most cautious, conservative answer. I would rather over-prepare than under-prepare."* This adjusts Claude's response away from edge cases and toward the safest reasonable interpretation.[^4-2]

### The Calibration Question

After any important answer, ask: *"How confident are you in this, and what should I independently verify?"* Claude will tell you where its answer is reliable and where you should double-check with a professional or a primary source. This is not a sign of weakness in the tool. It is the most useful question in the book.

### When to Start a New Conversation

The AI remembers everything within a single conversation but nothing between conversations by default. If you are working through a complex problem over multiple sessions, start each new session with a one-paragraph summary of what you discussed before. If a conversation has gone on so long that the AI seems to be losing track of details, start fresh with a summary.

> **[ALSO]** Claude calls persistent cross-conversation memory simply "Memory" — it can be enabled in settings and will carry facts about you from session to session. Gemini calls this "Personalization." ChatGPT calls it "Memory." All three work similarly: the tool builds a profile of your situation over time so you don't have to re-explain it. This is different from Projects / Gems / Custom GPTs, which are manually configured contexts. See Appendix G.

> **[ALSO]** For ongoing household projects — managing a renovation, tracking a medical situation, handling a long legal dispute — Claude's **Projects** feature lets you store background documents and instructions that persist across every conversation in that project. Gemini's equivalent is a **Gem**. ChatGPT's equivalent is a **custom GPT**. Setting one up for your household is the single highest-leverage thing you can do with any of these tools. Chapter 3 explains how.

> **[SCIENCE]** Decades of research on *expertise* show that the primary difference between novices and experts is not intelligence — it is the quality of the questions they ask (Berliner, 1988). Experts ask more specific questions, frame problems more precisely, and break large problems into smaller pieces. The prompt template in this chapter is a transferable expertise skill: using it makes you more effective not just with AI, but in any situation where you need help from another person.[^4-3]

[^4-1]: The principle at work here is specificity in communication, which is consistently associated with better outcomes in any helping relationship — from therapy (Lambert, 2013) to management consulting to medical intake. Vague requests produce hedged, general responses. Specific requests produce specific, actionable ones.

[^4-2]: Kahneman, D. (2011). *Thinking, Fast and Slow*. Farrar, Straus and Giroux. The research on System 1 and System 2 thinking is directly relevant here: high-stakes decisions benefit from the deliberate, effortful processing that a well-specified prompt encourages, counteracting the fast, intuitive — and error-prone — thinking that characterizes stressed decision-making.

[^4-3]: Berliner, D.C. (1988). "The development of expertise in pedagogy." Charles W. Hunt Memorial Lecture, American Association of Colleges for Teacher Education.
