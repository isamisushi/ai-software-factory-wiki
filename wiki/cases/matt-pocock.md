---
title: Matt Pocock Software Factory
kind: case
org: Matt Pocock
people: [Matt Pocock]
type: [product]
source: oss
license: MIT
repo: https://github.com/mattpocock/skills
investigated_at: 2026-11-02
investigated_commit: b59cab42bf1206e1363eafc37f71b21c3bcaa12f
concepts:
  - human-checkpoints
  - bounded-fix-loop
  - tracker-as-control-plane
  - progress-ledger
  - fix-the-machine
  - trust-root-review
  - stateless-run-handoff
---

# Matt Pocock Software Factory

[← Cases](../index.md) · [Loop diagrams](../loops/matt-pocock.md)

Research date: 2026-11-02 (JST). The target is the final commit of [PR #1316](https://github.com/mattpocock/skills/pull/1316): `mattpocock/skills@b59cab42bf1206e1363eafc37f71b21c3bcaa12f`. The research cloned the public source, selected this version, and read it. It did not reproduce the whole current main branch or the course runtime.

Concepts: [Human checkpoints](../concepts/human-checkpoints.md) · [Bounded fix loop](../concepts/bounded-fix-loop.md) · [Tracker as control plane](../concepts/tracker-as-control-plane.md) · [Progress ledger](../concepts/progress-ledger.md) · [Fix the machine](../concepts/fix-the-machine.md) · [Trust root review](../concepts/trust-root-review.md) · [Stateless run handoff](../concepts/stateless-run-handoff.md)

## Summary

Matt Pocock publishes this skill to help users design their own software factories. A skill is a reusable set of agent instructions. It defines shared terms for work types, individual runs, execution environments, and external services. Users design launches, handoffs, and duplicate prevention. Like Superpowers, it controls agent work through text. Its subject is factory design. [SKILL.md](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md)

The design discards local state between runs and ends a run when human judgment is required. Human updates to tickets or PRs start the next run. Quality controls include automated tests, AI review in a separate run, and human PR review. The skill requires limits on repeated repairs. [Terms and design policy](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md#L8)

The public files contain the skill, example tasks, and research on service selection. This directory has no scheduler, runner, or merge gate implementation. The limits, approvals, and disposable environments below are design rules. Distributed code does not enforce them.

## 1. Organization and people

| Item | Finding |
| --- | --- |
| Author | Matt Pocock, also named in the plugin manifest. |
| License | MIT. |
| Target PR | #1316, merged at 2026-10-31 23:23 JST. It contains 12 commits and eight changed files. |
| Distribution stage | Beta in `skills/in-progress/` at this commit. The normal plugin's skills array does not include it. |
| Invocation | `disable-model-invocation: true`. The user must explicitly invoke it. |

Evidence: [PR](https://github.com/mattpocock/skills/pull/1316), [LICENSE](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/LICENSE), [Plugin manifest](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/.claude-plugin/plugin.json), [Beta description](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/README.md), [Development rules](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/CLAUDE.md).

Activity measurement covers only this PR. GitHub API metadata records 12 commits and eight files. All 12 fetched commit bodies contain `Co-Authored-By: Claude Opus 5.5` in local Git history. This is evidence of agent assistance. It is not proof that this factory developed itself, or a measure of autonomy. This research did not recount repository popularity or activity over the latest 90 days.

## 2. Product overview

The skill separates product selection for external services from definitions of the tasks that read and write those services. It starts with user problems. Examples include unorganized tickets, pending reviews, or a move toward stricter quality rules. [Design entry point](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md#L48)

| Term | Meaning in this skill |
| --- | --- |
| Task | A repeatable kind of work, such as implementation, review, or research. |
| Trigger | An event that starts execution, such as a ticket update, PR update, or scheduled time. |
| Run | One execution of a Task. It can contain multiple agent sessions. |
| Runner | A disposable environment that executes a Run. |
| Ticket tracker / source | Ticket storage and the entry point for externally created tickets. |
| Git host | Storage for branches, PRs, and reviews. |
| Orchestrator | A component that receives triggers and records waiting, running, and completed work. |
| Observability platform | A place where humans read logs and execution status. Existing run screens can make it unnecessary. |

These terms describe roles, not product names or machine counts. Examples include GitHub filling several roles, a Linear-based design, and a custom tracker. Remote execution and disposable Runners are policies chosen by this case. They are not definitions for the entire wiki. [Definitions and examples](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md)

## 3. Factory design from source files

### 3.1 Published instructions and runtime boundaries

| File | Role |
| --- | --- |
| [SKILL.md](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md) | Terms, gradual automation, architecture choices, and conditions for design completion. |
| [EXAMPLE-TASKS.md](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/EXAMPLE-TASKS.md) | Problem-specific Tasks, their triggers, processing, and subsequent Tasks. |
| [TICKET-TRACKERS.md](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/TICKET-TRACKERS.md) | Tracker types and selection criteria for state, notifications, APIs, identity, and related needs. |
| [GIT-HOSTS.md](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/GIT-HOSTS.md) | Selection criteria for PRs, permissions, required checks, and event chains. |
| [RUNNERS.md](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/RUNNERS.md) | Ownership of execution loops and machines, plus lifetime, cost, and isolation. |
| [OBSERVABILITY-PLATFORMS.md](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/OBSERVABILITY-PLATFORMS.md) | Delivery of execution data, retention, cost, and whether another product is needed. |

Each service guide dates its information to October 2026 and disclaims continued freshness. The skill instructs users to consult primary sources again before selection. This page does not present those prices or beta states as current facts.

### 3.2 Connect implementation, review, and repair

Explore reads tickets and passes implementable work to Implementer. If judgment is needed, it leaves a waiting state on the ticket and exits. Implementer passes quality tests, creates a draft PR, and starts a separate Automated review. [Example tasks](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/EXAMPLE-TASKS.md#L5)

Automated review reads the diff against rules and the ticket. After rejection, Rework repairs the reported issues and starts another review. A specified number of failures returns the work to a person. The example does not specify the number or counter storage. Even after approval, a person reads and merges the PR. [Review and repair](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/EXAMPLE-TASKS.md#L19)

Automated tests in every Run and human review of every PR are design policies. The skill does not implement test commands, GitHub required checks, reviewer identity, or matching the evaluated SHA. Users must build these controls.

### 3.3 Human waiting and state lifetime

A Run does not stay alive while waiting for a human reply. It saves state in tickets or PRs and ends. A human update starts a new Run. The Runner does not treat local files as memory for the next run. It records information in the tracker, Git host, and orchestrator. [Run and Runner](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md#L18)

The design separates log viewing from the records that drive work. If monitoring detects a problem, it creates a ticket that a Run reads. Logs do not directly trigger the next operation. The problem first becomes managed work. [Observability role](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md#L44), [Monitoring to tickets](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/EXAMPLE-TASKS.md#L57)

### 3.4 Duplicate prevention is required for a complete design

For each Task, the user must define its trigger, processing, data destinations, and next Task. The user must also define the human return point and how duplicate execution stops. A Ticket source must explain how it avoids duplicate tickets. Design is complete when each role has a product and each question has an answer. [Design questions](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md#L86)

The skill does not choose a lock, lease, or deduplication key mechanism. Duplicate prevention is not an implemented feature. It is a question that the design cannot leave unanswered.

### 3.5 Expand automation and improve the factory

Automatic launches start at low volume. Examples include one of every ten bug reports or one run per day. These are examples, not product defaults. Volume grows after automated tests, separate reviews, and human reviews prove useful. [Start slow](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md#L54)

Fix turns logs from a failed Run into a ticket. If repair is possible, it creates a PR that repairs the factory. A failed Fix does not start another Fix. This prevents a recursive chain of repairs. Every factory repair requires human review. [Fix](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/EXAMPLE-TASKS.md#L61)

Retro proposes instruction changes from merged PRs, tickets, AI reviews, and execution logs. One example trigger is every ten merges. Architecture collects improvement candidates into one ticket at night. It does not start implementation until a human selects work. Ratchet moves one file at a time from an exception list to stricter quality rules. It finishes when no exceptions remain. [Improvement tasks](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/EXAMPLE-TASKS.md#L39)

### 3.6 Development and evaluation of this skill

The PR reports applying the vocabulary to course design exercises and three example architectures. It also explicitly reports no tests because the change only affects text. This is not a measured runtime success rate or cost-benefit result. [PR evidence](https://github.com/mattpocock/skills/pull/1316)

At the target commit, `.github/workflows/` applies triage labels, closes unanswered needs-info issues, and manages versions with Changesets. These operate the repository. They do not run the full factory described in EXAMPLE-TASKS. The inspected directory and CI contain no identified dedicated evaluation of skill adherence. [Workflows](https://github.com/mattpocock/skills/tree/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/.github/workflows)

## 4. Public claims and supporting evidence

| Claim or policy | Public evidence and limits |
| --- | --- |
| Shared terms guide factory design | The skill supplies terms, example architectures, and design questions. |
| Runs end when waiting for humans | The definition states this. Users implement state storage and relaunch. |
| Repairs have a limit | Instructions require a limit and show failure handoff. They provide no fixed number or enforcement code. |
| The factory improves itself | Fix, Retro, Ratchet, and other Task examples describe this. Public operational logs remain unknown in this study. |
| Automated tests and two review stages protect quality | This is a design policy. Git protection rules and mechanical guarantees of independence are not supplied. |

## 5. Analysis

Superpowers details stages within agent sessions. This case designs connections between Runs across external services. Like Symphony, it lets people control work through a tracker. Unlike a design that retains a workspace, it discards local state after each Run.

The case turns retries, human waiting, duplicate runs, and recursive repair into questions to answer before implementation. The absence of runtime code limits enforcement. However, it makes the controls that users must implement explicit for comparison.

## 6. Open questions

The research leaves these items open:

- How Part Two of the course or real deployments map these terms to runtime code.
- Promotion into the normal plugin and connections to other skills after this PR. The distribution description applies only to the target commit.
- Concrete implementation of duplicate prevention, cost limits, acceptance tied to a SHA, and permission separation.
- Actual PR success rates, human repair effort, and operating costs.

## Sources

Source links use the final PR commit. The research obtained PR state, time, 12 commits, and eight files from the GitHub API on 2026-11-02. The merge commit is `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d`. The research read code and instructions only. It did not run repository scripts or install the skill.
