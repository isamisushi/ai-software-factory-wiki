---
title: Separate execution from acceptance
kind: concept
aliases: [execution success versus acceptance, phase success, run acceptance]
category: Verification
seen_in: [sssf]
---

# Separate execution from acceptance

[← Concepts](../concepts.md)

## Definition

Execution success and product acceptance are separate states. A stage can finish its assigned work correctly while its output fails requirements. For example, a test worker can correctly report a failing result. The worker succeeds, but the product fails.

## Why it is needed

Treating normal process exit or receipt of a review as overall success can ignore problems found by evaluation. If records, screens, and exit codes use different conditions, people and automation can read different outcomes.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [SSSF](../cases/sssf.md) | `Run.finish()` requires both stage success and `accepted`. It uses the same decision for session records, screen output, and the exit code. Callers supply test success or review approval. | [runner.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/runner.py#L114), [build_review](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_review.py) |

## What to inspect and limits

State the execution success conditions and acceptance conditions separately. Distinguish evaluation errors, failed evaluations, and tests that never ran. Make sure that the accepted version matches the final artifact.

SSSF defaults `accepted` to true, so each stage script must supply the appropriate condition. The distributed quality commands are placeholders that always succeed. Separating states does not compensate for missing test coverage. [quality.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/quality.py)

## Related concepts

- [Deterministic verdicts](deterministic-verdict.md) define how to read review output.
- [Tie acceptance to a commit](commit-bound-acceptance.md) identifies the version that passed.
- [Bounded fix loops](bounded-fix-loop.md) limit repairs after failures.
