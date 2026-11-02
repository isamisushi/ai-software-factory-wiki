---
title: 機械を直す（Fix the machine）
kind: concept
aliases: [session learnings, factory iteration]
category: 運用
seen_in: [swamp, superpowers, gh-aw, matt-pocock]
---

# 機械を直す（Fix the machine）

[← 用語一覧](../concepts.md)

## 定義

同じ種類の失敗が起きたら、個々の出力を直すだけで終わらせない。その種類の失敗を捕まえられるように、ファクトリー（skill、規約、ゲート、スクリプト）の側を改善する。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | 「Session Learnings」として、つまずいたことはAGENTS.mdかskillへの追記として提案する。attestationを手順書（約70行）から組み立てると毎回結果が少しずつ違ったので、生成スクリプトに置き換えた。verdictを推測していたことが原因の事故の後、判定を厳格にした | `AGENTS.md`、`verification-conventions.md` |
| [Superpowers](../cases/superpowers.md) | 利用者のセッションで起きた失敗（完了済みタスクの再実行、収束しないレビューループ、42k文字の貼り付け履歴など）を設計書に書き、skillを改訂する。`diagnosing-superpowers` がセッション記録から証拠つきの報告を作る。改訂は圧力テストとQuorumの評価で確かめる | [docs/superpowers/specs/](https://github.com/obra/superpowers/blob/2ce8aa1/docs/superpowers/specs)、[diagnosing-superpowers](https://github.com/obra/superpowers/blob/2ce8aa1/skills/diagnosing-superpowers/SKILL.md)、[ループF](../loops/superpowers.md#loop-f) |
| [GitHub Agentic Workflows](../cases/gh-aw.md) | ci-coachがCIのログと検証結果を読み、工程の修理・効率改善をPRとして提案する。PR採用まで閉じた自律ループではない。 | [固定コミットの実装調査](../cases/gh-aw.md) |
| [Matt Pocock](../cases/matt-pocock.md) | Fixは失敗ログ、RetroはマージPR・指摘をfactory変更案へ戻す。Fix自身の失敗からFixを連鎖起動しない指示。 | [PR最終版の調査](../cases/matt-pocock.md) |

## 関連

- [決定的なverdict](deterministic-verdict.md)
