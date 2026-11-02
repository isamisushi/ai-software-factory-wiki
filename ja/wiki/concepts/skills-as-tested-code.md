---
title: skillをテストされるコードとして扱う
kind: concept
aliases: [skill evals, pressure testing, TDD for skills]
category: 検証
seen_in: [superpowers, swamp]
---

# skillをテストされるコードとして扱う

[← 用語一覧](../concepts.md)

## 定義

エージェント向けの手順書（skill、規約）を、振る舞いを決めるコードとして扱う。変更する前後でエージェントの振る舞いを測り、効果を確かめてから出す。

## なぜ必要か

- ファクトリーの強制の多くがプロンプトで書かれていると、文言の小さな変更が工程全体の振る舞いを変える。
- エージェントは時間や手間のかかる規則を、もっともらしい理由で省く。どんな言い逃れをするかは、実際に失敗させてみないと分からない。
- skillが正しい場面で呼ばれるか（トリガー）も、文言で決まる。

## 観察のポイント

- 何を測るか（呼ばれるか、規則を守るか、結果の品質、費用）。
- 誰が採点するか（人手、LLM、決定的なチェック）。採点基準は被験エージェントから隠されているか。
- 評価に通らない変更を止めるゲートがあるか、慣習か。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Superpowers](../cases/superpowers.md) | `writing-skills` でRED（skillなしで失敗させ言い逃れを記録）→ GREEN → REFACTOR（新しい言い逃れを塞ぐ）を回す。各skillに言い逃れの表を置く。別リポジトリのQuorumが実CLIを動かし、QA役のエージェントが会話して非公開の受け入れ基準と決定的な事後チェックで採点する（95シナリオ）。PRには前後の評価結果を求めるが、評価を通らないとマージできない仕組みはない | [writing-skills](https://github.com/obra/superpowers/blob/2ce8aa1/skills/writing-skills/SKILL.md#L30)、[AGENTS.md](https://github.com/obra/superpowers/blob/2ce8aa1/AGENTS.md#L99)、[superpowers-evals](https://github.com/prime-radiant-inc/superpowers-evals) |
| [Swamp](../cases/swamp.md) | `verify-skills` workflowで、tesslによるskillの品質スコア（同梱skillは90%以上）と、promptfooによるトリガーのeval（`claude -p` / codex経由）を実行する。ローカル検証の一部としてattestationに含まれる | `verification/workflow-verify-skills.yaml`、`evals/promptfoo/` |

## 関連

- [ワークフローのブートストラップ注入](workflow-bootstrap-injection.md)
- [機械を直す](fix-the-machine.md)
