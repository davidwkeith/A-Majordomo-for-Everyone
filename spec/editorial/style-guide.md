# Style Guide

*The mechanical rules that keep 80,000+ words consistent across drafting sessions. For voice, audience, and philosophy, see [voice-and-audience.md](voice-and-audience.md) and [principles.md](principles.md). For structural conventions (callouts, Skill anatomy, art briefs), see [editorial-conventions.md](editorial-conventions.md).*

---

## Base Style Manual

**Chicago Manual of Style, 17th edition.** Follow Chicago unless this guide specifies an exception. When Chicago offers multiple acceptable forms, prefer the simpler one.

---

## Readability

- **Target:** Flesch-Kincaid Grade 8 throughout. The reader is smart. Short sentences are not condescending; they are respectful of the reader's time.

---

## Numbers

- Spell out one through nine. Use digits for 10 and above.
- Always use digits for: dollar amounts ($62,000), percentages (80%), ages (44-60), measurements (8.5x11), dates, and times.
- Spell out numbers that open a sentence. If the result is awkward, rewrite the sentence.
- Approximate or idiomatic quantities stay spelled out: "a few," "a couple of," "one thing," "a dozen."
- Ranges use an en dash with digits (10--20), "to" with spelled-out numbers (one to nine).

---

## Punctuation

- **Oxford comma:** Always. "Legal, medical, and financial."
- **Em dashes:** Spaced — like this — per the book's established convention. In Djot source, use ` --- ` (space-padded triple hyphen) or the Unicode character ` — `. Unspaced em dashes read as cramped in digital typesetting; the spaced form is clearer on screen and in ePub rendering.
- **Contractions:** Use freely. "Don't," "you're," "it's." The voice is conversational. "Do not" reads stiff for this audience — reserve it for emphasis ("Do not apologize for asking").
- **Exclamation points:** Almost never. If the sentence needs one to land, rewrite the sentence.
- **Quotation marks:** Double quotes for direct speech and scare quotes. Single quotes for quotes within quotes. Periods and commas inside closing quotes (Chicago).
- **Ellipses:** Three spaced periods per Chicago ( . . . ). Avoid in body prose — they soften the voice. Acceptable in quoted agent output or reader dialogue.

---

## Capitalization

| Element | Convention | Example |
|---------|-----------|---------|
| Chapter titles | Title case | "Strategy 2: Prepare" |
| Skill titles | Title case | "Understanding a Contractor Bid" |
| Callout labels | ALL CAPS in brackets | `> **[SCIENCE]**` |
| Subheadings in prose | Sentence case | "### Ask for numbered steps when sequence matters" |
| Subheadings inside agent output | Bold sentence case | "**What to bring:**" |
| Strategy names | Capitalized | Prepare, Decode, Navigate |
| Part names | Capitalized | "Part Two: The Field Guide" |
| "Field Guide" | Capitalized (proper noun in this book) | "the Field Guide" |
| "Skill" / "Skills" | Capitalized when referring to a Field Guide entry | "see Skill H-4," "the Health Skills" |
| "the spec loop" | Lowercase | "run the spec loop" |

---

## Terminology

Preferred terms. Use the left column; never use the right column with the same meaning.

| Use | Don't use |
|-----|-----------|
| your Agent | the AI, the chatbot, the bot, the assistant, the model, the LLM |
| spec / specification | prompt (except when explaining what others call it) |
| specification interview | prompt engineering, prompt crafting |
| ask / tell your Agent | leverage, utilize, harness, interface with |
| the book | this guide, this manual, this resource |
| Skill (Field Guide) | entry, article, post, section (for individual Skills) |
| worked example | demo, tutorial, walkthrough |
| the reader | the user, the customer, the consumer |
| high-stakes | high-value, mission-critical, critical |

**First-mention rule:** When a term the reader may not know appears for the first time, define it inline or link to Wikipedia (the Federation Database). Do not assume vocabulary.

**"Claude" vs. "your Agent":** Use "your Agent" in all instructional prose. Use "Claude" only when discussing Claude-specific features (inside [ALSO] callouts or Appendix G) or when the sentence would be confusing without naming a specific product.

---

## Banned Words and Phrases

These are never appropriate in this book's voice:

| Banned | Why |
|--------|-----|
| empower | Corporate wellness language. The book gives tools, not empowerment. |
| journey | The reader is not on a journey. They are filing an insurance appeal. |
| thrive | See above. |
| transform / transformative | Oversells. The book is practical, not revelatory. |
| leverage (as verb) | Jargon. Say "use." |
| utilize | Say "use." |
| unlock (your potential, etc.) | Marketing copy. |
| game-changer | Cliche that promises too much. |
| deep dive | Say "look closely" or just do it. |
| Great question! | Patronizing opener. Banned from agent output examples too. |
| It's worth noting that | Filler. Delete the phrase; start with what's worth noting. |
| In today's world | Filler. Delete. |
| at the end of the day | Cliche. |
| a]l of the above | Lazy. Be specific. |

---

## Gendered Language

