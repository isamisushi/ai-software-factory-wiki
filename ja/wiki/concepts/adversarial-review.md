---
title: Adversarial review
kind: concept
aliases: [敵対的レビュー, skeptic reviewer]
category: 検証
seen_in: [swamp, superpowers, symphony, orchestrator]
---

# Adversarial review

[← 用語一覧](../concepts.md)

## 定義

「このコードは壊れている」という前提に立ち、壊し方を探す役割のエージェントレビュー。通常のレビューとは分けて行う。品質要件（セキュリティ、UX、アクセシビリティなど）ごとに専用のレビュアーを用意し、変更の内容に応じて必要なものだけを実行することが多い。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | 計画に対するもの（Architecture、Scope、Risk、Testing、Complexity、Security、Correctness、Documentationの観点）と、コードに対するもの（code、adversarial、ux、ci-securityの4種類を変更されたパスで振り分ける）がある。コア部分の変更時はCIでも再実行する | `agent-constraints/adversarial-dimensions.md`、`verification/review-prompts/`、`verification-conventions.md` のGuards表 |
| [Superpowers](../cases/superpowers.md) | 品質要件ごとのレビュアーではなく、タスクごとの懐疑的なレビュアー。「実装者の報告は未検証の主張。『YAGNIなので省いた』などの理由づけも自己採点」と指示し、spec準拠と品質の2つの判定を返させる。コントローラーがレビュアーに「これは指摘するな」と予断を与えることも禁じる | [task-reviewer-prompt.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/task-reviewer-prompt.md#L64)、[SKILL.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md) |
| [Symphony](../cases/symphony.md) | Elixir実装の `AGENTS.md` が「自明でない変更では早めにadversarial reviewを使い、隣接するライフサイクルの経路を壊しにいく。再現できる失敗は他のレビューがきれいでもlandを止める」と書く。ただし、それを実行するプロンプトや仕組みは公開リポジトリにない（指示のみ）。land skillが待つ `## Codex Review — <persona>` のコメントも、公開PRには見つからなかった | [AGENTS.md L36](https://github.com/openai/symphony/blob/be10a1b/elixir/AGENTS.md#L36)、[land SKILL.md](https://github.com/openai/symphony/blob/be10a1b/.codex/skills/land/SKILL.md) |
| [Orchestrator.inc](../cases/orchestrator.md) | 別reviewerが差分と未信頼のリポジトリ内容を読み、構造化判定を出す。テスト実行は禁止する指示で、権限の強制はadapterにより異なる。 | [固定コミットの実装調査](../cases/orchestrator.md) |

Adam Jacobはポッドキャストで、Webサイト側でLighthouse 100点を維持するadversarial skillを使っていると話している（ソースは未確認）。

## 関連

- [決定的なverdict](deterministic-verdict.md)
- [Trust rootのレビュー](trust-root-review.md)
