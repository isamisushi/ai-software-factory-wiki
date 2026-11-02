---
title: Orchestrator.inc
kind: case
org: Orchestrator Inc.
people: []
type: [product]
source: partial
license: Apache-2.0
repo: https://github.com/OrchestratorInc/agent-orchestrator
investigated_at: 2026-10-31
investigated_commit: c0b351a31e
concepts:
  - isolated-workspace
  - deterministic-loop-calls-llm
  - progress-ledger
  - human-checkpoints
  - adversarial-review
  - bounded-fix-loop
  - commit-bound-acceptance
---

# Orchestrator.inc

[← Cases](../index.md) · [Loop diagrams](../loops/orchestrator.md)

Research date: 2026-10-31 (JST). Target commit: `OrchestratorInc/agent-orchestrator@c0b351a31eccaf1ac55f8e5015fd21ab414545ca` (2026-10-31). Source links below use this commit.

Concepts: [Isolated workspace](../concepts/isolated-workspace.md) · [Deterministic loop calls an LLM](../concepts/deterministic-loop-calls-llm.md) · [Progress ledger](../concepts/progress-ledger.md) · [Human checkpoints](../concepts/human-checkpoints.md) · [Adversarial review](../concepts/adversarial-review.md) · [Bounded fix loop](../concepts/bounded-fix-loop.md) · [Commit-bound acceptance](../concepts/commit-bound-acceptance.md)

## Summary

