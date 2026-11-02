---
title: Delegate writes through a gate
kind: concept
aliases: [safe outputs, mediated writes]
category: Safety
seen_in: [gh-aw]
---

# Delegate writes through a gate

[← Concepts](../concepts.md)

## Definition

A write gate controls which proposed changes take effect. The agent outputs proposed external changes. A separate process inspects their target, format, and permission conditions, then applies them with limited authority.

## Why it is needed

Issues or code can contain text that leads an agent toward an incorrect operation. If the reasoning process holds write permissions, its decisions directly cause external changes.

Separating proposals from execution lets code limit allowed operations. The correctness of a proposal within those permissions still needs separate assessment.

## Implementations

| Case | Implementation | Evidence |
| --- | --- | --- |
| [GitHub Agentic Workflows](../cases/gh-aw.md) | The agent job is read-only by default. The system inspects changes in safe outputs. A separate job applies them with limited permissions. Users can configure this mechanism. Different configurations do not guarantee the same protection. | [README at the studied commit](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/README.md#L49), [Implementation and configuration exceptions](../cases/gh-aw.md) |

## What to inspect

Make sure that the agent cannot obtain write credentials or write directly through another path. Inspecting the proposal file alone does not prove an execution boundary.

Inspect the behavior when threat detection fails. Stopping, applying changes with warnings, and converting work into human-reviewable changes are different outcomes.

In gh-aw strict mode, compilation rejects agent write permissions for `contents / issues / pull-requests`. Continuation after threat detection is enabled by default. When detection raises a warning, the system classifies operations. Reviewable artifacts remain with warnings. Branch pushes become PR creation. Operations such as merge stop. A configuration also disables detection entirely. [Permission rules](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/strict_mode_permissions_validation.go#L20), [detection configuration](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/threat_detection_config.go#L32), [operation classification](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_output_handler_manager.cjs#L175).

## Related concepts

- [Run agent tools on the host](host-side-agent-tools.md)
- [Review the trust root](trust-root-review.md)
- [Deterministic verdicts](deterministic-verdict.md)
- [Fence stale write authority](fenced-authority.md)
