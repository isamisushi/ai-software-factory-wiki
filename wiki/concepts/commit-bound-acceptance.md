---
title: Tie acceptance to a commit
kind: concept
aliases: [head-bound acceptance, stale review prevention]
category: Verification
seen_in: [openhands, orchestrator]
---

# Tie acceptance to a commit

[← Concepts](../concepts.md)

## Definition

Commit-bound acceptance ties results to a specific code version. Test and review results identify the commit SHA, not only the PR number. A SHA identifies a commit. If the code changes, a pass for the old version does not pass the new version.

The merge request also supplies the expected SHA. If another commit arrives after assessment, the merge fails.

## Why it is needed

Another worker or agent can change the code between review and merge. A pass recorded only against the PR can appear to cover untested code.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [OpenHands](../cases/openhands.md) | The watchdog inspects two statuses and Actions for the current head, then passes the same SHA to the merge API. The inspected reviewer template did not reveal a path that publishes the required statuses. This leaves an unresolved connection between stages. | [watchdog](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-delivery-watchdog/scripts/worker.py#L43), [Reviewer output instructions](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/main.py#L938) |
| [Orchestrator.inc](../cases/orchestrator.md) | The GitHub merge API receives the expected head SHA and returns an error if the head changed. This condition does not require approval from the separate AO review system. | [GitHub merge adapter](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31eccaf1ac55f8e5015fd21ab414545ca/backend/internal/adapters/scm/github/merge_action.go#L20) |

## What to inspect

Inspect the version that a pass covers separately from the identity allowed to issue that pass. A matching SHA does not establish that the issuer is appropriate.

Also establish whether tests cover the PR head or a provisional merge commit. Updates to the target branch can change what acceptance means.

## Related concepts

- [Deterministic verdicts](deterministic-verdict.md)
- [Record local test evidence](local-verification-attestation.md)
- [Isolated workspaces](isolated-workspace.md)
- [Fence stale write authority](fenced-authority.md)
- [Separate execution from acceptance](execution-vs-acceptance.md)
