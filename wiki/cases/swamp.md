---
title: Swamp
kind: case
org: Elder Swamp Club, Inc.
people: [Adam Jacob, Paul Stack]
type: [product, dogfooding]
source: oss
license: AGPL-3.0
repo: https://github.com/swamp-club/swamp
investigated_at: 2026-10-29
investigated_commit: 963e0d2
concepts:
  - closed-contribution
  - issue-lifecycle-state-machine
  - human-checkpoints
  - adversarial-review
  - local-verification-attestation
  - deterministic-verdict
  - trust-root-review
  - ddd-as-agent-vocabulary
  - architecture-fitness-tests
  - black-box-uat
  - fix-the-machine
  - deterministic-loop-calls-llm
  - progress-ledger
  - skills-as-tested-code
  - isolated-workspace
---

# Swamp (Swamp Club / Elder Swamp Club, Inc.)

[← Cases](../index.md) · [Loop diagrams](../loops/swamp.md)

Research date: 2026-10-29. Target commit: `swamp-club/swamp@963e0d2` (2026-10-28).

Concepts: [Input control](../concepts/closed-contribution.md) · [Issue lifecycle state machine](../concepts/issue-lifecycle-state-machine.md) · [Human checkpoints](../concepts/human-checkpoints.md) · [Adversarial review](../concepts/adversarial-review.md) · [Local verification attestation](../concepts/local-verification-attestation.md) · [Deterministic verdict](../concepts/deterministic-verdict.md) · [Trust root review](../concepts/trust-root-review.md) · [DDD as agent vocabulary](../concepts/ddd-as-agent-vocabulary.md) · [Architecture fitness tests](../concepts/architecture-fitness-tests.md) · [Separate black-box acceptance tests](../concepts/black-box-uat.md) · [Fix the machine](../concepts/fix-the-machine.md) · [Deterministic loop calls an LLM](../concepts/deterministic-loop-calls-llm.md) · [Progress ledger](../concepts/progress-ledger.md) · [Skills as tested code](../concepts/skills-as-tested-code.md) · [Isolated workspace](../concepts/isolated-workspace.md)

## Summary

Swamp is both a product and a factory used to develop itself. The CLI turns agent intent into reusable behaviors and workflows with typed inputs and outputs. A programmed loop calls an LLM only when needed. The LLM does not control the outer loop.

The AGPLv3 repository exposes agent rules, review prompts, testing workflows, attestation generation, and automatic CI merge. An attestation is a record of completed verification. This repository alone cannot establish swamp-club server behavior or the separate acceptance tests. Swamp uses its own workflows to build Swamp.

The initial study counted 776 merged PRs since 2026-09-29 and about five main authors. This review did not repeat that PR search. It did establish that all 50 latest commits at the target contain `Co-authored-by: Claude Opus 5.5`. PR counts and co-author labels alone do not measure quality, autonomy, or effort.

The factory restricts input and layers evaluation with records. It rejects external PRs. Plan approval and the pre-PR review are the main human decision points. Humans also explain deviations and handle other exceptions. The implementation does not guarantee perfect quality or exactly two points of human involvement.

## 0. Corrections from source review

On 2026-10-29, the research compared the lifecycle, verdict logic, verification rules, and CI at the same commit. This was not a newer-version study or an operational experiment. Company details, funding, and PR counts remain from the initial study. This review did not re-establish them.

