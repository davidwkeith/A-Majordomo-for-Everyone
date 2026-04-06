---
title: "Online Presence"
part: 2
order: 10
strategy: null
status: "draft"
---

### ONLINE PRESENCE

*The internet was built on a promise: anyone could publish, anyone could read, anyone could connect — no permission required. For a decade or so, it delivered. Then the platforms arrived, and the open web was enclosed like common land in the English countryside — fenced, monetized, and rented back to the people who built it. The billionaire class maintained their own domains, their own servers, their own archives. Everyone else got a profile page on someone else's property, governed by someone else's algorithm, deletable at someone else's discretion. The entries that follow are about reclaiming what was always yours: your words, your identity, and your corner of the web.*

> **[MEME]** The internet was supposed to be [Geocities](https://en.wikipedia.org/wiki/GeoCities) — everyone's weird, personal, hand-built page. Then it became five apps owned by three companies. The [IndieWeb](https://en.wikipedia.org/wiki/IndieWeb) is Geocities with better tools and the same energy: your site, your words, your corner of the internet. The '90s promised us this. We are collecting on that promise.

---

#### Computer Literacy

- Picking an OS
- Buying devices
- Learning an App or digital skill like design
- Vibe coding scripts
- Learning Agentic Engineering

#### WB-1: Building Your Own Website with Your Agent
**Strategy:** Create + Navigate
**See also:** WB-3: Writing in CommonMark (for writing your content), WB-4: Joining the IndieWeb (for connecting to the broader web)
**The Majordomo says:** *The billionaire class has always had a web presence managed by professionals. The rest of us got Facebook pages and LinkedIn profiles — land we rent on platforms that can change the terms, throttle the reach, or disappear the content at any time. Owning your own website is the digital equivalent of owning your home instead of renting it. It has always been possible. It has not always been this easy.*
**The spec:**
```
I want to build my own personal website. I have never done this before.
I want it to be simple, fast, and mine — not hosted on someone else's
platform where they control what I can say and who sees it.
Please walk me through the process from the beginning:
1. What do I need to get started? (domain, hosting, tools)
2. What will my site look like when it's done?
3. How do I put content on it?
4. How do I make it findable on the web?
5. What will it cost me, and what should I never pay for?
Keep it simple. I want something I can maintain myself.
```
**What to do with the output:** Follow the steps. Your first site does not have to be perfect. It has to exist. You can improve it every week for the rest of your life — and unlike a social media profile, every improvement accrues to something you own. A static site (plain HTML files, no database, no server-side code) is the simplest, fastest, cheapest, and most durable option. It is also the greenest — a static site uses a fraction of the energy of a WordPress installation because there is nothing to compute, only files to serve.

> **[SCIENCE]** The environmental cost of the internet is non-trivial — data centers account for roughly 1-1.5% of global electricity use (IEA, 2024). A static website served from a green host produces orders of magnitude less carbon per page view than a dynamic site running on a cloud server that spins up computation for every visitor. The [Green Web Foundation](https://www.thegreenwebfoundation.org/) maintains a directory of verified green hosts.[^wb1-1]

> **[TIP]** *"I already have a site on [Squarespace / Wix / WordPress.com] but I want to own it outright. How do I export my content and move to something I control?"* — Migration is almost always possible. The sooner you do it, the less content you have to move.

> **[ALSO]** Checking current information requires web search, which is free in Gemini, ChatGPT, and Copilot. In Claude, web search requires the paid tier. See [Appendix G](06-appendix-g-feature-table.xhtml).

<!-- RESEARCH NEEDED: Hosting cost comparison for personal sites. A static site on Netlify or Cloudflare Pages is free for most personal use. A custom domain costs $10-15/year. The total annual cost of owning your web presence is less than one month of most streaming subscriptions. This comparison is useful for the reader who assumes "building a website" is expensive or technical. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): The class dimension of web ownership. Having your own domain is correlated with education and technical literacy, which are correlated with income. The IndieWeb movement is predominantly white, male, and technical — which is both a demographic fact and a design challenge. The tools are getting simpler. The entry should make this feel achievable for the reader who has never opened a text editor. -->

[^wb1-1]: International Energy Agency. (2024). "Data Centres and Data Transmission Networks." IEA Tracking Report. See also The Green Web Foundation, [thegreenwebfoundation.org](https://www.thegreenwebfoundation.org/).

---

#### WB-2: Reading Without the Algorithm
**Strategy:** Research + Navigate
**See also:** Li-11: Escaping Social Media (for reducing compulsive consumption), WB-4: Joining the IndieWeb
**The Majordomo says:** *Before the algorithm, there was RSS — a protocol that let you subscribe to any website and receive its updates in a single reader, in chronological order, with no ads, no ranking, no engagement optimization, and no company deciding what you should see next. RSS still works. It never stopped working. The platforms just stopped promoting it because a protocol that gives users control does not generate advertising revenue.*
**The spec:**
```
I want to read the web on my own terms — without algorithms
deciding what I see and without social media feeds.
My interests: [list topics, publications, or writers you follow]
Please help me:
1. Understand what RSS is and how it works — in plain language
2. Recommend a feed reader that's simple to use
3. Find the RSS feeds for the websites and writers I already follow
4. Suggest how to discover new sources outside of
   social media recommendations
5. Show me how to use my AI Agent to curate and summarize
   what I'm reading — a daily briefing that I control
```
**What to do with the output:** Set up a feed reader and add ten sources. That is your starting library. Within a week, you will notice a change: you are reading what you chose, not what an algorithm chose for you. The difference in signal quality — and in how you feel afterward — is immediate and measurable.

**Common reading Expert Role specs:**
```
Act as my research librarian. Here are the topics I care about:
[list]. Find me the best independent sources — blogs, newsletters,
journals — that cover these topics with depth, not engagement bait.
Give me their RSS feeds if they have them.
```
```
I subscribe to [X] feeds and I can't keep up. Help me build
a system: which feeds should I read daily, which weekly,
and which should you summarize for me? Prioritize original
reporting over aggregation.
```

> **[MEME]** The algorithm shows you what keeps you scrolling. An RSS feed shows you what you asked to see. One of these is a library. The other is a slot machine. You have been using the slot machine. The library is still open.

> **[SCIENCE]** Pariser's *The Filter Bubble* (2011) documented how algorithmic curation narrows exposure to diverse viewpoints — a finding that has only strengthened as recommendation systems have become more sophisticated. Bakshy et al. (2015) in *Science* found that Facebook's algorithm reduced exposure to ideologically cross-cutting content by 5-8% beyond users' own choices. The effect is small per interaction but compounds over years of daily use.[^wb2-1]

<!-- RESEARCH NEEDED: RSS reader landscape. Feedly, Inoreader, NetNewsWire (free, open source, Mac/iOS), Miniflux (self-hosted). The market is small but healthy. The tools are better than they were in Google Reader's era. The challenge is discovery — how do you find feeds when the platforms have hidden them? Browser extensions, RSSHub, and your Agent can all help. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): Information diet as class marker. The wealthy and educated have always curated their information sources — subscribing to specific journals, hiring researchers, maintaining professional networks. Algorithmic feeds are the information equivalent of fast food: engineered for consumption, not nutrition. RSS is the home-cooked meal. The analogy to H-8 (Wellness and Nutrition Coach) is direct and worth drawing. -->

[^wb2-1]: Bakshy, E., Messing, S., & Adamic, L.A. (2015). "Exposure to ideologically diverse news and opinion on Facebook." *Science*, 348(6239), 1130–1132.

---

#### WB-3: Writing in CommonMark
**Strategy:** Decode + Draft
**See also:** WB-1: Building Your Own Website, WB-5: Blogging and Journaling
**The Majordomo says:** *[CommonMark](https://commonmark.org/) is the universal language of AI the way English is the universal language of air traffic control — not because it is the best, but because everyone agreed on it and it works. It is plain text with a few symbols that mean things. You can learn the whole language in ten minutes. This book was written in it. Your Agent thinks in it. When you write in CommonMark, you are writing in the lingua franca of every AI system on the market — which means your Agent can process, format, and transform your writing using fewer tokens and with greater precision than any other format.*
**The spec:**
```
I want to learn CommonMark so I can write content for my website
and communicate more effectively with my AI Agent.
I have never used any kind of markup language before.
Please teach me the basics I need to write a blog post:
headings, paragraphs, links, images, bold, italic, lists, and quotes.
Show me examples I can copy and modify.
Then show me the one thing that makes CommonMark more powerful
than any word processor: links.
```
**What to do with the output:** Write your first post in CommonMark. Do not worry about getting the syntax perfect — your Agent will correct you. The point is to start writing in a format that is portable, future-proof, and readable by every tool you will ever use.

<!-- art
file: commonmark-side-by-side.png
size: full
alt: A CommonMark document on the left showing plain text with formatting symbols, and the rendered output on the right showing headings, bold text, a bulleted list, and a hyperlink
brief: Split-panel illustration, left side shows plain text in a monospaced font on a light gray background with CommonMark syntax visible (# heading, **bold**, - list items, [link text](url)), right side shows the same content rendered as a formatted document with a serif heading, bold text, bullet points, and a blue underlined link, thin vertical divider between panels, clean flat style, transparent background
-->

Links are the key innovation. [Tim Berners-Lee](https://en.wikipedia.org/wiki/Tim_Berners-Lee) built the web on a single idea: any document can reference any other document, anywhere, with a click. That is what a link is. Every link you write is a citation, a recommendation, a connection, a vote of confidence. A blog post with good links is a contribution to the web's knowledge graph. A blog post without links is a dead end. Link generously.

> **[TIP]** *"Convert this Word document / Google Doc into clean CommonMark. Preserve the headings, lists, and bold text. Remove all formatting that doesn't translate."* — Your Agent is the best format converter you will ever use.

> **[SCIENCE]** Formatting is not decoration — it is cognition. Research on document design consistently shows that structured text (headings, lists, whitespace) improves comprehension by 25-40% compared to undifferentiated prose (Schriver, 1997). When you format your writing in CommonMark, you are not making it pretty. You are making it readable. The formatting is the thinking made visible.[^wb3-1]

<!-- RESEARCH NEEDED: CommonMark adoption. CommonMark is used by GitHub, GitLab, Reddit, Stack Overflow, Discourse, and most AI systems. The specification (commonmark.org) is maintained as an open standard. The distinction from "Markdown" (which has dozens of incompatible variants) is that CommonMark is a single, unambiguous specification. This matters because it means your content is portable — what you write today will render correctly everywhere, forever. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): The power of links as a democratic act. In the pre-web era, citation was gatekept by publishers, editors, and academic institutions. The hyperlink democratized citation. Anyone can reference anyone. This is the web's most underappreciated feature and the one most threatened by platforms that trap content behind walls. Every link you create is a small act of web citizenship — you are connecting knowledge that was previously isolated. Ward Cunningham (inventor of the wiki) and Tim Berners-Lee both identified the link as the web's fundamental unit of value. -->

[^wb3-1]: Schriver, K.A. (1997). *Dynamics in Document Design.* John Wiley & Sons. The research on structured text and comprehension is extensive and consistent across both print and digital contexts.

---

#### WB-4: Joining the IndieWeb
**Strategy:** Navigate + Research
**See also:** WB-1: Building Your Own Website, WB-5: Blogging and Journaling, Li-11: Escaping Social Media
**The Majordomo says:** *The [IndieWeb](https://indieweb.org/) is a movement of people who believe you should own your content, control your identity, and be able to move your stuff between services without asking permission. It is the web the way it was designed to work before the platforms captured it. Joining is not a political act, though it feels like one. It is a practical one: publish on your own site first, syndicate to the platforms second, and never lose your words because a company pivoted.*
**The spec:**
```
I have my own website. I want to connect it to the broader web
without giving up control of my content.
Please explain:
1. What is the IndieWeb and what are its core principles?
2. What is POSSE (Publish on your Own Site, Syndicate Elsewhere)
   and how do I set it up?
3. What is Webmention and how do conversations work
   across independent websites?
4. How do I make my site discoverable to others
   without relying on social media algorithms?
5. What are the easiest first steps — what can I do this weekend?
```
**What to do with the output:** Start with [POSSE](https://indieweb.org/POSSE). Write on your site first. Syndicate to the platforms. Your words live where you put them, not where a company decided to put them. The platforms become distribution channels, not homes. If Twitter disappears tomorrow — as it effectively did — your content survives because it was never really there. It was always on your site.

> **[MEME]** [*Starfleet's Computer*](https://en.wikipedia.org/wiki/Library_computer) did not store its logs on a Ferengi-owned server with terms of service that changed quarterly. Your Captain's Log belongs on your own ship.

> **[SCIENCE]** The web was designed as a decentralized system — [RFC 2616](https://en.wikipedia.org/wiki/HTTP) (HTTP), [RFC 3986](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier) (URIs), and HTML all assume independent servers communicating as peers. The centralization that followed was not a technical inevitability but an economic one — network effects and venture capital concentrated users on platforms. The [ActivityPub](https://en.wikipedia.org/wiki/ActivityPub) protocol (W3C, 2018) and the Fediverse represent the first large-scale technical effort to reverse this centralization. Mastodon, the most visible implementation, reached 10 million registered users by 2023.[^wb4-1]

<!-- RESEARCH NEEDED: IndieWeb adoption data. IndieWebCamp events have been running since 2011. The movement is small but disproportionately influential — many of its participants are the same people who built the protocols the web runs on. Tantek Çelik (CSS co-editor), Aaron Parecki (OAuth co-editor), and others who write the standards also practice IndieWeb principles. The tools are getting more accessible but the movement still skews technical. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): The nostalgia for the early web is real and documented. "Digital gardens," personal wikis, and hand-coded sites are experiencing a renaissance among people who remember what the web felt like before the platforms. This is not just sentimentality — it is a design preference for a web that prioritized expression over engagement. The reader who remembers Geocities, LiveJournal, or early Blogger is the reader who knows what they lost. The reader who doesn't remember it is the reader who might be surprised by what's possible. -->

[^wb4-1]: W3C. (2018). "ActivityPub." W3C Recommendation, 23 January 2018. Mastodon user data from Mastodon project statistics, 2023.

---

#### WB-5: Blogging and Journaling
**Strategy:** Create + Draft
**See also:** WB-3: Writing in CommonMark, WB-4: Joining the IndieWeb, Li-8: Wellness Coach (journaling as mental health practice)
**The Majordomo says:** *Every sitcom family had a room where the real conversations happened. For the [Conners](https://en.wikipedia.org/wiki/Roseanne) it was the kitchen table. For the [Seinfelds](https://en.wikipedia.org/wiki/Seinfeld) it was the apartment. For the [Simpsons](https://en.wikipedia.org/wiki/The_Simpsons) it was the couch. A blog is that room — except you built it yourself, you own the walls, and nobody can cancel the show. A journal is the same room with the door closed. Both are acts of thinking in public or in private, and both are more valuable than you think.*
**The spec:**
```
I want to start [blogging publicly / journaling privately / both].
My situation:
— What I care about: [topics, interests, professional expertise]
— What holds me back: [don't know what to write / feel self-conscious /
   don't think anyone will read it / not sure I have anything to say /
   tried before and stopped]
— What I want to get out of it: [clarify my thinking / build an audience /
   document my life / professional visibility / creative outlet]
Please help me:
1. Figure out what I should write about — based on what I know,
   not what's trending
2. Develop a realistic publishing cadence I'll actually maintain
3. Draft my first post — something I can publish today
4. Tell me honestly: does anyone actually read blogs anymore?
```
**What to do with the output:** Publish the first post. It does not need to be good. The act of publishing — putting your thinking where others can find it — is the point. Captain's Log, Star Date today. Every blog post is a contribution to the public record of how people think, what they know, and what they care about. Your ideas matter, even when you are echoing what others say, because your particular combination of experience and perspective is unique. That is not a platitude. It is information theory.

Letters to the editor used to require an editor's approval. Now, if you own your domain, you can speak your mind — back it up with research, or don't. Make jokes that only one in a thousand will understand. Find that community. The one-in-a-thousand is the point. The internet has enough people that one-in-a-thousand is still a room full of people who get the joke.

> **[SCIENCE]** Pennebaker's expressive writing research (1986, replicated extensively) shows measurable immune function improvement from writing about difficult experiences for 15-20 minutes over 3-4 days. The mechanism is not fully understood — possibly narrative coherence, possibly emotional processing, possibly both. Journaling is one of the cheapest, most accessible, most evidence-backed interventions in psychology.[^wb5-1]

> **[TIP]** *"I want to blog about [topic] but I'm not an expert. Help me write a post that shares what I've learned so far, with links to the sources I'm drawing from, and frames it as 'here's what I found' rather than 'here's the truth.'"* — The internet has enough experts. It needs more honest learners.

> **[FAIRNESS]** Accessible formats matter. Not everyone reads. Video, audio, images, and writing are all valid ways to share ideas. YouTube is blogging in video. A podcast is blogging in audio. Instagram was blogging in images before it became a shopping mall. If you are more comfortable speaking than writing, record yourself and let your Agent transcribe and edit it into a post. The medium is yours to choose.

**Licensing your work:**

When you publish online, you decide how your ideas can be shared, remixed, and built upon. [Creative Commons](https://creativecommons.org/) licenses let you specify this in a way that is legally enforceable and machine-readable. This book uses [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — anyone can share and adapt it, as long as they credit the author and share under the same terms. Ethically built AI systems respect these licenses. That is a line they must not cross. Your Agent can help you choose a license: *"Explain the Creative Commons license options. I want people to share my work but I want credit. Which license should I use?"*

<!-- RESEARCH NEEDED: Blogging statistics. WordPress powers approximately 43% of all websites (W3Techs, 2024). Substack has 35+ million subscribers. Blog readership is not declining — it has migrated from RSS readers to newsletters, social sharing, and search. The form is alive; the distribution changed. The reader who thinks "no one reads blogs" is wrong — they are thinking of the 2005 distribution model, not the 2025 one. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): The psychology of public writing. The fear of publishing is universal and specific: fear of judgment, fear of being wrong, fear of the permanent record. Elbow (1973, "Writing Without Teachers") identified the core tension: writing is thinking, and thinking in public is vulnerable. The rise of "digital gardens" — personal sites explicitly framed as works-in-progress rather than finished products — is a design response to this fear. The entry should normalize imperfection and frame blogging as practice, not performance. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): The value of writing that no one reads. Research on reflective practice (Schön, 1983, "The Reflective Practitioner") shows that the act of articulating experience transforms understanding — whether or not anyone else sees it. Journaling, blogging into the void, writing for an audience of zero: all of these produce cognitive benefits for the writer. The audience is a bonus, not the point. -->

[^wb5-1]: Pennebaker, J.W. & Beall, S.K. (1986). "Confronting a traumatic event: Toward an understanding of inhibition and disease." *Journal of Abnormal Psychology*, 95(3), 274–281.

---

#### WB-6: Preservation and Legacy
**Strategy:** Research + Navigate
**See also:** WB-1: Building Your Own Website (owning vs. renting), H-7: Preparing for End-of-Life Conversations (the analog equivalent)
**The Majordomo says:** *The [Library of Alexandria](https://en.wikipedia.org/wiki/Library_of_Alexandria) burned. The Dead Sea Scrolls survived in clay jars for two thousand years. MySpace lost 50 million songs in a server migration. [GeoCities](https://en.wikipedia.org/wiki/GeoCities) was deleted by Yahoo in 2009. The lesson is consistent across millennia: what survives is what someone deliberately chose to preserve. The internet remembers everything and nothing — everything that someone archived, nothing that was left on a platform that shut down, pivoted, or lost a database.*
**The spec:**
```
I want to make sure my online work — writing, photos, creative
projects — survives beyond any single platform or service.
My situation: [I have years of content on social media /
I have a website I want to preserve / I want to plan
for what happens to my digital life when I'm gone /
I just want to understand how web preservation works]
Please help me:
1. Understand what Archive.org is and how to use it
   to preserve my site and others I care about
2. Export and back up my content from [platforms I use]
3. Choose a domain name that will serve me for decades —
   what makes a good permanent identity online?
4. Plan for digital legacy — what happens to my accounts
   and content after I die?
```
**What to do with the output:** Submit your website to the [Wayback Machine](https://web.archive.org/) today. It takes thirty seconds. Then export your content from every platform you use — most offer a data export buried in their settings. Store the exports somewhere you control. The domain you choose is your handle, your identity, the name you are known by online. Pick it as carefully as you would a pen name — it is the digital equivalent, and it can outlast you.

> **[SCIENCE]** The [Internet Archive](https://archive.org/) has preserved over 835 billion web pages since 1996. It is a nonprofit, donation-funded, and legally contested — publishers have sued to limit its digital lending library. It is also the single most important preservation project in the history of human knowledge, because the web it archives was never designed to be permanent.[^wb6-1]

> **[MEME]** Most people today do not associate the name [Anne Hathaway](https://en.wikipedia.org/wiki/Anne_Hathaway) with [Shakespeare's wife](https://en.wikipedia.org/wiki/Anne_Hathaway_(wife_of_Shakespeare)). Names get reused. Identities shift. In the Gilded Age, some overdressed elite probably had the name as the answer to a parlor game question. We have not forgotten the historical figure — it is just a detail, not a daily confusion. Your domain name works the same way. It is a handle, somewhere between rented and owned, and it is how the future finds you.

<!-- RESEARCH NEEDED: Digital estate planning. Most platform terms of service address account death poorly or not at all. Facebook has "legacy contacts." Google has "Inactive Account Manager." Apple has "Digital Legacy." The patchwork is predictable. A comprehensive digital estate plan should include: account inventory, password manager access for executor, platform-specific legacy settings, and explicit instructions in a will. This is Li-4 (Planning Care for Aging) applied to the digital world. -->

<!-- RESEARCH NEEDED (HUMAN CONDITION): The grief of digital loss — lost photos, deleted accounts, inaccessible archives — is underresearched but universal. The person who lost years of blog posts when a platform shut down experienced a form of archival grief. The person who cannot access a deceased loved one's photos because they are locked behind a platform login is experiencing the digital version of a locked filing cabinet with no key. The entry should frame preservation as a form of care — for your future self and for the people who will want to find you after you are gone. -->

<!-- RESEARCH NEEDED: Link rot and content decay. Zittrain et al. (2021, Harvard/NYT study) found that 25% of links in New York Times articles from 1996 to 2019 are broken. The Supreme Court's opinions fare even worse. The web is not permanent by default. It is permanent only by effort. Your own site, preserved in the Wayback Machine, is more durable than a link to a social media post. -->

[^wb6-1]: Internet Archive. [archive.org](https://archive.org/). Founded 1996 by Brewster Kahle. As of 2024, the Wayback Machine contains over 835 billion archived web pages.