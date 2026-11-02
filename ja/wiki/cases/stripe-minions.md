---
title: Stripe Minions
kind: case
org: Stripe
people: [Alistair Gray]
type: [internal]
source: closed
license: 非公開
repo: https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents
investigated_at: 2026-11-02
investigated_commit: 非公開のため対象なし
concepts: [human-checkpoints, bounded-fix-loop, isolated-workspace, deterministic-loop-calls-llm]
---

# Stripe Minions

[← 事例一覧](../index.md) · [ループの図解](../loops/stripe-minions.md)

調査日: 2026-11-02。調査対象コミット: 非公開のため対象なし。Stripeの公式記事Part 1・Part 2に基づく。社内実装、配備設定、個別PRの実行ログは未確認。

この事例に出てくる概念: [人間のチェックポイント](../concepts/human-checkpoints.md) · [上限つきの修正ループ](../concepts/bounded-fix-loop.md) · [分離した作業領域](../concepts/isolated-workspace.md) · [決定的なループからLLMを呼ぶ](../concepts/deterministic-loop-calls-llm.md)

## TL;DR

社内の依頼からコード変更とCIまでを無人で進め、人間のレビューへ渡す仕組み。工程をコードで定め、実装や修正が必要な工程でエージェントを呼ぶ。無人実装と人間による受け入れを分けて比較する事例である。[Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)、[Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

## 1. 組織・人物

Stripeの社内開発用。記事の著者Alistair GrayはLeverageチームのエンジニア。Part 1は毎週1,000件超のマージPRがMinionsだけでコードを書いたものだと説明する。これは会社側の主張であり、総PR数に対する比率、失敗率、人間のレビュー時間を示さない。[Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)

## 2. プロダクト / サービスの概要

Slack、CLI、Web、社内ツールが入口になる。依頼の文脈を集め、作業環境で変更し、ブランチとPRの準備まで進む。人間は結果を読み、PRを開いて別のエンジニアへレビューを依頼する。追加指示や手作業での修正も可能である。[利用の流れ](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)

## 3. ソフトウェアファクトリーの仕組み（公開説明から）

### 3.1 工程を持つコードと、判断するエージェント

Blueprintは、コードで定義した工程のグラフである。実装・CI失敗の修正をエージェントに任せ、lint・pushなどを通常のコードで実行する。基盤はBlockのgooseを社内で変更したもの。公開gooseのコードを、そのままMinionsの実装根拠にはしない。[Blueprints](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

### 3.2 作業環境とツール

作業は開発者と共通のdevboxで行う。記事は、本番環境・実ユーザーデータ・任意の外向き通信へのアクセスを制限すると説明する。MCPツールには別の統制があり、必要な集合だけを渡す。隔離や権限の具体的な設定は非公開。[環境とMCP](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

### 3.3 検査と修正の上限

ローカルlintを先に回し、CIは1回の実行で最大2巡に制限する。最初のCIで残った失敗を修正し、2度目のpushとCIの後は人間へ返す。追加指示による再実行を含む総回数と総費用の上限は未確認。[検証と反復](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)、[CIの工程](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)

## 4. 公開されている主張と、実装との対応

| 公開説明 | 確認範囲 |
| --- | --- |
| 無人で依頼を処理する | 実装中の無人運転。PRの人間レビューは残る |
| Blueprintが必要な工程を実行する | 公式の設計説明。ソースによる強制条件は未監査 |
| CIは最大2巡 | 1回の標準実行の方針。全実行をまたぐ上限ではない |
| 多数のPRを生成する | 会社側の報告。品質や自律率の独立した測定ではない |

## 5. 考察

既存の開発環境と検査をエージェントにも使わせる点が比較軸になる。自動化の終点はコード生成ではなく、人間が判断できる変更と検査結果の提出に置かれる。ただし、合格記録とマージ対象コミットの照合方法は公開記事では確認できない。

## 6. 未確認・次に調べたいこと

修正の成功率、人間の手戻り、モデル別の費用、ローカルlintの最大反復数、重複起動の排除、古い実行からの書き込み拒否は未確認。最後の二点は[古い実行の書き込みを拒否する](../concepts/fenced-authority.md)という別の調査軸になる。

## Sources

[公式記事Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)と[Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)を2026-11-02に確認。ページ内容はコミット固定できない。社内活動の独立集計と実行検証は行っていない。
