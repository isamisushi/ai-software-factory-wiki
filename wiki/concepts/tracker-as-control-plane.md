---
title: Use the tracker to control work
kind: concept
aliases: [state-driven agent execution, tracker as control plane, board-driven dispatch]
category: Process
seen_in: [symphony, openhands, matt-pocock]
---

# Use the tracker to control work

[← Concepts](../concepts.md)

## Definition

A control plane decides when work starts and stops. This pattern uses issue tracker state as the sole input that controls agents. Trackers include Linear, Jira, and GitHub Issues. A persistent orchestrator reads the state and decides whether to start or stop agents. Humans manage work by moving cards instead of talking to each agent session.

## Why it is needed

- Humans do not need to monitor each session. Multiple issues can progress concurrently.
- Existing tracker operations express human decisions to start, approve, return, or cancel work. Mobile apps can also provide those controls.
- An orchestrator without its own database can recover after restart from tracker state.

## What to inspect

- Identify which states start and stop agents. Distinguish an agent that waits from an orchestrator that does not start it.
- Identify who changes state. Establish whether code enforces completion conditions or trusts agent reports.
- If state is the only stopping condition, identify where retry and cost limits apply.
- If anyone can submit issues, identify filters such as assignees, labels, and projects.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Symphony](../cases/symphony.md) | The orchestrator polls Linear every five seconds. It starts Codex for `active_states`: Todo, In Progress, Merging, and Rework. Terminal states stop agents and remove workspaces. Nonactive states stop agents. Humans use `Backlog → Todo` and `Human Review → Merging / Rework`. Agent tool calls change state. Code does not enforce transition validity. Failure retries have no count limit. Only state changes stop them. | [SPEC §8](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L733), [WORKFLOW.md](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L1), [Reconciliation](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L421) |
| [OpenHands](../cases/openhands.md) | GitHub issues, readiness labels, PR heads, and statuses trigger independent scanners. The connection from the current reviewer to the required status remains unestablished. | [Implementation study at a fixed commit](../cases/openhands.md) |
| [Matt Pocock](../cases/matt-pocock.md) | The design defines the tracker as the human control interface. Ticket or label changes trigger Runs. | [Study of the final PR version](../cases/matt-pocock.md) |

## Related concepts

- [Issue lifecycle state machine](issue-lifecycle-state-machine.md) defines states and transitions in code. Tracker-based control leaves transitions to instructions.
- [Human decision points](human-checkpoints.md)
- [Call an LLM from a deterministic loop](deterministic-loop-calls-llm.md)
- [Keep a progress ledger outside the conversation](progress-ledger.md)
