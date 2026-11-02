---
title: Record local test evidence
kind: concept
aliases: [verification evidence, verification attestation]
category: Verification
seen_in: [swamp]
---

# Record local test evidence

[← Concepts](../concepts.md)

## Definition

An attestation is a generated record of test evidence. Developers run expensive builds, tests, and agent reviews on their machines. A tool collects the results into this record. CI tests the consistency of the record. Even when CI skips test repetition, it can run additional agent reviews.

## Why it is used

Developer subscriptions can pay for agent reviews instead of CI API keys. Agents can also repair failures and repeat tests quickly on the developer machine.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | The `verify-build`, `verify-reviews`, and `verify-skills` Swamp workflows run in a fresh `git worktree`. The `build-attestation` script records step results, duration, review models, SHA-256 values of configuration files, and affected CLI commands. CI requires a matching commit, `allPassed`, required configuration hashes, and other conditions before approving the PR. Records older than 24 hours or with unknown timestamps produce warnings. Neither condition alone causes rejection. | `agent-constraints/verification-conventions.md`, `verification/*.yaml`, ci.yml: `validate-attestation` |

Swamp explicitly states that it inspects the schema but does not guarantee provenance, which identifies the origin of evidence. This differs from a cryptographic signature or independent proof that every test actually ran. Sources: [test conventions](https://github.com/swamp-club/swamp/blob/963e0d2/agent-constraints/verification-conventions.md#L355), [freshness warnings](https://github.com/swamp-club/swamp/blob/963e0d2/.github/workflows/ci.yml#L688).

## Related concepts

[Deterministic verdicts](deterministic-verdict.md) define how code reads review outcomes.
