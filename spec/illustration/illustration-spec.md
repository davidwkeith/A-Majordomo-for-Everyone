# Illustration Spec

This spec covers two categories of illustration: **chapter openers** (the Trinitron compositions, one per strategy chapter) and **inline graphics** (smaller drawings used throughout the text to illustrate concepts, objects, and moments).

---

## Inline Graphics

Small hand-drawn illustrations placed within the text flow. These appear throughout all parts of the book — in strategy chapters, field guide entries, and appendices — wherever a visual would clarify, compress, or humanize the content.

---

*Materials and style:*

The same hand as the chapter openers. #2 pencil (HB) for all structure and detail. Multi-color ballpoint pen for any color elements, using the same 8-bit palette approximation. The quality is the same: obsessive where the drawer cared, slightly loose elsewhere. Erasure ghosts present. The same kid, the same notebook, the same class.

**The critical difference: no notebook paper.** Inline graphics have no notebook paper, no blue lines, no red margin. The drawing is produced on a **plain white background** — the build pipeline removes white to create an alpha channel in post-processing. The final result is a transparent-background PNG that adapts to both light and dark reading modes.

This is a functional requirement, not an aesthetic choice. The ePub will be read in light mode and dark mode. A drawing on white paper becomes an unreadable white rectangle in dark mode. A drawing on transparent ground adapts to both.

---

*Production requirements:*

