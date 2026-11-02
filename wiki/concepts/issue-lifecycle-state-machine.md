---
title: Issue lifecycle state machine
kind: concept
aliases: [SDLC as state machine, lifecycle model]
category: Process
seen_in: [swamp, symphony]
---

# Issue lifecycle state machine

[← Concepts](../concepts.md)

## Definition

A state machine defines states and allowed transitions. It models work from issue intake to delivery as explicit stages. Agents advance work by calling transitions. Persistent state lives outside the agent conversation.

## Why it is needed

- Code can reject forbidden transitions. Exception paths still need inspection. Do not assume that code enforces every documented stage.
- Work can resume after context compression or a session change.
- Each transition produces an audit record.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | The `@swamp/issue-lifecycle` behavior advances through `triage → plan → adversarial_review → approve → implement → code_conformance_review → verify → post_attestation → link_pr → pr_merged → notify → summarize`. Each transition is recorded on a swamp-club issue. The final `summarize` requires the original problem, delivered result, and whether the goal was met. | `.claude/skills/issue-lifecycle/SKILL.md`, `extensions/models/_lib/schemas.ts` `TRANSITIONS` |
| [Symphony](../cases/symphony.md) | Tracker states form the lifecycle: `Backlog → Todo → In Progress → Human Review → Merging → Done`, with `Rework` for requested changes. Prompts define the work in each state. Code only runs agents for active states and stops and cleans up terminal states. It does not enforce allowed transitions or completion conditions. This is weaker than Swamp and also fits [tracker-controlled work](tracker-as-control-plane.md). | [WORKFLOW.md](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L107), [SPEC §7](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L635) |

The Swamp table describes the normal planned path. Other paths include `fast_forward` to record existing work, `link_issue` to connect issues, and `complete` to finish. Even `outcomeMet: false` permits transition to `done`. Process completion and goal achievement are separate outcomes. See the [diagram and enforcement scope](../loops/swamp.md#loop-a).

## Related concepts

- [Use the tracker to control work](tracker-as-control-plane.md) describes a weaker form that leaves transitions to instructions.
- [Human decision points](human-checkpoints.md)
- [Adversarial review](adversarial-review.md)
- [Record local test evidence](local-verification-attestation.md)
