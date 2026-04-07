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

## Structure

The manuscript is CommonMark with YAML frontmatter. The spec is the source of truth:

```
spec/editorial/    # voice, conventions, principles, cultural references
spec/illustration/ # illustrator agent instructions, cover brief
src/content/       # chapter files organized by part
build/             # TypeScript pipeline: CommonMark → ePub 3.0
```

## License

Copyright &copy; 2025 David W. Keith

Licensed under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/).

Not just free as in beer. Free as in speech.
