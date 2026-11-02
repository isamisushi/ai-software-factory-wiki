---
title: 仕様を配布物にする
kind: concept
aliases: [spec as product, spec-first distribution, implement this spec]
category: アーキテクチャ
seen_in: [symphony, strongdm]
---

# 仕様を配布物にする

[← 用語一覧](../concepts.md)

## 定義

ツールの主な配布物を、実装ではなく言語に依存しない仕様にする。利用者は自分のコーディングエージェントに仕様を渡し、自分の言語と環境に合わせた実装を作らせる。参考実装は付けるが、正本は仕様の側に置く。

## なぜ必要か

- エージェントが仕様から実装を作れるなら、言語や環境ごとに保守する実装を配る必要が薄れる。
- 利用者ごとに違う部分（トラッカー、承認の方針、サンドボックス）を、仕様の中で「実装に任せる」と明示し、文書化だけを求められる。
- 仕様の側に適合テストと完了の定義を置けば、作られた実装を同じ基準で確かめられる。

## 観察のポイント

- 仕様がエージェントを読み手として想定しているか（冗長な要約、チートシート、規範語の使い方）。
- 適合の定義とテスト行列があるか。必須と任意、実環境での確認を分けているか。
- 参考実装と仕様がずれたとき、どちらを直す規則か。
- 仕様から作った実装の品質を、誰がどう確かめるか。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Symphony](../cases/symphony.md) | READMEの第一の使い方は「好きなコーディングエージェントに `SPEC.md` を渡して実装させる」。SPEC（2312行）はRFC 2119の語彙を使い、エージェントが設定層を素早く実装できるよう「意図的に冗長な」チートシート（§6.4）、テスト行列（§17）、完了の定義（§18）を持つ。Elixirの参考実装は「実験的」で、`AGENTS.md` が「SPECの上位集合でよいが衝突してはならず、挙動を変えたら同じ変更でSPECを直す」と規定する。Codexが他言語の実装を作ったという話は会社側の主張で、リポジトリには含まれない | [README](https://github.com/openai/symphony/blob/be10a1b/README.md)、[SPEC §6.4](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L605)、[SPEC §18](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L2204)、[AGENTS.md](https://github.com/openai/symphony/blob/be10a1b/elixir/AGENTS.md#L15) |
| [StrongDM Software Factory](../cases/strongdm.md) | Attractor・coding agent loop・LLM clientの自然言語仕様を配布し、利用者に実装させる。社内factory全体のソースではない。 | [README](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/README.md) |

## 関連

- [skillをテストされるコードとして扱う](skills-as-tested-code.md)（手順書の側を測る考え方）
- [トラッカーを制御面にする](tracker-as-control-plane.md)
