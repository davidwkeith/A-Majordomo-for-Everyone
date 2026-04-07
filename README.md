# A Majordomo for Everyone

*Managing Your Personal Staff of AI Agents*

The billionaire class has always had a staff attorney, a bookkeeper, a chief of staff. The word for that person, in the old houses, was *majordomo* — the one who runs the household, reads the contracts, knows which bill to dispute and which to pay.

You now have something close to that, for free, on your phone.

This book is a practical guide to using AI agents to navigate the systems that govern your health, housing, money, and legal standing. It is *This Old House*, but for living in a capitalist society.

## Build

```bash
npm install
npm run build        # tsc + generate ePub
npm run build:check  # type-check only
npm test             # vitest
```

The output is `dist/a-majordomo-for-everyone.epub`.

## Illustrations

Art direction lives in `.art.md` sidecar files next to each chapter:

```
src/content/01-strategies/00-strategy-0-specify/
  index.md                        # chapter prose
  trinitron-s0-specify.art.md     # art brief (frontmatter + production brief)
```

The sidecar's filename determines the output image name. The frontmatter specifies `format`, `size`, and `alt` text; the body is the production brief for the illustrator.

```yaml
---
format: png
size: full
alt: >
  Accessibility description for screen readers.
---

Production brief for the illustrator.
```

Chapters reference art by stem name only:

```markdown
<!-- art: trinitron-s0-specify -->
```

Built images go in `src/images/`. If the image exists, the ePub renders a `<figure>`; if not, a placeholder box with the alt text and brief appears instead.

### Generating images

The build can generate missing images via two backends: **Gemini** (cloud, default) or **mflux** (local). Pass `--generate` to create missing images, and optionally `--max=N` to cap a run:

```bash
npm run build -- --generate          # generate all missing images
npm run build -- --generate --max=3  # generate up to 3
```

#### Cloud generation with Gemini (default)

Uses the [Gemini API](https://ai.google.dev/gemini-api/docs/image-generation) (`@google/genai`). The full style guide from `spec/illustration/gem-illustration-instructions.md` is prepended to each prompt. Gemini handles complex, multi-layered art briefs that diffusion models cannot interpret.

```bash
export GOOGLE_API_KEY=your-key-here
npm run build -- --generate
```

#### Local generation with mflux

Runs [FLUX.1-schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell) on Apple Silicon via [MLX](https://github.com/filipstrand/mflux). Fast 4-step generation, no API key needed. Best for simple, single-subject graphics (icons, silhouettes). Set `IMAGE_BACKEND=mflux` to use.

```bash
python -m venv .venv/mflux           # isolated env — avoid polluting system packages
source .venv/mflux/bin/activate
pip install mflux                    # one-time setup (~3.5 GB model download on first run)
IMAGE_BACKEND=mflux npm run build -- --generate
```

Set `MFLUX_MODEL=dev` and `MFLUX_STEPS=25` for higher quality at the cost of speed. The `dev` model is a [gated repo](https://huggingface.co/black-forest-labs/FLUX.1-dev) — accept the license on its Hugging Face page, then authenticate:

```bash
pip install huggingface_hub[hf_xet]  # if not already installed with mflux
hf login
```

#### Environment variables

| Variable | Purpose |
|---|---|
| `IMAGE_BACKEND` | `gemini` (default) or `mflux` |
| `MFLUX_MODEL` | FLUX model variant: `schnell` (default, fast) or `dev` (quality) |
| `MFLUX_STEPS` | Inference steps (default: `4` for schnell, use `25` for dev) |
| `GOOGLE_API_KEY` | Gemini API key (required for default backend) |
| `GEMINI_MODEL` | Override Gemini model (default: `gemini-2.5-flash-image`) |

Embed XMP metadata (alt text, brief, license) into a produced image:

```bash
npx tsx build/embed-xmp.ts src/images/file.png --from src/content/path/to/chapter/file.art.md
```

See `spec/illustration/gem-illustration-instructions.md` for the full visual style guide.

## Structure

The manuscript is CommonMark with YAML frontmatter. The spec is the source of truth:

```
spec/editorial/    # voice, conventions, principles, cultural references
spec/illustration/ # illustrator agent instructions, art briefs
src/content/       # chapters as directories (index.md + .art.md sidecars)
src/images/        # produced illustrations
build/             # TypeScript pipeline: CommonMark → ePub 3.0
```

## License

Copyright &copy; 2025 David W. Keith

Licensed under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/).

Not just free as in beer. Free as in speech.
