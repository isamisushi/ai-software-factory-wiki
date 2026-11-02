---
title: Inject workflow rules at session start
kind: concept
aliases: [session bootstrap, skill auto-triggering, SessionStart injection]
category: Process
seen_in: [superpowers]
---

# Inject workflow rules at session start

[← Concepts](../concepts.md)

## Definition

Bootstrap injection adds workflow rules when a session starts. A hook or similar mechanism supplies the starting stage and rules for choosing skills. Workflow entry does not depend on the agent remembering the process at that moment.

## Why it is needed

A skill file alone does not make an agent invoke it. The agent needs the workflow before its first question or code search. Otherwise, it can skip design and planning and start implementation.

The same mechanism can restore rules after context compression or `/clear`.

## What to inspect

- Identify the mechanism: a hook, harness configuration, or manual input. Identify the events that trigger it.
- Establish whether it supplies only rules or also workflow state and next steps.
- The model still decides whether to invoke the skill. Establish whether the team measures invocation rates.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Superpowers](../cases/superpowers.md) | `SessionStart` on startup, clear, or compact injects the full `using-superpowers` text inside `<EXTREMELY_IMPORTANT>`. It instructs agents to invoke a skill even with only a 1% chance that it applies. Acceptance tests for a new harness use `Let's make a react todo list` and require automatic invocation of `brainstorming`. | [hooks/session-start](https://github.com/obra/superpowers/blob/2ce8aa1/hooks/session-start#L41), [using-superpowers](https://github.com/obra/superpowers/blob/2ce8aa1/skills/using-superpowers/SKILL.md#L11), [AGENTS.md](https://github.com/obra/superpowers/blob/2ce8aa1/AGENTS.md#L84) |

## Related concepts

[Treat skills as tested code](skills-as-tested-code.md) measures skill invocation. [Human decision points](human-checkpoints.md) define where the workflow needs human judgment.
