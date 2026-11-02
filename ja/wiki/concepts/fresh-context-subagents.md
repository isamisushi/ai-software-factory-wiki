---
title: タスクごとの新しいサブエージェント
kind: concept
aliases: [controller and subagents, fresh context per task, subagent-driven development]
category: アーキテクチャ
seen_in: [superpowers]
---

# タスクごとの新しいサブエージェント

[← 用語一覧](../concepts.md)

## 定義

メインのエージェントはコントローラー（調整役）に徹し、実装やレビューはタスクごとに新しい文脈のサブエージェントに任せる。サブエージェントには会話の履歴を渡さず、そのタスクに必要なものだけをファイルで渡す。

## なぜ必要か

- 文脈が汚れない。前のタスクの試行錯誤や思い込みが次のタスクに持ち込まれない。
- レビュアーが実装者の文脈を持たないので、実装者の説明に引きずられにくい。
- コントローラーの文脈を調整のために残せる。長い計画でも圧縮されにくい。
- 役割ごとにモデルを選べる（機械的な実装は安いモデル、最終レビューは強いモデル）。

## 観察のポイント

- サブエージェントに何を渡すか（タスク本文、インターフェース、差分）。履歴を貼り付けていないか。
- 実装者がさらにサブエージェントを出すことを許すか。
- コントローラーが自分で修正してよいか（レビューを飛ばすことになる）。
- 並列に動かすか、順番に動かすか。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Superpowers](../cases/superpowers.md) | SDDのコントローラーが、`task-brief` で抜き出したタスク本文を新しい実装者に渡し、`review-package` の差分ファイルを新しいタスクレビュアーに渡す。過去のタスクの要約は貼らない。実装者もレビュアーもサブエージェントを出してはいけない。コントローラーは修正しない。実装者は並列に出さない。モデルは役割ごとに明示する | [SKILL.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md)、[Model Selection](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md#L139)、[task-reviewer-prompt.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/task-reviewer-prompt.md) |

## 関連

- [上限つきの修正ループ](bounded-fix-loop.md)
- [会話の外に置く進捗台帳](progress-ledger.md)
- [Adversarial review](adversarial-review.md)
