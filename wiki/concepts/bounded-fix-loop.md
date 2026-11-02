---
title: Bounded fix loops
kind: concept
aliases: [circuit breaker, review-fix loop cap, scoped re-review]
category: Process
seen_in: [superpowers, symphony, openhands, orchestrator, matt-pocock, stripe-minions, sssf]
---

# Bounded fix loops

[← Concepts](../concepts.md)

## Definition

A bounded fix loop limits repeated reviews and repairs. It defines the maximum rounds, when to change the approach, and what happens at the limit. It avoids an instruction to repeat until approval.

## Why it is needed

- LLM reviewers can produce different findings each time. Repeating a full review can produce endless new findings.
- An implementer who fails repeatedly often cannot recognize the underlying problem.
- The number of rounds causes large differences in cost and time.

## What the limit counts

Define one round explicitly. SSSF permits at most three reviews, which allows two repairs after the initial implementation. JSON correction uses a separate loop. Stripe limits CI to two rounds per run. That limit excludes later requests from humans. [SSSF implementation study](../cases/sssf.md), [Stripe public description](../cases/stripe-minions.md)

Inspect whether the final files passed tests when the limit stops work. SSSF `build_test` ends in failure without testing its last repair again. Inspect the stopping rule separately from the acceptance conditions for the final output.

## What to inspect

- Identify the limit and whether code counts it or instructions describe it.
- Identify the scope of another review: repaired changes or the entire change.
- Identify whether the process changes the model or worker during repairs.
- Identify who decides at the limit and where that decision is recorded. Outcomes include human intervention, controller judgment, and failure.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Superpowers](../cases/superpowers.md) | SDD allows five rounds per task. Each round includes one repair and one focused review. Rounds 1–3 resume the original implementer. Rounds 4–5 use a new implementer with the next stronger model. Before repairs start, the controller resolves findings that conflict with the plan against the specification. At the limit, the controller resolves other findings and records deferrals or minimal rulings in the ledger. The final SDD review allows one repair wave and one review. Native allows one repair pass by the original agent. Each repair uses TDD and the full test suite. Another review is prohibited. Instructions define these limits. Code does not count them. | [fix-loop.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/references/fix-loop.md#L21), [final-review.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/references/final-review.md#L17), [executing-plans](https://github.com/obra/superpowers/blob/2ce8aa1/skills/executing-plans/SKILL.md#L234), [Design (2026-07-15)](https://github.com/obra/superpowers/blob/2ce8aa1/docs/superpowers/specs/2026-07-15-sdd-fix-loop-redesign-design.md) |
| [Symphony](../cases/symphony.md) | Code limits turns per worker (`max_turns`, default 20), time without output (one hour), and stalls (five minutes). If the issue remains active at `max_turns`, a new worker starts after one second. Failure retries have no count limit. Backoff reaches at most five minutes. PR feedback sweeps, land, and Rework also repeat without count limits. Only tracker state stops the overall work. This is a comparison case without an overall bound. | [agent_runner.ex](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/agent_runner.ex#L101), [orchestrator.ex](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L1232), [PR feedback sweep](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L171) |
| [OpenHands](../cases/openhands.md) | Conversation errors allow two retries within one delivery. A new delivery resets the count. The study did not establish limits for the entire sequence of revised heads or total cost. | [Implementation study at a fixed commit](../cases/openhands.md) |
| [Orchestrator.inc](../cases/orchestrator.md) | Each review/comment notification key permits at most three attempts. Three automatic review execution failures for the same head stop attempts. These are local notification and execution limits, not a limit on the complete repair process. | [Implementation study at a fixed commit](../cases/orchestrator.md) |
| [Matt Pocock](../cases/matt-pocock.md) | The design limits review/rework failures and returns work to a human-waiting state. Users implement the numeric limit, counter, and cost limit. | [Study of the final PR version](../cases/matt-pocock.md) |
| [Stripe Minions](../cases/stripe-minions.md) | One run allows at most two CI rounds, then returns to a human. The implementation is private. | [Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) |
| [Super Simple Software Factory](../cases/sssf.md) | `build_review` permits three reviews and two repairs. `build_test` runs tests three times and does not test the last repair again. These limits differ from local resend counts. | [Static study of the loops](../loops/sssf.md) |

The study did not establish count or cost limits for Swamp repairs in [local tests](../loops/swamp.md#loop-d) or [CI and merge](../loops/swamp.md#loop-e).

## Related concepts

- [Fresh subagents for each task](fresh-context-subagents.md)
- [Keep a progress ledger outside the conversation](progress-ledger.md)
- [Human decision points](human-checkpoints.md)
- [Separate execution from acceptance](execution-vs-acceptance.md)
