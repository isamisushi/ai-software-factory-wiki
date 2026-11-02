---
title: ワークフローのブートストラップ注入
kind: concept
aliases: [session bootstrap, skill auto-triggering, SessionStart injection]
category: プロセス
seen_in: [superpowers]
---

# ワークフローのブートストラップ注入

[← 用語一覧](../concepts.md)

## 定義

エージェントのセッションが始まるたびに、hookなどの仕組みで「どの工程から始めるか」「いつどのskillを使うか」という起動規則を文脈に入れておくこと。工程の入口を、エージェントがその場で思い出すかどうかに任せない。

## なぜ必要か

- skillはファイルとして置いてあるだけでは呼ばれない。最初の一歩（質問する、コードを探す）を踏み出す前に工程に入らないと、設計や計画を飛ばして実装を始めてしまう。
- コンテキストの圧縮（compact）や `/clear` の後にも規則を戻せる。

## 観察のポイント

- 注入は何で行うか（hook、ハーネスの設定、手動）。どのイベントで入るか。
- 注入されるのは規則だけか、工程そのもの（状態や次の手順）か。
- 注入しても、skillを呼ぶかどうかの最終判断はモデルにある。起動率を測っているか。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Superpowers](../cases/superpowers.md) | `SessionStart`（startup / clear / compact）で `using-superpowers` の全文を `<EXTREMELY_IMPORTANT>` で包んで注入する。「1%でも当てはまるならskillを呼べ」。新しいハーネスへの対応は、`Let's make a react todo list` で `brainstorming` が自動起動することを受け入れテストにしている | [hooks/session-start](https://github.com/obra/superpowers/blob/2ce8aa1/hooks/session-start#L41)、[using-superpowers](https://github.com/obra/superpowers/blob/2ce8aa1/skills/using-superpowers/SKILL.md#L11)、[AGENTS.md](https://github.com/obra/superpowers/blob/2ce8aa1/AGENTS.md#L84) |

## 関連

- [skillをテストされるコードとして扱う](skills-as-tested-code.md)（起動するかどうかを評価で測る）
- [人間のチェックポイント](human-checkpoints.md)
