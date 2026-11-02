---
title: Human decision points
kind: concept
aliases: [human-in-the-loop gates, approval points]
category: Process
seen_in: [swamp, superpowers, symphony, orchestrator, matt-pocock, stripe-minions]
---

# Human decision points

[← Concepts](../concepts.md)

## Definition

Human decision points are explicit places for human judgment. A factory defines a small number of these points. Machine gates control the other stages.

## What to inspect

Compare three aspects:

- Identify human involvement at input, planning, code review, release, or after release.
- Establish whether humans review code.
- Identify the controls that stop work.

## Implementations

| Case | Human involvement | Evidence |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | The main explicit approvals cover the plan and PR creation after local tests. Other interaction includes explaining departures from the plan. A PR `hold` label stops progress. | `issue-lifecycle` skill Key Rules, `verification-conventions.md`  step 8, ci.yml |
| [Superpowers](../cases/superpowers.md) | Humans select the approach and approve the design document (HARD-GATE). They review the plan and select the execution method. They also select merge, PR, or hold at integration. Execution stops only for four defined conditions, including irreversible operations. At the end, the agent lists decisions it made as "Rulings I made". | [brainstorming](https://github.com/obra/superpowers/blob/2ce8aa1/skills/brainstorming/SKILL.md#L247), [writing-plans](https://github.com/obra/superpowers/blob/2ce8aa1/skills/writing-plans/SKILL.md#L179), [SDD](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md#L27), [finishing](https://github.com/obra/superpowers/blob/2ce8aa1/skills/finishing-a-development-branch/SKILL.md#L53) |
| [Symphony](../cases/symphony.md) | Humans act through tracker state changes. `Backlog → Todo` authorizes work. After inspecting a PR in `Human Review`, they select `Merging` for approval or `Rework` for changes. A terminal state stops running agents. Agents assume unattended operation and do not ask humans to perform work. Missing tools or credentials trigger a blocker report and `Human Review`. Instructions define completion conditions before `Human Review`. Code does not enforce them. | [Status map](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L107), [Step 3](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L244), [escape hatch](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L187) |
| [Orchestrator.inc](../cases/orchestrator.md) | Routine feedback notifications do not enter a human permission dialog. Review dispatch policy is configurable. Independent human approval is not an inherent requirement of the merge API. | [Implementation study at a fixed commit](../cases/orchestrator.md) |
| [Matt Pocock](../cases/matt-pocock.md) | The design requires human review for every PR. Runs end while waiting for a human. Updates start a new run. No enforcement code is supplied. | [Study of the final PR version](../cases/matt-pocock.md) |
| [Stripe Minions](../cases/stripe-minions.md) | After unattended implementation, a human inspects the result, opens a PR, and requests review from another human. This is the official description of operations. | [Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) |

Superpowers defines every decision point through skill instructions. It has no mechanism that records approval evidence. Swamp also relies on skill instructions to wait for approval. Its `approve` code assesses the review version and resolved findings, but requires no argument containing evidence of human approval. See the [approve implementation](https://github.com/swamp-club/swamp/blob/963e0d2/extensions/models/issue_lifecycle.ts#L2007) and [human consultation during conformance review](https://github.com/swamp-club/swamp/blob/963e0d2/.claude/skills/issue-lifecycle/references/code-conformance-review.md).

## Related concepts

[Issue lifecycle state machine](issue-lifecycle-state-machine.md) defines the workflow states and transitions.