- **File format:** PNG. No JPEG (lossy compression damages detail). The image is generated on a plain white (#FFFFFF) background.
- **White-to-alpha post-processing:** The build pipeline converts white backgrounds to transparency. The area around and between pencil strokes becomes transparent after processing. The graphite strokes retain their natural opacity.
- **Pencil strokes:** Rendered with natural value variation. Heavier pressure = darker graphite. Lighter pressure = fainter. Ballpoint pen color is fully saturated where applied, sitting on top of the pencil work.
- **Anti-aliasing:** Smooth edges on all strokes. No hard pixel boundaries — the strokes should feel hand-drawn at any zoom level.
- **Resolution:** Minimum 300 DPI at rendered size. Inline graphics will typically render at 40-80% of text width.
- **Dark mode compatibility:** After white-to-alpha conversion, test every graphic against both #FFFFFF and #121212 backgrounds. If a graphic is illegible in either mode, adjust stroke opacity or add a minimal semi-transparent backing behind critical details only.

---

*What gets an inline graphic:*

Not everything. Inline graphics earn their placement the same way `[MEME]` sidebars earn theirs — by doing work that text alone cannot. A graphic that merely decorates is cut.

**Categories that warrant inline graphics:**

- **Objects the reader will interact with.** An EOB layout with callouts showing which fields matter. A lease page with the three clauses highlighted. A contractor bid with the line items annotated. These are functional graphics — the reader looks at the real document, then looks at the drawing, and understands the connection.

- **Process diagrams.** The specification interview loop drawn as a hand-sketched flow. The appeal escalation path — internal review → external review → state regulator — as a simple diagram with pencil arrows. The Five-Part Frame as a visual template. Hand-drawn, not software-generated. The wobble of the pencil line is part of the visual grammar.

- **Domestic objects drawn with the Trinitron's level of attention.** The chapter openers prove the drawer can render a TV in obsessive detail. Inline graphics extend this to the objects that define the book's world: a mailbox with a letter sticking out. A kitchen table with papers spread. A phone showing a Claude conversation. A stethoscope. A front door key. A rubber stamp. Each drawn with the same specificity and care as the Trinitron, but smaller, isolated, floating on nothing.

- **The Al Borland moment.** Small illustrations of the correct tool for the job, drawn in the style of a repair manual diagram that someone sketched from memory. A wrench at the correct angle. A multimeter with labeled probes. The right screwdriver for the right screw. These accompany the Diagnose strategy and Home domain entries.

- **Pixel art vignettes.** Small 8-bit scenes — not full Trinitron compositions, just the pixel art itself — for moments that reference specific episodes or cultural touchstones. Colored in ballpoint. No CRT physics (no barrel distortion, no scan lines). Just the image, on transparent ground. These are visual footnotes.

---

*Art briefs as sidecar files:*

Every graphic is specified in a `.art.md` sidecar file that lives next to the chapter it belongs to. The brief lives in the manuscript tree, not in a separate document. This keeps the art direction collocated with the text it illustrates and ensures that accessibility text is written by the author at the time of writing, not retrofitted later.

The filename (minus `.art.md`) is the **image stem** — the build resolves it to `src/images/{stem}.{format}`.

**Sidecar file** (`src/content/.../image-name.art.md`):

```yaml
---
format: png
size: full | half-left | half-right | margin
alt: >
  Plain-language description for screen readers. One to two sentences.
  What the image shows and what it communicates. Written for a reader
  who cannot see the image.
---

Production description for the illustrator or image generator.
As detailed as needed. Multiple sentences. Describes exactly what
to draw, in what style, with what emphasis. References the
materials spec (pencil, ballpoint, etc.) only when deviating
from the default.
```

**Chapter reference** — placed at the exact position where the image should render. Without caption, the stem is the text content. With caption, the stem moves to an attribute:

```djot
[image-name]{.art}

[_Caption text with inline markup._]{.art stem="image-name"}
```

**Frontmatter fields:**

- **format:** The image file extension (typically `png`). The build looks for `src/images/{stem}.{format}`. All images live flat in `src/images/` — no subdirectories.
- **size:** One of `full`, `half-left`, `half-right`, or `margin`. Maps to CSS classes in the stylesheet. Determines layout intent — the ePub reader may linearize, but the intent is preserved for renderers that support it.
- **alt:** The accessibility description. This becomes the `alt` attribute on the `<img>` element in the ePub. Written for screen reader users. Describes what the image *shows* and what it *means in context*. Not a restatement of the brief — the brief says what to draw; the alt says what the reader needs to know. Required. No image ships without alt text.

**Body:** The production brief. Describes exactly what to draw, with enough detail for a human illustrator or an image generation tool to produce the correct output. The brief is not included in ePub output — it exists only in the source.

**Rules:**

- One art brief per image. One image per brief.
- The `[stem]{.art}` reference appears in the chapter Djot at the exact location where the image should render. It is positional.
- If the image file exists and contains XMP metadata, the embedded `Iptc4xmpCore:AltTextAccessibility` is used for alt text (falling back to the sidecar's `alt` field).
- If the image file does not exist, the pipeline renders a placeholder box with the alt text and brief in an expandable `<details>` element.
- Alt text must be meaningful on its own. "An illustration" is not alt text. "A hand-drawn EOB form with three fields circled and annotated: Amount Billed, Allowed Amount, and Patient Responsibility" is alt text.
- The brief may reference the illustration spec's material and style conventions by exception only. "Colored in red and blue ballpoint instead of the default pencil" is useful. "Drawn in #2 pencil" is redundant — that is the default.

**Example — annotated document:**

Sidecar file `src/content/02-field-guide/01-health/eob-annotated.art.md`:

```yaml
---
format: png
size: full
alt: >
  A hand-drawn Explanation of Benefits form with three fields circled
  and annotated in plain language: Amount Billed, Allowed Amount, and
  Patient Responsibility.
---

EOB form rendered in light #2 pencil, slightly crumpled at the
top-right corner. Three fields circled in red ballpoint with
pencil arrows pointing to handwritten margin notes. Amount Billed
($4,200) annotated "what they charged." Allowed Amount ($1,800)
annotated "what insurance says it's worth." Patient Responsibility
($450) annotated "what you actually owe." The rest of the form is
rendered in lighter pencil, readable but de-emphasized. The margin
notes are in the same hand as the chapter opener drawings —
slightly cramped, slightly urgent.
```

Chapter reference in `src/content/02-field-guide/01-health/index.dj`:

```djot
The EOB arrives. It looks like a receipt but it is not a receipt. It is
an explanation of what happened to your money after the insurance company
finished deciding what your health is worth.

[eob-annotated]{.art}

Ask Claude to decode this. Paste the EOB. The three numbers that matter
are the ones circled above.
```

**Example — pixel art vignette:**

Sidecar file `src/content/00-introduction/03-chapter-01.../epigraph-ch1-picard.art.md`:

```yaml
---
format: png
size: margin
alt: >
  An 8-bit pixel art rendering of Captain Picard in his dress uniform,
  one hand raised, drawing the line.
---

Picard in 8-bit pixel art, approximately 32x48 pixels scaled up.
Standing pose, dress uniform from First Contact. One hand raised
in the "this far, no further" gesture. 4-color palette: uniform
dark grey, skin tone, command red piping, black. Colored in
ballpoint over pencil grid. No CRT effects. Transparent background.
```

**Build pipeline behavior:**

The build pipeline discovers all `.art.md` sidecar files at startup and builds a registry keyed by stem name. When rendering chapter Djot:

1. Matches `[stem]{.art}` spans (no caption) or `[_caption_]{.art stem="stem"}` spans (with caption).
2. Looks up the stem in the brief registry.
3. If `src/images/{stem}.{format}` exists: reads XMP metadata for alt text (falls back to sidecar alt), renders `<figure class="inline-graphic inline-graphic-{size}"><img ... alt="{alt}"/></figure>`. If a caption is present, appends `<figcaption>`.
4. If the image does not exist: renders a placeholder `<figure>` with a `<details>` element containing the alt text and brief.

Use `--generate` to invoke image generation for missing images: `npm run build -- --generate`.

---

*Sizing and placement:*

- **Full-width inline:** Spans the text column. Used for process diagrams and annotated document examples. Caption below in italic, same format as chapter openers.
- **Half-width inline:** Floats left or right, text wraps around it. Used for individual objects and small vignettes. No caption unless the object needs identification.
- **Margin note size:** Small enough to sit beside a paragraph. Used for pixel art vignettes and single-object drawings. Sized to match the text's line height when possible.

In ePub, float positioning is advisory — some readers will linearize. All inline graphics must make sense as block-level elements stacked between paragraphs, even if the intended layout is a float.

---

*Legal basis:*

Same as chapter openers. All original artwork. Objects depicted are generic or are technical illustrations of real products (which is protected). No identifiable people. No reproduced screenshots or photographs.

---

## Chapter Opener Illustrations

Each strategy chapter (0 through 9) opens with a full-width original illustration using a consistent three-layer visual format across all ten chapters.

---

*Layer 1: The Notebook Page*

Standard American college-ruled notebook paper. Blue horizontal lines. No vertical margin line — the red margin line appears only on the cover, where it serves as an alignment element for the title and telephone pole. Chapter openers omit it to reduce visual complexity. No paper edges visible — the paper extends beyond all four sides of the frame. The paper is the background, not an object placed on a background.

**The paper is at an angle.** Unique per chapter. Rotated so the blue lines run diagonally. The angle is determined by the primary action direction in the pixel art on screen — the lines of the paper extend and continue the compositional vectors of the image. See the paper angle reference table in the Cover Art Spec. No two chapters share the same angle. Illustrator maps all eleven simultaneously before finalizing any.

Faint #2 pencil construction lines visible beneath the main pencil drawing. This drawing was made during a class that was not about this.

---

*Layer 2: The Sony Trinitron CRT Television, drawn in too much detail*

On the notebook page: a hand-drawn Sony Trinitron CRT television, rendered with obsessive technical accuracy. Not a sketch. The drawing a Gen-X kid made during a boring class because they knew every millimeter of this object by heart. The level of detail is slightly unhinged.

**The Trinitron specifically — reference points for the artist:**

- *Screen geometry:* Flatter than most CRTs, with characteristic edge curvature. The aperture grille produces two faint horizontal stabilizer wires visible across the screen — hair-thin dark lines, one near the top third and one near the bottom third. These must be present. They are the Trinitron's fingerprint.
- *Cabinet:* Late-80s / early-90s Sony grey-beige. Forward lean to the cabinet. Ventilation slots on sides and back, each one rendered individually. Sony logo on the front bezel, carefully lettered.
- *Controls:* Channel and volume knobs or buttons on the front panel. The small red standby LED. The infrared receiver window.
- *The remote:* A Sony remote control on top of the TV, rendered with the same obsessive detail. Every button labeled. Battery compartment visible on the bottom.
- *Cables:* Coaxial cable from the back, power cord, both trailing off the edge of the notebook page.
- *Back panel (partially visible):* Ventilation slots, FCC compliance sticker, model number plate, ground screw.
- *Rabbit ears (optional, model-dependent):* At a characteristic asymmetric angle.

Drawn in #2 pencil (HB), consistent pressure, no color fill. The quality of a technical illustration done freehand by someone who has stared at this object for thousands of hours. Erasure ghosts acceptable — the slightly wrong line visible beneath the corrected one. This is the material of thinking, not presentation.

---

**The obsession zone — one per chapter:**

Each chapter's Trinitron is fully rendered. But in every chapter, one specific part of the television becomes the zone where the pencil got lost — where the drawer kept adding detail beyond what was necessary, beyond what was asked for, into the territory of genuine fixation. The rest of the TV is complete. This part is excessive.

The obsession zone shifts with every chapter. No two chapters share the same zone. Across the full set of ten illustrations, every major component of the Trinitron gets its moment of over-rendering.

The zone is never explained or labeled. It is simply there — denser, more worked, more present than everything around it. The reader who looks at all ten illustrations will feel the shift before they consciously register it.

**Obsession zone by chapter — and why:**

*Strategy 0: Specify — the remote control*
Every button on the Sony remote is labeled in tiny, precise pencil lettering. INPUT SELECT. CHANNEL UP/DOWN. SLEEP TIMER. PIC. The remote is a specification document for the television — it tells the TV exactly what to do, in what sequence, and the TV executes. George needed a remote for his concept. He had no remote.

*Strategy 1: Decode — the aperture grille wires*
The two horizontal stabilizer wires across the screen are rendered as if the drawer used a straightedge and a 4H pencil, making them ruler-precise across the full width of the screen — impossibly thin, impossibly even. The pixel art behind them is visible through the wires. Decoding is looking through the medium that distorts what you're seeing, finding what's actually there.

*Strategy 2: Prepare — the front panel controls*
Every button on the front panel is labeled. The channel selector. The volume. The input selector. The menu. Each button has its function lettered in the same tiny, precise hand. Preparation is knowing which buttons exist before you need them. Tim walked into the hospital with no buttons mapped.

*Strategy 3: Draft — the speaker grill*
The woven mesh of the speaker grill is rendered in obsessive crosshatch — every intersection of the fabric, every small rectangular opening, every shadow between threads. The speaker grill is where the voice comes out. Murphy Brown could not get her voice out. The grill is fully rendered. The page behind Murphy's typewriter is blank.

*Strategy 4: Navigate — the coaxial input on the back panel*
The F-connector coaxial input is drawn in near-engineering-diagram detail: the center pin, the outer collar, the threading on the connector, the cable's braid visible at the cut end, the signal path implied. Navigation is finding the correct input and connecting to it in the right sequence. Kramer did not connect correctly. He just watched.

*Strategy 5: Decide — the back panel adjustment knobs*
The brightness, contrast, color, tint, and sharpness adjustment controls on the rear panel — the knobs that nobody touched except when something was visibly wrong — are drawn with each graduation mark on the dial face, each pointer position, each label. The decision variables. Ross was adjusting the wrong knobs.

*Strategy 6: Diagnose — the ventilation slots*
The ventilation slots on the side panel are drawn slot by slot — each one an individual rectangle, evenly spaced, with the faint shadow of the interior visible through each opening. The slots are what lets you see that something is happening inside without opening the case. Diagnosis is looking at the symptoms before applying power. Tim skipped this step every time.

*Strategy 7: Research — the model number and compliance plate*
The small metal plate on the back of the TV — model number, serial number, FCC ID, UL listing mark, power consumption rating, country of manufacture — is drawn in full, each character rendered, each regulatory mark accurate. Research is finding out exactly what you have before you commit. The Conners did not read the plate.

*Strategy 8: Assert — the Sony logo on the front bezel*
The Sony logotype on the front of the cabinet is drawn letter by letter with the precision of someone who has traced corporate lettering a hundred times — the specific proportions of each letterform, the slight optical adjustments, the exact weight. The logo is the assertion of identity. Who made this. Who owns it. The assertion is only as good as your ability to specify exactly what you own.

*Strategy 9: Create — the screen corners*
The four corners where the CRT's curvature meets the cabinet bezel are drawn with the attention of someone who has spent a long time looking at where the screen ends and the world begins. The rubber gasket. The slight gap. The shadow. The place where the image is always slightly compressed, slightly distorted by the curve. The boundary between the story and the frame. Moriarty could not see the corners of his world. The drawer drew them anyway.

---

*Layer 3: The 8-bit pixel art scene, on screen*

The TV screen displays the iconic episode scene in 8-bit pixel art — the visual language of the era's other dominant screen medium.

**Pixel art specifications:**
- Resolution aesthetic: approximately 160x144 (Game Boy) or 256x224 (SNES). Visible individual pixels, large enough to read the scene, unmistakably 8-bit.
- Color palette: 4 to 16 colors maximum. Flat fills, no gradients, era-appropriate.
- Characters recognizable by silhouette and context. Not facial detail.
- Scene: the moment of maximum irony from the anchor episode — the precise frame just before or during the disaster.

**CRT physics applied to the pixel art:**
- *Barrel distortion:* The screen image is warped by the curve of the CRT glass. Strongest at corners and edges, image bending slightly inward at the sides.
- *Interlace scan lines:* Alternating rows of full and slightly-dimmed pixels across the entire screen. The horizontal line pattern of a CRT in operation. Subtle but present. Running across the pixel art.
- *Aperture grille wires:* The Trinitron's two stabilizer wires cross the screen image as faint horizontal dark lines.
- *Corner vignette:* Slight darkening at screen corners.
- *Phosphor glow (optional):* Faint bloom around the screen edge.

**Color relationship between layers:**
- Notebook page and TV drawing: #2 pencil on white/cream paper, graphite gray, no fill.
- TV screen: the only source of color in the entire illustration — the ballpoint pen 8-bit palette approximations against the monochrome pencil drawing.
- This contrast is intentional and load-bearing: the screen is where the color lives, as it was in the actual experience of watching television in a 90s living room. Everything outside the screen is the gray of pencil on paper. The screen is lit.

---

*Dimensions:*

Full text width. Aspect ratio determined by the Trinitron's natural proportions — the 4:3 screen inside the cabinet, plus cabinet, plus remote on top, plus cables. The illustration will be taller than a standard 4:3 image.

*Caption format:* Italic, below illustration:
*[Show], "[Episode title]" ([Year]) — [One sentence: what's about to go wrong, and why it didn't have to.]*

*Placement:* After chapter title and strategy tagline, before episode summary. TV first. Pixel art primes the recognition. Caption names the episode. Summary confirms the irony. Strategy follows.

---

*Legal basis:*

Original artwork throughout. The Trinitron is a technical illustration of a real object. The pixel art scenes are original illustrations inspired by the episodes — not reproductions or screenshots. Characters depicted in 8-bit abstraction recognizable by context and silhouette, not photorealistic likeness. Commentary and homage.

---

*Why this works:*

The Trinitron is the Gen-X domestic altar — the object around which the household organized itself for fifteen years. Drawing it in #2 pencil with obsessive detail on notebook paper is the exact gesture a bored, attentive Gen-X kid would make in class. The same kid who is now an adult managing a household and navigating systems not designed for them.

The 8-bit pixel art colored in ballpoint puts the episode scene in the grammar of the era's other screen medium — the video game aesthetic that shared the living room with the Trinitron. Scene as TV show and video game simultaneously: the two dominant screen experiences of Gen-X adolescence, collapsed into one image, colored by hand with the pen that was always in the drawer.

The CRT physics — barrel warp, interlace lines, aperture grille wires — are the physical signature of how this generation actually watched television. Not a simulation of nostalgia. A technical record.

The college-ruled paper — blue lines, red margin — is the most specific material detail in the entire spec. Not graph. Not blank. Not any other kind. The exact paper that was on every desk in every classroom this generation sat in. The red margin is a line that said: stay inside here. The blue lines are a grid that said: stay on this. The illustrations break both rules, constantly, at angles that serve the image rather than the paper.

The paper angle as compositional bridge is the system that makes the whole book cohere. Every illustration is kinetic. Every page turn moves in a slightly different direction. The blue lines are not just texture — they are vectors connecting the pencil-drawn Trinitron to the ballpoint pixel art on its screen, the notebook drawing to the television image, the reader's world to the world on the screen. The lines run through everything.
