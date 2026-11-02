---
title: Separate black-box acceptance tests
kind: concept
aliases: [acceptance tests outside the agent, black box testing]
category: Verification
seen_in: [swamp, strongdm]
---

# Separate black-box acceptance tests

[← Concepts](../concepts.md)

## Definition

Black-box tests assess a product through its external behavior. Teams manage these acceptance tests separately from the implementation. UAT means acceptance tests against user requirements. Separate storage and write permissions prevent implementation agents from changing evaluation conditions to obtain a pass.

Adam Jacob recommends a black-box test suite as the first step toward a factory.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | Tests that start the CLI as a subprocess cannot live in the main repository. The separate `swamp-uat` repository tests the compiled binary. Every plan must assess the need for UAT. Missing coverage becomes an issue in `swamp-uat`. | `AGENTS.md`, `agent-constraints/planning-conventions.md` |
| [StrongDM Software Factory](../cases/strongdm.md) | StrongDM describes evaluation scenarios that often live outside the code and use DTU to assess external behavior. The study did not audit separation of access to that storage. | [Story](https://factory.strongdm.ai/), [DTU](https://factory.strongdm.ai/techniques/dtu) |

## Types of separation and limits

Storage outside the codebase, invisibility to the implementer, and protection against implementer edits are three different conditions. A separate repository does not separate write authority if the same credentials can change it. The StrongDM description of external storage does not establish access controls.

Distinguish Boolean test results from model-based scores. Separate evaluation still permits missing scenarios and scoring errors.

## Related concepts

- [Adversarial review](adversarial-review.md)
- [Reproduce external service behavior](behavioral-service-twins.md)
- [Separate execution from acceptance](execution-vs-acceptance.md)