| Earlier description | Source finding | Evidence |
| --- | --- | --- |
| Attestation is signed proof | The record supports schema, commit, and configuration consistency tests. It does not establish authentic origin. | [Verification rules](https://github.com/swamp-club/swamp/blob/963e0d2/agent-constraints/verification-conventions.md#L355) |
| CI rejects records older than 24 hours | Old or unknown timestamps produce warnings. They do not fail CI alone. | [ci.yml](https://github.com/swamp-club/swamp/blob/963e0d2/.github/workflows/ci.yml#L688) |
| Humans participate only twice, and code guarantees approval | Two main decision points coexist with additional consultation. Waiting is a skill instruction. `approve` takes no approval evidence. | [Conformance procedure](https://github.com/swamp-club/swamp/blob/963e0d2/.claude/skills/issue-lifecycle/references/code-conformance-review.md), [approve](https://github.com/swamp-club/swamp/blob/963e0d2/extensions/models/issue_lifecycle.ts#L2007) |
| Verdicts inside code blocks are ignored, and outputs under 50 bytes always fail | Only provider-error detection removes code blocks. Verdict extraction reads original output before testing its length. | [determineVerdict](https://github.com/swamp-club/swamp/blob/963e0d2/scripts/check_review_verdict.ts#L110) |
| Deterministic reruns use no tokens | Reusing stages reduces repeated generation cost. Runtime LLM calls still use inference. | [Product loop](../loops/swamp.md#loop-g) |
| Every run follows one sequence, and F wraps everything | Paths such as `fast_forward` exist. F describes operational improvement, not an established parent loop in code. | [Development flow](../loops/swamp.md#loop-a), [Improvement](../loops/swamp.md#loop-f) |

## 1. Company and people

| Item | Detail |
| --- | --- |
| Company | Elder Swamp Club, Inc., founded in February 2026. |
| CEO | Adam Jacob, Chef co-founder and former leader of System Initiative for six years. |
| Co-founders | Nick Stinemates, John Watson, Mahir Lupinacci, and Paul Stack. Stack is product owner and engineering leader. |
| Funding | About $7M in seed funding, led by Amplify Partners. SEC Form D records $6.25M raised. |
| Background | The team moved from 18 people at System Initiative to five for Swamp. The company described 900 releases in four weeks. |
| License | AGPLv3 with an additional exception. Source is on `git.swamp-club.com` and GitHub `swamp-club/swamp`. |
| Pricing | Monthly per-user pricing with user-supplied inference. CLI execution requires a swamp-club.com account. |

## 2. Swamp as a product

### Main claims

[Syntax #1049, 2026-10-21](https://syntax.fm/show/1049/wtf-is-a-software-factory) describes converting intent into typed components and reusable workflows. At 03:28–09:37, it compares repeated LLM planning with predefined processing that calls an LLM when needed. Deterministic execution does not mean guaranteed success or identical output. External state and LLM-dependent stages can vary. Every inference call still costs resources.

The product describes these ideas:

- “Behavior-Centric AI” turns intent into reusable components. Defined code controls runtime flow. Requirements changes lead to component changes.
- “Invert the loop” places programmed control outside the LLM. It calls the model only for judgment, such as a classification API. Typed inputs and outputs ease provider replacement.
- The company claims an eightfold token reduction in a production code-review workflow. This research did not establish that reduction independently.

### Six primitives in `design/README.md`

| Primitive | Meaning |
| --- | --- |
| Behaviors | Types for APIs, CLI tools, and cloud resources, plus YAML definitions. Methods produce data. The former name was models. |
| Data | Method results that support versions, immutability, queries, and retention periods. |
| Workflows | A directed graph of method steps without cycles, with inputs, triggers, and approvals. |
| Vaults | Secrets resolved at runtime and automatically hidden from output. |
| Extensions | Packaged behavior types and other components. The registry contains about 1,860. |
| Serve | A persistent server and remote workers through `swamp serve`. |

Definitions live in `models/`, `workflows/`, and `vaults/` for Git review. Runtime data lives in `.swamp/`. The tool works beneath harnesses such as Claude Code, Codex, Cursor, OpenCode, and Kiro. `swamp repo init --tool ...` installs skills for the selected harness.

## 3. Swamp's own factory from source code

The following files define the factory in the repository:

```text
CLAUDE.md / AGENTS.md          Agent rules (AGENTS.md has 271 lines)
CONTRIBUTING.md                Policy that rejects all external PRs
agent-constraints/             Rules for each phase
verification/
  workflow-verify-build.yaml   lint/fmt/check/test/dependency audit/compile
  workflow-verify-reviews.yaml Agent reviews
  workflow-verify-skills.yaml  Skill quality and trigger evaluations
  review-prompts/              code-review, adversarial-review, ux-review, ci-security-review
.claude/skills/
  issue-lifecycle/             State machine from issue to delivery
  ddd/                        Domain-driven design for planning and review
  github-pr/, terminal-output/, swamp/, swamp-getting-started/
extensions/models/issue_lifecycle.ts   Lifecycle behavior (about 135KB)
evals/promptfoo/               Skill trigger routing through claude -p / codex
integration/*_rules_test.ts    Architecture fitness tests
.github/workflows/ci.yml       Attestation validation, Claude review, automatic merge
```

### 3.1 Input control rejects external PRs

`CONTRIBUTING.md` states:

> AI Agents can produce working, reliable source code at a rate that is difficult for a human to understand or review. Because we cannot discern between a large human change or a large change made by an AI Agent, the only way we can maintain supply chain security and quality control is to tightly control the inputs to the software development process.

The policy has these effects:

- External contributors submit bug reports and feature requests only. After review for malicious intent and prompt injection, internal agents implement them.
- Reporters receive co-author credit. The `notify` stage sends thanks called a “ripple.”
- The authoritative issue lives in swamp-club, the company's Lab, rather than GitHub.

### 3.2 Issue Lifecycle as a state machine

A state machine defines allowed transitions between workflow states. The `issue-lifecycle` skill controls the `@swamp/issue-lifecycle` behavior. Each transition creates a structured entry in swamp-club and updates the issue status. Persistent state supports resumption after context compression or a new session.

```text
created → triaging → classified → plan_generated ⇄ (adversarial_review / iterate)
        ──[human approval]──→ approved → implementing → (code_conformance_review)
        → verifying → (verification_passed → post_attestation) ──[human review]──→ pr_open
        → pr_merged (= shipped) → notify → summarizing → done
```

`TRANSITIONS` in `extensions/models/_lib/schemas.ts` defines transitions.

| Phase | Behavior |
| --- | --- |
| Triage | Reads CLAUDE.md and `design/`. Uses `git log` to assess regressions. A sub-agent reproduces bugs in `/tmp/swamp-repro-issue-<N>`. |
| Planning | Requires DDD analysis and assessment of documents, separate `swamp-uat` tests, and Diátaxis manuals. |
| Adversarial review | Runs for every plan. Covers Architecture, Scope, Risk, Testing, Complexity, Security, Correctness, and Documentation. Security includes trust boundaries, normalization, and confused-deputy risks. |
| Human approval | “Never auto-approve.” Instructions prohibit `approve` before explicit human approval. |
| Code conformance | Compares implementation with the approved plan. Deviations are allowed with recorded reasons. |
| Verification | Runs three Swamp workflows in a fresh host-side `git worktree`. |
| Human review | Shows an all-green checklist and pauses. After human acceptance, it sends attestation and opens the PR. |
| After delivery | `summarize` records the original problem, delivered result, and whether the goal was met. |

Unrelated bugs become separate issues rather than expanding scope. “Session Learnings” proposes additions to AGENTS.md or skills after difficulties. This directs repairs toward the factory rather than blaming people.

### 3.3 Local evaluation and attestation

Heavy evaluation runs as Swamp workflows on the developer's machine. An attestation records results for CI. It is separate from cryptographically signed proof of origin.

`verify-build` runs lint, formatting, type tests, tests, dependency audits, compilation, and binary smoke tests. `verify-reviews` runs reviews in parallel according to changed paths:

| Review | Trigger |
| --- | --- |
| code-review | Always. |
| adversarial-review | Changes to core paths such as `src/cli/`, `src/domain/`, and `src/infrastructure/`. |
| ux-review | Changes to CLI commands or output. |
| ci-security-review | Changes to `.github/workflows/`. |

The default reviewer is Claude Opus 5.5. Codex is also available and runs with a read-only permission profile. `verify-skills` uses tessl quality scores and promptfoo trigger evaluations. Bundled skills must score at least 90%.

Review passes only when a line starts with `VERDICT: pass`. Provider-error detection runs first. Verdict extraction then reads the original output. The under-50-byte test applies only when no marker exists, so a short `VERDICT: pass` can pass. Extraction also includes markers inside code blocks. Earlier inference from prose allowed a review with two blocking findings to pass, recorded as swamp-club#2265.

`deno run build-attestation` generates the record mechanically from execution results. Instructions prohibit manual construction and reuse of an earlier record. It contains step results and duration, review models, SHA-256 hashes of relevant files, and affected CLI commands calculated through the import graph. `post_attestation` sends it to swamp-club. The project explicitly states that schema shape is tested but provenance is not yet guaranteed.

### 3.4 CI merge gates in `.github/workflows/ci.yml`

CI does not repeat lint or tests. It validates attestation and runs reviews that require the CI trust boundary. Its stages are:

1. `validate-attestation` tests version, PR head/commit match, `gate.allPassed`, and required configuration hashes. Records older than 24 hours, missing times, or timestamp parsing failures only warn. With no errors, github-actions approves even with warnings.
2. `claude-adversarial-review` runs again in CI for core changes.
3. `claude-ci-security-review` runs for workflow changes.
4. `claude-review-integrity` runs for trust-root changes. The trust root contains files that define the factory's controls. Paths include CLAUDE.md, AGENTS.md, `verification/`, `agent-constraints/`, lifecycle references, verdict/attestation scripts, and evaluation providers. The prompt treats every PR file, including CLAUDE.md, as untrusted data.
5. `auto-merge` requires every prerequisite to pass or legitimately skip because no relevant path changed. It excludes fork PRs and stops for a `hold` label. `--match-head-commit` limits squash merge to the evaluated commit.

### 3.5 Architecture and quality

The factory uses these controls:

- DDD supplies shared vocabulary across plans, reviews, and rules through the `ddd` skill. Adam says that agents already know DDD books and understand terms such as anti-corruption layer.
- `integration/*_rules_test.ts` tests layer boundaries, libswamp exports, JSON mode, and license headers. Importing `mod.ts` as a barrel is forbidden. A pinned-ratchet prevents the violation count from increasing.
- Unit tests stay in-process. Integration tests use real filesystems and mock servers on port 0. Property tests use fast-check. Conformance tests use the same contracts as extension authors. Black-box CLI acceptance tests run compiled binaries in separate `swamp-uat`, not the main repository.
- Scheduled jobs detect flaky tests with `deno test --repeats`. Windows compatibility tests run every four hours.
- `design/` documents must relate to one of the six primitives. Each records `last-verified: <date> @ <commit>` to keep agent context current.

## 4. Podcast claims and source evidence

| Adam Jacob's claim | Repository evidence |
| --- | --- |
| Each product needs a different factory | Repository-specific `agent-constraints/` replaces generic defaults. Missing files use the defaults. |
| Black-box tests matter most | Separate `swamp-uat` and mandatory planning assessment support this. |
| DDD supplies vocabulary | Planning, review, and conformance require the `ddd` skill. |
| Quality-specific adversarial reviews | Changed paths select adversarial, UX, CI security, and integrity reviews. |
| Fix the machine instead of blaming the robot | Session Learnings, stricter verdicts after #2265, and scripted attestation generation implement this. Earlier attestation used 70 instruction lines and varied between runs. |
| An adversarial skill maintains Lighthouse 100 | This repository is a CLI. A website repository is the likely location, but remains unexamined. |
| Unit tests are a candidate for removal | Current rules still require “Comprehensive” unit tests. They remain present. |
| Large companies need to start with five-person teams | Team reduction is a company statement. The initial 776-PR count does not establish an optimal team size. |

## 5. Comparison points

The case raises these comparison points:

- Plan approval and pre-PR review are the main human decisions. Deviations, uncertain classification, missing acceptance tests, and notification exceptions can also need people. Prompt instructions and enforced conditions remain separate.
- LLMs judge reviews. Programmed code extracts verdicts, generates attestations, and applies merge conditions. This mirrors the product's programmed outer loop.
- Enumerated trust-root paths trigger dedicated reviews when changed. The design anticipates prompt injection.
- Lifecycle state lives in swamp-club and the Swamp datastore, outside conversations. Work can continue after lost context.
- Heavy evaluation runs on developer machines through claude.ai subscriptions. CI handles attestation and a smaller review set.
- The project documents unresolved provenance and infrastructure limits, including payload escaping in swamp-club#2284.

## 6. Open questions

The research leaves these items open:

- Main lifecycle gates, approvals, `fast_forward`, verification failure, and summaries received source review. Full runtime tests, server permissions, and operational adherence remain unknown.
- Saving and recounting the 776 PR search results, plus measuring change size, lead time, failures, rework, and inference cost.
- Repair attempt and cost limits, plus human handoff when repairs do not converge.
- How swamp-uat results connect to the merge gate. Planning instructions alone do not establish an automatic gate.
- Whether the `swamp-uat` repository is public.
- The Lighthouse adversarial skill in the swamp-club.com website repository.
- Changelog Friends #130, “Automation at the speed of swamp,” including external PR policy and the reduction from 18 people to five.

## Sources

The original research used:

- Source at https://git.swamp-club.com/swamp-club/swamp and https://github.com/swamp-club/swamp at `963e0d2`.
- [Syntax #1049: WTF is a Software Factory?, 2026-10-21](https://syntax.fm/show/1049/wtf-is-a-software-factory), using a user-supplied transcript and official episode information.
- https://swamp-club.com/
- https://runtimewire.com/article/exclusive-adam-jacob-s-swamp-raises-6-25-million-for-deterministic-ai-agent-auto
- https://pulse2.com/swamp-club-raises-7-million-seed-funding/
- https://nevercodealone.de/de/vibe-coding/vibe-coding-tools/swamp
- https://pocketcasts.com/podcast/changelog-master-feed/ba457f00-7222-0134-78b4-4ffec63d9550/automation-at-the-speed-of-swamp-changelog-friends-130/d1d05b79-9185-4f3e-ae4d-4e7571452382
- PR count from `gh search prs --repo swamp-club/swamp --merged --merged-at ">=2026-09-29"`, run on 2026-10-29.
