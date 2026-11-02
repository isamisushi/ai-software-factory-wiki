---
title: Stripe Minions loops
kind: loop
---

# Stripe Minions loops

[← Loop index](index.md) · [Case study](../cases/stripe-minions.md)

Research date: 2026-11-02. The researcher organized these diagrams from official articles. Code enforcement is not established. A shows the full workflow. B and C repair work inside it.

```mermaid
flowchart TD
  A["A: Request to human review"] -->|"Contains"| B["B: Local lint"]
  A -->|"Contains"| C["C: Repair CI failures"]
  C -->|"Use after repair"| B
```

| Diagram | Unit | Evaluation and return path | Exit condition |
| --- | --- | --- | --- |
| A: Workflow | One request | A human reads the output. | Handoff to human review. Automatic merge is not shown. |
| B: Repair | Local changes | Lint results return to local repair. | Lint issues resolved. Attempt limit unknown. |
| C: Repair | One Minion run | CI failures return to repair. | Return to a human after a pass or two CI rounds. |

## A. Request to human review {#loop-a}

```mermaid
flowchart TD
  ask["Request and context"]:::human --> env["Prepare a devbox" ]
  env --> impl["Agent implements the change"]
  impl --> lint[["Loop B: Local lint"]]:::loopref
  lint --> ci[["Loop C: CI and repair"]]:::loopref
  ci --> inspect["Human inspects changes and results"]:::human
  inspect --> review["Open a PR for human review"]:::human
  classDef human fill:#fde68a,stroke:#b45309,color:#000
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

[B: Local lint](#loop-b) · [C: CI and repair](#loop-c)

Humans can add instructions or edit manually. The total number of later attempts is unknown. This does not imply that every PR automatically reaches review. [Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)

## B. Local lint {#loop-b}

```mermaid
flowchart TD
  run["Run the defined lint task"] --> ok{{"Issues resolved?"}}:::gate
  ok -->|"Yes"| next["Continue to push"]
  ok -.->|"No"| fix["Repair locally"]
  fix --> run
  classDef human fill:#fde68a,stroke:#b45309,color:#000
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

The article states that code controls the lint loop. Lint detects code style and static errors. The exact division between automatic and agent repairs is unknown, as is the stop limit. [Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

## C. CI and repair {#loop-c}

```mermaid
flowchart TD
  push["Push and run CI"] --> pass{{"CI passed?"}}:::gate
  pass -->|"Yes"| human["Return results to a human"]:::human
  pass -->|"No"| cap{{"Second CI round?"}}:::gate
  cap -->|"Yes"| human
  cap -.->|"No"| fix["Apply automatic fixes<br/>and repair remaining failures"]
  fix --> local[["Loop B: Local lint"]]:::loopref
  local --> push
  classDef human fill:#fde68a,stroke:#b45309,color:#000
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

[B: Local lint](#loop-b)

The two-round CI limit comes from the official account. Work can return to a human without passing. This is not a lifetime attempt count that includes later human requests. [Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents), [Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)
