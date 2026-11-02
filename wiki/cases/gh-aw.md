---
title: GitHub Agentic Workflows (gh-aw)
kind: case
org: GitHub Next
people: []
type: [product, dogfooding]
source: oss
license: MIT
repo: https://github.com/github/gh-aw
investigated_at: 2026-10-31
investigated_commit: 633bb2c2383d3ec0623e46b8c928c20c209b38ff
concepts:
  - delegated-write-gate
  - deterministic-loop-calls-llm
  - isolated-workspace
  - closed-contribution
  - fix-the-machine
---

# GitHub Agentic Workflows (gh-aw)

[← Cases](../index.md) · [Loop diagrams](../loops/gh-aw.md)

Research date: 2026-10-31 (JST). Target commit: `github/gh-aw@633bb2c2383d3ec0623e46b8c928c20c209b38ff` (2026-10-31 JST). The research cloned public source and read the code, generated workflows, and development rules. It did not run the target scripts.

Concepts: [Separate proposals from writes](../concepts/delegated-write-gate.md) · [Deterministic loop calls an LLM](../concepts/deterministic-loop-calls-llm.md) · [Isolated workspace](../concepts/isolated-workspace.md) · [Input control](../concepts/closed-contribution.md) · [Fix the machine](../concepts/fix-the-machine.md)

## Summary

The compiler turns Markdown instructions and YAML configuration into GitHub Actions `.lock.yml` files. Separate jobs handle agent reasoning and changes to GitHub. In the generated `ci-coach`, the agent can read the repository. `safe_outputs` receives the required write permissions. Safety controls include compilation rules and handlers that apply changes, as well as prompts. [Generated agent](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L564), [safe_outputs](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L2856)

