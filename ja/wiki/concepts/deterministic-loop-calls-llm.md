---
title: 決定的なループからLLMを呼ぶ
kind: concept
aliases: [flip the agent loop, behavior-centric AI]
category: アーキテクチャ
seen_in: [swamp, symphony, openhands, orchestrator, gh-aw, stripe-minions, strongdm, sssf]
---

# 決定的なループからLLMを呼ぶ

[← 用語一覧](../concepts.md)

## 定義

LLMに全体の流れを回させない。決定的なコード（ワークフロー）が流れを持ち、判断や推論が必要なステップでだけ、型付きの入出力でLLMを呼ぶ。全体の手順を毎回LLMで生成するコストを避ける。LLMを呼ぶステップでは再実行時にも推論を使う。外部APIや時刻・状態・LLMに依存すれば出力は変わるため、同一出力や成功率100%の保証ではない。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | プロダクトの中心の考え方（Behavior-Centric AI）。エージェントが意図をbehaviorとworkflowに変換し、定義済みの流れを繰り返し利用する。要件変更時には部品を改訂する。Swamp自身の開発プロセスにも同じ考え方を当てはめている（レビューの判断はLLM、合否の判定とマージは決定的なコード） | `README.md`、`design/README.md`、ポッドキャスト |
| [Symphony](../cases/symphony.md) | オーケストレーターは決定的なコードで、ポーリング、起動の可否、並行数、リトライ、停止を決め、issueごとにCodexのセッションを起動する。ただし呼ぶのは小さな判断のステップではなく、作業全体を担うコーディングエージェントで、工程の中身（検証、PR、マージ）はエージェントが手順書に従って進める。外枠だけが決定的な形 | [SPEC §3.2](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L118)、[orchestrator.ex](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex) |
| [OpenHands](../cases/openhands.md) | 独立したscannerが条件に従ってagent会話を起動する。watchdogはLLMを呼ばず、SHA・status・CIに基づいてマージを判定する。 | [固定コミットの実装調査](../cases/openhands.md) |
| [Orchestrator.inc](../cases/orchestrator.md) | PR観測と差し戻し、レビュー起動条件をGoコードが持つ。実装・修正の中身はワーカーへ委譲する。 | [固定コミットの実装調査](../cases/orchestrator.md) |
| [GitHub Agentic Workflows](../cases/gh-aw.md) | MarkdownをActionsへコンパイルし、agent・検知・適用を別ジョブにする。推論の出力を決定的なハンドラーが検査して適用する。 | [固定コミットの実装調査](../cases/gh-aw.md) |
| [Stripe Minions](../cases/stripe-minions.md) | Blueprintが通常コードの工程とエージェントの工程を接続する。公式説明であり実装は非公開。 | [Blueprints](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) |
| [StrongDM Software Factory](../cases/strongdm.md) | Attractor仕様はDOTグラフ、条件分岐、ノードの再試行を定義する。公開物は仕様であり社内実装の監査ではない。 | [attractor-spec.md](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/attractor-spec.md) |
| [Super Simple Software Factory](../cases/sssf.md) | Pythonが工程・反復・finishを決め、AIのJSON出力を検査する。実テストのコマンド設定は利用者側。 | [build_review](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_review.py)、[quality.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/quality.py) |

## 関連

- [決定的なverdict](deterministic-verdict.md)
