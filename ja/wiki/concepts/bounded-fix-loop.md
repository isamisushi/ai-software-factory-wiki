---
title: 上限つきの修正ループ
kind: concept
aliases: [circuit breaker, review-fix loop cap, scoped re-review]
category: プロセス
seen_in: [superpowers, symphony, openhands, orchestrator, matt-pocock, stripe-minions, sssf]
---

# 上限つきの修正ループ

[← 用語一覧](../concepts.md)

## 定義

レビューと修正の繰り返しに、回数の上限・途中での手の替え方・上限に達したときの扱いを決めておくこと。「承認されるまで繰り返す」を避ける。

## なぜ必要か

- LLMのレビュアーは実行のたびに違う指摘を出す。毎回差分全体をレビューすると新しい指摘が出続け、ループが収束しない。
- 同じ実装者が何度も失敗するのは、その実装者が自分の問題を見えていないことが多い。
- ループの回数は、費用と時間のばらつきの大きな原因になる。

## 上限を数える範囲

何を1回と数えるかを定める。SSSFのレビュー最大3回は、初回実装後の修正最大2回に対応する。JSONの訂正は別の反復である。StripeのCI最大2巡も、1回の実行内の上限であり、人間の追加依頼を含む総回数ではない。[SSSFの実装調査](../cases/sssf.md)、[Stripeの公開説明](../cases/stripe-minions.md)

上限後に残るファイルが検証済みかも調べる。SSSFのbuild_testは最後の修正を再テストせず、不合格で終了する。止まる仕組みと、最後の成果物を受け入れる条件は別に確認する。

## 観察のポイント

- 上限はいくつか。コードで数えているか、手順書の指示か。
- 再レビューの範囲（修正差分だけか、全体か）。
- 途中でモデルや担当者を替えるか。
- 上限に達したら誰が決めるか（人間に戻す、コントローラーが裁定する、失敗として止める）。その決定は記録されるか。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Superpowers](../cases/superpowers.md) | SDDはタスクごとに最大5ラウンド（修正1回 + 範囲を絞った再レビュー1回）。1〜3は元の実装者を再開、4〜5は一段強いモデルの新しい実装者に交代。計画と衝突する指摘は開始前に仕様を基準に裁定する。それ以外は上限後にコントローラーが裁定し、保留か最小の決定として台帳に書く。SDDの最終レビューは修正ウェーブ1回と再レビュー1回だけ。Nativeは本人が1回の修正パスで直し、各修正をTDDと全テストで検証する。再レビューは禁止。上限は手順書の指示で、コードでは数えていない | [fix-loop.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/references/fix-loop.md#L21)、[final-review.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/references/final-review.md#L17)、[executing-plans](https://github.com/obra/superpowers/blob/2ce8aa1/skills/executing-plans/SKILL.md#L234)、[設計書（2026-07-15）](https://github.com/obra/superpowers/blob/2ce8aa1/docs/superpowers/specs/2026-07-15-sdd-fix-loop-redesign-design.md) |
| [Symphony](../cases/symphony.md) | コードの上限は1つのワーカーのターン数（`max_turns`、既定20）、出力のない時間（1時間）、停滞（5分）。ただし `max_turns` に達してもissueがactiveなら1秒後に新しいワーカーが起動し、失敗のリトライにも回数の上限はない（バックオフは最大5分）。PRフィードバックのsweep、land、Reworkも「なくなるまで繰り返す」で、回数の上限はない。止めるのはトラッカーの状態だけ。上限が**ない**例として比較に使える | [agent_runner.ex](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/agent_runner.ex#L101)、[orchestrator.ex](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L1232)、[PR feedback sweep](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L171) |
| [OpenHands](../cases/openhands.md) | 同deliveryの会話errorは再試行2回。新deliveryではリセットする。修正headの連鎖全体と総費用の上限は未確認。 | [固定コミットの実装調査](../cases/openhands.md) |
| [Orchestrator.inc](../cases/orchestrator.md) | review/commentの通知keyごと最大3回、同headの自動レビュー実行失敗3件で停止。通知・実行失敗の局所上限であり、修正全体の上限ではない。 | [固定コミットの実装調査](../cases/orchestrator.md) |
| [Matt Pocock](../cases/matt-pocock.md) | review/reworkの失敗回数に上限を設け、人間待ちへ戻す方針。数値・カウンター・費用上限の実装は利用者側。 | [PR最終版の調査](../cases/matt-pocock.md) |
| [Stripe Minions](../cases/stripe-minions.md) | 1回の実行でCI最大2巡。2巡目の後は人間へ返す。実装は非公開。 | [Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) |
| [Super Simple Software Factory](../cases/sssf.md) | build_reviewはレビュー最大3回・修正最大2回。build_testはテスト3回で最後の修正を再テストしない。局所の再送回数とは分ける。 | [ループの静的調査](../loops/sssf.md) |

Swampの修正ループ（[ローカル検証](../loops/swamp.md#loop-d)、[CIとマージ](../loops/swamp.md#loop-e)）では、回数や費用の上限は確認できていない。

## 関連

- [タスクごとの新しいサブエージェント](fresh-context-subagents.md)
- [会話の外に置く進捗台帳](progress-ledger.md)
- [人間のチェックポイント](human-checkpoints.md)
- [工程の成功と成果物の受け入れを分ける](execution-vs-acceptance.md)
