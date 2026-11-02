---
title: Superpowers
kind: case
org: Prime Radiant
people: [Jesse Vincent, Drew Ritter]
type: [product, dogfooding]
source: oss
license: MIT
repo: https://github.com/obra/superpowers
investigated_at: 2026-10-29
investigated_commit: 2ce8aa1
concepts:
  - workflow-bootstrap-injection
  - fresh-context-subagents
  - bounded-fix-loop
  - progress-ledger
  - skills-as-tested-code
  - human-checkpoints
  - adversarial-review
  - closed-contribution
  - fix-the-machine
  - isolated-workspace
---

# Superpowers (Prime Radiant / obra)

[← Cases](../index.md) · [Loop diagrams](../loops/superpowers.md)

Research date: 2026-10-29. Target commit: `obra/superpowers@2ce8aa1` (2026-10-21, release v7.0.1 on `main`). The research only compared differences on `dev` at `b58deb3`, 317 commits ahead of `main`, as discussed below.

Concepts: [Workflow bootstrap injection](../concepts/workflow-bootstrap-injection.md) · [Fresh-context sub-agents](../concepts/fresh-context-subagents.md) · [Bounded fix loop](../concepts/bounded-fix-loop.md) · [Progress ledger](../concepts/progress-ledger.md) · [Skills as tested code](../concepts/skills-as-tested-code.md) · [Human checkpoints](../concepts/human-checkpoints.md) · [Adversarial review](../concepts/adversarial-review.md) · [Input control](../concepts/closed-contribution.md) · [Fix the machine](../concepts/fix-the-machine.md) · [Isolated workspace](../concepts/isolated-workspace.md)

## Summary

Superpowers supplies a factory inside one developer's agent session. Its plugin adds design, planning, implementation, review, and integration stages. Unlike Swamp, it does not install a production line across repository, CI, and server gates. Most stages follow skill instructions rather than CI or server enforcement.

The main workflow is `subagent-driven-development` (SDD). A controller gives each plan task to a new sub-agent with fresh context. A separate reviewer judges specification compliance and quality for each task. Failures enter a repair loop of at most five rounds. A file ledger stores progress for resumption after context compression.

Humans approve the design, review the plan, choose the execution method, and choose the final integration method. Other instructions tell the agent to continue, decide uncertain matters, and record its rulings. Superpowers also develops itself with Superpowers. Its design documents live in `docs/superpowers/specs/`.

The project treats skills as code that controls behavior. Changes require pressure tests with sub-agents and real-agent evaluation in the separate Quorum lab. Most enforcement remains in prompts. Code covers only selected controls, such as startup injection, review-diff range tests, and Native completion records after successful tests.

## 1. Organization and people

