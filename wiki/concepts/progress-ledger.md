---
title: Keep a progress ledger outside the conversation
kind: concept
aliases: [progress ledger, durable state, compaction-safe state]
category: Operations
seen_in: [superpowers, swamp, symphony, orchestrator, matt-pocock, sssf]
---

# Keep a progress ledger outside the conversation

[← Concepts](../concepts.md)

## Definition

A progress ledger records work outside the agent conversation. Files or data stores hold progress, decisions, and unresolved questions for long tasks. Resumed work reads those records. Records take priority over conversational memory.

## Why it is needed

Context compression and session changes can cause agents to forget their progress. Repeating completed work is one of the most expensive failures.

The ledger also lets humans inspect decisions that an agent made on their behalf.

## What to inspect

- Identify storage, such as working-tree files, Git, or an external server, and who can change it.
- Identify protections against mistaking another task’s records for the current task.
- Establish whether code enforces valid transitions or only records them.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Superpowers](../cases/superpowers.md) | `sdd-workspace` separates workspaces per plan with a `plan-path` marker and records progress in `progress.md`. Instructions tell the controller to inspect the plan path on the first line. The ledger records completion, repair rounds, deferrals, and `Ruling:` entries. After compression, agents trust the ledger and `git log` over memory. Before deleting the ledger, the agent shows humans every `Ruling:` line. An LLM decides completion in SDD. Native `task-done` appends completion only when the supplied test command succeeds. It does not prevent direct edits or inappropriate test commands. | [SKILL.md L108](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md#L108), [sdd-workspace](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/scripts/sdd-workspace), [task-done](https://github.com/obra/superpowers/blob/2ce8aa1/skills/executing-plans/scripts/task-done#L39), [Evaluation results (2026-07-06)](https://github.com/obra/superpowers/blob/2ce8aa1/docs/superpowers/specs/2026-07-06-sdd-plan-scoped-workspace-eval-results.md) |
| [Swamp](../cases/swamp.md) | Issue lifecycle state persists in swamp-club and the Swamp data store. Work can resume after compression or in another session. Code restricts transitions. | [Issue lifecycle state machine](issue-lifecycle-state-machine.md) |
| [Symphony](../cases/symphony.md) | One Linear issue comment, `## Codex Workpad`, holds the plan, acceptance conditions, tests, notes, and `Confusions`. It starts with `<host>:<path>@<sha>`. Instructions tell continuation turns and later workers to resume from workpad state. Each issue also retains its workspace. Rework deletes and recreates the workpad. Instructions govern its format and updates. Code does not enforce them. | [Step 1](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L140), [Workpad template](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L295) |
| [Orchestrator.inc](../cases/orchestrator.md) | SQLite stores activity, PRs, CI, reviews, and delivery signatures. The system derives the displayed state from these records. `ao report` keeps progress outside the conversation. | [Implementation study at a fixed commit](../cases/orchestrator.md) |
| [Matt Pocock](../cases/matt-pocock.md) | The design limits memory from earlier runs to the tracker, Git host, and orchestrator. The Runner keeps no local state from earlier runs. The storage format is unspecified. | [Study of the final PR version](../cases/matt-pocock.md) |
| [Super Simple Software Factory](../cases/sssf.md) | Files and SQLite store the Run ID, session IDs per role, stages, events, and usage. The system reloads `agent_map`. This does not guarantee automatic recovery of every stage. | [runner.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/runner.py) |

## Related concepts

[Issue lifecycle state machine](issue-lifecycle-state-machine.md) is a stronger form with states and transitions defined in code. [Bounded fix loops](bounded-fix-loop.md) use records to control repair rounds.
