---
title: Symphony
kind: case
org: OpenAI
people: [Alex Kotliarskyi]
type: [product, dogfooding]
source: oss
license: Apache-2.0
repo: https://github.com/openai/symphony
investigated_at: 2026-10-29
investigated_commit: be10a1b
concepts:
  - tracker-as-control-plane
  - spec-as-product
  - host-side-agent-tools
  - isolated-workspace
  - human-checkpoints
  - progress-ledger
  - issue-lifecycle-state-machine
  - deterministic-loop-calls-llm
  - bounded-fix-loop
  - closed-contribution
  - adversarial-review
---

# Symphony (OpenAI)

[← Cases](../index.md) · [Loop diagrams](../loops/symphony.md)

Research date: 2026-10-29. Target commit: `openai/symphony@be10a1b` (2026-09-15).

Concepts: [Tracker as control plane](../concepts/tracker-as-control-plane.md) · [Specification as product](../concepts/spec-as-product.md) · [Host-side agent tools](../concepts/host-side-agent-tools.md) · [Isolated workspace](../concepts/isolated-workspace.md) · [Human checkpoints](../concepts/human-checkpoints.md) · [Progress ledger](../concepts/progress-ledger.md) · [Issue lifecycle state machine](../concepts/issue-lifecycle-state-machine.md) · [Deterministic loop calls an LLM](../concepts/deterministic-loop-calls-llm.md) · [Bounded fix loop](../concepts/bounded-fix-loop.md) · [Input control](../concepts/closed-contribution.md) · [Adversarial review](../concepts/adversarial-review.md)

## Summary

Symphony is a persistent service that watches issue trackers such as Linear. It repeatedly starts Codex in a separate working directory for each issue. OpenAI describes humans managing work through board cards instead of monitoring agent sessions.

The main deliverable is the language-independent `SPEC.md`, with 2,312 lines. The README's first recommended use is giving this specification to a preferred coding agent for implementation in a chosen language. An experimental Elixir reference implementation is included.

Programmed orchestration reads the tracker and decides launch, continuation, retry, and stop. Agents handle ticket transitions, comments, PRs, review feedback, and merge through `WORKFLOW.md` and skills. Humans move `Backlog → Todo` to start work. They move `Human Review → Merging` to approve it or choose `Rework` to reject it.

Most quality conditions are procedural instructions. Examples include green tests before Human Review and resolved CI/review issues before merge. Code enforces workspace boundaries, active/terminal dispatch rules, turn limits, and timeouts.

Activity is separate from quality and autonomy. There were 64 merged PRs from February through September 2026. Of these, 22 carried the `symphony` label requested by WORKFLOW.md. The last commit was 2026-09-15, about six weeks before the research date.

## 1. Organization and people

