---
title: Stripe Minions
kind: case
org: Stripe
people: [Alistair Gray]
type: [internal]
source: closed
license: Private
repo: https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents
investigated_at: 2026-11-02
investigated_commit: "Not applicable: private source"
concepts: [human-checkpoints, bounded-fix-loop, isolated-workspace, deterministic-loop-calls-llm]
---

# Stripe Minions

[← Cases](../index.md) · [Loop diagrams](../loops/stripe-minions.md)

Research date: 2026-11-02. No research commit applies because the source is private. This page uses Part 1 and Part 2 of the official Stripe articles. The internal implementation, deployment configuration, and logs for individual pull requests remain unknown. A pull request (PR) proposes a code change for review.

Concepts: [Human checkpoints](../concepts/human-checkpoints.md) · [Bounded fix loop](../concepts/bounded-fix-loop.md) · [Isolated workspace](../concepts/isolated-workspace.md) · [Deterministic loop calls an LLM](../concepts/deterministic-loop-calls-llm.md)

## Summary

Minions takes internal requests through code changes and CI without human intervention, then hands the result to a human reviewer. CI runs automated tests and other quality rules. Code defines the workflow and calls agents for implementation or repairs. This case separates unattended implementation from human acceptance. [Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents), [Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

## 1. Organization and people

Stripe uses Minions for internal development. The author, Alistair Gray, is an engineer on the Leverage team. Part 1 says that Minions writes all code for more than 1,000 merged PRs each week. This is a company claim. It does not give the share of all PRs, the failure rate, or human review time. [Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)

## 2. Product overview

Requests enter through Slack, the CLI, the web, or internal tools. Minions gathers context, changes code in a work environment, and prepares a branch and PR. A person reads the result, opens the PR, and asks another engineer to review it. People can also give more instructions or edit the code themselves. [Usage flow](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)

## 3. Factory design from public descriptions

### 3.1 Code controls stages and agents make decisions

A Blueprint is a graph of stages defined in code. Agents implement changes and repair CI failures. Ordinary code runs tasks such as lint and push. The foundation is an internal version of Block's goose. Public goose code is not direct evidence of the Minions implementation. [Blueprints](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

### 3.2 Work environment and tools

Agents use the same devboxes as developers. The article describes restricted access to production, real user data, and arbitrary outbound network traffic. MCP tools have separate controls, and agents receive only the required set. The exact isolation and permission configuration is private. [Environment and MCP](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

### 3.3 Test and repair limits

Local lint runs first. CI has a maximum of two rounds per run. The agent repairs remaining failures after the first CI round. After the second push and CI round, control returns to a person. The total run count and cost limits, including reruns after further instructions, remain unknown. [Testing and repetition](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents), [CI stages](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

## 4. Public claims and supporting evidence

| Public description | Scope of the evidence |
| --- | --- |
| Requests run without human intervention | Implementation is unattended. Humans still review PRs. |
| Blueprints run the required stages | This is an official design description. Source enforcement is not audited. |
| CI has at most two rounds | This is the policy for one standard run. It is not a limit across all runs. |
| Minions produces many PRs | The company reports this. It is not an independent measure of quality or autonomy. |

## 5. Analysis

One comparison point is the reuse of existing development environments and quality rules for agents. Automation ends with changes and test results that a person can assess. It does not end at code generation. The articles do not establish how acceptance records match the commit that will merge.

## 6. Open questions

Repair success rates, human rework, costs by model, and maximum local lint rounds remain unknown. Duplicate launch prevention and rejection of writes from old runs also remain unknown. The last two belong to a separate research topic: [Fenced authority](../concepts/fenced-authority.md).

## Sources

The research reviewed [official Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) and [Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) on 2026-11-02. These pages cannot be pinned to a commit. The research did not independently count internal activity or test the runtime.
