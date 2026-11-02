---
title: Call an LLM from a deterministic loop
kind: concept
aliases: [flip the agent loop, behavior-centric AI]
category: Architecture
seen_in: [swamp, symphony, openhands, orchestrator, gh-aw, stripe-minions, strongdm, sssf]
---

# Call an LLM from a deterministic loop

[← Concepts](../concepts.md)

## Definition

A deterministic loop follows rules defined in code. The workflow controls execution and calls an LLM only where judgment or reasoning is needed. An LLM is a large language model. Its calls use typed inputs and outputs. This avoids paying an LLM to generate the whole procedure each time.

Steps that call an LLM still use reasoning on subsequent runs. External APIs, time, state, and LLM responses can change the output. This approach does not guarantee identical output or a 100% success rate.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | Behavior-Centric AI is the product’s central idea. Agents convert intent into behaviors and workflows, then reuse the defined flow. Changed requirements lead to revised components. Swamp applies this idea to its own development. LLMs judge reviews. Deterministic code decides pass/fail and merge. | `README.md`, `design/README.md`, podcast |
| [Symphony](../cases/symphony.md) | Deterministic orchestration controls polling, dispatch eligibility, concurrency, retries, and stopping. It starts a Codex session per issue. Each call delegates the complete coding task rather than a small decision. The agent follows instructions for tests, PRs, and merge. Only the outer execution structure is deterministic. | [SPEC §3.2](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L118), [orchestrator.ex](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex) |
| [OpenHands](../cases/openhands.md) | Independent scanners start agent conversations when conditions match. The watchdog calls no LLM. It decides whether to merge from the SHA, statuses, and CI. | [Implementation study at a fixed commit](../cases/openhands.md) |
| [Orchestrator.inc](../cases/orchestrator.md) | Go code observes PRs, returns problems to workers, and controls review triggers. Workers handle implementation and repairs. | [Implementation study at a fixed commit](../cases/orchestrator.md) |
| [GitHub Agentic Workflows](../cases/gh-aw.md) | Markdown compiles into Actions with separate agent, detection, and application jobs. Deterministic handlers inspect and apply the reasoning output. | [Implementation study at a fixed commit](../cases/gh-aw.md) |
| [Stripe Minions](../cases/stripe-minions.md) | Blueprints connect ordinary code stages and agent stages. This comes from the official description. The implementation is private. | [Blueprints](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) |
| [StrongDM Software Factory](../cases/strongdm.md) | The Attractor specification defines DOT graphs, conditional branches, and retries per node. The public artifact is a specification, not an audit of the internal implementation. | [attractor-spec.md](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/attractor-spec.md) |
| [Super Simple Software Factory](../cases/sssf.md) | Python controls stages, repetition, and finish, and inspects AI-generated JSON. Users configure the commands that run real tests. | [build_review](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_review.py), [quality.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/quality.py) |

## Related concepts

[Deterministic verdicts](deterministic-verdict.md) apply fixed rules to review output.
