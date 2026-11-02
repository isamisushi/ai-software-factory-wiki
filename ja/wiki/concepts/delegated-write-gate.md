---
title: 提案と書き込みの分離
kind: concept
aliases: [safe outputs, mediated writes]
category: 安全性
seen_in: [gh-aw]
---

# 提案と書き込みの分離

[← 用語一覧](../concepts.md)

## 定義

エージェントは外部への変更を提案として出力する。別の処理が対象・形式・許可条件を検査し、限定した権限で変更を実行する。

## なぜ必要か

読み取ったIssueやコードに、エージェントを誤った操作へ誘導する文章が含まれることがある。推論する処理に書き込み権限を直接渡すと、その判断が外部への変更に直結する。

提案を作る処理と実行する処理を分けると、許可する操作をコード側で限定できる。ただし、許可範囲内の提案が正しいかは別に評価する必要がある。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [GitHub Agentic Workflows](../cases/gh-aw.md) | agent jobは既定で読み取り専用。safe outputsに出した変更を検査し、別のジョブが限定した権限で適用する。設定可能な仕組みであり、すべての構成で同じ保護を保証するものではない | [固定コミットのREADME](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/README.md#L49)、[実装と設定上の例外](../cases/gh-aw.md) |

## 観察のポイント

書き込み資格情報をエージェントが取得できないか、別経路から直接書き込めないかを確認する。提案ファイルの検査だけでは、実行権限の境界を証明できない。

脅威検知が失敗した場合の動作も調べる。処理の停止、警告付きの適用、人間が確認する変更への変換は、それぞれ異なる動作である。

gh-awのstrictモードでは、agent側の `contents / issues / pull-requests` のwrite権限をコンパイル時に拒否する。脅威検知の継続設定は既定で有効で、警告時には操作を分類する。確認可能な成果物は警告付きで残し、branchへのpushはPR作成に変換し、mergeなどは中止する。検知自体を無効にする設定もある。[権限の検査](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/strict_mode_permissions_validation.go#L20)、[検知の設定](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/threat_detection_config.go#L32)、[操作の分類](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_output_handler_manager.cjs#L175)。

## 関連

- [認証情報を持つツールをホスト側で実行する](host-side-agent-tools.md)
- [Trust rootのレビュー](trust-root-review.md)
- [決定的なverdict](deterministic-verdict.md)
- [古い実行の書き込みを拒否する](fenced-authority.md)
