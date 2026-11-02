# Concepts and patterns

[← Home](../) · [Cases](index.md) · [Loops](loops/index.md) · [Comparison](compare.md)

This dictionary defines patterns for comparing the cases. Each page includes a definition, evidence, and limits. Some patterns come from only one case.

The pages distinguish findings from code, public descriptions, and teaching material. A pattern name does not mean that every case enforces it.

## Input

| Concept | Description | Cases |
| --- | --- | --- |
| [Control incoming contributions](concepts/closed-contribution.md) | Reject external code, or require human involvement and disclosure of its source. | Swamp, Superpowers, Symphony, GitHub Agentic Workflows |

## Process

| Concept | Description | Cases |
| --- | --- | --- |
| [Issue lifecycle state machine](concepts/issue-lifecycle-state-machine.md) | Define stages and allowed transitions from issue to release. Store the state outside the conversation. | Swamp, Symphony |
| [Human decision points](concepts/human-checkpoints.md) | Name a small number of points where a human makes a decision. | Swamp, Superpowers, Symphony, Orchestrator.inc, Matt Pocock, Stripe Minions |
| [Inject workflow rules at session start](concepts/workflow-bootstrap-injection.md) | Add startup rules to each session so that the agent enters the intended process. | Superpowers |
| [Bounded fix loops](concepts/bounded-fix-loop.md) | Set limits for review and repair. Define when to replace a worker and what happens at the limit. | Superpowers, Symphony, OpenHands, Orchestrator.inc, Matt Pocock, Stripe Minions, Super Simple Software Factory |
| [Use the tracker to control work](concepts/tracker-as-control-plane.md) | Use issue states to start and stop agents. Humans manage work by moving cards. | Symphony, OpenHands, Matt Pocock |
| [End the run and hand off to a human](concepts/stateless-run-handoff.md) | Record the problem externally and end the run. Start a new run after the human updates the record. | Matt Pocock |

## Verification

| Concept | Description | Cases |
| --- | --- | --- |
| [Adversarial review](concepts/adversarial-review.md) | Ask a reviewer to find failures and missing work without trusting the implementer's report. | Swamp, Superpowers, Symphony, Orchestrator.inc |
| [Record local test evidence](concepts/local-verification-attestation.md) | Test locally and give CI a record of the results to inspect. | Swamp |
| [Deterministic verdicts](concepts/deterministic-verdict.md) | Use fixed rules to read markers or JSON from an AI review and decide the result. | Swamp, Super Simple Software Factory |
| [Separate black-box acceptance tests](concepts/black-box-uat.md) | Separate acceptance evaluation from implementation. Inspect both storage location and write permissions. | Swamp, StrongDM Software Factory |
| [Treat skills as tested code](concepts/skills-as-tested-code.md) | Measure agent behavior before and after changes to its instructions. | Superpowers, Swamp |
| [Tie acceptance to a commit](concepts/commit-bound-acceptance.md) | Tie test and review results to a specific commit. Require that same version at merge time. | OpenHands, Orchestrator.inc |
| [Reproduce external service behavior](concepts/behavioral-service-twins.md) | Reproduce external API behavior and failures in a test environment to evaluate dependent software. | StrongDM Software Factory |
| [Separate execution from acceptance](concepts/execution-vs-acceptance.md) | Decide separately whether a process completed and whether its output passed. | Super Simple Software Factory |

## Safety

| Concept | Description | Cases |
| --- | --- | --- |
| [Review the trust root](concepts/trust-root-review.md) | Give special review to changes in files that define the factory itself. | Swamp, Matt Pocock |
| [Run agent tools on the host](concepts/host-side-agent-tools.md) | Run authenticated operations on the host without exposing tokens to the agent. | Symphony |
| [Isolated workspaces](concepts/isolated-workspace.md) | Keep each task and its tests in a separate directory or Git worktree. | Symphony, Swamp, Superpowers, OpenHands, Orchestrator.inc, GitHub Agentic Workflows, Stripe Minions |
| [Delegate writes through a gate](concepts/delegated-write-gate.md) | Let another process inspect agent proposals and apply them with limited permissions. | GitHub Agentic Workflows |
| [Fence stale write authority](concepts/fenced-authority.md) | Compare ownership generations at storage and reject writes from a previous owner. | Seen in a teaching model. Enforcement in the listed cases remains unconfirmed. |
| [Audit changes after execution](concepts/post-execution-write-audit.md) | Compare the state before and after execution. If changes exceed permission, reject the result. | Super Simple Software Factory |

## Architecture

| Concept | Description | Cases |
| --- | --- | --- |
| [Use domain terms as agent vocabulary](concepts/ddd-as-agent-vocabulary.md) | Put established design terms in a skill for planning and review. | Swamp |
| [Architecture fitness tests](concepts/architecture-fitness-tests.md) | Use static tests to protect boundaries and conventions. Prevent existing violations from increasing. | Swamp |
| [Call an LLM from a deterministic loop](concepts/deterministic-loop-calls-llm.md) | Let code control the flow. Call the language model only at judgment steps. | Swamp, Symphony, OpenHands, Orchestrator.inc, GitHub Agentic Workflows, Stripe Minions, StrongDM Software Factory, Super Simple Software Factory |
| [Fresh subagents for each task](concepts/fresh-context-subagents.md) | Give tasks to implementers and reviewers with fresh conversation context. | Superpowers |
| [Distribute a specification as the product](concepts/spec-as-product.md) | Distribute a language-independent specification for the user's agent to implement. | Symphony, StrongDM Software Factory |

## Operations

| Concept | Description | Cases |
| --- | --- | --- |
| [Fix the machine](concepts/fix-the-machine.md) | Improve the factory in response to each class of failure. | Swamp, Superpowers, GitHub Agentic Workflows, Matt Pocock |
| [Keep a progress ledger outside the conversation](concepts/progress-ledger.md) | Store progress and decisions in files or a data store. Resume from those records after conversation compression. | Superpowers, Swamp, Symphony, Orchestrator.inc, Matt Pocock, Super Simple Software Factory |
