---
title: End the run and hand off to a human
kind: concept
aliases: [stateless run handoff, event-driven human handoff]
category: Process
seen_in: [matt-pocock]
---

# End the run and hand off to a human

[← Concepts](../concepts.md)

## Definition

A stateless handoff ends execution while a human decides. The run saves necessary information in a ticket or PR, then exits. A human update starts a new run. The conversation does not remain alive while waiting.

## Why it is needed

The execution process cannot control when a human replies. This pattern separates waiting time from the lifetime of that process. A later run resumes from external records.

## Implementations

| Case | Implementation or policy | Evidence |
| --- | --- | --- |
| [Matt Pocock](../cases/matt-pocock.md) | A Run ends instead of waiting for a human. Tracker or Git host updates start a new Run. The Runner retains no state from the previous Run. No enforcement code is supplied. | [Run / Runner](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md#L18), [Explore and Rework](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/EXAMPLE-TASKS.md) |

## What to inspect

Identify what the run saves before exit and who authorizes the next start. The system also needs protection against duplicate events that start the same work twice. This skill includes duplicate prevention among its design questions, but leaves the method to users.

## Related concepts

- [Human decision points](human-checkpoints.md)
- [Keep a progress ledger outside the conversation](progress-ledger.md)
- [Use the tracker to control work](tracker-as-control-plane.md)
