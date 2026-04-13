The specification is the source of truth. Read the spec before writing content.

## Spec

The `spec/` directory defines how this book is written, illustrated, voiced, and structured. Every editorial decision — tone, references, illustrations, format — is specified there. Read the relevant spec before making changes:

- `spec/editorial/style-guide.md` — writing style rules: Chicago base, readability, terminology, numbers, punctuation, accessibility, citations and footnotes
- `spec/editorial/voice-and-audience.md` — project vision, reader persona, tonal guidelines
- `spec/editorial/editorial-conventions.md` — formatting rules, callout types, art briefs, episode references, entry anatomy
- `spec/editorial/principles.md` — "The Library and the Life" — what AI is and isn't
- `spec/editorial/cultural-references.md` — episode index and cultural reference sheet
- `spec/editorial/episode-index.md` — episode-to-strategy mapping
- `spec/editorial/roddenberry.md` — Star Trek thematic framework
- `spec/illustration/gem-illustration-instructions.md` — illustrator agent instructions
- `spec/illustration/cover-spec.md` — cover art brief
- `spec/architecture.md` — book structure and chapter organization

The spec is version-controlled. If the spec and the content disagree, fix one of them — do not leave them in conflict.

## Versioning

Semver. Draft status is `0.x.x`. Minor bumps for significant content or pipeline changes, patch bumps for fixes and small edits. `1.0.0` when the book ships. Tag every release: `git tag -a v0.x.x -m "description"`.

## Build

```bash
npm run build        # tsc + generate ePub
npm run build:check  # type-check only
npm test             # vitest
npm run clean        # rm dist/
```

CI runs on every push and PR to main (`.github/workflows/build.yml`): type-check, tests, ePub build. The built ePub is uploaded as an artifact.

## Project Structure

```
spec/                # All editorial, visual, and structural specifications
  editorial/         # Voice, conventions, principles, cultural references
  illustration/      # Illustrator agent instructions and art briefs
src/content/         # Djot chapter files (.dj) with YAML frontmatter
  00-introduction/   # Epigraph, Foreword, "How to Use", Chapters 1-4
  01-strategies/     # Strategy 0-9
  02-field-guide/    # Field Guide entries by domain
  03-general-method/ # Part Three chapters
  04-appendices/     # Appendices A-H + final note
src/styles/          # ePub CSS
src/images/          # Cover + chapter illustrations
build/               # TypeScript build pipeline
  filters/           # Djot filters (callouts, art-briefs, conversations, endnotes)
  epub/              # ePub 3.0 assembly (templates, jszip)
  embed-xmp.ts       # XMP metadata embedding utility
dist/                # Output (gitignored)
```

## Pipeline

Djot → `@djot/djot` parse → calloutFilter → artBriefFilter → conversationFilter → renderHTML (with epubOverrides for endnotes, sections, hr) → jszip ePub 3.0

## Djot Syntax

Content files use [Djot](https://djot.net) markup (`.dj` extension). Key differences from CommonMark:

- `_italic_` for emphasis (not `*italic*`)
- `*bold*` for strong (not `**bold**`)
- Smart typography is automatic: `"` → curly quotes, `---` → em-dash, `--` → en-dash, `...` → ellipsis

## Chapter Frontmatter

```yaml
---
title: "Chapter Title"
part: 0-4
order: 0-N
strategy: null | 0-9
status: "draft" | "stub"
---
```

## Art Brief Syntax

Art briefs are `.art.md` sidecar files that live next to the chapter they belong to. The filename (minus `.art.md`) is the image stem — the build looks for `{stem}.{format}` in `src/images/`.

**Sidecar file** (`src/content/.../image-name.art.md`):

```yaml
---
format: png
size: full | half-left | half-right | margin
alt: >
  Accessibility description for screen readers.
---

Production brief for the illustrator. This is the body of the file,
not a frontmatter field.
```

**Chapter reference** — an inline span. Without caption, the stem is the text content. With caption, the stem moves to an attribute and the caption becomes the text:

```djot
[image-name]{.art}

[_[Show:S1E1 "Title"](url), Year — Caption text._]{.art stem="image-name"}
```

Captions render as `<figcaption>` inside the `<figure>`. Inline markup (emphasis, links) is supported in captions.

**Image output** always goes to `src/images/`. The build resolves `[name]{.art}` by looking up the `.art.md` sidecar, then checking `src/images/{name}.{format}`. If the image exists and contains XMP metadata, the embedded `Iptc4xmpCore:AltTextAccessibility` is used for alt text. If the image does not exist, a placeholder box renders with the alt text and brief in an expandable `<details>` element.

**Missing art** — use `--generate` to invoke image generation for missing images:

```bash
npm run build -- --generate   # generate missing art, then build ePub
```

Embed XMP into produced images:

```bash
npx tsx build/embed-xmp.ts src/images/file.png --from src/content/path/to/file.art.md
```

## Callout Syntax

Six types, written as fenced divs: `::: science`, `::: tip`, `::: fairness`, `::: meme`, `::: spec`, `::: also`

```djot
::: science
Studies show this works.
:::
```

Each callout type has a hand-drawn notebook doodle icon (Cool S, Bohr atom, star, yin-yang, 3D cube, block arrow) that varies naturally across appearances.

## Conversation Syntax

Prompt and agent conversation blocks use fenced divs:

```djot
::: prompt
Help me understand this bill.
:::

::: agent
I can help with that. A few questions...
:::
```

## Episode Reference Format

`[Show:SxEy "Episode Title"](wikipedia-url), Year`