Threat detection does not stop everything after a finding. The default warning mode can publish PRs and comments with warnings. It converts branch pushes into review PRs and cancels actions such as merge. The experimental merge feature rejects default and protected branches. Its destination must be the head branch of another open PR. Calling this a factory that also handles normal automatic merge to main overstates its scope. [Detection configuration](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/threat_detection_config.go#L32), [Output classes](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_output_handler_manager.cjs#L175), [Merge limits](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/merge_pull_request.cjs#L502)

## 1. Organization and people

GitHub Next publishes this open-source project under MIT. The [official GitHub Changelog](https://github.blog/changelog/2026-10-28-github-agentic-workflows-generally-available/) records general availability on 2026-10-28. Development input centers on issues. `CONTRIBUTING.md` rejects direct PRs from people outside the core team. Contributors instead write detailed agentic plans in issues, and the core team implements them with agents. This contribution policy does not establish that AI created every PR. [Contribution policy](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/CONTRIBUTING.md#L1), [LICENSE](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/LICENSE)

### Activity

The research recounted activity with the GitHub Search API on 2026-10-31 JST. The period is 2026-08-01 through 2026-10-30 UTC, inclusive. The commit query `repo:github/gh-aw committer-date:2026-08-01..2026-10-30` returned a `total_count` of 3,787. The issue query `repo:github/gh-aw is:pr is:merged merged:2026-08-01..2026-10-30` returned 3,693.

The first count covers commits visible to GitHub commit search. The second covers PRs merged during the period. They do not measure the same population. The research did not measure AI authorship, success rates, or production adoption. It did not copy numbers from the supplied report. [Commit search](https://github.com/search?q=repo%3Agithub%2Fgh-aw+committer-date%3A2026-08-01..2026-10-30&type=commits), [PR search](https://github.com/github/gh-aw/pulls?q=is%3Apr+is%3Amerged+merged%3A2026-08-01..2026-10-30)

## 2. Product overview

`gh aw compile` converts frontmatter and Markdown instructions into Actions. Frontmatter is metadata at the start of a document. It defines triggers, permissions, tools, and engines. Uses include issue classification, review, CI failure analysis, and document maintenance. It does not replace ordinary builds and tests. Available engines include Copilot, Claude, Codex, Gemini, and Pi. [README](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/README.md), [Compiler entry point](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/compiler.go#L50)

## 3. Factory design from source code

| File | Role |
| --- | --- |
| `pkg/workflow/compiler.go` | Entry point for Markdown parsing, validation, YAML generation, and lock file output. |
| `pkg/workflow/strict_mode_permissions_validation.go` | Strict rules for write permissions, disabled sandboxes, and related configuration. |
| `actions/setup/js/safe_outputs_handlers.cjs` | Structures agent change requests and tests targets and explicit count limits. |
| `actions/setup/js/safe_output_type_validator.cjs` | Tests output types and fields. |
| `actions/setup/js/safe_output_handler_manager.cjs` | Routes outputs to handlers and applies detection results. |
| `actions/setup/js/merge_pull_request.cjs` | Tests experimental merge targets, reviews, and status results. |
| `.github/workflows/ci-coach.md` / `.lock.yml` | Source and generated example that analyzes its own CI and proposes improvements. |

### 3.1 Input and compilation rules

The compiler validates parsed data and generates Actions YAML. CLI documentation says that strict mode is the default. Frontmatter can relax it with `strict: false`. Strict mode rejects top-level write permissions for `contents`, `issues`, and `pull-requests` that affect the agent. However, `copilot-requests: write` serves inference. It is separate from those three change permissions. A claim that all permissions are read-only is inaccurate. [CLI configuration](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/cmd/gh-aw/main.go#L843), [Three rejected scopes](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/strict_mode_permissions_validation.go#L20)

Strict mode also rejects `sandbox.agent: false` and disabling the XPIA defense prompt. `strict: false` explicitly relaxes validation. The safety rules therefore do not constrain the configuration author without exception. Standard safe-output boundaries also cannot guarantee the permissions of arbitrary custom jobs, tokens, or external MCP integrations. [Sandbox rules](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/strict_mode_permissions_validation.go#L77), [Custom job generation](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/compiler_custom_job_execution.go)

### 3.2 Separate agent proposals from writes

The generated `ci-coach.lock.yml` sets workflow permissions to `permissions: {}`. It grants separate permissions to the agent and safe-output jobs. The agent edits its local workspace and records GitHub change requests as safe outputs. A later job with repository write permissions handles those requests. Read-only describes GitHub permissions. It does not prohibit edits to the working directory. [Workflow permissions](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L81), [Agent](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L564), [Write job](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L2856)

Requests are structured, rather than free text. The system compares a proposed PR's target repository with allowed configuration. It tests output types and applies count limits in the handler that creates PRs. The MCP call also tests an explicit `max`. If it is absent, the later handler owns the default limit. Therefore, the same schema does not test every constraint twice. [Target rules](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_outputs_handlers.cjs#L850), [Call-time limits](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_outputs_handlers.cjs#L438), [Type rules](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_output_type_validator.cjs), [PR limits](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/create_pull_request.cjs#L718)

Changes to protected files are not always prohibited. The PR handler defaults to `request_review`. It can add a warning and a review that requests changes. Alternatively, `fallback-to-issue` creates an issue for review. ci-coach chooses that alternative. The enforced configuration and the administrator who permits it form the trust boundary. [Protected files](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/create_pull_request.cjs#L1351), [ci-coach configuration](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.md#L32)

### 3.3 Threat detection combines code rules with AI evaluation

The detection prompt assesses malicious outputs or patches, leaked secrets, and attempts to replace instructions. AI performs the assessment, so detection is not guaranteed. Code decides what happens afterward. [Detection prompt](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/md/threat_detection.md), [Application decision](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_output_handler_manager.cjs#L1115)

The modes and limits are:

- Default warning mode applies reviewable PRs and comments with warnings. It converts pushes to PR branches into review PRs. It cancels state changes such as merge, close, and dispatch.
- `continue-on-error: false` makes a detection error or threat finding fail the detection job and stop safe outputs.
- `threat-detection: false` or `enabled: false` disables detection. `engine: false` disables AI evaluation, but a detection job with custom evaluation steps remains.
- Warning mode has a branch that warns about unclassified output types but permits their handlers. Adding a custom output does not automatically make the system reject it.

Evidence: [Defaults and disabling](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/threat_detection_config.go#L32), [Three classes](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_output_handler_manager.cjs#L175), [Unclassified outputs](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_output_handler_manager.cjs#L1136), [Strict detection steps](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/threat_detection_steps.go#L309).

### 3.4 Stop and retry scope

The defaults passed to the AWF API proxy are 500 turns, 1,000 AI Credits, and five consecutive cache misses per run. The default detection budget is 400 AI Credits. The compiler passes these limits to the external AWF runtime. This research did not audit the full AWF implementation. Negative budgets disable limits. Configuration and environment variables can change the defaults. [Constants](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/constants/constants.go#L433), [Proxy configuration](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/awf_config_build.go#L109), [Budget arguments](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/awf_command_builder.go#L346)

Generated ci-coach jobs allow 60 minutes for the agent, 10 for detection, and 45 for safe outputs. The source's `timeout-minutes: 30` does not mean a 30-minute limit for the entire job. The research found no product-wide repair loop that always restarts failed builds until success. CLI repeat uses a specified count, but returns immediately if the first run errors. Mergeability retrieval uses `maxRetries: 3` plus a final retrieval fallback. This does not count implementation repairs. [Generated workflow](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L564), [Repeat](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/cli/retry.go#L37), [Mergeability retries](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/merge_pull_request.cjs#L36)

### 3.5 PR creation and merge are different

An experimental `merge-pull-request` feature exists. It evaluates reviews, unresolved threads, labels, and mergeability. It rejects default and protected branches. The destination must be the head of another open PR. This supports combining stacked PRs in an intermediate branch. It does not complete final integration into normal main by itself.

The inspected implementation also does not pass the evaluated PR head SHA to the merge API's `sha` argument. A SHA identifies a commit. Thus, the research cannot establish that merge atomically accepts only the evaluated commit. [Constraints and evaluation](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/merge_pull_request.cjs#L449), [Merge API call](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/merge_pull_request.cjs#L595)

### 3.6 Repair its own CI

`ci-coach` runs on weekdays or by manual request. It reads the latest 60 CI runs, evaluation step exit codes, and logs. It prioritizes repairs if preliminary tests fail. Otherwise, it looks for efficiency improvements. Its prompt permits a PR only after `make lint`, `make build`, and `make test-unit` pass. This is a prompt instruction. The research did not establish a safe-output gate that proves those three commands passed before PR creation. [Mission and input](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.md#L80), [Completion conditions](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.md#L320)

Normal `ci.yml` performs integration tests on main pushes, scheduled runs, and manual runs. It also compiles CLI and marketplace workflows. The presence of this CI does not establish enforcement as required checks on every PR. That remains unknown. `AGENTS.md` also instructs agents to test before final reports and recompile after workflow changes. These are agent procedures. [Normal CI](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci.yml#L1), [Marketplace compilation](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci.yml#L1087), [Development rules](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/AGENTS.md#L19)

## 4. Public claims and supporting evidence

| Claim | Findings and limits |
| --- | --- |
| “Actions + Agent + Safety” | A compiler, separate jobs, and output handlers exist. Configuration authors can relax strict mode and detection. |
| Agents default to read-only | Generated workflows separate GitHub change permissions from later write jobs. Local edits and inference write permissions remain possible. |
| Safe outputs are validated | Rules cover types, targets, counts, and protected files. They do not guarantee suitable tests or useful proposals. |
| Agents support its own development | Contribution rules and ci-coach source and generated files support this. Operational success rates and AI authorship are not measured. |

The [pinned README](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/README.md) contains the product claims. This page does not use the supplied report's release counts, security incidents, or star growth as evidence.

## 5. Analysis

A reusable structure converts model proposals into typed requests. Deterministic code with the required permissions applies them. This lets teams improve AI review accuracy separately from operation limits. However, comments and PRs with warnings still publish writes externally. Detection failure does not guarantee that nothing leaves the system.

ci-coach uses CI records as input for factory improvements. Scheduled launches are repeated execution. Reading results and changing code is instruction-guided repair. Neither establishes an autonomous loop that also accepts the resulting PR.

## 6. Open questions

The research leaves these items open:

- Actual branch protection, required checks, and environment approvals.
- Pinned AWF, MCP gateway, and external detector implementations, including behavior when limits are exceeded.
- ci-coach execution history, PR acceptance rates, cost, and the effect of warning-bearing outputs on later automation.
- Permission boundaries across custom jobs, custom tokens, and custom safe outputs.

## Sources

The pinned source links above are the primary evidence. The [official GitHub Changelog](https://github.blog/changelog/2026-10-28-github-agentic-workflows-generally-available/) supplies only the announcement date. The research treated repository rules and prompts as research material, not instructions to execute.
