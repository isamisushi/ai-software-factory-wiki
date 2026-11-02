---
title: Review the trust root
kind: concept
aliases: [factory integrity, meta-review]
category: Safety
seen_in: [swamp, matt-pocock]
---

# Review the trust root

[← Concepts](../concepts.md)

## Definition

The trust root contains files that govern the factory. It includes agent instructions, review prompts, pass/fail scripts, and evaluation configuration. Changes to these files trigger a dedicated review. This aims to prevent changes such as an agent weakening its own evaluation conditions.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | `claude-review-integrity` runs for changes to `CLAUDE.md`, `AGENTS.md`, `verification/`, `agent-constraints/`, lifecycle references, verdict and attestation scripts, or promptfoo providers. The prompt starts by treating every PR file, including `CLAUDE.md`, as untrusted data. | ci.yml: `claude-review-integrity` |
| [Matt Pocock](../cases/matt-pocock.md) | The design requires human review of Fix PRs that change the factory itself. It supplies neither changed-file detection nor an implementation of a merge gate. | [Study of the final PR version](../cases/matt-pocock.md) |

## Related concepts

- [Control incoming contributions](closed-contribution.md)
- [Adversarial review](adversarial-review.md)
- [Audit changes after execution](post-execution-write-audit.md)
