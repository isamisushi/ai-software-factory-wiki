---
title: Audit changes after execution
kind: concept
aliases: [post-execution write audit, post-hoc permission check]
category: Safety
seen_in: [sssf]
---

# Audit changes after execution

[← Concepts](../concepts.md)

## Definition

A write audit detects changes outside the allowed scope. It compares file state before and after agent execution. A violation causes rejection of the output and an attempt to restore files. This differs from preventing writes before they happen.

## Why it is needed

A read-only prompt or removal of editing tools does not prevent changes. Agents can write files through other paths, such as a shell. The system therefore needs to inspect what actually changed.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [SSSF](../cases/sssf.md) | The system compares changes before and after execution against each role’s `writes` and the global `protected_files`. Detected violations trigger an attempted restoration and a `PermissionBreach` exception. | [permissions.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/permissions.py#L163) |

## What to inspect and limits

Establish whether the comparison uses contents, hashes, line counts, or only filenames. SSSF uses added/deleted line counts for tracked files and names for untracked files. Different contents with the same comparison values remain indistinguishable. [snapshot](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/permissions.py#L50)

Establish whether failed runs reach the audit and whether restoration preserves earlier uncommitted changes. SSSF audits permissions after JSON parsing and gate evaluation. Earlier exception paths therefore skip the audit. [Call order](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agents.py#L141)

An audit after execution cannot undo information reads or requests sent outside the environment. Successful file restoration does not prove safe isolation of execution.

## Related concepts

- [Isolated workspaces](isolated-workspace.md) reduce file interference between tasks.
- [Review the trust root](trust-root-review.md) assesses changes to the evaluation mechanism itself.
- [Fence stale write authority](fenced-authority.md) rejects outdated workers at the destination.
