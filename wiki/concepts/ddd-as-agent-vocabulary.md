---
title: Use domain terms as agent vocabulary
kind: concept
aliases: [architecture skill, domain driven design for agents]
category: Architecture
seen_in: [swamp]
---

# Use domain terms as agent vocabulary

[← Concepts](../concepts.md)

## Definition

Domain-driven design (DDD) organizes software around domain concepts. Teams explicitly select design vocabulary that agents already know and collect it in a skill. Agents use that vocabulary for planning and review. Without it, agents can choose designs independently for each change and produce code that is difficult to change.

Adam Jacob explains that agents already know DDD books and understand terms such as an anti-corruption layer, which isolates one domain from another.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | The `ddd` skill defines how to select building blocks, the shared domain vocabulary, and required tests for each building block. Plans require DDD analysis. Code review and conformance review also use it. | `.claude/skills/ddd/SKILL.md`, `agent-constraints/planning-conventions.md` |

## Related concepts

[Architecture fitness tests](architecture-fitness-tests.md) enforce structural rules in code.