This desktop product runs multiple coding agents with separate worktrees, branches, and sessions for each task. A worktree is a separate checkout of a Git repository. A main agent plans and delegates, while workers implement. Prompts mostly define the roles. Go code observes PRs and sends problems back to their workers. [README](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/README.md), [Role prompts](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/session_manager/prompt.go#L215)

The local core uses a Go daemon and SQLite. The UI uses Electron and React. It separates observation, fact storage, and derived state or actions. It calculates board states from agent activity, PRs, CI, and reviews, instead of storing independent display states. [Architecture](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/architecture.md#L38)

CI failures, unresolved comments, requested changes, and conflicts generate independent notifications to the responsible worker. Saved signatures and counts suppress duplicate delivery after restart. A notification does not guarantee a repair or acceptance. [reactions.go](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/lifecycle/reactions.go#L65)

A separate reviewer records results per PR, head, and harness. AO approval is neither GitHub approval nor merge permission. The merge API rereads current CI and reviews and passes the expected head SHA to GitHub. It does not require AO review approval. [Review prompt](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/review/prompt.go), [Merge action](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/service/pr/action_service.go#L125)

AO Cloud's control plane lives in a separate private repository. Public contracts and clients do not establish its reconciler, database, or sandbox implementation. The public/private boundary limits this research. [AGENTS.md](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/AGENTS.md#L7)

## 1. Organization and people

| Item | Finding |
| --- | --- |
| Organization and product | The README names Orchestrator.inc. The public GitHub organization is OrchestratorInc. |
| Public license | Apache-2.0. [LICENSE](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/LICENSE) |
| Distribution | The desktop app is the normal distribution. The legacy npm route stopped at 0.10.0. [AGENTS.md](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/AGENTS.md#L109) |
| Public and private scope | Desktop, CLI, and cloud contracts are public. The hosted control plane is private. [CONTRIBUTING](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/CONTRIBUTING.md) |
| People | Founder identities and roles are outside this study. Git authors do not establish identity or employment. |

### Activity and evidence of internal use

Counts use history reachable from the cloned HEAD. The period is at least 2026-08-01 00:00 and before 2026-10-31 00:00 JST, using committer time. This differs from both a latest-90-days period and GitHub search counts.

| Measure | Result and boundary |
| --- | --- |
| Reachable commits | 1,693, including history through merges. |
| First-parent commits | 1,662, a subset of the above. |
| Author strings | 92 distinct `name <email>` strings. This is not a count of people. |
| Commits with co-authors | 813 contain `Co-authored-by:`, without case sensitivity. |
| Agent names in co-author lines | 557 commits mention Claude, Codex, Cursor, Kimchi, Copilot, or Gemini. This counts commits, not lines. Other names and agents are omitted. |
| Merged PRs, releases, and stars | This research did not recount them through the API or reproduce supplied report numbers. |

The base command is `git log HEAD --since='2026-08-01T00:00:00+09:00' --until='2026-10-31T00:00:00+09:00'`. A regular expression counted co-author lines at the start of commit-body lines. Git date filters and GitHub API search totals are different measures.

The history strongly indicates agent-assisted development. Co-authors alone cannot distinguish AO-launched workers from changes made through another CLI. The repository has AGENTS instructions, PR creation skills, and UI testing skills for its own development. The share of fully automatic development through AO and production adoption remain unknown. [AGENTS.md](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/AGENTS.md), [desktop-dev skill](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/.agents/skills/ao-desktop-dev/SKILL.md)

## 2. Product overview

The README describes a request to a main agent, task division, worker launches, and human involvement when needed. One desktop supervises worker chats, terminals, browsers, PRs, CI, and reviews. Users select agents and models per task. This is not a single-model factory. Chat and TUI are separate interfaces to the same session. The daemon owns the active execution controller. [README](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/README.md), [Architecture](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/architecture.md#L390)

Cloud Agents and Mobile are also product features. This page mainly covers the public local daemon. Old TypeScript code and design proposals do not establish current Go behavior. AGENTS also directs readers to prioritize the current rewrite.

## 3. Factory design from source code

| File or directory | Role |
| --- | --- |
| `backend/internal/session_manager/prompt.go` | Main-agent and worker roles, delegation, review, and reporting instructions. |
| `backend/internal/skillassets/using-ao/` | CLI catalog for launches, messages, reviews, reports, and browser use. |
| `backend/internal/observe/scm/observer.go` | Observes PRs, CI, and review threads. |
| `backend/internal/lifecycle/reactions.go` | Decides notifications, duplicate prevention, and stopping after completion. |
| `backend/internal/sessionguard/` | Reads activity immediately before delivery and blocks input during permission waits. |
| `backend/internal/autoreview/coordinator.go` | Automatic review conditions for idle workers and failed execution retry limits. |
| `backend/internal/review/` | Plans, launches, restores, and prompts reviews per head. |
| `backend/internal/service/review/review.go` | Receives structured decisions, tests run/worker associations, and sends notifications. |
| `backend/internal/service/pr/action_service.go` | Rereads current state and evaluates merge conditions. |
| `backend/internal/storage/sqlite/` | Persists sessions, PRs, reviews, delivery history, and change data. |
| `.github/workflows/` | Tests the product's Go/React code, generated-file drift, and public boundaries. |

### 3.1 The main agent coordinates and workers implement

Instructions tell the main agent to inspect state, avoid duplicate work, launch workers with `ao spawn`, and coordinate through `ao send`. It must not implement, push, or create PRs itself. It must use AO workers rather than runtime sub-agents. These are prompt constraints. They do not establish code that removes the main agent's file-write permissions. [prompt.go](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/session_manager/prompt.go#L215)

Workers receive issues or free text. Project workers have worktrees and branches. Projectless workers use AO-managed directories and do not assume PR, CI, or tracker support. Instructions encourage durable reports of meaningful progress, blockers, and artifacts through `ao report`. Reporting does not rely only on conversation summaries. It does not guarantee automatic reporting of every action. [prompt.go](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/session_manager/prompt.go#L143), [Report instructions](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/session_manager/prompt.go#L324)

### 3.2 Store observed facts and derive display state

SQLite stores `activity_state`, `is_terminated`, controller generations, handoff checkpoints, PRs, checks, comments, and reviews. Display states such as `working / needs_input / ci_failed / mergeable` are derived on read. Database triggers write `change_log`, and a poller sends changes to the UI and other consumers. Moving board columns is not an issue-state control plane like Symphony. [Architecture](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/architecture.md#L38), [Change data capture](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/architecture.md#L719)

The SCM observer defaults to 30-second PR/CI polling and two-minute review-thread polling. The runtime reaper defaults to five seconds. A design rule separates failed probes from dead processes. “Needs attention,” a live controller, and a wait for user input are separate facts. [Observer constants](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/observe/scm/observer.go#L29), [Reaper](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/observe/reaper/reaper.go#L19), [Hard rules](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/AGENTS.md)

### 3.3 Return CI failures, reviews, and conflicts to workers

`ApplyPRObservation` receives stored PR state. If several problems coexist, it queues separate notifications. It avoids early returns that let a CI failure suppress review feedback. [reactions.go](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/lifecycle/reactions.go#L65)

| Observed problem | Code condition and response |
| --- | --- |
| CI failure | If the PR enables `AutoInjectCI`, failed checks generate detailed feedback. |
| Unresolved comment | Per-comment `AutoInjectReview` controls delivery. Signatures belong to comments, not entire threads. |
| Changes requested | Delivery follows the review-specific configuration and review ID. |
| Merge conflict | Rebase instructions exclude PRs stacked on open parent PRs. Once resolution is certain, duplicate suppression resets so recurrence can notify again. |

The target is the session that owns the PR. Chat delivers through a SQLite queue into provider turns. TUI sends runtime input. Ordinary CI and review messages wait during needs-input states. Conflicts can send urgent messages to idle input fields known to be safe. They never type into a live permission dialog. [Routing](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/architecture.md#L594), [Last-moment guard](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/lifecycle/reactions.go#L929)

Delivery succeeds before the signature enters memory and then the database. If persistence fails and the process restarts, an extra notification is possible. This is not strict exactly-once delivery. It avoids losing an unsent notification by recording it as delivered too early.

Review/comment notifications allow at most three attempts per key and do not repeat identical signatures. CI and conflict notifications use `maxAttempts=0`, so their counts are unbounded. Identical signatures still receive duplicate suppression. These are notification limits, not total repair-round limits. The inspected local lifecycle/review paths do not establish task-wide cost or repair limits. [sendOnce](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/lifecycle/reactions.go#L929)

### 3.4 Separate review, structured decisions, and permissions

A reviewer runs separately from the implementation worker. It reads the specified PR/head diff for correctness, error handling, security, and missing tests. The prompt treats repository content as untrusted. It prohibits builds, tests, installation, edits, commits, and pushes. This reviewer does not execute tests. [Prompt](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/review/prompt.go)

It posts a GitHub `COMMENT` review. Required fixes become inline comments, while optional suggestions enter the summary. It then reports `approved / changes_requested`, run ID, GitHub review ID, and text through `ao review submit`. GitHub prevents an account from approving its own PR, so AO keeps a separate decision. If GitHub publication fails, AO can still record a result without a review ID. An AO decision therefore does not establish that a GitHub review exists. [Prompt](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/review/prompt.go), [Submission rules](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/service/review/review.go#L884)

Code tests the decision enum, run ownership, running state, and repeated submission of the same result. It does not judge review correctness. A changed head creates a new review target. `--rerun` allows deliberate repeat review of the same head. [Planner](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/review/planner.go), [Worker instructions](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/session_manager/prompt.go#L368)

With automatic review enabled, a worker becomes eligible after one idle minute by default. The default sweep interval is one minute. Draft, closed, merged, and unknown-head PRs are excluded. An approved, changes-requested, cancelled, or similar result prevents automatic relaunch for the same head. Three automatic review execution failures stop further automatic attempts for that head. This does not mean three code repairs. [Coordinator](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/autoreview/coordinator.go)

Read-only enforcement differs by adapter. Codex adds `--sandbox read-only`. Claude Code sets allowed and disallowed tools. A capability gateway can bind PR, run, and SHA through a fixed manifest. However, its ADR states that the gateway alone is not a process sandbox. Experimental host-trusted reviewers are not described as contained or read-only. The evidence does not support a universal safe-sandbox claim. [Codex](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/adapters/reviewer/codex/codex.go), [Claude Code](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/adapters/reviewer/claudecode/claudecode.go), [ADR 0002](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/adr/0002-secure-interactive-reviewer-gateway.md)

### 3.5 Merge and human decisions

The merge request's `expectedHeadSHA` must match the stored head. The service rereads PR, CI, and review threads from the provider. CI and PR heads must match, and review retrieval must be complete. The PR cannot be draft, closed, or merged. CI cannot be failed, pending, or unknown. Requested changes and unresolved human comments must be absent, and the PR must be mergeable.

The GitHub request includes squash and SHA, so GitHub also rejects a head change after evaluation. No-CI state differs from unknown or pending. A PR without a review-approval requirement can pass. [ActionService](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/service/pr/action_service.go#L125), [ReadyToMerge](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/domain/pr.go#L235), [GitHub SHA condition](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/adapters/scm/github/merge_action.go#L19)

This API does not require AO native review approval. It also does not require an AO-specific proof of approval by another human. GitHub branch protection is a separate boundary. Prompts explicitly state that AO approval does not authorize merge. Automatic reviewer approval therefore does not guarantee automatic merge. [Worker review instructions](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/session_manager/prompt.go#L368)

Humans can participate in requests, agent/model selection, questions, permissions, review configuration, and final PR decisions. If `WorkersRequestReview` is disabled, instructions require the worker to ask a human or orchestrator before starting review. If enabled, the worker can start review itself. This prompt policy is separate from automatic coordinator conditions.

Stopping after merge also has multiple conditions. `TerminateOnPRMerge` must be enabled, at least one session PR must be merged, no PR can remain open, and the worker cannot be active. This avoids premature termination during multiple PRs or creation of the next PR. [reactions.go](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/lifecycle/reactions.go#L65)

### 3.6 CI for the product's own development

Go CI runs build, vet, format, race-enabled tests, lint, and drift tests for sqlc/API generated files. Frontend CI includes typecheck, split Vitest runs, renderer smoke tests, and boundary tests in real Electron. Public boundary CI detects private control-plane dependencies entering public code. These tests protect AO itself. They are not automatically installed in user projects. [Go workflow](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/.github/workflows/go.yml), [Frontend workflow](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/.github/workflows/frontend.yml), [Public boundary](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/.github/workflows/public-boundary.yml)

AGENTS requires local CI and remote results before PR handoff. CONTRIBUTING requires advance approval for new features and maintainer review/merge. These instructions are separate from deployed GitHub required-check configuration, which public source does not reveal.

## 4. Public claims and supporting evidence

| Public description | Findings and limits |
| --- | --- |
| The main agent manages a fleet | Role prompts and AO CLI launch/message paths exist. They do not guarantee correct task division. |
| CI failures return to the right agent | Routing, policies, and persistent duplicate suppression target the PR-owning session. Repair quality still depends on the agent. |
| A reviewer reads PRs before humans | Separate reviewers, per-head runs, and launch configuration exist. Review is not mandatory for every PR. |
| Code stays on your machine | This describes local desktop use. It does not cover the separately offered Cloud Agents. |
| Cloud work continues with the laptop closed | This is a product claim. Public contracts and clients are readable, but private operations remain unknown. |

The claims come from the [README](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/README.md). Performance improvements, fully automatic merge rates, and cost reductions were not established in this research.

## 5. Analysis

The design connects LLM roles to PR feedback delivery that survives restart. It separates external PR facts from agent runtime facts instead of overwriting them with one board state. CI failures and review failures can therefore receive separate responses. Persistent duplicate suppression, conflict reset, and permission guards before delivery are concrete controls beyond prompts.

Review approval, GitHub approval, merge readiness, and actual merge are distinct decisions. Structured approval is not independent human approval. The merge API does not require AO review. Describing the whole system as automatic repair until approval followed by automatic merge hides these boundaries.

Worktree isolation, separate reviewers, programmed launch decisions, and durable progress match existing concepts. Bounded repair applies only to notification counts and automatic review failures here. It is not a task-wide iteration budget. Two candidate descriptions are “derive display state from observed facts” and “durable feedback delivery to the responsible worker.” These are research descriptions, not official product terms.

## 6. Open questions

The research leaves these items open:

- Private AO Cloud reconciliation, runtime environments, database, cost limits, and retries.
- Deployed GitHub branch protection, required checks, and a full count of who approved and merged each PR.
- OS-level permission escape and network experiments for each reviewer adapter. This research only read code and did not run external scripts or tests.
- The share of PRs developed through AO, repair success rates, and continued use in other organizations.
- Task-wide cost and repair limits. Local limits do not establish global limits.

## Sources

The source set includes:

- [Pinned repository](https://github.com/OrchestratorInc/agent-orchestrator/tree/c0b351a31e).
- [README](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/README.md), [AGENTS](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/AGENTS.md), and [CONTRIBUTING](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/CONTRIBUTING.md).
- [Architecture](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/architecture.md) and [reviewer gateway ADR](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/adr/0002-secure-interactive-reviewer-gateway.md).
- Pinned implementation links in each section. Activity counts use local Git history at the same commit. The supplied report served only as a research lead.