| Item | Detail |
| --- | --- |
| Organization | Prime Radiant, named in the README Community section. Commercial support is available. |
| Main people | Jesse Vincent, `obra`, authored 145 of the latest 200 commits. Drew Ritter followed with 41. |
| Publication | Repository creation and [release announcement](https://blog.fsck.com/2025/10/09/superpowers/) occurred on 2025-10-09. |
| Scale | About 308,000 stars and 27,000 forks, retrieved with `gh repo view` on 2026-10-29. |
| License | MIT. |
| Distribution | Official Claude Code and Codex marketplaces, plus more than ten harnesses. These include Cursor, Gemini CLI, Copilot CLI, OpenCode, Pi, Kimi, Hermes, and Muse. [README](https://github.com/obra/superpowers/blob/2ce8aa1/README.md) |

## 2. Product overview

The README describes a complete development method for coding agents. Composable skills and initial instructions tell agents to use that method. The [basic workflow](https://github.com/obra/superpowers/blob/2ce8aa1/README.md) is:

1. `brainstorming` gathers intent, writes a design, and obtains approval before construction.
2. `using-git-worktrees` creates an isolated checkout and establishes baseline test results.
3. `writing-plans` divides implementation into tasks of two to five minutes.
4. `subagent-driven-development` or `executing-plans` executes the plan.
5. `test-driven-development` uses RED-GREEN-REFACTOR during implementation.
6. `requesting-code-review` requests review and classifies findings by severity.
7. `finishing-a-development-branch` tests the result, asks the human to choose merge, PR, or retention, and cleans up the worktree.

Other skills include `systematic-debugging`, `verification-before-completion`, `receiving-code-review`, `dispatching-parallel-agents`, `writing-skills`, and `diagnosing-superpowers`. The `skills/` directory contains 15 skills. The README claims that hours of autonomous work without plan deviation are common. It does not describe a measurement method for that company claim.

## 3. Factory design from source code

```text
hooks/session-start              Injects using-superpowers at session start
skills/using-superpowers/        Rules for calling relevant skills
skills/brainstorming/            Intent, design, builder check, HARD-GATE
skills/writing-plans/            Global Constraints, Review Focus, Interfaces
skills/subagent-driven-development/
  SKILL.md                      Controller procedures and task loop
  implementer-prompt.md          Implementation sub-agent template
  task-reviewer-prompt.md        Specification and quality review template
  re-review-prompt.md            Scoped review after repairs
  references/                   preflight / fix-loop / final-review / resuming
  scripts/                      sdd-workspace / task-brief / review-package
skills/executing-plans/          One-context execution and tested completion
  scripts/                      task-start / task-done
skills/writing-skills/           TDD and pressure tests for skills
AGENTS.md / PULL_REQUEST_TEMPLATE.md   Requirements for agent-written PRs
tests/                          Plugin infrastructure tests, including claude -p
docs/superpowers/specs/          Designs produced through brainstorming
```

There is no `.github/workflows/`. This repository has no CI. Maintainers run tests and skill evaluations locally.

### 3.1 Startup hooks establish the workflow entry point

`hooks/hooks.json` runs [`hooks/session-start`](https://github.com/obra/superpowers/blob/2ce8aa1/hooks/session-start#L41) on `SessionStart` events: startup, clear, and compact. It injects all of `using-superpowers` inside `<EXTREMELY_IMPORTANT>`. Instructions require skill invocation before questions or code exploration if there is even a 1% chance of relevance. A Red Flags table lists excuses that agents use to avoid this. [using-superpowers line 11](https://github.com/obra/superpowers/blob/2ce8aa1/skills/using-superpowers/SKILL.md#L11)

AGENTS.md defines an acceptance test for a real harness integration. In a clean session, `Let's make a react todo list` must automatically start `brainstorming` before code work. Copying skill files alone is insufficient. The startup hook supplies the workflow entry point. [AGENTS.md line 84](https://github.com/obra/superpowers/blob/2ce8aa1/AGENTS.md#L84)

### 3.2 Design waits for approval

`brainstorming` gathers intent, presents two or three approaches, writes a design, and prohibits implementation before human approval. This is its [HARD-GATE](https://github.com/obra/superpowers/blob/2ce8aa1/skills/brainstorming/SKILL.md#L247). A fully specified request, such as changing an icon to cornflower blue, can proceed directly. If the human declines questions, the skill and its gate end.

For project-sized work, the design is committed to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`. Before human review, a fresh sub-agent asks whether this document alone supports a plan. Its builder check divides questions into already answered, agent-decided, and human-only groups. The agent asks the human-only questions once.

### 3.3 Plans state decisions that implementers cannot infer

`writing-plans` assumes that the implementer has never seen the codebase or specification. [writing-plans](https://github.com/obra/superpowers/blob/2ce8aa1/skills/writing-plans/SKILL.md) requires these elements:

- Spec links the plan to the specification, which travels with it. Global Constraints repeats shared values such as versions and names. Review Focus identifies five likely troublesome inputs or failures omitted by the specification and assigns tests to tasks.
- Each task names files and Interfaces: what it receives from earlier tasks and passes onward. Its steps cover a failing test, observed failure, minimal implementation, observed success, and commit.
- Self-review compares plan length with the specification to detect plans that merely copy implementation code.
- The human reviews the completed plan and chooses Subagent-driven or Native execution in the same session. [Execution handoff](https://github.com/obra/superpowers/blob/2ce8aa1/skills/writing-plans/SKILL.md#L179)

### 3.4 Controllers and disposable sub-agents

In SDD, the main agent acts only as a controller. [SKILL.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md) divides roles as follows:

| Role | Work | Context |
| --- | --- | --- |
| Controller | Assigns tasks, requests reviews, records progress, and makes rulings. It does not repair code itself. | Whole plan and dependencies between tasks. |
| Implementer | Implements, tests, commits, reviews its own work, and writes a report. It cannot spawn sub-agents. | Task text from `task-brief`, previous Interfaces, and rulings. |
| Task reviewer | Reads diff files once and returns specification status (✅/❌/⚠️) plus quality (Approved / Needs fixes). It is read-only. | Brief, report, and diff from `review-package`. |
| Final reviewer | Reviews the whole branch with the strongest available model. | Full branch diff and deferred ledger items. |

Several rules control cost and judgment:

- Reviewers treat implementer reports as unproven claims. Explanations such as omitting work for YAGNI are still self-assessment. [Reviewer prompt line 64](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/task-reviewer-prompt.md#L64)
- Files carry task text, diffs, and reports. Controllers do not paste them into their own context or copy earlier task summaries into later tasks. One recorded session contained 42,000 characters, 99% of which were pasted history.
- Model selection follows the role. Fully specified implementation uses the cheapest model, integration and judgment use a standard model, and final review uses the strongest. Explicit selection avoids inheriting an expensive session model. [Model selection](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md#L139)
- Controllers do not ask humans between tasks. Four stop cases remain: irreversible actions, security-sensitive actions, effects outside the worktree, and a broken plan that leaves only guesses. External effects include merge, shared-branch push, and publication. Otherwise, the controller records a ruling, reason, and cost if wrong, then continues. [Stop rules](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md#L27)
- Implementers do not run in parallel because their changes can conflict.

Native `executing-plans` uses one context and skips task-level reviews. At the end, it launches one fresh reviewer with the strongest model if sub-agents are available. Otherwise, it performs a separate self-review and records that limit in the ledger and final report. The implementer repairs Critical/Important findings in one pass. Each repair follows RED→GREEN and the full test suite. Further review is prohibited. This differs from SDD final review. [Final review](https://github.com/obra/superpowers/blob/2ce8aa1/skills/executing-plans/SKILL.md#L234)

### 3.5 Evaluation and repair loops

Task review usually enters repair for specification failure, Critical/Important findings, or established warnings. Findings that conflict with the plan first receive a controller ruling based on the specification. The controller records that ruling before repair. Minor findings become deferred ledger items for final review. [Fix-loop line 14](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/references/fix-loop.md#L14)

One repair round contains one repair and one scoped review. The maximum is five rounds. Rounds one through three resume the original implementer. Rounds four and five use a fresh implementer with a model one level stronger. Review covers only the repair diff and original findings. Repeated full reviews can produce endless new findings. After round five, the controller records a justified deferral or the smallest decision needed to continue. [fix-loop.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/references/fix-loop.md#L21)

SDD final review sends all findings to one repair sub-agent, then permits one scoped review. There is no second repair wave. The controller rules on remaining findings. The final message lists every `Ruling:` line under “Rulings I made.” [final-review.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/references/final-review.md#L17)

`verification-before-completion` forbids completion claims without fresh evidence. Another agent's success report is insufficient. Instructions require inspection of the version-control diff. [Iron Law](https://github.com/obra/superpowers/blob/2ce8aa1/skills/verification-before-completion/SKILL.md#L14)

The TDD skill says to delete and rewrite production code written before a failing test. TDD means tests precede implementation. However, the implementer template makes it conditional on the task requesting TDD. [TDD line 31](https://github.com/obra/superpowers/blob/2ce8aa1/skills/test-driven-development/SKILL.md#L31)

After three failed repairs, debugging instructions require questioning the architecture rather than another local hypothesis. [systematic-debugging line 195](https://github.com/obra/superpowers/blob/2ce8aa1/skills/systematic-debugging/SKILL.md#L195)

The controller LLM judges SDD review prose. No script extracts a machine verdict like Swamp's `VERDICT: pass`. Native test-based completion uses `task-done`, described next.

### 3.6 State lives in a ledger and Git

The instructions describe a controller that lost its place after compression and repeated an entire completed task sequence. They call this the most expensive observed failure. Conversation memory does not reliably survive compression. [SKILL.md line 108](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md#L108)

The state controls are:

- `scripts/sdd-workspace` creates `.superpowers/sdd/<plan>/` for `progress.md`, briefs, reports, and review diffs. The first ledger line identifies the plan path. The script also adds `.gitignore` to exclude this workspace from Git.
- The ledger records completion, repair rounds, deferrals, and rulings. An example is `Task N: complete (commits a..b, review clean)`. After compression, instructions prioritize the ledger and `git log` over memory.
- `review-package` exits with code 3 if BASE is not a HEAD ancestor or the range is empty. It still accepts a nonempty ancestral `HEAD~1`, so it does not prove whole-task coverage. Correct use requires the BASE saved at task start. [Lines 27–28](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/scripts/review-package#L27)
- Native [`scripts/task-done`](https://github.com/obra/superpowers/blob/2ce8aa1/skills/executing-plans/scripts/task-done#L39) runs the supplied test command and appends completion only after success. Failure saves a log and exits without completion. Code enforces this branch when the script runs. Suitable tests, script use, and avoiding direct ledger edits still depend on instructions.

### 3.7 Humans choose integration

`finishing-a-development-branch` stops if any test fails. Otherwise, it offers local merge, push and PR, or keeping the work unchanged. It waits for a human choice. Discarding work requires an explicit human request. After local merge, it reruns tests and retains the worktree if they fail. [Step 4](https://github.com/obra/superpowers/blob/2ce8aa1/skills/finishing-a-development-branch/SKILL.md#L53)

### 3.8 Superpowers develops itself

External PRs face strict conditions. [AGENTS.md](https://github.com/obra/superpowers/blob/2ce8aa1/AGENTS.md) requires model, harness, version, and complete plugin disclosure. A human must write a summary of at most 200 words, read the whole diff, investigate duplicates, and describe a real problem. Agent fixes for another person's issue require a maintainer request. PRs target `dev`, not `main`.

Skill changes require evaluation because skills shape behavior like code. `writing-skills` uses RED without the skill, GREEN with it, and REFACTOR to close new excuses. PRs include before/after results. Tuned wording, Red Flags tables, rationalizations, and “your human partner” require evidence before changes.

The separate [prime-radiant-inc/superpowers-evals](https://github.com/prime-radiant-inc/superpowers-evals) repository was at `e64684c` during research. Quorum runs real CLIs such as Claude Code, Codex, and Gemini. A QA agent, Gauntlet, converses like a user. Hidden acceptance criteria and programmed post-run tests score results. There are 95 scenarios. For example, `code-review-catches-planted-bugs` tests whether a reviewer flags planted SQL injection as Critical/Important and refuses merge approval.

Some suites compare Superpowers with `superpowers: none`. Live evaluations disable agent permission prompts, so trusted maintainers run them locally or on dedicated appliances rather than public CI. This restriction is part of the evaluation workflow.

Design records include a 2026-07-15 repair-loop redesign described as approved and brainstormed with Jesse. A 2026-07-06 workspace evaluation used five Sonnet sub-agents per group with manual scoring of all responses. The five-round limit is explicitly “Jesse's judgment,” based on observed endless review loops. Branches such as `codex/...`, `fix/2081-...`, and `exp/loop-econ-r` suggest agent work and cost experiments. Operational details remain unknown.

## 4. Public claims and supporting evidence

| Claim | Implementation | Assessment |
| --- | --- | --- |
| Skills start automatically without special user actions | SessionStart injects `using-superpowers` and invocation rules. | Hooks support this in compatible harnesses. Models still decide invocation. Quorum triggering scenarios measure it. |
| Hours of autonomous work without plan deviation are common | Continue-without-pausing rules, four stop cases, rulings, and resumption procedures exist. | The mechanism exists, but the repository gives no measured duration or deviation rate. This is a company claim. |
| PR rejection rate is 94% | On 2026-10-29, search returned 223 merged, 965 closed unmerged, and 176 open PRs. About 81% of closed PRs were unmerged. | Counts depend on period and scope. Merged counts include maintainer PRs. The 94% is a company claim. |
| Critical issues stop progress | SDD usually repairs them, but plan conflicts receive prior rulings and unresolved findings can be deferred after five rounds. | Stopping is not unconditional. Rulings can permit continuation and must appear in the final human handoff. |
| Tests precede code, and earlier code is deleted | The skill instructs this. The implementer template conditions TDD on task instructions. | Enforcement is procedural. Reports and review assess TDD evidence. |

## 5. Analysis

Swamp places gates across repositories, CI, and servers. Superpowers brings portable stages into developer sessions. It has no server merge gate or tamper-resistant records. Local range tests and Native completion scripts add controls, but their use depends on instructions. These designs operate at different layers.

Except for hooks and selected scripts, prompts enforce the method. Red Flags and Rationalizations tables, pressure tests, and Quorum measure whether that wording works. Treating skill wording as tested code is central to quality control.

Fresh sub-agents, file handoffs, model selection, scoped reviews, and one final repair wave also address time and token costs. Recorded observations include final-review repairs costing more than all tasks combined. Quorum includes `cost-*` scenarios.

Human involvement concentrates at design and plan approval, then integration. During execution, the agent proceeds and later exposes its rulings. Humans can revisit those decisions. Shared ideas with Swamp include human plan approval, state outside conversations, skill evaluation, and repairs to the factory after recurring failures. Swamp uses tessl and promptfoo, while Superpowers uses Quorum.

## 6. Open questions

The research leaves these items open:

- `dev`, 317 commits ahead of `main`, was not fully read. `git diff --stat main origin/dev -- skills hooks AGENTS.md` showed three changed hook files and no skill changes. The remaining changes appeared to concern tests and documents, but were not fully reviewed.
- Actual Quorum pass rates, with/without differences, and costs. The contents of `results/` and dashboards were not examined.
- Adherence to repair and final-review limits in real sessions, including evaluation coverage of those limits.
- Skill-level token or monetary limits are absent. Quorum's README describes campaign attempt, duration, and reserve limits, not monetary thresholds. That implementation remains unexamined.
- The relationship between the public version and `superpowers-private`, named in ABOUT.md as an evaluation target.
- Prime Radiant's organization, funding, and commercial services.
- Since 2026-09-29, there were 18 merged PRs, 17 by obra, including releases and merges into `dev`. There were 92 created PRs: 55 open and 19 closed unmerged. `dev` had 43 commits, including 20 co-authored by Claude Fable 5.1 and eight by Muse Spark. These counts do not measure autonomy or quality.

## Sources

The original research used:

- https://github.com/obra/superpowers at `2ce8aa1`. Only differences were examined for `dev` at `b58deb3`.
- https://github.com/prime-radiant-inc/superpowers-evals at `e64684c`: README, ABOUT.md, and `scenarios/`.
- [Superpowers release announcement, 2025-10-09](https://blog.fsck.com/2025/10/09/superpowers/), linked from the README. The research did not read its body.
- `gh search prs --repo obra/superpowers --merged --merged-at ">=2026-09-29"`, `--created ">=2026-09-29"`, and GitHub searches `is:pr is:merged`, `is:closed is:unmerged`, and `is:open`, run on 2026-10-29.
- Authors and `Co-Authored-By` fields from `git log origin/dev --since=2026-09-29`.
