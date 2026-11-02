---
title: Deterministic verdicts
kind: concept
aliases: [verdict marker, fail-closed judgement]
category: Verification
seen_in: [swamp, sssf]
---

# Deterministic verdicts

[← Concepts](../concepts.md)

## Definition

A deterministic verdict uses fixed rules to read review output. Code reads a defined marker or JSON field instead of inferring pass/fail from review prose. Missing required output or a parsing failure cannot count as a pass. If the system requests corrected output, it defines retry limits and final failure conditions.

## Scope of the decision

Format, internal consistency, and correctness of the content are separate properties. Valid JSON can contain both approval and serious unresolved findings. Code can reject that conflict, but it cannot detect every defect that the reviewer missed.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | Only a line starting with `VERDICT: pass` counts as a pass. The code detects provider errors first, with quoted code excluded. It extracts verdicts from the original output, so markers inside code blocks still count. Only missing markers trigger the under-50-byte classification of failure reasons. A short pass marker itself passes. The earlier prose-based approach passed a review with two blocking findings, which prompted this change (swamp-club#2265). | `scripts/check_review_verdict.ts`, `verification-conventions.md` |
| [Super Simple Software Factory](../cases/sssf.md) | Code tests consistency among JSON `approved`, `blocking`, and `findings`. The finish step connects acceptance conditions to the exit code. The model still judges content correctness. | [gates.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/gates.py), [runner.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/runner.py) |

Only the rules for reading output are deterministic. The correctness of the review is not. This study inspected the execution order in [determineVerdict](https://github.com/swamp-club/swamp/blob/963e0d2/scripts/check_review_verdict.ts#L110), rather than relying only on comments.

## Related concepts

- [Adversarial review](adversarial-review.md)
- [Call an LLM from a deterministic loop](deterministic-loop-calls-llm.md)
- [Separate execution from acceptance](execution-vs-acceptance.md)
