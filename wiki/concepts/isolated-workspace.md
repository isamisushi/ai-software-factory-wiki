---
title: Isolated workspaces
kind: concept
aliases: [per-issue workspace, git worktree isolation, sandboxed checkout]
category: Safety
seen_in: [symphony, swamp, superpowers, openhands, orchestrator, gh-aw, stripe-minions]
---

# Isolated workspaces

[← Concepts](../concepts.md)

## Definition

An isolated workspace separates files for one unit of work. Agents work and test in a separate directory, such as a Git worktree, clone, or container. This keeps concurrent tasks from damaging each other or the original working tree.

## Why it is needed

- Concurrent agents do not mix their changes.
- Tests start from a clean state without unrelated developer changes.
- A failed task can be discarded without affecting other tasks.

## What to inspect

- Identify the unit of separation: an issue, branch, or test run. Establish whether the workspace is reused or recreated.
- Establish whether code enforces paths and working directories or instructions merely describe the boundary.
- Distinguish directory separation from operating system and network isolation.
- Identify who removes obsolete workspaces and when.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Symphony](../cases/symphony.md) | Each issue gets `<workspace.root>/<normalized identifier>`. Later workers for that issue reuse it. The SPEC requires the agent working directory to equal the workspace. The workspace must remain under the root, and its name must use `[A-Za-z0-9._-]`. The SPEC calls these the most important portability constraints. A terminal issue triggers removal. The SPEC explicitly states that directory separation does not replace an operating system sandbox. | [SPEC §9](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L851), [SPEC §15.1](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1721) |
| [Swamp](../cases/swamp.md) | Three local test workflows run in a new `git worktree` on the host. A changed commit requires another test run. | [Case page §3.2](../cases/swamp.md) |
| [Superpowers](../cases/superpowers.md) | The `using-git-worktrees` skill creates an isolated working tree and assesses the test baseline. `finishing-a-development-branch` cleans it up. Effects outside the worktree are one condition that stops execution. | [Case page](../cases/superpowers.md) |
| [OpenHands](../cases/openhands.md) | Official instructions specify a Docker workspace per conversation. The study did not establish the mount or network boundaries of an actual deployment. | [Implementation study at a fixed commit](../cases/openhands.md) |
| [Orchestrator.inc](../cases/orchestrator.md) | Project workers receive a branch and worktree. Projectless workers use an AO-managed directory. | [Implementation study at a fixed commit](../cases/orchestrator.md) |
| [GitHub Agentic Workflows](../cases/gh-aw.md) | Work runs in an Actions agent job with sandbox configuration. Strict mode rejects disabling the sandbox. This study did not audit the complete external AWF implementation. | [Implementation study at a fixed commit](../cases/gh-aw.md) |
| [Stripe Minions](../cases/stripe-minions.md) | The description assigns work to devboxes and restricts production data, services, and arbitrary outgoing traffic. The study did not audit the configuration. | [Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) |

## Related concepts

- [Run agent tools on the host](host-side-agent-tools.md)
- [Record local test evidence](local-verification-attestation.md)
- [Fresh subagents for each task](fresh-context-subagents.md)
- [Fence stale write authority](fenced-authority.md)
- [Audit changes after execution](post-execution-write-audit.md)
