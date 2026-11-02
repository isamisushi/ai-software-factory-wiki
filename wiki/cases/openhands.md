---
title: OpenHands Software Factory
kind: case
org: OpenHands
people: [Graham Neubig]
type: [product, dogfooding]
source: oss
license: MIT
repo: https://github.com/OpenHands/extensions
investigated_at: 2026-10-31
investigated_commit: 6fb2b676
concepts:
  - commit-bound-acceptance
  - tracker-as-control-plane
  - deterministic-loop-calls-llm
  - isolated-workspace
  - bounded-fix-loop
---

# OpenHands Software Factory

[← Cases](../index.md) · [Loop diagrams](../loops/openhands.md)

Research date: 2026-10-31 (JST). The research cloned and read public source without running project scripts or tests.

| Target | Pinned commit | Scope |
| --- | --- | --- |
| [OpenHands/extensions](https://github.com/OpenHands/extensions/tree/6fb2b67680b9a5b41452a148e5705f99c7df1a75) | `6fb2b67680b9a5b41452a148e5705f99c7df1a75` | Catalog, workers, prompts, tests, and development rules for four automations. |
| [OpenHands/automation](https://github.com/OpenHands/automation/tree/407bf8a021cce90656ee8d92292bd742b550080f) | `407bf8a021cce90656ee8d92292bd742b550080f` | Scheduler, profile connections, runtime limits, and finish hook. |
| [OpenHands/software-agent-sdk](https://github.com/OpenHands/software-agent-sdk/tree/c048a1eb82353b0586f3ce600708394a68ebb246) | `c048a1eb82353b0586f3ce600708394a68ebb246` | Profile secret filtering and conversation cost configuration. |
| [OpenHands/OpenHands](https://github.com/OpenHands/OpenHands/tree/073024546a5b47da3ff1a25eb49febfbb24062d3) | `073024546a5b47da3ff1a25eb49febfbb24062d3` | Current Canvas responsibilities and development rules. |

These are repository HEADs from the same research period. They do not reproduce the versions deployed in the official demo.

Concepts: [Commit-bound acceptance](../concepts/commit-bound-acceptance.md) · [Tracker as control plane](../concepts/tracker-as-control-plane.md) · [Deterministic loop calls an LLM](../concepts/deterministic-loop-calls-llm.md) · [Isolated workspace](../concepts/isolated-workspace.md) · [Bounded fix loop](../concepts/bounded-fix-loop.md)

## Summary

Humans prepare issues and acceptance conditions. They configure four independent scheduled automations: triage, developer, reviewer, and watchdog. GitHub issues, labels, PRs, reviews, and commit statuses pass information between roles. One parent agent does not call the four roles in sequence. [Official guide](https://docs.openhands.dev/openhands/usage/use-cases/software-factory)

Programmed scanners start conversations for triage, developer, and reviewer. Watchdog does not call an LLM. It tests statuses, Actions results, base freshness, and mergeability for a specific PR head. It requests squash merge with a SHA, which identifies the evaluated commit. [Watchdog implementation](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-delivery-watchdog/scripts/worker.py)

The current catalog has an unresolved connection between roles. Watchdog requires success for `software-factory/tests` and `software-factory/review`. Developer also starts repairs when the latter fails or errors. However, the current reviewer prompt produces only native reviews and explicitly prohibits commit statuses. The inspected extensions, automation, and SDK code contain no identified publisher for these two statuses. Thus, the latest templates alone do not establish an end-to-end automatic repair and merge flow. [Reviewer prompt](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/main.py#L934), [Developer condition](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-to-pr/scripts/worker.py#L136)

Role-specific profiles restrict secrets, and GitHub token permissions restrict operations. Different prompts alone do not provide this separation. Watchdog does not test the independence of status authors. SDK budget support also does not establish that the factory configures a budget.

## 1. Organization and people

This case covers OpenHands development infrastructure and reusable automations. The official guide uses a demo repository from Graham Neubig, GitHub user `neubig`. The main target, extensions, uses MIT. Each repository's AGENTS.md separates responsibilities for Canvas UI, Agent Server/SDK, automation services, and reusable templates. [Extensions rules](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/AGENTS.md), [Canvas rules](https://github.com/OpenHands/OpenHands/blob/073024546a5b47da3ff1a25eb49febfbb24062d3/AGENTS.md)

Activity is separate from quality and autonomy. On 2026-10-31, this command returned 83 merged PRs:

```sh
gh search prs --repo OpenHands/extensions --merged --merged-at '>=2026-10-01' --limit 1000 --json number,author
```

Seven had author login `all-hands-bot`. The query did not reach its result limit. These counts cover all extensions development, not PRs created by this four-role factory. Bot authorship alone does not reveal the launch path, human involvement, or automatic merge. [Equivalent public search](https://github.com/OpenHands/extensions/pulls?q=is%3Apr+is%3Amerged+merged%3A%3E%3D2026-10-01)

## 2. Product overview

The official guide requires Agent Canvas 1.24.0 or later, Automation enabled, Docker workspaces per conversation, and three repository-scoped tokens. Each automation runs every five minutes. Watchdog reuses the developer token. After configuration, humans enable all four and observe small issues first. [Official guide](https://docs.openhands.dev/openhands/usage/use-cases/software-factory)

Canvas owns the UI. Automation owns scheduling, dispatch, and run history. SDK/Agent Server owns conversations and tool execution. Extensions owns the specific GitHub work. The old `OpenHands/agent-canvas` repository now redirects users to the new location. It is not the current factory implementation. [Old repository notice](https://github.com/OpenHands/agent-canvas), [Responsibility boundaries](https://github.com/OpenHands/automation/blob/407bf8a021cce90656ee8d92292bd742b550080f/AGENTS.md)

## 3. Factory design from source code

### 3.1 Files and responsibilities

All extensions links below use the research commit.

| File | Role |
| --- | --- |
| [automations/catalog/github-issue-triage/manifest.json](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/automations/catalog/github-issue-triage/manifest.json) | Bundle, configuration, and 300-second scanner timeout. The other roles share this catalog. |
| [skills/github-issue-triage/scripts/worker.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-triage/scripts/worker.py) | Fingerprints of issue content, human discussion, and readiness changes. Duplicate prevention and triage prompt. |
| [skills/github-issue-to-pr/scripts/worker.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-to-pr/scripts/worker.py) | Starts ready issues and repairs existing PRs. Associates branches with issues. |
| [skills/github-pr-reviewer/scripts/worker.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/worker.py) | Selects review heads, limits launches through CI and counts, and establishes published review completion. |
| [skills/github-pr-reviewer/scripts/main.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/main.py) | Review prompt reused by the catalog worker. Its standalone path is separate. |
| [skills/github-pr-reviewer/scripts/publication.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/publication.py) | Optional structured review publication. The normal catalog does not set `structured_publication`. |
| [skills/github-delivery-watchdog/scripts/worker.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-delivery-watchdog/scripts/worker.py) | Programmed merge gate and base updates. |
| [skills/github/scripts/agent_conversation.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github/scripts/agent_conversation.py) | Conversations by subject, delivery records in key-value storage, profiles, secrets, and error retries. |
| [skills/github/scripts/github_client.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github/scripts/github_client.py) | Named secret retrieval, GitHub API calls, status reads, and dependency issues. |

### 3.2 Input and triage

The scanner fingerprints issue text, human discussion, readiness changes, and related input. It does not repeatedly send the same processed input. The prompt instructs the agent to establish repository ownership, scope, non-goals, and observable acceptance conditions. Unresolved decisions require `decision_needed`. Readiness to start implementation is separate from acceptance after implementation. [Worker](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-triage/scripts/worker.py#L29)

The current catalog does not pass guarded publisher configuration. It uses the prompt's legacy direct mode, where the agent writes to GitHub. The separate `triage_publisher_path` rereads input and validates JSON. Those controls are not always enforced by the standard catalog. [Manifest](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/automations/catalog/github-issue-triage/manifest.json), [Mode branch](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-triage/scripts/worker.py#L57)

For extensions itself, a workflow removes `ready-for-dev` labels set by users without write, maintain, or admin permission. CI also examines PR text and the readiness of linked issues. These are extra gates in the target repository. Factory setup does not automatically install them in every repository. [Readiness workflow](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/.github/workflows/issue-readiness-check.yml), [PR checker](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/.github/scripts/check_pr_description.py)

### 3.3 Developer selection and repair

New work requires an open issue, the configured trigger label, no existing managed open PR, and completed dependencies named in `Depends on:` lines. Code enforces these conditions. It prioritizes `priority:high`, then orders by issue number. A `prefix-issueNumber` branch identifies the work. [Worker run](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-to-pr/scripts/worker.py#L117), [Dependencies](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github/scripts/github_client.py#L352)

Implementation, tests, commit, push, PR creation, and review labels are prompt instructions. For an existing PR, failure or error in current-head `software-factory/review` starts a repair conversation on the same branch. It reads reviews, discussion, and failed checks. Failed test status alone and native review findings do not directly replace this trigger. Repeated delivery for the same repair head is suppressed. A new head creates a new delivery. [Repair conditions and prompt](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-to-pr/scripts/worker.py)

### 3.4 Reviewer head binding and acceptance records

The normal catalog lets the agent post a native GitHub review. The scanner supplies the target SHA. Instructions require detached HEAD, a fresh PR read before publication, no publication after a head change, and the target SHA as `commit_id`. Checkout and prepublication behavior are prompt rules. Completion code rereads GitHub reviews and compares the reviewer account, `commit_id`, and other fields. [Prompt and completion](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/worker.py#L260)

For scheduled discovery, the launch gate reads current-head checks that GitHub marks as required. If that information is unavailable, it falls back to all checks and workflows. Explicit review requests can bypass this gate. These conditions start review. They differ from watchdog's merge conditions. [Launch gate](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/worker.py#L955)

The official guide says that reviewers leave review and test statuses for each head. The current prompt instead requires native reviews as the only result. It prohibits commit statuses and Checks. Tests assert this contract. Optional `publication.py` validates structured JSON, rereads the head, and publishes a native review. It also has no identified publisher for the two acceptance statuses.

The research searched target code across extensions, automation, and SDK, and read the automation finish hook. It did not identify the status publisher required by watchdog. A separate deployment-specific path remains possible. [Explicit prohibition](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/main.py#L934), [Contract test](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/tests/test_github_reviewer_delivery.py#L146), [Structured publication](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/publication.py), [Finish hook](https://github.com/OpenHands/automation/blob/407bf8a021cce90656ee8d92292bd742b550080f/openhands/automation/presets/finish_tool_hook.py)

### 3.5 Watchdog merge conditions enforced by code

The [implementation](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-delivery-watchdog/scripts/worker.py) distinguishes these conditions:

| Condition | Actual code |
| --- | --- |
| PR scope | Open, not draft, specified base, `prefix-number` branch, matching head SHA, and `mergeable is True`. |
| Acceptance records | Both `software-factory/tests` and `software-factory/review` must succeed for the same SHA. A native APPROVE is insufficient. |
| Other statuses | The latest value in each retrieved context must succeed. The code does not test authors, GitHub Apps, or reviewer independence. |
| Actions | Runs must match the head SHA. The latest run per workflow/event/head_branch must be completed/success. Incomplete retrieval or API exceptions prevent merge. |
| No Actions runs | Allowed if `required_workflow_ids` is empty. The current UI form does not expose these IDs. CI existence is not mandatory. |
| Outdated base | After acceptance, behind/diverged detection adds the review label and calls update-branch with `expected_head_sha`. Merge waits for a later scan. |
| Final operation | `PUT /pulls/N/merge` receives the evaluated SHA and squash method. GitHub rejects a concurrent head change. |

Source code binds acceptance to a SHA. Independent acceptance also depends on appropriate token configuration and trusted status publishers. A context name and success result alone do not prove independence. Deployed branch protection and required checks remain unknown. The base is a separate reference from the head. Supplying a head SHA does not freeze base changes between comparison and merge.

### 3.6 Role permissions and workspaces

The guide requires repository-specific fine-grained PATs, with only the matching secret selected in each profile. PATs are personal access tokens. It also requires empty MCP server lists and disabled model switching and sub-agents. [Official guide](https://docs.openhands.dev/openhands/usage/use-cases/software-factory)

| Role | Main GitHub permissions |
| --- | --- |
| triage | Contents read, Issues write. It cannot push code. |
| developer | Contents/Issues/PR write, Actions/Statuses read. It can change code and PRs. |
| reviewer | Contents/Actions read, Issues/PR/Statuses write. It cannot push code. |
| watchdog | Reuses the developer token. Code handles conditional merge. |

The dispatcher starts conversations with the selected `AUTOMATION_AGENT_PROFILE_ID` and retrieves secrets through that profile. The SDK filters requested secrets through the profile's allowed set. It also applies this filter to secrets forwarded into conversation containers. These are two boundaries: credentials distributed to the agent and operations GitHub permits. Without an explicit profile, the active/default profile applies. Each role therefore needs explicit configuration. [Dispatcher](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github/scripts/agent_conversation.py#L175), [SDK filtering](https://github.com/OpenHands/software-agent-sdk/blob/c048a1eb82353b0586f3ce600708394a68ebb246/openhands-agent-server/openhands/agent_server/launch.py#L211)

Separate profiles or Docker alone do not prove complete secret isolation from malicious code. The reviewer also runs target repository tests. Access to Agent Server authentication credentials is outside this audit. Actual Docker mounts, networks, and resource limits in the demo remain unknown.

### 3.7 Stop, retry, and cost limits

| Unit | Observed limit | Boundary |
| --- | --- | --- |
| Scheduled scanner | Each catalog bundle has a 300-second timeout. | This is not the lifetime of delegated conversations. |
| Conversation error in one delivery | `_MAX_ERROR_RETRIES = 2`. | A new delivery resets the count. It does not bound the whole repair sequence. |
| New reviewer launches | `max_new_per_run` defaults to two across all repositories. | This limits new launches in one scan, not total runs or cost. |
| Service sandbox | `max_run_duration` defaults to 30 minutes. | General configuration, not the stop time for the entire factory. |
| SDK LLM cost | `max_budget_per_run` exists and defaults to None. | A catalog path that sets factory or conversation budgets remains unknown. |
| Chain of repair heads | No total round limit was established. | The evidence does not support a two-attempt handoff to humans. |

Evidence: [Delivery and retry](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github/scripts/agent_conversation.py#L37), [Review intake](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/worker.py#L45), [Service configuration](https://github.com/OpenHands/automation/blob/407bf8a021cce90656ee8d92292bd742b550080f/openhands/automation/config.py#L228), [SDK budget](https://github.com/OpenHands/software-agent-sdk/blob/c048a1eb82353b0586f3ce600708394a68ebb246/openhands-sdk/openhands/sdk/conversation/conversation.py#L76).

## 4. Public claims and supporting evidence

| Public description | Research finding |
| --- | --- |
| Four independent automations move issues to merge | Separate catalogs and scanners exist. The current reviewer-to-status connection remains unknown. |
| The reviewer cannot push | Official token configuration enforces Contents read through GitHub. Watchdog does not audit token permissions. |
| Independent review and tests approve the exact head | Watchdog tests SHA and context. It does not prove publisher independence or test execution. |
| Stale branches update and receive another review | Watchdog updates branches and reapplies labels. New heads require new statuses. |
| Six Airbnb clone issues ran in parallel and PRs #87–#92 all merged | This is an official demo claim. PR pages returned 404 during research, so their review, status, and merge history was unavailable. |
| A Box clone completed through the same path | This is an official description. Deployment versions, full logs, and the human intervention share remain unknown. |

The demo claims come from the [official guide](https://docs.openhands.dev/openhands/usage/use-cases/software-factory). They describe specific successes. They do not establish success rates for arbitrary repositories or company-wide unattended development.

## 5. Analysis

Independent scanners connect through GitHub as shared state. Triage readiness differs from acceptance after implementation. Labels, heads, reviews, and statuses outside conversations determine subsequent work. Conversations are reused by subject. This is different from independent evaluation with entirely fresh context on every attempt. [Subjects and deliveries](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github/scripts/agent_conversation.py#L228)

Watchdog moves merge decisions into code. It does not act on an LLM saying that merge is allowed. It evaluates records tied to a SHA and GitHub state. However, independence also requires knowing how and by whom those records were created. The current catalog leaves that publication connection unresolved. Separate component contract tests do not necessarily establish consistency across all four roles.

Evidence of internal use has different strengths. The repository has agent rules, review guidance, readiness CI, and bot-authored changes. These do not establish that this factory and watchdog control all its development. Official clone-app demos, public bot activity, and product-wide operations are separate evidence.

## 6. Open questions

The research leaves these items open:

- Extensions, SDK, and automation versions in the official demo, plus the publishers of both acceptance statuses and reasons for catalog differences.
- Review, status, Actions, base update, merge, and human edit histories for the six demo PRs.
- Deployed branch protection, restrictions on status-publishing identities, and merge permissions.
- Delegated conversation time, iteration, and cost limits, plus total repair limits and human handoff.
- Docker mount, network, CPU, and memory limits, plus trust boundaries around secret APIs and delegated agents.

## Sources

The sources and scope are:

- [Official Software Factory guide](https://docs.openhands.dev/openhands/usage/use-cases/software-factory), retrieved on 2026-10-31. This operational description can change.
- The four pinned repository commits above. The research read AGENTS.md, review guides, catalogs, workers, CI, and contract tests.
- The `gh search prs` query above, as of 2026-10-31. It counts public PRs, not audited factory launches.
- Officially referenced Airbnb clone [PR #87](https://github.com/neubig/airbnb-clone/pull/87) and [PR #92](https://github.com/neubig/airbnb-clone/pull/92). Their bodies were unavailable in this research.
