---
title: Treat skills as tested code
kind: concept
aliases: [skill evals, pressure testing, TDD for skills]
category: Verification
seen_in: [superpowers, swamp]
---

# Treat skills as tested code

[← Concepts](../concepts.md)

## Definition

A skill is a procedure supplied to an agent. This pattern treats skills and conventions as code that determines behavior. Teams measure agent behavior before and after changes, then assess the effect before release.

## Why it is needed

- Small wording changes can alter an entire process when prompts carry much of its enforcement.
- Agents invent plausible reasons to skip expensive rules. Experiments expose the excuses they actually use.
- Wording also determines whether agents invoke a skill in the intended situation.

## What to inspect

- Identify measured properties: invocation, rule compliance, output quality, and cost.
- Identify the evaluator: humans, an LLM, or deterministic tests. Establish whether the tested agent can see the scoring criteria.
- Establish whether a gate blocks changes that fail evaluation or whether evaluation is only a convention.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Superpowers](../cases/superpowers.md) | `writing-skills` follows RED → GREEN → REFACTOR. RED exposes failure without the skill and records excuses. REFACTOR closes newly discovered escape routes. Each skill contains an excuse table. Quorum lives in a separate repository and runs real CLIs across 95 scenarios. A QA agent interacts with them and scores results using hidden acceptance criteria and deterministic tests after execution. PRs require before/after evaluation results. No merge mechanism requires passing those evaluations. | [writing-skills](https://github.com/obra/superpowers/blob/2ce8aa1/skills/writing-skills/SKILL.md#L30), [AGENTS.md](https://github.com/obra/superpowers/blob/2ce8aa1/AGENTS.md#L99), [superpowers-evals](https://github.com/prime-radiant-inc/superpowers-evals) |
| [Swamp](../cases/swamp.md) | The `verify-skills` workflow measures skill quality with tessl and skill invocation with promptfoo through `claude -p` or codex. Bundled skills require a quality score of at least 90%. The attestation includes this workflow as part of local testing. | `verification/workflow-verify-skills.yaml`, `evals/promptfoo/` |

## Related concepts

[Inject workflow rules at session start](workflow-bootstrap-injection.md) controls when skills enter the conversation. [Fix the machine](fix-the-machine.md) uses observed failures to improve the process.
