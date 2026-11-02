---
title: SSSF loops
kind: loop
---

# SSSF loops

[← Loop index](index.md) · [Case study](../cases/sssf.md)

Research date: 2026-11-02. Target commit: `de31374882e7a4e3e5b7bb9bd09e69dc2f779356`. A and B follow `adw_build_review.py`. D follows the separate `adw_build_test.py`. C retries JSON parsing in a shared component. The researcher chose these divisions.

```mermaid
flowchart TD
  A["A: Implementation to acceptance"] -->|"Contains"| B["B: Review and repair"]
  A -->|"Used in agent calls"| C["C: JSON format correction"]
  B -->|"Used in agent calls"| C
  D["D: Separate test and repair template"] -->|"Used in agent calls"| C
```

| Diagram | Unit | Evaluation and return path | Exit condition |
| --- | --- | --- | --- |
| A: Workflow | One request | State of every step and review approval | `finish` finalizes the record and exit code. |
| B: Repair | Implementation result | Reviewer returns unmet and blocking items to the builder. | Approval or three reviews. Two repairs maximum. |
| C: Retry | Parse one response | JSON parsing error returns to the same session. | Type requirements met, or an exception after two corrections. |
| D: Repair | Changes under test | Command failure returns to the builder. | Pass, or failure after three tests and the final repair. |

## A. Implementation to acceptance {#loop-a}

```mermaid
flowchart TD
  ask["Provide a request"]:::human --> build["Call builder"]
  build --> output[["Loop C: JSON format correction"]]:::loopref
  output --> claims{{"Inspect artifact existence<br/>and other requirements"}}:::gate
  claims --> review[["Loop B: Review and repair"]]:::loopref
  review --> finish{{"All steps succeeded<br/>and review approved?"}}:::gate
  finish -->|"Yes"| ok["Record success / Exit 0"]
  finish -->|"No"| no["Record failure / Exit 1"]
  classDef human fill:#fde68a,stroke:#b45309,color:#000
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

[B: Review and repair](#loop-b) · [C: JSON format correction](#loop-c)

An exception marks the step as failed and propagates to its caller. The diagram shows the normal call path. This template does not include human PR approval or merge. [Workflow](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_review.py), [finish](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/runner.py#L114)

## B. Review and repair {#loop-b}

```mermaid
flowchart TD
  review["Call reviewer"] --> parse[["Loop C: JSON format correction"]]:::loopref
  parse --> gate{{"Inspect consistency of<br/>artifacts and verdict"}}:::gate
  gate --> approved{{"approved is true?"}}:::gate
  approved -->|"Yes"| done["Return approval to the workflow"]
  approved -->|"No"| cap{{"Third review?"}}:::gate
  cap -->|"Yes"| reject["Return rejection to the workflow"]
  cap -.->|"No"| fix["Give unmet items to builder for repair"]
  fix --> review
  classDef human fill:#fde68a,stroke:#b45309,color:#000
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

[C: JSON format correction](#loop-c)

A gate violation raises an exception, which differs from rejection. The default `retries=0` fails at that point. The repair step sets `retries=1`, which permits one gate correction. This local resubmission does not count as a review round in B. [Step configuration](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_review.py), [Gate repetition](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agents.py#L148)

## C. JSON format correction {#loop-c}

```mermaid
flowchart TD
  parse["Parse output as JSON<br/>and inspect its type"] --> valid{{"Parsing succeeded?"}}:::gate
  valid -->|"Yes"| done["Continue to the next inspection"]
  valid -->|"No"| cap{{"Both corrections used?"}}:::gate
  cap -->|"Yes"| fail["End with an exception"]
  cap -.->|"No"| correct["Return the error to the same session"]
  correct --> parse
  classDef human fill:#fde68a,stroke:#b45309,color:#000
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

Parsing uses the initial response and at most two corrections. Correct format does not prove a correct artifact. The permission audit runs later, so a parsing exception can bypass that audit. [Parsing](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agents.py#L267), [Call order](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agents.py#L141)

## D. Separate test and repair template {#loop-d}

```mermaid
flowchart TD
  test["Run the test command"] --> pass{{"Exit code is 0?"}}:::gate
  pass -->|"Yes"| ok["Call finish with success"]
  pass -.->|"No"| fix["Builder repairs the failure"]
  fix --> cap{{"Was this the third test?"}}:::gate
  cap -->|"No"| test
  cap -->|"Yes"| no["Call finish with failure<br/>without another test"]
  classDef human fill:#fde68a,stroke:#b45309,color:#000
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

This loop starts after the initial implementation. The implementation does not retest the final repair. Comments do not override that behavior. The default test command is a successful `echo`, so the first test passes before real tests are connected. [Workflow](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_test.py), [Placeholder command](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/quality.py)
