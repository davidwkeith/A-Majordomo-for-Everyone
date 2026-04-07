The specification is the source of truth. Read the spec before writing content.

## Spec

The `spec/` directory defines how this book is written, illustrated, voiced, and structured. Every editorial decision — tone, references, illustrations, format — is specified there. Read the relevant spec before making changes:

- `spec/voice-and-audience.md` — project vision, reader persona, tonal guidelines
- `spec/editorial-conventions.md` — formatting rules, callout types, art briefs, citation format
- `spec/principles.md` — "The Library and the Life" — what AI is and isn't
- `spec/illustration/gem-illustration-instructions.md` — illustrator agent instructions
- `spec/illustration/cover-spec.md` — cover art brief
- `spec/cultural-references.md` — episode index and cultural reference sheet
- `spec/architecture.md` — book structure and chapter organization

The spec is version-controlled. If the spec and the content disagree, fix one of them — do not leave them in conflict.

## Build

```bash
npm run build        # tsc + generate ePub
npm run build:check  # type-check only
npm test             # vitest
npm run clean        # rm dist/
```

## Project Structure

```
src/content/         # CommonMark chapter files with YAML frontmatter
  00-introduction/   # Epigraph, Foreword, "How to Use", Chapters 1-4
  01-strategies/     # Strategy 0-9
  02-field-guide/    # Field Guide entries by domain
  03-general-method/ # Part Three chapters
  04-appendices/     # Appendices A-H + final note
src/styles/          # ePub CSS
src/images/          # Cover + chapter illustrations
spec/                # All editorial, visual, and structural specifications
spec/illustration/   # Illustrator agent instructions and art briefs
build/               # TypeScript build pipeline
  plugins/           # remark/rehype plugins (callouts, art-briefs, endnotes)
  epub/              # ePub 3.0 assembly (templates, jszip)
  embed-xmp.ts       # XMP metadata embedding utility
dist/                # Output (gitignored)
```

## Pipeline

CommonMark → remark-parse → remark-gfm → remarkCallouts → remarkArtBriefs → remark-rehype → rehypeEndnotes → rehype-stringify → jszip ePub 3.0

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

```markdown
<!-- art
file: image-name.png
size: full | half-left | half-right | margin
alt: Accessibility description for screen readers.
brief: Production instruction for the illustrator.
-->
```

Art direction is permanent — comments stay in the source after the image is produced. If the image exists, it renders. If not, a red-dashed placeholder box appears.

## Callout Syntax

Six types, written as blockquotes: `> **[SCIENCE]**`, `> **[TIP]**`, `> **[FAIRNESS]**`, `> **[MEME]**`, `> **[SPEC]**`, `> **[ALSO]**`

## Episode Reference Format

`[Show:SxEy "Episode Title"](wikipedia-url), Year`
