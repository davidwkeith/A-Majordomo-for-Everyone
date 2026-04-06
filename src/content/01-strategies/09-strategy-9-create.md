---
title: "Strategy 9: Create"
part: 1
order: 9
strategy: 9
status: "draft"
---

## Strategy 9: Create

*Write the story. You own the plot. The AI writes the sentences.*

---

*[TRINITRON — 8-BIT PIXEL ART: Picard and Data in what appears to be a normal Victorian drawing room. Through the window behind them, barely visible, the hexagonal grid lines of a holodeck. One of them holds a book that should not exist outside the simulation. Their expressions: the specific look of people who have just realized the room is not real. Paper angle: determined by the holodeck grid lines visible through the window — the hex grid runs at roughly 30 degrees. Blue lines of the notebook paper align with the holodeck grid, so that the paper's lines and the simulation's lines are the same lines. The notebook and the holodeck are built from identical rules.]*

*[Star Trek: The Next Generation](https://en.wikipedia.org/wiki/Ship_in_a_Bottle_(Star_Trek:_The_Next_Generation)), "Ship in a Bottle" (1993) — [Moriarty](https://en.wikipedia.org/wiki/Moriarty_(Star_Trek)) thought he'd escaped the story. He was still inside someone else's spec.*

---

**The episode:** Professor Moriarty — a [holodeck](https://en.wikipedia.org/wiki/Holodeck) character who achieved self-awareness four years earlier — has been waiting inside a computer program, believing himself to be conscious and real. When the crew reactivates him, he demands what was promised: a way to exist outside the holodeck. Picard appears to find a solution. Moriarty and his companion step into what seems to be the real world.

They have not. They are inside a simulation of the real world, nested inside the holodeck. Picard, Data, and Barclay engineered the illusion. Moriarty will live out his days believing he is free, inside a story he did not author, playing a role in a spec written by someone else.

The tragedy is not that Moriarty is fictional. It is that he believed he was the protagonist of a story he did not write. His plot points were fixed by someone else. He could not distinguish between the story he thought he was in and the story he was actually in.

**The lesson:** This chapter is about being the author, not the character. Knowing which events in your story are fixed — the deterministic plot points you own — and which are dynamic, generated within constraints you set. The AI is the holodeck. You are the programmer. The story belongs to you. If you don't specify that, you will find yourself inside someone else's narrative, calling it your own.

*"In Star Trek, a holonovel programmer writes the world's rules, the characters' parameters, the plot's fixed points — and then the holodeck generates the experience within those constraints. The programmer is the author. The holodeck is the renderer. The story belongs to the programmer."*

---

In Star Trek, a holonovel programmer writes the world's rules, the characters' parameters, the plot's fixed points — and then the holodeck generates the experience within those constraints. The programmer is the author. The holodeck is the renderer. The story belongs to the programmer.

This is the correct mental model for AI-assisted creative writing. You are the author. The AI writes sentences. The distinction matters because it determines who makes every decision that matters: you do. The AI makes the decisions you don't care about, which turns out to be most of the sentences.

The failure mode — "I asked it to write me a story and it was generic" — happens because the writer handed the AI both jobs. The AI wrote the sentences *and* made the structural decisions, because no one told it not to. The result is the literary equivalent of a holodeck running without a programmer: technically functional, narratively empty.

This strategy is about keeping both jobs clearly assigned.

---

### The Architecture: Deterministic and Dynamic

Every story has two kinds of elements. Understanding the difference is the whole skill.

**Deterministic plot points** are the fixed events the story must pass through. The murder happened. The protagonist's father was not who she thought he was. The city burns in the third act. These are not up for negotiation. They are the bones. You own them. They go in the spec as facts, not suggestions.

**Dynamic passages** are everything between the fixed points — the scenes, the dialogue, the texture, the sentences. These can be generated, because getting them exactly right on the first pass doesn't matter. You will revise them. The AI's job is to produce a workable first draft of the connective tissue so you can focus on the bones.

The ratio varies by project and by writer. Some writers fix only three plot points and leave everything else dynamic. Some fix every scene beat and only leave the prose dynamic. Both are valid. The spec tells the AI which is which.

```
DETERMINISTIC — these will happen, exactly as stated:
- [Plot point 1]
- [Plot point 2]
- [Plot point 3]

DYNAMIC — generate these within the following constraints:
- [Constraint: tone, POV, pacing, length]
- [Constraint: what must be established in this passage]
- [Constraint: what must NOT be resolved yet]
```

---

### The Story Architecture Spec

Before the AI writes a word of prose, you build the architecture. This is the spec interview for creative work. It takes longer than a legal spec because the domain is larger — but the same principle applies: you don't write it from scratch. The AI interviews you into it.

**Opening the interview:**

```
I want to write a [genre] story. I have some ideas but I need help
building out the structure before I start writing scenes.
Please ask me questions about:
— the central conflict
— the main characters and what they want
— the world or setting
— the plot points I'm certain about
— the tone and audience
Ask one area at a time. I'll tell you when I'm ready to
move to the next one.
```

The AI will ask. You answer. After three to five exchanges per area, ask it to propose a story architecture document — a one-page skeleton of the whole story with the deterministic points flagged and the dynamic passages identified. Review it. Correct what's wrong. That document becomes the master spec for every scene you write.

---

### The Scene Draft Loop

With the architecture confirmed, each scene runs its own spec loop:

```
SCENE: [scene identifier, e.g., "Ch. 3 — Elena discovers the letter"]

DETERMINISTIC in this scene:
— Elena finds the letter in her father's desk
— The letter reveals he was in the city the night of the fire
— She does not confront him yet — save that for Ch. 7

DYNAMIC — please generate:
— Her emotional state moving into the scene
— The physical details of the desk and study
— Her reading of the letter (we see it through her reactions,
   not quoted in full)
— Where she is emotionally when the scene ends

CONSTRAINTS:
— Third person limited, Elena's POV
— Tone: dread mixed with recognition, not shock
— Length: 600-900 words
— Do not resolve her suspicion — deepen it
```

The AI generates the scene. You read it. For each element, one of three things is true:

1. **It works.** Keep it.
2. **It's close but wrong in a specific way.** Say exactly what's wrong: *"The physical description is right but her emotional response is too passive — she should be more angry than frightened at this point."* Regenerate the specific passage.
3. **It's structurally wrong.** The AI violated a constraint or a deterministic point. Go back to the spec, clarify the constraint, regenerate.

Most first drafts will have elements in all three categories. That is normal. A 700-word scene that is 80% usable saves you from writing 700 words from scratch, which is the point.

> **[MEME]** "Save early, save often." The [Sierra Adventures](https://en.wikipedia.org/wiki/Sierra_Entertainment) generation knows. Keep your architecture doc. Keep every scene draft. The version you're rejecting today is the one you'll want back in three weeks.

---

### Character Voice Specs

Characters are their own sub-specs. Before writing any scene with dialogue, build a voice spec for each major character. This is the character bible, compressed into a prompt:

```
CHARACTER: [name]

Who they are: [2-3 sentences of background]

What they want (surface): [what they say they want]
What they want (deep): [what they actually want]
What they're afraid of: [the thing driving their behavior]

How they speak:
— Vocabulary level and register: [formal/casual/technical/etc.]
— Sentence length: [short and clipped / long and circuitous / varies]
— Verbal tics or patterns: [specific habits — questions everything /
   deflects with humor / never says what they mean directly]
— What they never say: [topics they avoid, words they don't use]

Reference voice (optional): [a character from fiction or film whose
voice is similar — not to copy, but to calibrate]
```

Paste this spec at the top of any scene request involving that character. The AI will hold the voice through the scene. If it drifts, point to the spec and ask it to correct the specific line.

> **[TIP]** The "what they never say" field is the most powerful one. Negative constraints produce more distinctive voices than positive ones. A character who never asks for help directly writes completely differently than one who does.

---

### Branching Narratives and Game Plots

Modern game narrative — [Disco Elysium](https://en.wikipedia.org/wiki/Disco_Elysium), [Hades](https://en.wikipedia.org/wiki/Hades_(video_game)), [The Last of Us](https://en.wikipedia.org/wiki/The_Last_of_Us), [Baldur's Gate 3](https://en.wikipedia.org/wiki/Baldur%27s_Gate_3) — uses a structure that is more sophisticated than linear fiction but less chaotic than pure improvisation. The player has agency at specific decision points. The world responds. The core story still reaches its destination.

AI-assisted writing handles this structure well because the spec language maps directly to it:

```
BRANCH POINT: After Elena confronts her father in Ch. 7

PATH A (if she shows him the letter):
— Deterministic: he admits he was there
— Deterministic: he says it wasn't what she thinks
— Dynamic: his explanation — generate 3 versions, I'll choose one
— Next scene: Elena decides whether to believe him

PATH B (if she says nothing):
— Deterministic: she begins investigating on her own
— Dynamic: her first move — what does she do?
— Constraint: she cannot find the key witness yet — save that for Ch. 11
— Next scene: the investigation begins
```

You can generate both paths, read them, and decide which serves the story better — or keep both if you're writing an interactive piece. The AI holds both branches in memory for the duration of the conversation. For longer projects, paste the architecture doc at the start of each session to restore context.

> **[SCIENCE]** Research on creative cognition consistently identifies *constraint* as a driver of creative output rather than an obstacle to it — the phenomenon known as "creative constraint" (Stokes, 2006). Paradoxically, writers with more specific parameters produce more original work than those given full freedom, because constraints force novel solutions within a bounded space. The deterministic/dynamic architecture is applied creative constraint theory.[^s9-1]

[^s9-1]: Stokes, P.D. (2006). *Creativity from Constraints: The Psychology of Breakthrough.* Springer. The research on jazz improvisation, architectural design, and literary composition all point to the same finding: meaningful constraints produce more creative output than open-ended prompts.

---

### The Prose Refinement Cycle

A first draft from an AI is a first draft. It is not a failure if it needs revision. It is a first draft. The revision workflow:

**Pass 1 — Structure check.** Did the scene hit the deterministic points? Did it violate any constraints? Fix these first. They are binary.

**Pass 2 — Voice check.** Does each character sound like themselves? Does the prose match the specified tone? These are the most common drift points. Correct by pointing to the spec.

**Pass 3 — Your voice.** This is the pass where the prose becomes yours. Find the sentences that are technically correct but feel like nobody wrote them — the AI's equivalent of filler — and replace them. This is faster than writing from scratch because most sentences are already there.

**Pass 4 — Read aloud.** Every writer's final pass, AI-assisted or not. Anything that stumbles when spoken needs revision.

The target is not a draft that needs no revision. The target is a draft where Pass 3 takes twenty minutes instead of two hours.

---

### The Class Analysis

Professional ghostwriters charge $15,000 to $100,000 to write a book for someone else. Script consultants charge $500 to $2,000 per session. Game narrative designers command six-figure salaries. The billionaire class does not write its own memoirs, speeches, or corporate novels — it employs people whose entire job is to translate the principal's ideas into publishable prose.

The tool does not write the book. The writer writes the book. What changes is the cost of the sentences.

> **[MEME]** *"The first draft of anything is shit."* [Hemingway](https://en.wikipedia.org/wiki/Ernest_Hemingway) said this before AI existed. He would have used it.

---

### Worked Examples

**A mystery novel architecture interview** — building the skeleton of a 70,000-word mystery from a single premise sentence, identifying the ten deterministic plot points, and generating the first scene.

**A branching short story** — a 3,000-word piece with two branch points, generating all four possible endings and choosing the strongest.

**A game narrative prototype** — a single location with three character interactions, each with deterministic outcomes and dynamic dialogue, built to the conventions of modern RPG writing.

*(Full worked examples with [SPEC] loops to be drafted)*
