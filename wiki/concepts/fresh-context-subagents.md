---
title: Fresh subagents for each task
kind: concept
aliases: [controller and subagents, fresh context per task, subagent-driven development]
category: Architecture
seen_in: [superpowers]
---

# Fresh subagents for each task

[← Concepts](../concepts.md)

## Definition

A subagent is a separate agent assigned bounded work. The main agent acts as the controller, which coordinates work. It assigns implementation and review to new subagents for each task. Each subagent receives only the files needed for its task, without the conversation history.

## Why it is needed

- Earlier experiments and assumptions do not carry into the next task.
- Reviewers lack the implementer context, which reduces the influence of the implementer explanation.
- The controller keeps its context for coordination. Long plans are less likely to require context compression.
- Each role can use a different model. Routine implementation can use a cheaper model, while final review uses a stronger model.

## What to inspect

- Identify what each subagent receives: task text, interfaces, or changes. Look for pasted conversation history.
- Establish whether implementers can start further subagents.
- Establish whether the controller can repair code itself, which bypasses review.
- Establish whether workers run concurrently or in sequence.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Superpowers](../cases/superpowers.md) | The SDD controller gives a fresh implementer task text extracted by `task-brief`. A fresh reviewer receives change files from `review-package`. It does not paste summaries of earlier tasks. Neither implementers nor reviewers can start subagents. The controller does not repair code. Implementers run sequentially. The controller explicitly selects a model for each role. | [SKILL.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md), [Model Selection](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md#L139), [task-reviewer-prompt.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/task-reviewer-prompt.md) |

## Related concepts

- [Bounded fix loops](bounded-fix-loop.md)
- [Keep a progress ledger outside the conversation](progress-ledger.md)
- [Adversarial review](adversarial-review.md)
