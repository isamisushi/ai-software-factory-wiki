# AI Software Factory Wiki

This wiki studies AI software factories: systems that use agents to build software. An agent is software that carries out tasks. The wiki compares open-source projects, services, and shared design patterns.

The website opens in English. Use the EN / JA links in the header to read the same page in English or Japanese.

## Explore the research

- [Cases](wiki/index.md): Research on projects, services, and organizations.
- [Concepts](wiki/concepts.md): Patterns that connect the cases.
- [Loops](wiki/loops/index.md): Separate diagrams for each repeated process.
- [Comparison](wiki/compare.md): The cases compared across the same topics.

## View the site locally

Run these commands from the repository directory:

```sh
npm install
npm run dev
```

Open the local URL that VitePress prints, usually `http://localhost:5173`.
The site runs locally. This repository does not publish it.
VitePress builds each language's sidebar from the `title` and `category` fields at the start of each page.

To build the site and find broken page links, run this command from the repository directory:

```sh
npm run build
```

## Coverage

| Cases | Concept pages |
| --- | --- |
| 10 | 28 |

## Files

```text
README.md        English home page
wiki/
  index.md       Case index
  concepts.md    Concept index
  compare.md     Comparison table
  cases/         One file per case
  concepts/      One file per pattern
  loops/         Loop diagrams for each case
ja/
  index.md       Japanese home page
  wiki/          Japanese copies of the research pages
templates/       Templates for new cases and concepts
```

Keep the same file names in both languages. The language switch uses these names to open the matching page.
When you add or update research, update both language versions. Keep the source links and evidence limits consistent.

## Research method

- For open-source cases, clone the source and read it directly. Treat articles and podcasts as claims, then compare those claims with the implementation.
- Support claims with file paths, commits, or URLs. Mark anything that the research does not establish as unconfirmed.
- Add patterns from case pages to the concept pages. Link the cases and concepts in both directions.

[CLAUDE.md](CLAUDE.md) contains the contributor instructions.
