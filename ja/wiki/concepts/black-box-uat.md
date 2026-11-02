---
title: ブラックボックスUATの分離
kind: concept
aliases: [acceptance tests outside the agent, black box testing]
category: 検証
seen_in: [swamp, strongdm]
---

# ブラックボックスUATの分離

[← 用語一覧](../concepts.md)

## 定義

プロダクトを外から使って評価する受け入れテストを、実装から分離して管理する。UATは利用者の要求を満たすかを確かめる受け入れテストである。実装エージェントが評価条件を書き換えて合格することを防ぐため、保存場所と変更権限を分ける。

Adam Jacobは「ファクトリーに向かうなら、最初にやるべきはブラックボックスのテストスイートを作ること」と述べている。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | CLIをサブプロセスとして起動するテストは、本体のリポジトリに置くのを禁止している。別リポジトリ `swamp-uat` でコンパイル済みバイナリに対して実行する。計画のたびにUATが必要か評価し、足りなければ `swamp-uat` にissueを登録する | `AGENTS.md`、`agent-constraints/planning-conventions.md` |
| [StrongDM Software Factory](../cases/strongdm.md) | 評価用シナリオを多くの場合コードの外に置き、DTUで外部の挙動を評価するという説明。保存先へのアクセス分離は未監査。 | [Story](https://factory.strongdm.ai/)、[DTU](https://factory.strongdm.ai/techniques/dtu) |

## 分離の種類と限界

コードベースの外に置くこと、実装者から見えないこと、実装者が変更できないことは別の条件である。別リポジトリでも同じ資格情報で変更できるなら、変更権限の分離にはならない。StrongDMの外部配置という説明だけでは、アクセス制御まで確認したことにはならない。

テスト結果が真偽値なのか、モデルによる採点なのかも区別する。評価を分離しても、シナリオの不足や採点の誤りは残る。

## 関連

- [Adversarial review](adversarial-review.md)
- [外部サービスの振る舞いを再現する](behavioral-service-twins.md)
- [工程の成功と成果物の受け入れを分ける](execution-vs-acceptance.md)
