---
title: 人間のチェックポイント
kind: concept
aliases: [human-in-the-loop gates, approval points]
category: プロセス
seen_in: [swamp, superpowers, symphony, orchestrator, matt-pocock, stripe-minions]
---

# 人間のチェックポイント

[← 用語一覧](../concepts.md)

## 定義

ファクトリーの流れのうち、人間が判断する場所を少数に限って明示しておくこと。それ以外の部分は機械のゲートに任せる。

## 観察のポイント

事例を比べるときは、次の3点を見る。

- 人間が関わるのはどこか（入力、計画、コード、出荷前、出荷後）。
- コードレビューは人間がしているか。
- 止めるための手段はあるか。

## 事例での実装

| 事例 | 人間が関わる場所 | 根拠 |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | 主な明示的確認は(1) 計画の承認、(2) 検証後のPR作成前。計画とのずれの説明など、追加の人間とのやり取りもある。PRの `hold` ラベルで停止できる | `issue-lifecycle` skillのKey Rules、`verification-conventions.md` の手順8、ci.yml |
| [Superpowers](../cases/superpowers.md) | (1) 作り方の選択と設計書の承認（HARD-GATE）、(2) 計画のレビューと実行方式の選択、(3) 統合方法（マージ / PR / 保留）の選択。実行中は止めず、止まるのは取り返しのつかない操作など4つの条件だけ。実行中にAIが代わりに決めたことは最後に「Rulings I made」として列挙する | [brainstorming](https://github.com/obra/superpowers/blob/2ce8aa1/skills/brainstorming/SKILL.md#L247)、[writing-plans](https://github.com/obra/superpowers/blob/2ce8aa1/skills/writing-plans/SKILL.md#L179)、[SDD](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md#L27)、[finishing](https://github.com/obra/superpowers/blob/2ce8aa1/skills/finishing-a-development-branch/SKILL.md#L53) |
| [Symphony](../cases/symphony.md) | 人間の判断はトラッカーの状態の変更として入る。(1) `Backlog → Todo` で着手を許す、(2) `Human Review` のPRを見て `Merging`（承認）か `Rework`（差し戻し）に移す。terminalな状態に移せば、実行中のエージェントは止まる。エージェントは無人で動く前提で、人間に作業を頼まず、ツールや認証が欠けるときだけblockerを書いて `Human Review` に移す。`Human Review` 前の完了条件は手順書の指示で、コードは確かめない | [Status map](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L107)、[Step 3](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L244)、[escape hatch](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L187) |
| [Orchestrator.inc](../cases/orchestrator.md) | 人間のpermission dialogへ通常の差し戻し通知を入力しない。レビュー起動の方針を設定できるが、独立した人間の承認はマージAPI固有の必須条件ではない。 | [固定コミットの実装調査](../cases/orchestrator.md) |
| [Matt Pocock](../cases/matt-pocock.md) | 全PRで人間のレビューを求める設計。人間待ちではRunを終了し、更新後に新Runを起動する。強制コードは提供しない。 | [PR最終版の調査](../cases/matt-pocock.md) |
| [Stripe Minions](../cases/stripe-minions.md) | 無人実装の後に人間が結果を確認し、PRを開いて別の人間へレビューを依頼する。公式の運用説明。 | [Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) |

**強制の境界**: Superpowersのチェックポイントはすべてskillの指示で、承認の証跡を残す仕組みはない。Swampでも承認待ちはskillの指示。`approve` のコードはレビューの版と指摘の解決を確認するが、人間の承認証跡を引数で要求するものではない。[approve本体](https://github.com/swamp-club/swamp/blob/963e0d2/extensions/models/issue_lifecycle.ts#L2007) と [照合時の人間への確認](https://github.com/swamp-club/swamp/blob/963e0d2/.claude/skills/issue-lifecycle/references/code-conformance-review.md) を参照。

## 関連

- [Issue lifecycleのステートマシン](issue-lifecycle-state-machine.md)
