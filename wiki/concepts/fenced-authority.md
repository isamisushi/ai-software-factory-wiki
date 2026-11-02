---
title: Fence stale write authority
kind: concept
aliases: [fenced authority, fencing token, stale writer rejection]
category: Safety
seen_in: []
---

# Fence stale write authority

[← Concepts](../concepts.md)

## Definition

Fencing rejects writes from an outdated worker generation. Each ownership change increments the generation number. The destination applies a write only when the request generation matches the current generation. Comparison and application form one indivisible operation. This stops an old run from overwriting newer results. [Fenced Authority](https://github.com/sjarmak/software-factory-reliability/blob/b150a8ca477a3b67111b03c5b0412a36c219579c/patterns/fenced-authority.md)

## Why it is needed

Starting a replacement for a slow worker does not establish that the old worker stopped. A stop request can fail to arrive, or a paused process can resume. A worker name or a permission assessment before startup cannot establish authority at the moment of writing. [Failure scenario](https://github.com/sjarmak/software-factory-reliability/blob/b150a8ca477a3b67111b03c5b0412a36c219579c/drills/stale-writer-completes/DRILL.md)

For example, worker A in generation 7 pauses while worker B in generation 8 publishes an artifact. A then resumes. If the destination rejects generation 7 requests, it protects the artifact from B. Completion updates need the same condition.

## Implementations

The study did not establish production use of this mechanism in the three newly added cases. Therefore, `seen_in` remains empty. Workspace separation, audits after changes, and saved progress alone do not prove this property.

| Case | Current assessment | Evidence |
| --- | --- | --- |
| [Stripe Minions](../cases/stripe-minions.md) | The public description includes devbox isolation. Generation comparison remains unestablished. | Public scope described on the case page |
| [StrongDM](../cases/strongdm.md) | Resume support in the public Attractor specification does not establish generation comparison at internal destinations. | Public scope described on the case page |
| [SSSF](../cases/sssf.md) | The study found an audit after changes. It did not find destination-side rejection of publication by old runs in the inspected path. | Study at a fixed commit |

## Supporting teaching material

The study cloned `software-factory-reliability` on 2026-11-02. It inspected documents, the in-memory model, and failure scenarios at `b150a8ca477a3b67111b03c5b0412a36c219579c`. This is not counted as an operational case of a complete factory.

The model uses `Destination.compare_and_publish()` to compare the request generation before updating the artifact. Protected `Factory.publish()` calls this path. The unprotected version overwrites based on a previously observed value. Completion updates also reject older generations. [model.py](https://github.com/sjarmak/software-factory-reliability/blob/b150a8ca477a3b67111b03c5b0412a36c219579c/src/adapters/in_memory/model.py#L238), [publish](https://github.com/sjarmak/software-factory-reliability/blob/b150a8ca477a3b67111b03c5b0412a36c219579c/src/adapters/in_memory/model.py#L894), [complete](https://github.com/sjarmak/software-factory-reliability/blob/b150a8ca477a3b67111b03c5b0412a36c219579c/src/adapters/in_memory/model.py#L402)

The failure scenario resumes an old worker after a newer generation publishes. It compares protected and unprotected outcomes. This study did not run that fault test. The model assumes that comparison and application cannot be interrupted. It does not prove the same property for a real database or external API. [Scenario and limits](https://github.com/sjarmak/software-factory-reliability/blob/b150a8ca477a3b67111b03c5b0412a36c219579c/drills/stale-writer-completes/DRILL.md)

## What it does not guarantee

Fencing does not guarantee correct output from the current worker, termination of old processes, or freedom from duplicate effects across all external APIs. Readable demonstration code, passing model tests, and guarantees at a real destination are separate levels of evidence.

## Related concepts

- [Tie acceptance to a commit](commit-bound-acceptance.md) fixes the accepted version. Write authority is a separate condition.
- [Delegate writes through a gate](delegated-write-gate.md) evaluates conditions where changes take effect.
- [Isolated workspaces](isolated-workspace.md) prevent interference between work files. They do not reject stale writes at the publication destination.
- [Audit changes after execution](post-execution-write-audit.md)
