# AI Software Factory Wiki

This wiki collects research on AI software factories.
Write the default pages in plain English under `README.md` and `wiki/`.
Keep matching Japanese pages under `ja/index.md` and `ja/wiki/`.
Use the same file names, facts, evidence links, and explicit anchor IDs in both languages.
Update both versions when research changes.

## Add a case

1. For open-source projects, clone the source into a temporary research directory.
   Read the source directly.
   Start with CLAUDE.md, AGENTS.md, `.claude/skills/`, CI configuration, review prompts, and CONTRIBUTING.
   CI runs automated tests and other tasks after changes.
2. Measure project activity through merged pull requests and commit authorship.
   A pull request proposes code changes for review.
   With GitHub CLI authentication available, use `gh search prs --repo <repo> --merged --merged-at ">=<date>"`.
   Read the `Co-authored-by` entries in commit messages.
3. Create `wiki/cases/<slug>.md` from `templates/case.md`.
   A slug is the short name used in a path.
   Include the research date and the commit that you studied.
4. If you find a new pattern, create `wiki/concepts/<slug>.md` from `templates/concept.md`.
   If the pattern already exists, add a row to its table of case implementations.
   Update its `seen_in` field.
5. Draw the repeated processes in `wiki/loops/<slug>.md`.
   Follow the rules under “Loop diagrams” below.
6. Update `wiki/index.md`, the case column in `wiki/concepts.md`, and the coverage counts in `README.md`.
   Add the case to `wiki/compare.md`.
   Apply the same changes to the matching Japanese pages.

## Loop diagrams

- Use Mermaid `flowchart` diagrams.
  Draw one loop per diagram.
  A loop repeats work until a condition ends it.
- For a nested loop, use a reference box such as `[["Loop X: Name"]]:::loopref`.
  Explain that loop in a separate diagram.
- Start each page with a map that shows loop names and relationships.
  Add a table with the repeated unit, evaluation and return destination, and exit condition.
  Distinguish containment, execution order, and feedback.
  Draw nested relationships only when evidence supports them.
- Distinguish the overall workflow, repeated execution, and repair loops that change the process after evaluation.
  If the researcher chose the loop names or divisions, state this explicitly.
- Separate conditions enforced by code, written instructions, inferences, and unconfirmed behavior.
  Investigate stop conditions and limits on attempts and cost.
  If evidence does not establish a limit, leave it unconfirmed.
- If source comments conflict with the implementation, use the implementation as evidence.
  Link evidence to the specific commit that you studied.
- Below each nested loop reference, add a Markdown link to its diagram.
  Give headings stable IDs, such as `{#loop-b}`.
- Follow the color legend in `wiki/loops/index.md`.
  Use `:::human` for human decisions.
  Use hexagons, `{{"..."}}:::gate`, for automated conditions that control progress.
  Use dotted arrows, `-.->`, for returns to earlier steps.
- Split long labels with `<br/>`.
  After drawing, make sure that the browser shows all label text without clipping.

## Local preview and publication

Run `npm run dev` from the repository directory to preview the site.
GitHub Actions builds and publishes the site to GitHub Pages after each push to `main`.

The `.vitepress/config.mjs` file builds sidebars from page metadata in `wiki/cases/`, `wiki/concepts/`, and `wiki/loops/`.
Page metadata appears between `---` lines at the start of each file.
Use one of these values for the `category` field in each language:

| English | Japanese |
| --- | --- |
| Input | 入力 |
| Process | プロセス |
| Verification | 検証 |
| Safety | 安全性 |
| Architecture | アーキテクチャ |
| Operations | 運用 |

After adding pages, run `npm run build` from the repository directory.
Make sure that the build reports no broken page links.

## Writing rules

- Support claims with file paths or URLs.
  If evidence does not establish a fact, mark it as unconfirmed.
- Label company figures, such as reported token savings, as company claims.
- Use lowercase English letters and hyphens in slugs.
  Use relative links so that readers can follow them on GitHub.
