---
title: Symphony loops
kind: loops
case: symphony
investigated_commit: be10a1b
---

# Symphony loops

[← Explore the loops](index.md) · [Symphony case study](../cases/symphony.md)

Start with A, then B, then C. A covers the tracker workflow. B shows the orchestrator that keeps work running. C shows turns inside one worker. D, E, and F are repair loops that agents follow under instructions for each state in A.

Research target: `openai/symphony@be10a1b`. The researcher chose the names and divisions, not Symphony. A, D, E, and F follow this repository's [elixir/WORKFLOW.md](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md) and skills. Users replace these instructions for their own projects. B and C follow SPEC and Elixir code, where users change configuration values.

Hexagons represent code decisions only. Diamonds represent human or agent decisions. Almost all branches in A, D, E, and F are instructions.

## Map: Who runs each loop

```mermaid
flowchart LR
  A[["A: Tracker workflow"]]:::loopref
  B[["B: Dispatch and retry"]]:::loopref
  C[["C: Worker turns"]]:::loopref
  A -->|"Active states trigger dispatch"| B
  B -->|"Start worker"| C
  C -.->|"Agent advances state"| A
  A -->|"Used in In Progress"| D[["D: Evaluation and PR feedback"]]:::loopref
  A -->|"Used in Merging"| E[["E: land"]]:::loopref
  A -.->|"Human requests rework"| F[["F: Rework"]]:::loopref
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

Solid arrows mean “used in this state or step.” Dotted arrows return results. A does not sit inside B or C. Its state lives in the tracker. B reads that state to decide whether to start workers, and agents in C change it through tools. Agents inside C execute D, E, or F according to the state in A.

| Diagram | Unit and type | Evaluation and return path | Exit condition | Enforcement |
| --- | --- | --- | --- | --- |
| [A: Tracker workflow](#loop-a) | One issue / full workflow | Human review returns work to Rework F. | Agent moves to `Done`, or human chooses a terminal state. | Instructions. Code only starts and stops work by state. |
| [B: Dispatch and retry](#loop-b) | Orchestrator tick (five seconds) and retry / repeated execution | Restart after worker completion, failure, or stall. | Issue becomes inactive, terminal, or invisible. No attempt limit. | Code |
| [C: Worker turns](#loop-c) | Turns in one worker / repeated execution | Fetch the issue again after each turn. | Inactive state or `max_turns` (20). | Code |
| [D: Evaluation and PR feedback](#loop-d) | Implement, evaluate, push / repair loop | Test failure, review comments, and CI failure return to implementation. | Completion bar met and agent moves to `Human Review`. No limit. | Instructions. CI results do not prevent state transitions. |
| [E: land](#loop-e) | PR head / repair loop | `land_watch.py` exit codes for review, CI, and head updates | All green, no outstanding items, then squash merge. | Instructions and monitoring script. No required checks. |
| [F: Rework](#loop-f) | Restart the whole issue / repair loop | Human requests rework. | Human approves and moves to `Merging`. No limit. | Instructions. A human requests rework through the tracker. |

## A: Tracker workflow {#loop-a}

A evaluates one issue. Linear stores its state. Both humans and agents change that state.

```mermaid
flowchart TD
  backlog["Backlog<br/>Out of scope: Leave untouched"] --> todo["Human moves to Todo"]:::human
  todo --> start["Agent moves to In Progress<br/>and creates a workpad comment"]
  start --> D[["Loop D: Evaluation and PR feedback"]]:::loopref
  D --> hr["Agent moves to Human Review<br/>Worker stops"]
  hr --> review{"Human reviews the PR"}:::human
  review -->|"Approve: Move to Merging"| E[["Loop E: land"]]:::loopref
  review -.->|"Return: Move to Rework"| F[["Loop F: Rework"]]:::loopref
  E --> done(["Agent moves to Done"])
  start -.->|"Required tools or credentials missing<br/>Record blocker in workpad"| hr
  classDef human fill:#fde68a,stroke:#b45309,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

