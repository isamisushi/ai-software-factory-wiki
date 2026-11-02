---
title: StrongDM Software Factory
kind: case
org: StrongDM
people: [Justin McCarthy, Jay Taylor, Navan Chauhan]
type: [internal, product]
source: partial
license: Apache-2.0 for the public Attractor specification
repo: https://github.com/strongdm/attractor
investigated_at: 2026-11-02
investigated_commit: fb57a55ed97372a27ac90102f436947e29f48426
concepts: [black-box-uat, spec-as-product, deterministic-loop-calls-llm, behavioral-service-twins]
---

# StrongDM Software Factory

[← Cases](../index.md) · [Loop diagrams](../loops/strongdm.md)

Research date: 2026-11-02. The research cloned and read `strongdm/attractor@fb57a55ed97372a27ac90102f436947e29f48426`. The public material is a natural-language specification, not the internal factory implementation. Operational details below are descriptions from the official website.

Concepts: [Separate black-box acceptance tests](../concepts/black-box-uat.md) · [Specification as product](../concepts/spec-as-product.md) · [Deterministic loop calls an LLM](../concepts/deterministic-loop-calls-llm.md) · [Behavioral service twins](../concepts/behavioral-service-twins.md)

## Summary

This team states that humans do not write or review code. It evaluates software generated from specifications through behavior visible from outside. The public Attractor material specifies workflow control. It does not publish the entire internal evaluation platform. [Story](https://factory.strongdm.ai/), [Public README](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/README.md)

## 1. Organization and people

The official article introduces the StrongDM AI team: Justin McCarthy, Jay Taylor, and Navan Chauhan. This case covers the development method that this team describes. It does not cover every change across StrongDM. [Story](https://factory.strongdm.ai/)

The public Attractor specifications use Apache-2.0. The fetched HEAD has 15 reachable commits, with the latest dated 2026-03-17. There are no reachable commits from 2026-08-04 through the research date. This is the history of the public specification. It does not measure internal development volume or autonomy. [LICENSE](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/LICENSE), [Pinned commit](https://github.com/strongdm/attractor/commit/fb57a55ed97372a27ac90102f436947e29f48426)

## 2. Product overview

Specifications and other inputs start repeated generation, evaluation, and feedback. The official Principles page describes repetition until evaluation scenarios pass consistently. Those scenarios are not used for implementation. The public material does not establish exact thresholds, required consecutive passes, or a total cost limit. [Principles](https://factory.strongdm.ai/principles)

## 3. Factory design from operational descriptions and specifications

### 3.1 Separate evaluation from implementation

Story describes a problem: agents can rewrite tests stored beside the code. User scenarios therefore often live outside the codebase. The evaluation measures the proportion of observed paths that satisfy users. It remains unknown whether technical controls deny access to all evaluation material. [Story](https://factory.strongdm.ai/)

### 3.2 A test environment that reproduces external services

Digital Twin Universe is a test environment for external API behavior. It handles faults that are hard to test against real services, and large numbers of scenarios. The official description says that API contracts and observed edge conditions guide the replicas. The team compares them with real services. Reproduction accuracy and failure rates in real environments remain unknown. [DTU](https://factory.strongdm.ai/techniques/dtu)

### 3.3 Public scope of Attractor

| Public file | Role |
| --- | --- |
| [attractor-spec.md](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/attractor-spec.md) | DOT graphs, branches, stage retries, saved progress, and human input. |
| [coding-agent-loop-spec.md](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/coding-agent-loop-spec.md) | A coding agent loop specification. This research did not read it in detail. |
| [unified-llm-spec.md](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/unified-llm-spec.md) | A shared LLM client specification. This research did not read it in detail. |

The fetched tree has no execution engine, CI, or dedicated AGENTS.md, CLAUDE.md, or CONTRIBUTING. The README describes giving these specifications to an agent for implementation. The specifications are the public deliverable. [README](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/README.md)

### 3.4 Separate node retries from workflow returns

The specification defines `max_retries` as additional attempts after the first attempt. Its default is 0. At the end, the engine examines results from visited `goal_gate` nodes. If a result is neither `SUCCESS` nor `PARTIAL_SUCCESS`, it returns to a configured destination. If no return destination exists, the run fails. The local node limit does not establish a limit on total trips through the graph. [Specification sections 3.3–3.5](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/attractor-spec.md#L335)

The specification also includes saved progress, resumption, and nodes that wait for a human choice. A team policy against human code review does not conflict with a general specification that supports human input. Which nodes the internal team uses is a separate question. [Design principles](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/attractor-spec.md#L34)

## 4. Public claims and supporting evidence

| Claim or specification | Evidence and limits |
| --- | --- |
| Humans do not write or review code | This is a team policy, not an audit of every PR. |
| External scenarios evaluate software | This is an official description. Storage permissions and scoring independence are not audited. |
| Graphs control and resume stages | The public specification states this. Internal runtime enforcement remains unknown. |
| DTU runs large volumes of fault tests | This is a company claim. Evidence that measures differences from real services remains unknown. |

## 5. Analysis

A comparison with Stripe asks where acceptance occurs: human code review or external evaluation. Both need suitable evaluation targets and methods. StrongDM's description does not establish that hidden scenarios alone guarantee correctness.

## 6. Open questions

Scenario leak prevention, scoring errors, and whether accepted artifacts match released artifacts remain unknown. Stop conditions, cost limits, and recovery after failures also remain unknown. Third-party implementations of Attractor are not evidence of StrongDM's internal implementation.

## Sources

Sources include [Story](https://factory.strongdm.ai/), [Principles](https://factory.strongdm.ai/principles), [Techniques](https://factory.strongdm.ai/techniques), [DTU](https://factory.strongdm.ai/techniques/dtu), and the [Attractor introduction](https://factory.strongdm.ai/products/attractor). The research read the web material on 2026-11-02. GitHub links use the commit above. The research did not obtain internal execution logs or counts of merged PRs.
