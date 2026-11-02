---
title: StrongDM Software Factory
kind: case
org: StrongDM
people: [Justin McCarthy, Jay Taylor, Navan Chauhan]
type: [internal, product]
source: partial
license: 公開Attractor仕様はApache-2.0
repo: https://github.com/strongdm/attractor
investigated_at: 2026-11-02
investigated_commit: fb57a55ed97372a27ac90102f436947e29f48426
concepts: [black-box-uat, spec-as-product, deterministic-loop-calls-llm, behavioral-service-twins]
---

# StrongDM Software Factory

[← 事例一覧](../index.md) · [ループの図解](../loops/strongdm.md)

調査日: 2026-11-02。公開部分は `strongdm/attractor@fb57a55ed97372a27ac90102f436947e29f48426` をcloneして確認した。対象は自然言語仕様であり、社内factoryの実装ではない。運用部分は公式サイトによる説明として扱う。

この事例に出てくる概念: [ブラックボックスUATの分離](../concepts/black-box-uat.md) · [仕様書をプロダクトの中心にする](../concepts/spec-as-product.md) · [決定的なループからLLMを呼ぶ](../concepts/deterministic-loop-calls-llm.md) · [外部サービスの振る舞いを再現する](../concepts/behavioral-service-twins.md)

## TL;DR

人間がコードを書かず、コードレビューもしないという方針を掲げる事例。仕様から生成したソフトウェアを、外部から観測できる振る舞いで評価する。公開されたAttractorは工程制御の仕様で、社内の評価基盤全体が公開されているわけではない。[Story](https://factory.strongdm.ai/)、[公開README](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/README.md)

## 1. 組織・人物

公式記事はJustin McCarthy、Jay Taylor、Navan ChauhanによるStrongDM AIチームを紹介する。対象はStrongDM全社の全変更ではなく、このチームが説明する開発方式である。[Story](https://factory.strongdm.ai/)

公開Attractor仕様のライセンスはApache-2.0。取得したHEADから到達するコミットは15件、最終コミットは2026-03-17。2026-08-04以降、調査時点までの到達可能コミットは0件。これは公開仕様の履歴であり、社内開発量や自律率ではない。[LICENSE](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/LICENSE)、[固定コミット](https://github.com/strongdm/attractor/commit/fb57a55ed97372a27ac90102f436947e29f48426)

## 2. プロダクト / サービスの概要

仕様などの入力を起点に、生成・評価・フィードバックを繰り返す。公式のPrinciplesは、実装に使わない評価用シナリオが通り続けるまで回すと説明する。具体的な閾値、連続合格回数、総費用の上限は公表資料から未確認。[Principles](https://factory.strongdm.ai/principles)

## 3. ソフトウェアファクトリーの仕組み（運用説明と公開仕様）

### 3.1 実装から評価を分離する

Storyは、コードと同じ場所のテストをエージェントが書き換える問題を述べる。そこで利用者の行動を表すシナリオを、多くの場合コードベースの外に置く。評価は観測した経路が利用者を満足させる割合として説明される。すべての評価資料へのアクセス禁止が技術的に強制されるかは未確認。[Story](https://factory.strongdm.ai/)

### 3.2 外部サービスを再現する試験環境

Digital Twin Universeは、依存先APIの外から見える挙動を再現する試験環境である。実サービスでは試しにくい障害や大量のシナリオを扱う。公式説明はAPI契約と観測した境界条件から複製を作り、実サービスと照合するとする。再現率や実環境での不具合率は未確認。[DTU](https://factory.strongdm.ai/techniques/dtu)

### 3.3 Attractorの公開範囲

| 公開ファイル | 役割 |
| --- | --- |
| [attractor-spec.md](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/attractor-spec.md) | DOTグラフ、分岐、工程の再試行、チェックポイント、人間の入力 |
| [coding-agent-loop-spec.md](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/coding-agent-loop-spec.md) | コーディングエージェントのループ仕様。今回の精読範囲外 |
| [unified-llm-spec.md](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/unified-llm-spec.md) | LLMクライアントの共通仕様。今回の精読範囲外 |

取得したツリーには実行エンジン、CI、専用のAGENTS.md・CLAUDE.md・CONTRIBUTINGはない。READMEはこれらの仕様をエージェントへ渡して実装する使い方を示す。[README](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/README.md)

### 3.4 ノードの再試行と、工程の差し戻しを分ける

仕様の `max_retries` は初回以外の追加試行数で、既定は0。終端では訪問済みの `goal_gate` の結果を調べ、`SUCCESS` または `PARTIAL_SUCCESS` 以外なら戻り先へ移る。戻り先がなければ失敗で終了する。ノードの局所上限が、グラフを回る総回数も制限するとは読めない。[仕様§3.3〜3.5](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/attractor-spec.md#L335)

チェックポイントと再開、人間の選択を待つノードも仕様に含む。「人間がコードをレビューしない」というチーム方針と、人間の入力を扱える汎用仕様は矛盾しない。どのノードを社内で使うかは別問題である。[仕様の設計原則](https://github.com/strongdm/attractor/blob/fb57a55ed97372a27ac90102f436947e29f48426/attractor-spec.md#L34)

## 4. 公開されている主張と、実装との対応

| 主張・仕様 | 根拠の強さと限界 |
| --- | --- |
| 人間によるコード作成・レビューを行わない | チームの運用方針。全PRの監査結果ではない |
| 外部のシナリオで評価する | 公式説明。保存先の権限・採点の独立性は未監査 |
| 工程をグラフで制御し再開する | 公開仕様に記載。社内実行コードによる強制は未確認 |
| DTUで大量の障害試験を行う | 会社側の主張。実サービスとの差を測る証跡は未確認 |

## 5. 考察

Stripeと比較する軸は、人間のコードレビューを残すか、外部評価へ受け入れ判断を移すかである。どちらも検証対象と検証方法の品質が必要になる。StrongDMの説明から、評価用シナリオが隠されているだけで正しさが保証されるとは結論できない。

## 6. 未確認・次に調べたいこと

シナリオの漏えい防止、採点モデルの誤判定、合格した成果物と公開物の一致、停止条件、費用上限、障害後の復旧は未確認。Attractor仕様の第三者実装を、StrongDM社内実装の代わりに扱わない。

## Sources

[Story](https://factory.strongdm.ai/)、[Principles](https://factory.strongdm.ai/principles)、[Techniques](https://factory.strongdm.ai/techniques)、[DTU](https://factory.strongdm.ai/techniques/dtu)、[Attractor紹介](https://factory.strongdm.ai/products/attractor)。Web資料は2026-11-02確認。GitHubは上記コミットに固定。社内実行ログとマージPR件数は取得していない。
