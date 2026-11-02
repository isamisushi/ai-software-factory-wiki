---
title: トラッカーを制御面にする
kind: concept
aliases: [tracker as control plane, board-driven dispatch, 状態でエージェントを動かす]
category: プロセス
seen_in: [symphony, openhands, matt-pocock]
---

# トラッカーを制御面にする

[← 用語一覧](../concepts.md)

## 定義

issueトラッカー（Linear、Jira、GitHub Issuesなど）の状態を、エージェントを動かす唯一の入力にする。常駐するオーケストレーターが状態を読み、「この状態ならエージェントを動かす」「この状態になったら止める」を決める。人間はエージェントのセッションに話しかけず、カードを動かして仕事を管理する。

## なぜ必要か

- 人間がエージェントのセッションを1つずつ見張らなくてよくなる。複数のissueを並行して進められる。
- 人間の判断（着手、承認、差し戻し、中止）を、すでに使っている道具の操作に乗せられる。モバイルアプリからでも操作できる。
- オーケストレーターがDBを持たなくても、トラッカーの状態から再起動後に復旧できる。

## 観察のポイント

- どの状態でエージェントが動き、どの状態で止まるか。人間の判断を待つ状態は、エージェントが「待つ」のか、オーケストレーターが「起動しない」のか。
- 状態を移すのは誰か。遷移の正しさ（完了条件を満たしたか）をコードが確かめるか、エージェントの申告に任せるか。
- 止まる条件が状態だけの場合、失敗の繰り返しや費用の上限をどこで決めるか。
- エージェントに誰でもissueを書ける場合、どこで入力を絞るか（担当者、ラベル、プロジェクト）。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Symphony](../cases/symphony.md) | オーケストレーターが5秒ごとにLinearを読み、`active_states`（Todo / In Progress / Merging / Rework）のissueでCodexを起動する。terminalになれば止めて作業ディレクトリを消し、activeでなくなれば止める。人間の操作は `Backlog → Todo`、`Human Review → Merging / Rework`。状態を移すのはエージェントのツール呼び出しで、遷移の正しさはコードで確かめない。失敗のリトライには回数の上限がなく、止めるのは状態の変更だけ | [SPEC §8](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L733)、[WORKFLOW.md](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L1)、[照合](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L421) |
| [OpenHands](../cases/openhands.md) | GitHubのissue・readiness label・PR head・statusが独立scannerの起動条件となる。現在のreviewerから必要statusへの接続は未確認。 | [固定コミットの実装調査](../cases/openhands.md) |
| [Matt Pocock](../cases/matt-pocock.md) | trackerを人間の操作面と定義し、チケットやラベルの変更をRunの起動契機にする設計。 | [PR最終版の調査](../cases/matt-pocock.md) |

## 関連

- [Issue lifecycleのステートマシン](issue-lifecycle-state-machine.md)（状態と遷移をコードで持つ形。トラッカーを制御面にする形は、遷移を手順書に任せる）
- [人間のチェックポイント](human-checkpoints.md)
- [決定的なループからLLMを呼ぶ](deterministic-loop-calls-llm.md)
- [会話の外に置く進捗台帳](progress-ledger.md)
