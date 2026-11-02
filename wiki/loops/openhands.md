---
title: OpenHands loops
kind: loops
case: openhands
investigated_commit: 6fb2b676
---

# OpenHands loops

[← Case study](../cases/openhands.md) · [Loop index and legend](index.md)

Research date: 2026-10-31 JST. Main target: `OpenHands/extensions@6fb2b67680b9a5b41452a148e5705f99c7df1a75`. The researcher chose the following names and divisions.

## Relationship map

```mermaid
flowchart TD
  a["Repetition A: Triage and start"] -->|"Workflow order: Ready issue to PR"| b["Repair B: Implementation and independent review"]
  b -->|"Read passing records"| c["Repair C: Base update and merge decision"]
  c -.->|"Review the new head"| b
  d["Retry D: Delivery and conversation error"] -->|"Shared dispatch, not containment"| a
  d -->|"Shared dispatch"| b
```

Four automations run independently on schedules. One parent loop does not call all four roles. The current reviewer catalog does not establish a path that creates the required status. Therefore, the passing-record connection from B to C and the repair trigger within B remain unknown. The official demo and the current HEAD implementation do not establish one complete cycle together.

| Unit | Cycle unit | Evaluation and return path | Exit / enforcement and limits |
| --- | --- | --- | --- |
| Repetition A | Issue input fingerprint and scheduled scan | Triage assesses scope, questions, and acceptance conditions. Unresolved decisions return to human discussion. | `ready-for-dev` and completed dependencies start the developer. Triage correctness depends on the prompt. |
| Repair B | PR head SHA | Instructions tell the developer to read reviewer findings. The scanner starts repair on review status failure/error. | Review the new head. Current catalog status publisher unknown. The overall repair limit is unknown, not established as unlimited. |
| Repair C | PR head with passing records and current base | If the base is stale, request GitHub update-branch and return to B. | Same-head passing status, all status/Actions success, fresh base, and mergeable state. Merge specifies the SHA. No LLM. |
| Retry D | Delivery for an automation and subject | Resend the same work after a conversation error for that delivery. | Two error retries. A new delivery resets the count. This is not a total cost or repair limit. |

## Repetition A: Triage and start {#loop-a}

```mermaid
flowchart TD
  input["Human adds an issue or discussion"]:::human --> scan["Scheduled scanner fingerprints input"]
  scan --> changed{{"Unprocessed input?"}}:::gate
  changed -->|"No"| wait["Wait for the next scan"]
  changed -->|"Yes"| triage["Triage agent assesses scope, non-goals,<br/>acceptance conditions, and questions"]
  triage --> judgment["Prompt: Publish readiness and priority"]
  judgment --> ready{{"Developer scanner:<br/>Ready label, dependencies done, no PR"}}:::gate
  ready -->|"Pass"| dev["Start developer conversation<br/>with instructions to create a PR"]
  ready -.->|"Unresolved: Human reply or issue update"| input
  dev --> next[["Repair B: Implementation and independent review"]]:::loopref
  classDef human fill:#fde68a,stroke:#b45309,color:#000
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

[Continue to repair B](#loop-b)

This repeats input processing. It does not evaluate and repair one implementation. Standard catalog triage uses legacy direct mode. The guarded publisher, which inspects JSON recommendations, is optional. The developer scanner does not reassess whether the agent correctly followed readiness instructions. [Triage](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-triage/scripts/worker.py) · [Developer](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-to-pr/scripts/worker.py#L117)

## Repair B: Implementation and independent review {#loop-b}

```mermaid
flowchart TD
  dev["Developer agent receives instructions<br/>to implement, test, and push"] --> label["Prompt: Apply review label"]
  label --> scan["Independent reviewer scanner selects head"]
  scan --> review["Reviewer agent:<br/>Inspect exact head and post native review"]
  review --> native["GitHub native review:<br/>commit_id is the target SHA"]
  native --> gap["Unknown connection:<br/>Current prompt forbids commit status creation"]
  status["Separately required current-head<br/>software-factory/review status"] --> failed{{"Developer scanner:<br/>Failure or error?"}}:::gate
  failed -.->|"Yes: Repair the same PR branch"| dev
  status --> pass["C reads successful tests and review"]
  pass --> next[["Repair C: Base update and merge decision"]]:::loopref
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

[Continue to repair C](#loop-c)

The missing arrow from native review to status is deliberate. The reviewer prompt requires `commit_id`. Completion reads a review from the same account for the same SHA. However, developer repair reads `software-factory/review` failure/error rather than native reviews. This condition also does not start repair when only tests fail. A separate status publisher or a working historical demo remains possible. [Reviewer prompt](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/main.py#L934) · [Repair trigger](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-to-pr/scripts/worker.py#L136)

## Repair C: Base update and merge decision {#loop-c}

```mermaid
flowchart TD
  scan["Watchdog fetches PR and head again"] --> shape{{"Managed branch, open, not draft<br/>Expected base, matching head, mergeable"}}:::gate
  shape -->|"Pass"| checks{{"Same-SHA review and tests succeed<br/>Other statuses and Actions succeed"}}:::gate
  shape -->|"Fail"| wait["Do not merge<br/>Wait for next scan"]
  checks -->|"Missing / Failure / API error"| wait
  checks -->|"Pass"| base{{"Up to date with base?"}}:::gate
  base -.->|"behind/diverged"| update["Apply review label<br/>update-branch with expected_head_sha"]
  update --> rereview[["Repair B: Review the new head"]]:::loopref
  rereview -.->|"Wait for passing records on new head"| scan
  base -->|"ahead/identical"| merge["Request GitHub squash merge<br/>with the inspected SHA"]
  merge --> result{{"GitHub accepts merge?"}}:::gate
  result -->|"Yes"| done["End"]
  result -.->|"Rejection / Conflict: Fetch next time"| scan
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

[Continue to repair B](#loop-b)

All these decisions use deterministic Python code, which follows fixed rules. With no Actions present, an empty `required_workflow_ids` permits progress. The code trusts status context and state without inspecting the publisher. The SHA fixes the head, but does not freeze base updates between comparison and merge. [Watchdog](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-delivery-watchdog/scripts/worker.py#L12) · [Status reading](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github/scripts/github_client.py#L214)

## Retry D: Delivery and conversation error {#loop-d}

```mermaid
flowchart TD
  item["Scanner passes subject and delivery"] --> state["Read KV and conversation state"]
  state --> duplicate{{"Same delivery/head is running<br/>or already processed?"}}:::gate
  duplicate -->|"Yes"| stop["in_progress / deduplicated"]
  duplicate -->|"No"| run["Start or continue conversation<br/>with its profile"]
  run --> error{{"Conversation error for same delivery?"}}:::gate
  error -->|"No"| record["Record result and delivery"]
  error -->|"Yes"| cap{{"Fewer than two error retries?"}}:::gate
  cap -.->|"Yes: Resend on next scan"| run
  cap -->|"No"| exhausted["Suppress automatic retries<br/>for the same delivery"]
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
```

The diagram summarizes the shared dispatcher. Local and cloud modes have separate launch and recovery paths. Error retries count per delivery and reset when a new head or input changes the delivery. By default, the reviewer starts two new conversations per scan. The catalog scanner has a 300-second timeout. Neither value limits total factory cost or repair attempts. [Dispatcher](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github/scripts/agent_conversation.py#L228) · [Reviewer launch capacity](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/worker.py#L45)
