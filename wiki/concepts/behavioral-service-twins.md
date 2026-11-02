---
title: Reproduce external service behavior
kind: concept
aliases: [Digital Twin Universe, DTU, behavioral service twins]
category: Verification
seen_in: [strongdm]
---

# Reproduce external service behavior

[← Concepts](../concepts.md)

## Definition

A service twin reproduces external service behavior for tests. It reproduces both the API and behavior that callers can observe. Tests include normal responses, failures, and boundary conditions. StrongDM calls this environment the Digital Twin Universe (DTU). [Official description](https://factory.strongdm.ai/techniques/dtu)

## Why it is needed

Rate limits, costs, and effects on real data limit tests against live services. A controlled test environment lets teams repeat and compare the same failure conditions.

A substitute that returns fixed responses cannot fully assess state changes or unexpected operations. Test reliability depends on the behavior reproduced and the comparison against the real service.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [StrongDM](../cases/strongdm.md) | StrongDM describes reproductions of Okta, Jira, Slack, Google services, and others. Its approach uses API contracts and observed boundary conditions, then compares the twins against real services. The study did not inspect internal code or measurements. | [DTU](https://factory.strongdm.ai/techniques/dtu) |

## What to inspect and limits

Matching the API shape does not establish matching permissions, state transitions, errors, concurrency, or delays. Record the reproduced behavior and the method used to compare it against the real service. The test environment also needs an update process when the real service changes.

Passing these tests does not cover conditions that the environment does not reproduce. Whether the implementation agent can change the test environment is a separate question.

## Related concepts

[Separate black-box acceptance tests](black-box-uat.md) addresses where evaluations live and who can change them. [Separate execution from acceptance](execution-vs-acceptance.md) distinguishes successful test execution from acceptance of the tested product.
