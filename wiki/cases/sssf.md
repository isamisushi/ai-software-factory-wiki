---
title: Super Simple Software Factory
kind: case
org: IndyDevDan
people: [IndyDevDan]
type: [product]
source: oss
license: MIT
repo: https://github.com/disler/super-simple-software-factory
investigated_at: 2026-11-02
investigated_commit: de31374882e7a4e3e5b7bb9bd09e69dc2f779356
concepts: [deterministic-loop-calls-llm, bounded-fix-loop, deterministic-verdict, progress-ledger, execution-vs-acceptance, post-execution-write-audit]
---

# Super Simple Software Factory

[← Cases](../index.md) · [Loop diagrams](../loops/sssf.md)

Research date: 2026-11-02. The target is `disler/super-simple-software-factory@de31374882e7a4e3e5b7bb9bd09e69dc2f779356`. The research read cloned source without running it. It did not install the skill, call an LLM, or deploy to a target project.

Concepts: [Deterministic loop calls an LLM](../concepts/deterministic-loop-calls-llm.md) · [Bounded fix loop](../concepts/bounded-fix-loop.md) · [Deterministic verdict](../concepts/deterministic-verdict.md) · [Progress ledger](../concepts/progress-ledger.md) · [Execution versus acceptance](../concepts/execution-vs-acceptance.md) · [Audit writes after execution](../concepts/post-execution-write-audit.md)

## Summary

This template gives Python control of stages and acceptance decisions. Pi agents plan, implement, and review. Typed JSON output and test results pass to the next stage. However, the supplied quality commands are placeholders that exit successfully. Installation alone does not produce a factory with real tests. [Skill](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/SKILL.md), [quality.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/quality.py)

## 1. Organization and people

IndyDevDan publishes this project under MIT. The fetched HEAD has one reachable commit, dated 2026-08-02. There are no commits from 2026-08-04 through the research date. One public commit cannot measure the development process or the share of generated code. [LICENSE](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/LICENSE), [Pinned commit](https://github.com/disler/super-simple-software-factory/commit/de31374882e7a4e3e5b7bb9bd09e69dc2f779356)

## 2. Product overview

The skill installs stage scripts, configuration, prompts, and visualization components into a target project. Requests arrive as text or files. This page studies `adw_build_review.py` and `adw_build_test.py` as examples. It does not assume that every template behaves the same way. [Templates](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws)

## 3. Factory design from source code

### 3.1 Deliverables and responsibility boundaries

| File | Role |
| --- | --- |
| [SKILL.md](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/SKILL.md) | Instructions for launch, generation, and operation. Text alone does not enforce behavior. |
| [adw_build_review.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_review.py) | Implementation, review, repair, and the final decision. |
| [adw_build_test.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_test.py) | Code starts tests and returns failures to the builder. |
| [agents.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agents.py) | Pi calls, JSON parsing, and retries after invalid results. |
| [gates.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/gates.py) | Programmed rules assess claims in agent output. |
| [runner.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/runner.py) | Separates stage state from acceptance of the whole Run. |
| [permissions.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/permissions.py) | Detects unauthorized changes after execution and attempts restoration. |
| [quality.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/quality.py) | Connects the target project's tests, lint, and other quality commands. |
| [tracer.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/tracer.py) | Records state, events, and usage in SQLite. |

The target tree has no root AGENTS.md, CLAUDE.md, CONTRIBUTING, or `.github/workflows`. The research read the skill, reviewer prompt, configuration, and execution paths above. It did not execute them.

### 3.2 Implementation and review

A separate reviewer runs after the builder. Its instructions require reading real files for each requirement and returning unmet requirements with evidence. Code tests whether `approved`, unmet requirements, and blocking findings agree. The model still decides whether the requirements are actually met. [Reviewer](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/prompt_engineering/reviewer/system.md), [verdict_consistent](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/gates.py)

`MAX_REVISION_LOOPS = 3` means at most three reviews. After the third rejection, the loop exits without another repair. Therefore, at most two repairs follow the initial implementation. The constant name and the final message, “revision(s),” do not mean three repairs. [Actual loop](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_review.py#L50)

Retries after JSON parsing failures or gate violations return to the same Pi session. They do not discard context and start with a new worker. Their limit is separate from the outer review and repair count. [agents.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agents.py)

### 3.3 Test execution and Run acceptance

The system separates successful test execution from passing tests. `run.finish(accepted=...)` uses both stage success and acceptance conditions. These determine the recorded result and exit code. [runner.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/runner.py#L114)

The default test, lint, typecheck, and build commands in `quality.py` are `echo` placeholders that print explanations. Exit code 0 counts as success, so these commands pass without testing quality. Users must replace them with commands for the target project during setup. [Placeholders and decisions](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/quality.py)

`adw_build_test.py` runs tests at most three times and repairs after each failure. It also repairs after the third failure, but does not retest that change. The last failing result causes the Run to fail. This path does not accept an untested repair. However, the final files can differ from the files tested in the last round. [Test loop](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_test.py#L55)

### 3.4 Write audits after execution and their limits

The configuration defines `writes: []` for the reviewer and shared `protected_files`. If `permissions.enforce()` detects a violation, it attempts restoration and fails the stage. This is not OS isolation or rejection at write time. [Configuration](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/sssf.config.yaml), [permissions.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/permissions.py)

Detection uses `git diff HEAD --numstat` for tracked files and names for untracked files. It does not use content hashes. It cannot distinguish changed content with unchanged added and removed line counts. It also cannot distinguish content changes in an untracked file with the same name. Furthermore, `enforce()` runs after parsing and gate evaluation. Earlier exception paths do not call it. These findings do not support a claim that the mechanism reliably prevents every change. [snapshot / changed_paths](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/permissions.py#L50), [Call order](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agents.py#L141)

`diff_matches_claims` only establishes that reported files exist. It does not establish an exact match with the actual diff. It does not rule out unreported changes. [gates.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/gates.py)

### 3.5 State and cost

The system saves the Run ID and session IDs for each role. SQLite stores stages and usage. Agents run at the root of the target repository. This path does not automatically create a worktree or sandbox for each task. It records cost, but the inspected path does not establish an enforced total budget limit. [runner.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/runner.py), [agents.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agents.py)

## 4. Public claims and supporting evidence

| Policy | Source findings and limits |
| --- | --- |
| Code owns stages and acceptance | Python loops and `finish` implement this. Users must connect real tests. |
| Typed output passes between stages | JSON parsing and gate evaluation enforce structure. They do not establish factual correctness. |
| The reviewer does not change code | Instructions and later audits support this. Detection gaps and exception paths remain. |
| Repairs have limits | There are three reviews and two repairs. The test workflow has a different loop structure. |
| History supports observation | SQLite and output files provide records. They do not guarantee tamper resistance or distributed recovery. |

## 5. Analysis

This small implementation separates stage completion from acceptance of the result. The names of gates, their descriptions, and the conditions they actually test need separate attention. A default success message is not evidence of real tests or independent evaluation.

## 6. Open questions

Connecting real tests in target projects and fault tests of permission audits remain unexplored. Conflicts between Runs in one workspace and recovery after failures also remain unexplored. Connections to PRs, CI, and merge, plus operational success rates, remain unknown. This is a source-reading study, not a vulnerability demonstration or an exhaustive audit.

## Sources

The links above use the target commit. Activity counts use `git rev-list --count HEAD` and `git log` since 2026-08-04 against the full cloned history. The research did not count merged GitHub PRs. Repository publication frequency and work processed by the product are separate measures.