- Use singular "they" by default for hypothetical people: "Your manager — they will either approve it or escalate."
- When an example names a specific character with established pronouns (Tim, Jill, Picard, Roseanne), use those pronouns.
- Do not assign gendered pronouns to unnamed professionals (doctors, plumbers, lawyers, managers) — use "they" or rephrase.

---

## Lists

- **Inline:** Three or fewer simple items stay in prose: "legal, medical, and financial."
- **Bulleted/numbered:** Four or more items, or items with multiple clauses, break to a list.
- **Numbered vs. bulleted:** Use numbered lists only when sequence matters (steps, procedures, priority order). Use bullets for unordered sets.
- **Parallel structure:** Every item in a list starts with the same part of speech. If the first item starts with a verb, they all do.
- **Terminal punctuation:** Full sentences in lists get periods. Fragments do not.

---

## Accessibility

This section governs the ePub output and any web rendering.

### Alt Text

- Every image must have alt text — either from XMP `Iptc4xmpCore:AltTextAccessibility` or the `alt` field in the `.art.md` sidecar.
- Alt text describes **what the image communicates**, not what it looks like. "Tim and Jill in a doctor's waiting room with no questions prepared" not "pixel art of two people on a bench."
- Decorative images (dividers, ornaments) use empty alt (`alt=""`).
- Maximum 125 characters for short alt. If more is needed, use `aria-describedby` pointing to a longer description in the text.

### Structure

- Headings follow a strict hierarchy: `h2` for chapter titles, `h3` for sections, `h4` for entry titles. Never skip levels.
- Reading order matches visual order. No CSS reordering that breaks logical flow.
- All callout blockquotes use `role="note"` with an `aria-label` matching the callout type (e.g., `aria-label="Science note"`).

### Color and Contrast

- Body text meets WCAG 2.1 AA contrast ratio (4.5:1 minimum).
- No information conveyed by color alone — callout types are identified by label text, not just color.
- Link text is distinguishable from body text by underline, not just color.

### Language

- The ePub declares `lang="en"` at the document level.
- Foreign words or phrases use inline `lang` attributes.

---

## Cross-References

- Reference Skills by ID: "see H-4" or "see also L-1: Negotiating a Contract."
- Reference chapters by title, not number, except within Part 3 where chapter numbers are conventional: "Chapter 32: Getting Consistent, Reliable Answers."
- Reference strategies by name: "Strategy 2: Prepare" on first mention, "Prepare" thereafter.
- Never use "above" or "below" — ePub reading order is not guaranteed to match authorial expectation.

---

## Spec Block Conventions

- Spec blocks (reader prompts) use fenced code blocks with no language identifier.
- Agent responses use fenced code blocks with the `agent` language identifier.
- Realistic details only — no `[PLACEHOLDER]` or `[YOUR NAME HERE]`. If a value varies, use a bracketed description: `[your city]`, `[appointment date]`.
- Reflect the target reader's circumstances: renters, employees, high-deductible health plans. Not homeowners, entrepreneurs, or people with comprehensive coverage — unless the example specifically calls for it.

### Voice in Prompt and Agent Blocks

- **Prompt blocks (reader voice):** Casual and conversational. The reader is talking to their Agent the way they'd talk to a knowledgeable friend — plain language, incomplete thoughts sometimes, contractions always. Not formal instructions. Not corporate memo language. "I need help figuring out..." not "Please assist me in understanding..." If a prompt reads like something you'd type into a search engine or say to a colleague, it's right. If it reads like a cover letter, rewrite it.
- **Agent blocks (AI voice):** Should sound like a capable AI assistant actually sounds — direct, structured, slightly formal but not stiff. The Agent organizes information clearly, uses headers and lists when helpful, and gets to the point. It does not use exclamation marks, does not say "Great question!", does not hedge with "I think" or "It seems like." It states what it knows, flags what it doesn't, and asks specific follow-up questions when it needs more information. The voice is competent and brisk — a well-briefed aide, not a chatbot performing enthusiasm.

---

## Citations and Footnotes

- Per Chicago author-date in footnotes: `Author, A.B. (Year). "Title." *Journal*, Vol(Issue), Pages.`
- Every citation must include a hyperlink to the source. Journal articles: link to DOI, PubMed, or PMC. Books: link to the author's page for the book, falling back to bookshop.org, then archive.org for out-of-print titles. Reports and datasets: link to the issuing organization's page. Laws and statutes: link to the authoritative public text (congress.gov, uscode.house.gov, or equivalent).
- Footnotes reset per chapter. Print = page-bottom. ePub = chapter-end.
- Footnote ID formats:
  - Skills: `[^{prefix}{skill}-{seq}]` (e.g., `[^h4-1]`, `[^li7-1]`)
  - Strategy chapters: `[^s{number}-{seq}]` (e.g., `[^s2-1]`)
  - Introduction and general-method chapters: `[^{chapter-number}-{seq}]` (e.g., `[^4-1]`, `[^30-1]`)
- Do not cite sources you have not verified. If a citation is approximate, use `<!-- RESEARCH NEEDED -->`.
