---
title: 古い実行の書き込みを拒否する
kind: concept
aliases: [fenced authority, fencing token, stale writer rejection]
category: 安全性
seen_in: []
---

# 古い実行の書き込みを拒否する

[← 用語一覧](../concepts.md)

## 定義

仕事の担当が交代するたびに世代番号を進める。書き込み先は、要求の世代が現在の世代と一致する場合だけ変更を適用する。照合と変更を一体の処理にし、交代前の実行が後から結果を上書きすることを防ぐ。[Fenced Authority](https://github.com/sjarmak/software-factory-reliability/blob/b150a8ca477a3b67111b03c5b0412a36c219579c/patterns/fenced-authority.md)

## なぜ必要か

処理が遅いと判断して新しい担当を起動しても、古い担当が止まったとは限らない。停止要求が届かなかったり、一時停止していた処理が再開したりする。担当者名や起動前の権限確認だけでは、書き込みの瞬間に権限が残っているかを判断できない。[故障シナリオ](https://github.com/sjarmak/software-factory-reliability/blob/b150a8ca477a3b67111b03c5b0412a36c219579c/drills/stale-writer-completes/DRILL.md)

たとえば世代7の担当Aが止まっている間に、世代8の担当Bが成果物を公開する。その後にAが戻っても、保存先が世代7の要求を拒否すれば、Bの成果物を守れる。完了状態の更新にも同じ条件が必要になる。

## 事例での実装

今回追加した3事例について、この仕組みの実運用は確認できていない。したがって `seen_in` は空にする。作業領域の分離、変更の事後検査、チェックポイントの保存だけでは、この性質の証明にはならない。

| 調査対象 | 現時点の位置づけ | 根拠 |
| --- | --- | --- |
| [Stripe Minions](../cases/stripe-minions.md) | devboxの隔離は公開説明にあるが、世代の照合は未確認 | 事例ページの公開範囲 |
| [StrongDM](../cases/strongdm.md) | 公開Attractor仕様の再開機構と、社内保存先での世代照合は別問題 | 事例ページの公開範囲 |
| [SSSF](../cases/sssf.md) | 変更の事後検査を確認。古いRunの公開を保存先で拒否する実装は今回の経路で未確認 | 固定コミットの調査 |

## 根拠となる教材

`software-factory-reliability` を2026-11-02にcloneし、`b150a8ca477a3b67111b03c5b0412a36c219579c` の文書、メモリ内モデル、故障シナリオを確認した。完成したfactoryの運用事例としては数えない。

モデルの `Destination.compare_and_publish()` は要求の世代を照合してから成果物を更新する。`Factory.publish()` は保護ありの場合にこの経路を使い、保護なしの場合は以前に観測した値を基準に上書きする。完了更新にも古い世代を拒否する分岐がある。[model.py](https://github.com/sjarmak/software-factory-reliability/blob/b150a8ca477a3b67111b03c5b0412a36c219579c/src/adapters/in_memory/model.py#L238)、[publish](https://github.com/sjarmak/software-factory-reliability/blob/b150a8ca477a3b67111b03c5b0412a36c219579c/src/adapters/in_memory/model.py#L894)、[complete](https://github.com/sjarmak/software-factory-reliability/blob/b150a8ca477a3b67111b03c5b0412a36c219579c/src/adapters/in_memory/model.py#L402)

故障シナリオは、新しい世代の公開後に古い担当を再開し、保護ありと保護なしの結果を比較する設計である。今回、故障試験は実行していない。モデルは照合と適用の不可分性を仮定するため、実DBや外部APIでも同じ性質が成り立つという実証ではない。[シナリオと限界](https://github.com/sjarmak/software-factory-reliability/blob/b150a8ca477a3b67111b03c5b0412a36c219579c/drills/stale-writer-completes/DRILL.md)

## 保証しないこと

この仕組みは、現担当の成果物が正しいこと、旧プロセスが止まること、すべての外部APIで副作用が重複しないことを保証しない。確認用コードが読めること、モデル上で故障試験が通ること、実際の保存先で保証されることを分けて評価する。

## 関連

- [コミットに結び付けた合格記録](commit-bound-acceptance.md): どの版が合格したかを固定する。誰に書き込み権限があるかとは別の条件。
- [提案と書き込みの分離](delegated-write-gate.md): 書き込みの適用側で条件を検査する。
- [作業ごとに分離した作業領域](isolated-workspace.md): 作業ファイルの混線を抑える。公開先での古い書き込み拒否とは異なる。
- [実行後に変更範囲を検査する](post-execution-write-audit.md)
