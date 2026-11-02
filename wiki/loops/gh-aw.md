---
title: GitHub Agentic Workflows loops
kind: loops
case: gh-aw
investigated_commit: 633bb2c2383d3ec0623e46b8c928c20c209b38ff
---

# GitHub Agentic Workflows loops

[← Explore the loops](index.md) · [gh-aw case study](../cases/gh-aw.md)

Research target: `github/gh-aw@633bb2c2383d3ec0623e46b8c928c20c209b38ff`. Research date: 2026-10-31 JST. The researcher chose the names and divisions. A covers one execution, and B repeats model calls within it. C shows operational feedback through the repository's ci-coach. It is not a built-in feature for every user.

## Map: Workflow, repetition, and improvement

```mermaid
flowchart TD
  C[["C: Improve the factory from CI"]]:::loopref -->|"Run on each schedule"| A[["A: Proposal to applied change"]]:::loopref
  A -->|"Contains in the agent step"| B[["B: Model and tool repetition"]]:::loopref
  A -.->|"An accepted proposal PR<br/>affects later CI"| C
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

Labels on solid arrows distinguish execution order from containment. Dotted arrows show feedback. C does not guarantee automatic PR acceptance. The implementation does not always return to C after A ends. A PR is a pull request for code review. CI runs automated tests and other project tasks.

| Diagram | Unit / type | Evaluation and return path | Exit / limit | Enforcement |
| --- | --- | --- | --- | --- |
| [A: Proposal to applied change](#loop-a) | One Actions run / workflow | Compiler, output rules, and detection. Failure usually stops that run without an automatic return to input. | Output applied, noop, failure, or timeout | Code controls permissions and application. AI evaluates detection. |
| [B: Model and tool repetition](#loop-b) | Model response and tool calls / repeated execution | Tool results and limit errors return to the same agent. | Agent completion, turn limit, budget, or time limit | The compiler passes limits to AWF. Its internal stop implementation is not audited. |
| [C: Improve the factory from CI](#loop-c) | Scheduled ci-coach run and improvement PR / operational repair | CI logs and preliminary results lead to CI configuration or code changes. | No improvement: noop. Otherwise, a PR or failure. Overall attempt limit unknown. | Actions starts the run. A prompt requires successful tests before a PR. Acceptance is separate. |

## A: Proposal to applied change {#loop-a}

This workflow follows the generated `ci-coach.lock.yml`. Input editing and compilation happen before execution. The diagram does not imply automatic model repair after detection fails.

```mermaid
flowchart TD
  src["Markdown instructions and<br/>frontmatter configuration"] --> compile{{"Compile and inspect statically<br/>strict by default"}}:::gate
  compile -->|"Pass"| lock["Run .lock.yml in Actions"]
  compile -->|"Fail"| stop1(["Stop compilation"])
  lock --> B[["Loop B: Model and tool repetition<br/>Agent GitHub access is mainly read"]]:::loopref
  B --> output["Structured change requests<br/>and code change artifacts"]
  output --> detect["Separate detection job<br/>AI and other tools evaluate output"]
  detect --> policy{{"Compare detection results<br/>with configuration"}}:::gate
  policy -->|"Pass / Detection disabled"| validate
  policy -->|"Warning mode"| warn{{"Policy for each output type"}}:::gate
  warn -->|"Reviewable"| annotate["Attach a warning"]
  warn -->|"Push to PR branch"| convert["Convert to a PR for review"]
  warn -->|"Merge and similar actions"| abort(["Cancel the change"])
  policy -->|"Failure in strict mode"| stop2(["Stop safe outputs"])
  annotate --> validate
  convert --> validate
  validate{{"Inspect output type, target, count<br/>and operation conditions"}}:::gate -->|"Pass"| apply["A separate authorized job<br/>applies changes to GitHub"]
  validate -->|"Fail"| stop3(["Record failure for that operation"])
  apply --> done(["End the run"])
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

