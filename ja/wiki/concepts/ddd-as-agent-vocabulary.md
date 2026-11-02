---
title: DDDをエージェントの語彙に
kind: concept
aliases: [architecture skill, domain driven design for agents]
category: アーキテクチャ
seen_in: [swamp]
---

# DDDをエージェントの語彙に

[← 用語一覧](../concepts.md)

## 定義

エージェントがすでに知っている設計の語彙（DDDなど）を明示的に採用し、skillにまとめる。計画もレビューもその語彙で行わせる。エージェントに任せきりにすると、その場その場で設計を選んでしまい、変更に弱いコードになる。それを防ぐ。

Adam Jacobの説明では「エージェントはDDDの本をもう読んでいる。anti-corruption layerと言えば通じる」。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | `ddd` skillがbuilding blockの選び方、ユビキタス言語、building blockごとに必要なテストを定めている。計画にはDDD分析が必須で、code reviewとconformance reviewでも使う | `.claude/skills/ddd/SKILL.md`、`agent-constraints/planning-conventions.md` |

## 関連

- [Architecture fitness tests](architecture-fitness-tests.md)
