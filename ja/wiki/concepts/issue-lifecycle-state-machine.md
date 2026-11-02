---
title: Issue lifecycleのステートマシン
kind: concept
aliases: [SDLC as state machine, lifecycle model]
category: プロセス
seen_in: [swamp, symphony]
---

# Issue lifecycleのステートマシン

[← 用語一覧](../concepts.md)

## 定義

issueを受け取ってから出荷するまでの流れを、明示的なフェーズと遷移を持つステートマシンとして定義する。エージェントはその遷移を呼び出すことで作業を進める。状態はエージェントの会話の外に永続化する。

## なぜ必要か

- 許可されていない遷移を拒否できる。ただし例外経路の有無を調べ、手順書に書かれた全工程が強制されると推定しない。
- コンテキストが圧縮されてもセッションが変わっても、作業を再開できる。
- 各遷移が監査ログとして残る。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | `@swamp/issue-lifecycle` behaviorが triage → plan → adversarial_review → approve → implement → code_conformance_review → verify → post_attestation → link_pr → pr_merged → notify → summarize と進める。各遷移はswamp-clubのissueに記録される。最後の `summarize` で「元の問題」「届けた結果」「目的を達成したか」を必ず記録する | `.claude/skills/issue-lifecycle/SKILL.md`、`extensions/models/_lib/schemas.ts` の `TRANSITIONS` |
| [Symphony](../cases/symphony.md) | トラッカーの状態（Backlog → Todo → In Progress → Human Review → Merging → Done、差し戻しのRework）をそのままlifecycleとして使う。状態ごとの作業はプロンプトで定める。コードが持つのは「activeならエージェントを動かす、terminalなら止めて片付ける」だけで、遷移の許可や完了条件の確認はしない。Swampより弱い形で、[トラッカーを制御面にする](tracker-as-control-plane.md) とも読める | [WORKFLOW.md](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L107)、[SPEC §7](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L635) |

**Swampの例外**: 上の表は通常の計画型経路。既存の作業を後から記録する `fast_forward`、複数issueを関連づける `link_issue`、終了処理の `complete` などもある。`outcomeMet: false` でも `done` に進めるため、工程の完了と目的達成は別。[図解と強制の範囲](../loops/swamp.md#loop-a) を参照。

## 関連

- [トラッカーを制御面にする](tracker-as-control-plane.md)（遷移を手順書に任せる、より弱い形）
- [人間のチェックポイント](human-checkpoints.md)
- [Adversarial review](adversarial-review.md)
- [ローカル検証とattestation](local-verification-attestation.md)
