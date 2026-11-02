---
title: Architecture fitness tests
kind: concept
aliases: [arch rules tests, ratchet]
category: アーキテクチャ
seen_in: [swamp]
---

# Architecture fitness tests

[← 用語一覧](../concepts.md)

## 定義

レイヤー境界、公開APIの範囲、規約（ライセンスヘッダーなど）を、ソースコードに対する静的なテストとして検査する。既存の違反は数を固定し、それ以上増やせないようにする（ratchet）。エージェントがアーキテクチャを少しずつ崩していくのを機械的に止める。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | `integration/*_rules_test.ts` と `arch_fitness_helpers.ts` の「pinned-ratchet」パターン。libswampの `mod.ts` をbarrelとしてimportするのを禁止する、テスト内での `Deno.env.set` を禁止する、ツールチェーンのバージョンのずれを検知する、など | `AGENTS.md` のTesting節 |

## 関連

- [DDDをエージェントの語彙に](ddd-as-agent-vocabulary.md)
