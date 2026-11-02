---
title: Fix the machine
kind: concept
aliases: [session learnings, factory iteration]
category: Operations
seen_in: [swamp, superpowers, gh-aw, matt-pocock]
---

# Fix the machine

[← Concepts](../concepts.md)

## Definition

Fixing the machine means correcting the process that causes failures. Repeated failures require more than repairs to individual outputs. Teams improve the skills, conventions, gates, and scripts so that the factory catches that class of failure.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | Session Learnings turn difficulties into proposed additions to `AGENTS.md` or a skill. Following about 70 lines of attestation instructions produced slightly different results each time. A generation script replaced those instructions. After an incident caused by inferred verdicts, the system tightened its decision rules. | `AGENTS.md`, `verification-conventions.md` |
| [Superpowers](../cases/superpowers.md) | Design documents record failures from user sessions, then drive skill revisions. Examples include repeated completed tasks, endless review loops, and 42k characters of pasted history. `diagnosing-superpowers` creates evidence-backed reports from session records. Pressure tests and Quorum evaluations assess revisions. | [docs/superpowers/specs/](https://github.com/obra/superpowers/blob/2ce8aa1/docs/superpowers/specs), [diagnosing-superpowers](https://github.com/obra/superpowers/blob/2ce8aa1/skills/diagnosing-superpowers/SKILL.md), [Loop F](../loops/superpowers.md#loop-f) |
| [GitHub Agentic Workflows](../cases/gh-aw.md) | `ci-coach` reads CI logs and test results, then proposes process repairs and efficiency changes as PRs. This is not a closed autonomous loop through PR acceptance. | [Implementation study at a fixed commit](../cases/gh-aw.md) |
| [Matt Pocock](../cases/matt-pocock.md) | Fix turns failure logs into factory changes. Retro does the same with merged PRs and findings. Instructions prohibit a failed Fix from starting a chain of further Fix tasks. | [Study of the final PR version](../cases/matt-pocock.md) |

## Related concepts

[Deterministic verdicts](deterministic-verdict.md) illustrate a process repair based on an observed failure.
