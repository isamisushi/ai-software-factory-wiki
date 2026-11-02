---
title: Control incoming contributions
kind: concept
aliases: [conditional acceptance, input control, closed contribution]
category: Input
seen_in: [swamp, superpowers, symphony, gh-aw]
---

# Control incoming contributions

[← Concepts](../concepts.md)

## Definition

Input control limits accepted changes and required human involvement. This page distinguishes two policies.

Closed contribution rejects external pull requests (PRs), which propose code changes. Only people and agents under the organization control write code. External users submit bugs and requests. Swamp follows this policy.

Conditional acceptance permits external code with requirements such as model disclosure and human inspection of the changes. Superpowers follows this policy.

## Why it is needed

Agents can create changes faster than humans can review them. Large changes do not reveal whether a human or an agent wrote them. Both cases cite this review workload when they reject or restrict external PRs. These policies alone do not guarantee safety or quality.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | PRs from nonemployees close immediately. The team inspects issues for prompt injection and malicious intent before implementing them internally. Reporters receive co-author credit. | `CONTRIBUTING.md`, ci.yml: `auto-merge` excludes fork PRs |
| [Superpowers](../cases/superpowers.md) | External PRs require disclosure of the model, harness, and all plugins. A harness is the software that runs the agent. Humans must write their own summary, inspect the entire change, and address a problem they actually encountered. Maintainers close bundled PRs and agent fixes for other users’ issues. New skills are generally not accepted. Maintainers make the decision. No CI gate enforces it. | [AGENTS.md](https://github.com/obra/superpowers/blob/2ce8aa1/AGENTS.md), [PULL_REQUEST_TEMPLATE.md](https://github.com/obra/superpowers/blob/2ce8aa1/.github/PULL_REQUEST_TEMPLATE.md) |
| [Symphony](../cases/symphony.md) | Input filters select issues that start agents. Filters cover active/terminal states, required labels, and Linear assignees (`assignee`, including `me`). `Todo` issues must have no unfinished blockers. `Backlog` is excluded. A human must move work to `Todo`. The SPEC recommends restricting dispatch so untrusted issues do not automatically reach agents. This recommendation is optional. | [SPEC §8.2](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L754), [SPEC §15.5](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1771), [linear/client.ex](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/linear/client.ex#L496) |
| [GitHub Agentic Workflows](../cases/gh-aw.md) | The contribution policy rejects direct PRs from non-core members. Contributors submit detailed plans as issues. The core team uses agents to implement them. | [Implementation study at a fixed commit](../cases/gh-aw.md) |

Swamp rejects external code. Superpowers accepts it with human involvement and disclosure of its origin. Both cite the burden of reviewing large volumes of agent-generated changes.

## Related concepts

[Issue lifecycle state machine](issue-lifecycle-state-machine.md) and [review of the trust root](trust-root-review.md) describe related controls.
