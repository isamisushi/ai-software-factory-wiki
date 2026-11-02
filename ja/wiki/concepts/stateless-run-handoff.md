---
title: 実行を終了して人間へ引き継ぐ
kind: concept
aliases: [stateless run handoff, event-driven human handoff]
category: プロセス
seen_in: [matt-pocock]
---

# 実行を終了して人間へ引き継ぐ

[← 用語一覧](../concepts.md)

## 定義

人間の判断が必要になったら、必要な情報をチケットやPRに残して実行を終了する。人間の更新を契機として、新しい実行を開始する。会話を待機状態のまま維持することとは区別する。

## なぜ必要か

人間が返答する時刻は実行側から決められない。待ち時間を作業プロセスの寿命から分離し、後続の実行が外部の記録から再開できるようにする。

## 事例での実装

| 事例 | 実装・方針 | 根拠 |
| --- | --- | --- |
| [Matt Pocock](../cases/matt-pocock.md) | Runは人間を待たず終了し、trackerやGit hostの更新から新Runを起動する定義。Runnerに前回の状態を残さない。強制コードは提供しない | [Run / Runner](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md#L18)、[ExploreとRework](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/EXAMPLE-TASKS.md) |

## 観察のポイント

終了前に何を保存し、誰が次の起動を許可するかを確認する。重複イベントから同じ仕事が二度始まらない仕組みも必要になる。この事例のskillは重複防止を設計質問に含めるが、その方式は利用者に委ねる。

## 関連

- [人間のチェックポイント](human-checkpoints.md)
- [会話の外に置く進捗台帳](progress-ledger.md)
- [トラッカーを制御面にする](tracker-as-control-plane.md)
