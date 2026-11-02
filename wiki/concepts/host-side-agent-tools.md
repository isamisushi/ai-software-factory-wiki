---
title: Run agent tools on the host
kind: concept
aliases: [host-side tool execution, credential isolation, dynamic tools]
category: Safety
seen_in: [symphony]
---

# Run agent tools on the host

[← Concepts](../concepts.md)

## Definition

Host-side tools run in the process that starts the agent. Operations that need external service credentials run there instead of inside the agent process. The agent receives tool definitions and results, but never the token itself.

## Why it is needed

Prompt injection or mistaken commands can lead an agent to misuse credentials. Without the token, the agent cannot export it or use it directly beyond the intended scope.

The host can also restrict which projects and operations each tool can access.

## What to inspect

- Make sure that child-process environment variables and files actually exclude the credentials.
- Identify which resources tools can change and whether they permit reads, writes, or both.
- Identify the isolated service credentials. Establish whether other credentials, such as GitHub credentials, remain visible to the agent.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Symphony](../cases/symphony.md) | Tracker tools, such as `linear_graphql` for Linear, register as dynamic tools when the Codex session starts. They run with credentials configured on the Symphony host. The child environment excludes secret variable names declared by the adapter. Startup also runs `unset` for those names. The SPEC prohibits credentials written directly into `WORKFLOW.md`, which the child can read. The agent uses `gh` inside the workspace for push and merge. GitHub authentication does not use the same isolation. | [SPEC §10.5](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1065), [SPEC §15.3](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1748), [app_server.ex](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/codex/app_server.ex#L221) |

## Related concepts

- [Review the trust root](trust-root-review.md)
- [Isolated workspaces](isolated-workspace.md)
- [Control incoming contributions](closed-contribution.md)