See [B: Model and tool repetition](#loop-b).

The diagram covers normal built-in outputs. In warning mode, unclassified output types can execute with a warning. Administrator configuration needs separate inspection for `strict: false`, disabled detection, custom jobs, tokens, or MCP. Generated files also contain helper jobs such as activation. This diagram focuses on the boundary between reasoning and writes.

Human approval is not a required step. The system can create PRs with warnings. Reviewing and accepting a PR is separate from authorizing the output. Experimental merge rejects default and protected branches. Its only permitted destination is the head of another open PR.

Evidence: [Agent permissions](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L564), [Application job](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L2856), [Detection configuration](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/threat_detection_config.go#L32), [Warning policy](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_output_handler_manager.cjs#L1115), [Merge restrictions](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/merge_pull_request.cjs#L502).

## B: Model and tool repetition {#loop-b}

Each cycle covers one model response and its tool calls. This is engine execution, not a product-wide instruction to rewrite code until it passes.

```mermaid
flowchart TD
  prompt["Provide Markdown instructions"] --> budget{{"AWF proxy limits<br/>Turns, budget, cache misses"}}:::gate
  budget -->|"Within limits"| model["Model chooses the next action"]
  model -->|"Use a tool"| tool["Read, edit locally,<br/>request safe outputs, and more"]
  tool -.->|"Return results or limit errors"| budget
  model -->|"Work complete"| finish(["Continue to output evaluation in A"])
  budget -->|"Limit reached"| stop(["Stop / Record failure"])
  classDef gate fill:#fecaca,stroke:#b91c1c,color:#000
```

Defaults are 500 turns, 1,000 AI Credits, and five consecutive cache misses. Detection has a separate default budget of 400 AI Credits. A negative budget disables its limit. The compiler sets proxy configuration, but the full external AWF execution path is not audited. The gate shows that execution contract. The generated ci-coach agent job stops after 60 minutes.

The CLI function `ExecuteWithRepeat` repeats a specified number of times and returns the first error immediately. HTTP/API retries and repeated mergeability queries are separate from this model loop. They do not establish unlimited repair and restart until success.

Evidence: [Default constants](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/constants/constants.go#L433), [AWF configuration](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/awf_config_build.go#L109), [Generated timeout](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L581), [Repeat](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/cli/retry.go#L37).

## C: Improve the factory from CI {#loop-c}

ci-coach creates improvement PRs from CI records. Its implementation ends there. The diagram labels acceptance and later results as operational feedback.

```mermaid
flowchart TD
  tick["Weekday schedule / Manual start"] --> records["Read CI execution data<br/>and preliminary results"]
  records --> pick{"Did preliminary tests fail?"}
  pick -->|"Yes"| repair["Prioritize repair"]
  pick -->|"No"| optimize["Look for efficiency improvements"]
  repair --> draft["Implement the proposal<br/>Run lint, build, and tests"]
  optimize --> draft
  draft --> good{"Tests pass and<br/>a useful change exists?"}
  good -->|"No"| noop(["Report noop / Incomplete work"])
  good -->|"Yes"| A[["Later steps of A:<br/>Detection and safe outputs create PR"]]:::loopref
  A --> review["If a human accepts the PR<br/>Detailed acceptance rules unknown"]:::human
  review --> ci["Run CI with the change"]
  ci -.->|"Return results as input<br/>on the next scheduled run"| records
  classDef human fill:#fde68a,stroke:#b45309,color:#000
  classDef loopref fill:#bfdbfe,stroke:#1d4ed8,color:#000
```

See [A: Proposal to applied change](#loop-a).

Diamonds show agent decisions under instructions. The prompt says to create a PR only after tests pass. The research did not establish that safe outputs requires proof of passing tests. Preliminary tests are nonfatal, so analysis can continue after failure. A new PR does not imply automatic acceptance. B and the Actions timeout limit each run, but the total duration of improvement across days is unknown.

Evidence: [ci-coach configuration and mission](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.md#L1), [Preliminary tests](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.md#L80), [Completion conditions](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.md#L320), [Normal CI](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci.yml#L1).
