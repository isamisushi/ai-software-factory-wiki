---
title: 会話の外に置く進捗台帳
kind: concept
aliases: [progress ledger, durable state, compaction-safe state]
category: 運用
seen_in: [superpowers, swamp, symphony, orchestrator, matt-pocock, sssf]
---

# 会話の外に置く進捗台帳

[← 用語一覧](../concepts.md)

## 定義

長い作業の進捗・決定・未解決事項を、エージェントの会話ではなくファイルやデータストアに記録し、再開するときはそこから読む。会話の記憶より記録を優先する。

## なぜ必要か

- コンテキストの圧縮やセッションの切り替えで、エージェントは自分がどこまで進めたかを忘れる。完了済みの作業をやり直すのは、最も高くつく失敗の1つ。
- エージェントが人間の代わりに決めたことを、後で人間が確かめられる。

## 観察のポイント

- どこに置くか（作業ツリーのファイル、git、外部のサーバー）。誰が書き換えられるか。
- 別の作業の記録を自分のものと誤読しない工夫があるか。
- 遷移の正しさをコードで確かめるか、記録するだけか。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Superpowers](../cases/superpowers.md) | `sdd-workspace` が `plan-path` マーカーで計画ごとの作業領域を分け、その中の `progress.md` に進捗を書く。台帳1行目の計画パスの確認はコントローラーへの指示。完了・修正ラウンド・先送り・`Ruling:` を書き、圧縮後は「記憶より台帳と `git log` を信じる」。最後に `Ruling:` 行をすべて人間に示してから消す。SDDの完了判断はLLM。Nativeの `task-done` は渡されたテストコマンドの成功時だけ完了行を追記するが、台帳の直接編集や適切でないコマンドまでは防がない | [SKILL.md L108](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md#L108)、[sdd-workspace](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/scripts/sdd-workspace)、[task-done](https://github.com/obra/superpowers/blob/2ce8aa1/skills/executing-plans/scripts/task-done#L39)、[評価結果（2026-07-06）](https://github.com/obra/superpowers/blob/2ce8aa1/docs/superpowers/specs/2026-07-06-sdd-plan-scoped-workspace-eval-results.md) |
| [Swamp](../cases/swamp.md) | issue lifecycleの状態をswamp-clubとswampのdatastoreに永続化し、圧縮後や別セッションでも再開する。遷移はコードで制限される | [Issue lifecycleのステートマシン](issue-lifecycle-state-machine.md) |
| [Symphony](../cases/symphony.md) | Linearのissueに `## Codex Workpad` という1つのコメントを置き、計画・受け入れ条件・検証・メモ・不明点（`Confusions`）をそこだけに書く。冒頭に `<host>:<path>@<sha>` を入れる。継続のターンや次のワーカーは「workpadの状態から再開する」よう指示される。作業ディレクトリもissueごとに残して引き継ぐ。Rework時はworkpadを消して作り直す。書式と更新は手順書の指示で、コードは確かめない | [Step 1](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L140)、[Workpad template](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L295) |
| [Orchestrator.inc](../cases/orchestrator.md) | SQLiteへ活動・PR・CI・レビュー・送信署名を保存し、表示状態を導出する。ao reportで進捗を会話の外に残す。 | [固定コミットの実装調査](../cases/orchestrator.md) |
| [Matt Pocock](../cases/matt-pocock.md) | 前Runの記憶をtracker・Git host・orchestratorに限定し、Runnerのローカル状態を残さない方針。保存形式は未指定。 | [PR最終版の調査](../cases/matt-pocock.md) |
| [Super Simple Software Factory](../cases/sssf.md) | Run ID、担当ごとのセッションID、工程、イベント、使用量をファイルとSQLiteに保存する。agent_mapを再読込するが、全工程の自動復旧を保証するものではない。 | [runner.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/runner.py) |

## 関連

- [Issue lifecycleのステートマシン](issue-lifecycle-state-machine.md)（状態と遷移をコードで持つ、より強い形）
- [上限つきの修正ループ](bounded-fix-loop.md)
