---
title: Architecture fitness tests
kind: concept
aliases: [arch rules tests, ratchet]
category: Architecture
seen_in: [swamp]
---

# Architecture fitness tests

[← Concepts](../concepts.md)

## Definition

Architecture fitness tests enforce structural rules in source code. Static tests inspect layer boundaries, the public API, and conventions such as license headers. A ratchet fixes the number of existing violations and prevents increases. These tests stop agents from gradually weakening the architecture.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | `integration/*_rules_test.ts` and `arch_fitness_helpers.ts` use the "pinned-ratchet" pattern. Rules prohibit importing the libswamp `mod.ts` barrel and using `Deno.env.set` in tests. Other rules detect differences between toolchain versions. | `AGENTS.md`  Testing section |

## Related concepts

[Use domain terms as agent vocabulary](ddd-as-agent-vocabulary.md) describes another way to preserve architectural boundaries.