| Item | Detail |
| --- | --- |
| Organization | OpenAI. |
| Main author | Alex Kotliarskyi, GitHub `frantic-openai`. He authored 34 of 47 main commits and 50 of 64 merged PRs. |
| Publication | Repository creation: 2026-02-26. Official article: 2026-04-28, according to secondary reporting. |
| License | Apache-2.0. |
| Positioning | The README calls it a “low-key engineering preview for testing in trusted environments.” Secondary reporting says OpenAI positions it as a reference implementation rather than a separately maintained product. |
| Prerequisite | The README says it works best with codebases that adopt [harness engineering](https://openai.com/index/harness-engineering/). It presents Symphony as the next stage. |

The official article at https://openai.com/index/open-source-codex-orchestration-symphony/ returned HTTP 403 during research. Its body was unavailable. The research used secondary reporting such as [Help Net Security](https://www.helpnetsecurity.com/2026/04/28/openai-symphony-codex-orchestration-linear/) for its contents.

## 2. Product overview

The [README](https://github.com/openai/symphony/blob/be10a1b/README.md) and [SPEC section 1](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L16) describe a long-running service. It reads tracker work, creates issue-specific directories, and runs coding-agent sessions inside them. Four problems guide the design: repeatable execution, issue isolation, repository-owned workflow policy, and visibility into concurrent agents.

The service replaces manual issue scripts with a daemon. `WORKFLOW.md` stores policy beside code under version control. Observability supports operation and debugging of several agents at once. Symphony schedules, runs, and reads the tracker. Agents write tickets through host-side tools. A successful run can end at a handoff state such as `Human Review`, rather than `Done`.

Non-goals include a rich web UI, a general workflow engine, built-in ticket or PR policy, and mandatory strong sandboxing. Elixir adapters support Linear, GitHub Issues, GitLab, Jira Cloud, and Asana under `elixir/lib/symphony_elixir/*/adapter.ex`. An extension also launches remote workers over SSH. [SPEC appendix A](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L2252)

## 3. Factory design from source code

```text
SPEC.md                          Language-independent specification and implementation checklist
elixir/                          Elixir/OTP reference implementation
  WORKFLOW.md                    Configuration and prompt for this repository's development
  AGENTS.md                      Rules for agents that edit the Elixir implementation
  lib/symphony_elixir/orchestrator.ex   Polling, launch, retry, reconciliation (1,990 lines)
  lib/symphony_elixir/agent_runner.ex   One issue's worker and turn continuation
  lib/symphony_elixir/codex/app_server.ex  JSON-RPC and approval handling
  lib/symphony_elixir/workspace.ex      Issue directories and hooks
  lib/mix/tasks/pr_body.check.ex        PR body template validation
.codex/skills/                   linear, commit, push, pull, land, debug, release
  land/land_watch.py             Watches review comments, CI, and head updates
.github/workflows/
  make-all.yml                   format / lint / coverage / dialyzer (make all)
  pr-description-lint.yml        PR body format rules
```

### 3.1 Programmed coordination and prompted policy

The SPEC separates layers. The Policy layer in `WORKFLOW.md` owns team-specific ticket processing, evaluation, and handoff rules. The Coordination layer owns polling, dispatch eligibility, concurrency, retries, and reconciliation. [Section 3.2](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L118)

| Decision | Code behavior | Evidence |
| --- | --- | --- |
| Dispatch | Requires an active, nonterminal state, adapter `dispatchable=true`, all required labels, no running/reserved worker, and free capacity. | [SPEC section 8.2](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L754) |
| Linear `dispatchable` | Must match the assignee filter, including `me`. `Todo` issues cannot have unfinished blockers. | [linear/client.ex line 496](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/linear/client.ex#L496) |
| Priority | Ascending priority 1–4, then oldest creation date, then identifier. | [SPEC section 8.2](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L771) |
| Concurrency | `max_concurrent_agents` defaults to 10. Per-state limits are available. | [SPEC section 8.3](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L777) |
| Reconciliation | Every tick rereads running issues. Terminal state stops work and deletes its directory. Nonactive state stops work but retains the directory. | [orchestrator.ex line 421](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L421) |
| Turn continuation | Each completed turn rereads the issue. Active issues continue in the same thread, up to `max_turns`, default 20. | [agent_runner.ex line 101](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/agent_runner.ex#L101) |
| Retry | Successful completion schedules continuation after one second. Failure or stalling uses `10 seconds × 2^(n-1)`, capped by `max_retry_backoff_ms`, default five minutes. | [orchestrator.ex line 1232](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L1232) |
| Stalling | No event for `stall_timeout_ms`, default five minutes, stops the worker and schedules retry. | [orchestrator.ex line 608](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L608) |

Neither the SPEC nor implementation caps retry count. While an issue stays active, restarts continue with at most five-minute backoff. A tracker-state change by a human or another actor stops this cycle. Configuration has no cost limit. Token totals support observation, but the inspected code does not stop on them. [SPEC section 13.5](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1419)

Elixir adds behavior beyond the SPEC. If an agent stops for human input or approval, it enters `blocked` without retry. It does not restart until the tracker state becomes nonactive or terminal. [orchestrator.ex line 757](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L757)

After service restart, recovery uses the tracker and filesystem. Retry timers and running sessions are not restored. The orchestrator has no persistent database of its own. [SPEC section 14.3](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1690)

### 3.2 Repository-owned WORKFLOW.md

`WORKFLOW.md` combines YAML frontmatter configuration with a Liquid-compatible prompt. Changes apply to subsequent launches without restarting the service. Invalid updates retain the last valid configuration instead of crashing the service. Unknown template variables cause errors. [SPEC section 6.2](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L560)

This repository's [elixir/WORKFLOW.md](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md) defines:

- A Linear project with active states `Todo / In Progress / Merging / Rework` and terminal states `Closed / Cancelled / Canceled / Duplicate / Done`.
- `Human Review` belongs to neither set. Moving there stops the worker but retains its directory.
- Polling every five seconds, concurrency 10, and `max_turns: 20`.
- An `after_create` hook that clones with `--depth 1` and installs dependencies.
- Codex `gpt-5.5`, `model_reasoning_effort=xhigh`, `approval_policy: never`, a `workspace-write` sandbox, and network access.

The [status map](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L107) instructs agents as follows:

| State | Agent instruction |
| --- | --- |
| `Backlog` | Ignore it until a human moves it to `Todo`. |
| `Todo` | Move to `In Progress` and create the workpad before work. If a PR exists, start with its feedback. |
| `In Progress` | Plan, reproduce, synchronize with `origin/main`, implement, evaluate, create a PR, and address feedback and CI. |
| `Human Review` | Do not change code or tickets. Wait for human judgment. |
| `Merging` | Loop through the `land` skill and move to `Done`. Do not call `gh pr merge` directly. |
| `Rework` | Start over. Close the PR, delete the workpad, and create a fresh branch from `origin/main`. |

Additional instructions cover unattended work and records:

- Agents cannot ask humans for follow-up or include “next steps for user” in final messages. Missing tools, authentication, permissions, or secrets form an early-stop escape hatch. The agent records the blocker and moves to `Human Review`. GitHub access failure alone is not normally a blocker. The agent must try alternatives.
- One Linear comment titled `## Codex Workpad` holds the plan, acceptance conditions, evaluation, and notes. It starts with `<host>:<path>@<sha>`. Separate completion comments are prohibited. Unclear matters go under `### Confusions`. [Workpad template](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L295)
- Ticket sections named `Validation`, `Test Plan`, or `Testing` become required workpad acceptance items. Every item must run.
- Out-of-scope improvements become separate `Backlog` issues with acceptance conditions.
- Before code changes, the workpad records evidence of current behavior, such as command output or a screenshot.

### 3.3 Procedural gates for evaluation and review

The [completion bar](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L265) requires a completed workpad checklist, acceptance conditions, and ticket evaluation items. Tests on the latest commit and PR checks must be green. PR feedback must be addressed, and the `symphony` label must be present. These precede `Human Review`.

The supporting procedures are:

- The PR feedback sweep gathers top-level comments, inline comments, and review summaries from humans and bots. Each blocks progress until addressed or rebutted with reasons. The agent retests, pushes, and repeats until no feedback remains. There is no round cap. [Line 171](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L171)
- The `push` skill runs `make -C elixir all` before push and tests PR text with `mix pr_body.check`. [push SKILL.md](https://github.com/openai/symphony/blob/be10a1b/.codex/skills/push/SKILL.md)
- Elixir rules require early adversarial review for nontrivial changes. Reviewers challenge complexity and attempt to break adjacent lifecycle paths. Reproducible failures stop landing even if other reviews pass. The public repository contains no corresponding prompt or execution mechanism. [AGENTS.md line 36](https://github.com/openai/symphony/blob/be10a1b/elixir/AGENTS.md#L36)
- CI runs `make all` for format, lint, coverage, and dialyzer, plus PR body format tests. It has no LLM review job.

Code does not establish these conditions before allowing `Human Review`. The agent moves state through its own tool call. The orchestrator does not judge whether the transition is valid.

### 3.4 Merge through the land skill

When a human moves the issue to `Merging`, the agent repeats the [land skill](https://github.com/openai/symphony/blob/be10a1b/.codex/skills/land/SKILL.md). It uses these steps:

- Conflicts invoke `pull` to merge `origin/main`, then `push` to publish the repair.
- `land_watch.py` watches review comments, CI, and PR head updates concurrently. Exit codes are 2 for comments, 3 for CI failure, and 4 for a head update.
- CI failures lead to log inspection, repair, and another watch. The agent can proceed without repair if it judges a failure flaky.
- Before changes in response to reviews, the agent posts an acceptance, acknowledgment, or rebuttal with `[codex]`.
- After green results and resolved reviews, the agent runs `gh pr merge --squash`. Auto-merge is prohibited. The skill says this repository lacks required checks, so auto-merge can bypass tests.

Some land instructions do not match the public repository. They wait for GitHub Actions comments named `## Codex Review — <persona>` and discuss broken pnpm lockfiles. This repository uses Elixir, not pnpm, and has no review-posting workflow. None of the 22 public PRs with the `symphony` label contained `## Codex Review`. Only one contained a `[codex]` reply.

The likely explanation is that the skill came from another repository, possibly inside OpenAI. This is an inference. The described review mechanism does not appear active in the public repository.

### 3.5 Safety

The design separates several boundaries:

- The agent's cwd must match its issue directory under `workspace.root`. Directory names use `[A-Za-z0-9._-]` normalization, with a hash if changed. The SPEC calls these the most important portability constraints. [Section 9.5](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L928)
- Tracker tools, such as `linear_graphql`, execute on the Symphony host with configured credentials. The child receives results only. Elixir removes adapter-declared environment variables and calls `unset` before Codex launch. [SPEC section 10.5](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1065), [app_server.ex line 221](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/codex/app_server.ex#L221)
- The SPEC leaves approval and sandbox policy to implementations but requires documentation. Elixir defaults reject sandbox approvals, rules, and MCP elicitation. This repository uses `approval_policy: never`, which automatically grants approval requests. Questions other than MCP tool approvals do not receive automatic answers and lead to `blocked`. [Defaults](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/config/schema.ex#L183), [Automatic approval](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/codex/app_server.ex#L55)
- Hooks are fully trusted configuration and require timeouts. [SPEC section 15.4](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1760)
- The SPEC recommends treating tracker data, repository content, prompts, and tool arguments as untrusted. It recommends narrowing eligible issues, projects, and labels so untrusted tasks cannot automatically reach agents. These are recommendations, not mandatory constraints. [SPEC section 15.5](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1771)
- GitHub authentication is not isolated. Agents use `gh` to push and merge inside the workspace. WORKFLOW.md passes `shell_environment_policy.inherit=all`. Exposure of nontracker credentials therefore depends on the operator's environment.

### 3.6 The specification is the product

The SPEC includes a deliberately repetitive cheat sheet to help coding agents implement the configuration layer quickly. It treats agents as readers. [Section 6.4](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L605)

Section 17 contains a test matrix. Section 18 defines completion. The specification separates Core Conformance, extensions, and real-environment tests. A skipped test must be reported as skipped, not passed.

Elixir's AGENTS.md permits a superset of the SPEC but forbids conflicts. Behavior changes must update the SPEC in the same change. Secondary reporting says OpenAI used Codex to implement the SPEC in TypeScript, Python, and Rust. This is a company claim. Those implementations are not in this repository.

## 4. Public claims and supporting evidence

| Claim | Repository evidence |
| --- | --- |
| Engineers manage work instead of watching Codex | Humans move tracker states such as Todo, Merging, and Rework. The orchestrator starts and stops workers from those states. |
| Agents attach proof of work, including CI, review responses, complexity analysis, and videos | Procedures cover CI and reviews. UI changes request `launch-app` and `github-pr-media`, but those skills are absent. No complexity-analysis procedure was identified. |
| Agents land safely after approval | The land procedure and `land_watch.py` support this. Merge conditions are instructions, and required checks are absent. |
| Some teams increased landed PRs by 500% in the first three weeks | Company claim through secondary reporting. The measurement method remains unknown. |
| It works best with harness-engineered codebases | Evaluation and review content belongs to WORKFLOW.md and target repository rules/tests. Quality depends on that surrounding infrastructure. |
| It is for trusted-environment testing | The example uses automatic approval and network access. The SPEC also gives automatic approval as a high-trust example. |

## 5. Analysis

Symphony provides the factory's outer structure: intake, isolation, launch, continuation, and stop. User repositories own evaluation, review, and merge policy through prompts and skills. Swamp places more of these controls in code through evaluation records and merge gates.

Human judgment becomes tracker state. Approval can be a Linear card move, including from a mobile app in secondary-report examples. However, code does not prove that work entering `Human Review` meets completion conditions. Human review remains the final defense.

The prompt tells agents to wait and poll in `Human Review`. The implementation stops the worker because that state is not active. Waiting therefore means no worker launch, rather than a live waiting agent. This is a small but concrete difference between prompt and runtime.

The design favors continued execution through uncapped failure retries. It discourages human questions. Tracker state, timeout handling, and Elixir's blocked-input behavior control stopping. Concurrency and backoff restrain load, but there is no total spending cap.

The `symphony` labels and WORKFLOW.md suggest use in the repository's own development. Public PRs show outcomes only. Linear workpads and internal review mechanisms are not visible. The degree of unattended operation remains unknown.

## 6. Open questions

The research leaves these items open:

- The official article body, unavailable because of HTTP 403, and the team, period, and method behind the 500% figure.
- The share of public PRs actually created through Symphony. The `symphony` label is only an indicator.
- The mechanism behind `## Codex Review — <persona>` and the contents of `launch-app` and `github-pr-media`, absent from the public repository.
- The 2026-02-11 harness engineering article and its concrete connection to Symphony, as a possible separate case.
- Whether the TypeScript, Python, and Rust implementations are public.
- Whether six weeks without updates indicates an end to maintenance.

## Sources

The original research used:

- https://github.com/openai/symphony at `be10a1b`.
- Activity queries on 2026-10-29: `gh search prs --repo openai/symphony --merged --limit 200`, with 64 PRs and 22 `symphony` labels. `git log` showed 47 main commits and 10 with `Co-authored-by: Codex`. The research also fetched comments and reviews for labeled PRs.
- [Help Net Security: OpenAI releases Symphony to automate Codex work through Linear, 2026-04-28](https://www.helpnetsecurity.com/2026/04/28/openai-symphony-codex-orchestration-linear/).
- [Better Stack: OpenAI Symphony](https://betterstack.com/community/guides/ai/openai-symphony/).
- [Noqta: OpenAI Releases Symphony](https://www.noqta.tn/en/news/openai-symphony-codex-autonomous-orchestrator-linear-2026).
- The official article at https://openai.com/index/open-source-codex-orchestration-symphony/, with its body unavailable.
- Harness engineering at https://openai.com/index/harness-engineering/, also unavailable, and [InfoQ](https://www.infoq.com/news/2026/02/openai-harness-engineering-codex).
