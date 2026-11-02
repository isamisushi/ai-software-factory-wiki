---
title: Distribute a specification as the product
kind: concept
aliases: [spec as product, spec-first distribution, implement this spec]
category: Architecture
seen_in: [symphony, strongdm]
---

# Distribute a specification as the product

[← Concepts](../concepts.md)

## Definition

A specification describes required behavior independently of implementation language. This pattern distributes that specification as the main product. Users give it to a coding agent to build an implementation for their language and environment. A reference implementation can accompany it, but the specification remains authoritative.

## Why it is needed

- Agents that implement specifications reduce the need to distribute and maintain implementations for each language and environment.
- The specification can delegate user-specific choices, such as trackers, approval policy, and sandboxes, while requiring documentation.
- Conformance tests and completion criteria in the specification allow a common assessment of generated implementations.

## What to inspect

- Establish whether the intended reader is an agent. Look for redundant summaries, cheat sheets, and normative language.
- Find the conformance definition and test matrix. Distinguish required, optional, and live-environment tests.
- Identify which artifact must change when the specification and reference implementation disagree.
- Identify who assesses generated implementations and how.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Symphony](../cases/symphony.md) | The README first recommends giving `SPEC.md` to a preferred coding agent for implementation. The 2,312-line SPEC uses RFC 2119 terms. It includes a deliberately redundant cheat sheet (§6.4), test matrix (§17), and completion definition (§18). These help agents implement the configuration layer quickly. The Elixir reference implementation is experimental. `AGENTS.md` permits a superset of the SPEC but prohibits conflicts. Behavior changes must update the SPEC in the same change. Claims that Codex built other language implementations come from the company. Those implementations are absent from the repository. | [README](https://github.com/openai/symphony/blob/be10a1b/README.md), [SPEC §6.4](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L605), [SPEC §18](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L2204), [AGENTS.md](https://github.com/openai/symphony/blob/be10a1b/elixir/AGENTS.md#L15) |
| [StrongDM Software Factory](../cases/strongdm.md) | Natural-language specifications cover Attractor, the coding agent loop, and the LLM client. Users implement them. These artifacts do not provide the source of the complete internal factory. | [README](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/README.md) |

## Related concepts

[Treat skills as tested code](skills-as-tested-code.md) measures the procedures themselves. [Use the tracker to control work](tracker-as-control-plane.md) describes one architecture that a specification can define.
