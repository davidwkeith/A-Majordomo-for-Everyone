This is a project to build an ePub from CommonMark. The specification for how the book is written and illustrated are in /spec/.

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
  00-introduction/   # Foreword, "How to Use", Chapters 1-4
  01-strategies/     # Strategy 0-9
  02-field-guide/    # Field Guide entries by domain
  03-general-method/ # Part Three chapters
  04-appendices/     # Appendices A-G + final note
src/styles/          # ePub CSS
src/images/          # Cover + chapter illustrations (TBD)
spec/                # SPEC.md split into reference docs
build/               # TypeScript build pipeline
  plugins/           # remark/rehype plugins (callouts, endnotes)
  epub/              # ePub 3.0 assembly (templates, jszip)
dist/                # Output (gitignored)
```

## Pipeline

CommonMark → remark-parse → remark-gfm → remarkCallouts → remark-rehype → rehypeEndnotes → rehype-stringify → jszip ePub 3.0

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

## Callout Syntax

Six types, written as blockquotes: `> **[SCIENCE]**`, `> **[TIP]**`, `> **[FAIRNESS]**`, `> **[MEME]**`, `> **[SPEC]**`, `> **[ALSO]**`