See [D](#loop-d), [E](#loop-e), and [F](#loop-f).

`Todo`, `In Progress`, `Merging`, and `Rework` are active states. B keeps workers running in those states. `Human Review` and `Backlog` are neither active nor terminal, so workers do not start.

WORKFLOW.md Step 3 tells the agent to wait and poll in `Human Review`. However, the implementation ends turn continuation in C and stops the worker through reconciliation in B after this state change. It does not restart the worker. The diagram follows the implementation and shows the worker stopping.

Agent tool calls change state, through `linear_graphql` for Linear. Code does not establish valid source-to-target transitions or fulfillment of completion conditions. Configuration also defines state names.

Evidence: [WORKFLOW.md frontmatter](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L1), [Status map](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L107), [Step 3](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L244), [Reconciliation](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L421).

## B: Dispatch and retry {#loop-b}

Each cycle follows an orchestrator tick or retry timer. The orchestrator uses state and configuration, not issue content.

```mermaid
flowchart TD
  tick["Tick: Every 5 seconds in this repository"] --> recon{{"Reconcile running issues<br/>Detect stall: Default 5 minutes inactive"}}:::gate
  recon -->|"terminal"| clean["Stop and delete working directory"]
  recon -->|"Not active"| stop["Stop but retain directory"]
  recon -->|"active"| pre{{"Inspect WORKFLOW.md"}}:::gate
  pre -->|"OK"| fetch["Fetch active issues<br/>Sort by priority and creation date"]
  fetch --> elig{{"Dispatchable, required labels,<br/>unclaimed, capacity available"}}:::gate
  elig -->|"Eligible"| C[["Loop C: Worker turns"]]:::loopref
  C -->|"Normal completion"| cont["Test continuation after 1 second"]
  C -.->|"Failure or stall"| backoff["Exponential backoff<br/>10 seconds × 2^(n-1), max 5 minutes<br/>No attempt limit"]
  C -->|"Requests human input or approval"| blocked["blocked<br/>Hold until state changes"]
  cont --> retry{{"Fetch issue again<br/>Still active and routable?"}}:::gate
  backoff --> retry
  retry -->|"Yes"| elig
  retry -->|"No"| release["Release claim"]
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

See [C: Worker turns](#loop-c).

Tracker state determines when retries stop. Failure retries have no attempt limit. If the issue remains active, restarts continue with a delay capped at five minutes. No cost-based stop configuration exists. Token totals serve observation only. Invalid WORKFLOW.md prevents new dispatches on that tick but does not stop reconciliation.

The Elixir implementation adds blocked handling. SPEC only requires avoiding indefinite waits for input and leaves the method to implementations. Elixir holds input or approval requests without retry until a human changes tracker state. With `approval_policy: never`, it automatically permits approval requests. Holds therefore mainly involve questions other than MCP tool approval.

A service restart loses retry timers and running sessions. Startup removes working directories for terminal issues. It then fetches active issues again and restarts work.

Evidence: [SPEC §8](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L733), [SPEC §14.3](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1690), [Normal completion](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L208), [Backoff](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L1232), [Stall detection](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L608), [Blocked handling](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L757), [Automatic approval](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/codex/app_server.ex#L55).

## C: Worker turns {#loop-c}

Each cycle is a turn in one Codex thread. The agent controls the work. Between turns, the worker only inspects issue state.

```mermaid
flowchart TD
  ws["Prepare issue working directory<br/>after_create and before_run hooks"] --> launch["Start Codex app-server<br/>Unset secret tracker<br/>environment variables"]
  launch --> first["First turn: Send WORKFLOW.md prompt"]
  first --> work["Agent works<br/>Host tools perform tracker operations"]
  work --> refresh{{"Fetch issue again<br/>Active and routable?"}}:::gate
  refresh -->|"No"| done(["Normal end → Continuation test in B"])
  refresh -->|"Yes"| cap{{"Turn count < max_turns (20)?"}}:::gate
  cap -->|"Yes"| next["Send continuation instructions only<br/>to the same thread"]
  next --> work
  cap -->|"No"| done
  work -.->|"Failure, 1 hour without output,<br/>or process exit"| fail(["Failure → Backoff in B"])
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
```

Both exit paths run the `after_run` hook and stop the session. Even after success, the working directory remains for the next worker.

Later turns do not resend the original prompt. They say that the previous turn ended normally but the issue remains active. They direct the agent to resume from the workpad rather than restart. `turn_timeout_ms`, one hour by default, limits time without output. It does not limit total turn duration.

After `max_turns`, if the issue remains active, continuation in B starts a new worker after one second. Thus, `max_turns` limits one session, not the total work spent on an issue.

Evidence: [agent_runner.ex](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/agent_runner.ex#L88), [SPEC §16.5](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1932), [SPEC §10.6](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1142), [Removal of secret environment variables](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/codex/app_server.ex#L221).

## D: Evaluation and PR feedback {#loop-d}

D evaluates the latest commit and PR. During `In Progress`, the agent repeats these steps under the instructions.

```mermaid
flowchart TD
  plan["Record plan, acceptance, and evaluation in workpad<br/>Record a reproduction signal"] --> pull["Sync origin/main with pull skill"]
  pull --> impl["Implement and update workpad"]
  impl --> val{"Required evaluation and<br/>ticket Validation pass?"}
  val -.->|"No: Repair and rerun"| impl
  val -->|"Yes"| push["push skill: make all, then push<br/>Create PR, inspect body, add symphony label"]
  push --> ci{{"CI: make all and PR body format"}}:::gate
  ci --> sweep{"Unresolved review comments<br/>or failed tests?"}
  sweep -.->|"Yes: Address or rebut, then evaluate again"| impl
  sweep -->|"No"| bar{"Completion bar met?"}
  bar -.->|"No"| impl
  bar -->|"Yes"| out(["Continue to Human Review"])
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
```

All diamonds represent agent decisions. Machines evaluate CI jobs, but the agent reads results and decides whether to proceed. Failed CI does not block state transitions. Human and bot review comments remain unresolved until the agent addresses them or gives a reasoned rebuttal.

The instructions also require a “principal-style self-review” of the plan, but do not require a separate reviewer. Elixir `AGENTS.md` requests adversarial review for nontrivial changes. The repository contains no prompt or mechanism that executes it.

The sweep has no attempt limit. It repeats until no outstanding items remain. After C reaches `max_turns`, B starts another worker. Tracker state is therefore the stop condition for this loop.

Evidence: [Step 1](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L140), [PR feedback sweep](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L171), [Step 2](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L199), [Completion bar](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L265), [push skill](https://github.com/openai/symphony/blob/be10a1b/.codex/skills/push/SKILL.md), [make-all.yml](https://github.com/openai/symphony/blob/be10a1b/.github/workflows/make-all.yml).

## E: land {#loop-e}

E evaluates the PR head. After a human moves the issue to `Merging`, the agent continues until merge.

```mermaid
flowchart TD
  start["Human moves to Merging"]:::human --> local["Make sure that local make all passes"]
  local --> conflict{"Conflict with main?"}
  conflict -->|"Yes"| resolve["Resolve with pull skill and push"]
  resolve --> watch
  conflict -->|"No"| watch{{"land_watch.py monitors<br/>review, CI, and head"}}:::gate
  watch -.->|"Exit code 2:<br/>Review comment"| reply["Reply with plan and [codex] prefix<br/>before addressing the comment"]
  watch -.->|"Exit code 3: CI failure"| fix["Read logs and repair<br/>Can proceed if judged flaky"]
  watch -.->|"Exit code 4: Head update"| sync["Pull and push again"]
  reply --> local
  fix --> local
  sync --> local
  watch -->|"All green, no outstanding items"| merge["gh pr merge --squash"]
  merge --> done(["Move to Done"])
  classDef human fill:#fde68a,stroke:#b45309,color:#000
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
```

The skill instructs the agent to retain control until merge. It prohibits auto-merge because this repository has no required checks and auto-merge can bypass tests. GitHub therefore has no corresponding merge gate. The system depends on the agent following the instructions.

Some skill steps do not operate in the public repository. They wait for GitHub Actions comments headed `## Codex Review — <persona>` and handle a pnpm lockfile. The repository contains neither that workflow nor pnpm. Public PRs labeled `symphony` also lacked those comments. The researcher infers that the skill came from another repository.

Evidence: [land SKILL.md](https://github.com/openai/symphony/blob/be10a1b/.codex/skills/land/SKILL.md), [land_watch.py](https://github.com/openai/symphony/blob/be10a1b/.codex/skills/land/land_watch.py), [Step 3](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L244).

## F: Rework {#loop-f}

F evaluates the whole approach. It treats a human return as a restart rather than a small repair.

```mermaid
flowchart TD
  ask["Human requests changes<br/>and moves to Rework"]:::human --> reread["Reread issue and human comments<br/>State what will change this time"]
  reread --> reset["Close existing PR<br/>Delete workpad comment"]
  reset --> branch["Create new branch from origin/main"]
  branch --> D[["Loop D: Evaluation and PR feedback"]]:::loopref
  D --> hr["Continue to Human Review"]
  hr --> judge{"Human decision"}:::human
  judge -.->|"Return again"| ask
  judge -->|"Approve: Move to Merging"| E[["Loop E: land"]]:::loopref
  classDef human fill:#fde68a,stroke:#b45309,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

See [D](#loop-d) and [E](#loop-e).

Each return discards the previous PR and workpad. The agent reads the issue and human comments to understand what failed last time. Rework has no count limit. It can continue until a human stops it or moves the issue to a terminal state.

If a `Todo` issue already has a PR, work starts with PR feedback rather than a restart. This is a separate path from Rework.

Evidence: [Step 4: Rework handling](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L253), [Step 0](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L118).
