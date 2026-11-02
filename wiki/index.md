# Cases

[← Home](../) · [Concepts](concepts.md) · [Loops](loops/index.md) · [Comparison](compare.md)

A skill gives an agent reusable instructions. A pull request proposes code changes for review. CI runs automated tests and other tasks after changes.

| Case | Type | Source | Research date | Summary |
| --- | --- | --- | --- | --- |
| [Swamp](cases/swamp.md) | Product + internal development | Open source (AGPLv3) | 2026-10-29 | A command-line tool that turns intent into behaviors with fixed rules. Its own factory uses issue states, evidence records, and automatic merging. |
| [Superpowers](cases/superpowers.md) | Product + internal development | Open source (MIT) | 2026-10-29 | A skill plugin that guides design, planning, agent implementation, review, and integration. An evaluation lab measures and improves the skills themselves. |
| [Symphony](cases/symphony.md) | Product + internal development | Open source (Apache-2.0) | 2026-10-29 | A coordinator that monitors issues and runs Codex in a separate directory for each issue. Its main deliverable is a language-independent specification. Each repository defines testing, review, and merge rules in `WORKFLOW.md`. |
| [OpenHands](cases/openhands.md) | Product + development operations | Open source (multiple repositories) | 2026-10-31 | Four independent automated processes move issues toward a merge. The connection between the current reviewer and the watchdog's required pass records remains unconfirmed. |
| [Orchestrator.inc](cases/orchestrator.md) | Product | Public parts use Apache-2.0. Cloud control code is private. | 2026-10-31 | Stores facts about pull requests, automated tests, and reviews. Sends problems back to the responsible worker. Separates AO review decisions from GitHub merge requirements. |
| [GitHub Agentic Workflows](cases/gh-aw.md) | Product + internal development | Open source (MIT) | 2026-10-31 | Compiles Markdown into Actions workflows. Separates agent proposals from jobs that write with limited permissions. |
| [Matt Pocock Software Factory](cases/matt-pocock.md) | Product (design skill) | Open source (MIT) | 2026-11-02 | Designs factories with shared terms for Tasks, Runs, and external services. Defines policies for human handoff, repair limits, and prevention of recursive self-repair. |
| [Stripe Minions](cases/stripe-minions.md) | Internal development | Private (official articles) | 2026-11-02 | Moves from a request through implementation and automated tests without supervision, then hands the pull request to a human reviewer. The official account states a maximum of two CI cycles. |
| [StrongDM Software Factory](cases/strongdm.md) | Internal development + public specification | Partly public (Attractor specification, Apache-2.0) | 2026-11-02 | Evaluates acceptance through scenarios outside the code. The research separates internal operations from the public Attractor specification. |
| [Super Simple Software Factory](cases/sssf.md) | Product | Open source (MIT) | 2026-11-02 | Python controls the process and acceptance. The supplied quality commands are placeholders. The audit of changes after execution also has limits. |

A product is a tool or service for building a software factory. Internal development means that the organization uses a factory to build its own software.
