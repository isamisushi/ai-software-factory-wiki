---
title: Adversarial review
kind: concept
aliases: [adversarial review, skeptic reviewer]
category: Verification
seen_in: [swamp, superpowers, symphony, orchestrator]
---

# Adversarial review

[← Concepts](../concepts.md)

## Definition

Adversarial review means that an agent tries to break the code. The reviewer assumes that the code contains defects. This review runs separately from ordinary review.

Teams often assign reviewers to specific requirements, such as security, user experience, and accessibility. They run only the reviewers that the change needs.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | Swamp reviews plans across Architecture, Scope, Risk, Testing, Complexity, Security, Correctness, and Documentation. Code review uses four reviewers: code, adversarial, ux, and ci-security. Changed paths determine which reviewers run. CI runs them again for changes to core components. | `agent-constraints/adversarial-dimensions.md`, `verification/review-prompts/`, `verification-conventions.md`  Guards table |
| [Superpowers](../cases/superpowers.md) | Each task gets a skeptical reviewer, rather than one reviewer per quality requirement. The reviewer treats the implementer report as an unproven claim. Reasons such as omitting work under YAGNI also count as self-assessment. The reviewer returns separate decisions for specification compliance and quality. The controller must not bias the reviewer with instructions to ignore particular findings. | [task-reviewer-prompt.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/task-reviewer-prompt.md#L64), [SKILL.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md) |
| [Symphony](../cases/symphony.md) | The Elixir `AGENTS.md` calls for early adversarial review of nontrivial changes and attempts to break adjacent lifecycle paths. A reproducible failure blocks landing even if other reviews pass. The public repository contains instructions, but no prompt or mechanism that performs this review. The study found no public PR comments matching the `## Codex Review — <persona>` format that the land skill awaits. | [AGENTS.md L36](https://github.com/openai/symphony/blob/be10a1b/elixir/AGENTS.md#L36), [land SKILL.md](https://github.com/openai/symphony/blob/be10a1b/.codex/skills/land/SKILL.md) |
| [Orchestrator.inc](../cases/orchestrator.md) | A separate reviewer reads the changes and untrusted repository content, then returns a structured decision. Instructions prohibit running tests. Permission enforcement differs by adapter. | [Implementation study at a fixed commit](../cases/orchestrator.md) |

Adam Jacob said in a podcast that an adversarial skill keeps the website at a Lighthouse score of 100. The study did not inspect its source.

## Related concepts

[Deterministic verdicts](deterministic-verdict.md) and [review of the trust root](trust-root-review.md) describe related controls.
