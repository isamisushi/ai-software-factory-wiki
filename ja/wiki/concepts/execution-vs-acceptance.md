---
title: 工程の成功と成果物の受け入れを分ける
kind: concept
aliases: [execution success versus acceptance, phase success, run acceptance]
category: 検証
seen_in: [sssf]
---

# 工程の成功と成果物の受け入れを分ける

[← 用語一覧](../concepts.md)

## 定義

工程が正常に仕事を終えたことと、成果物が要求を満たしたことを別の状態として扱う。たとえば、テスト担当が不合格の結果を正しく報告した場合、担当の実行は成功しても成果物は不合格である。

## なぜ必要か

プロセスの正常終了やレビュー結果の取得だけで仕事全体を成功にすると、検証で見つかった問題を無視してしまう。記録、画面表示、終了コードが別の条件で決まると、人間と自動処理が異なる結論を読むこともある。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [SSSF](../cases/sssf.md) | `Run.finish()` が工程の成功と `accepted` の両方を確認する。同じ判定をセッションの記録、表示、終了コードに使う。呼び出し側がテスト合格やreview承認を渡す | [runner.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/runner.py#L114)、[build_review](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_review.py) |

## 観察のポイントと限界

何を実行成功とし、何を受け入れ条件とするかを明記する。評価処理のエラー、対象の不合格、検査を実行しなかった状態を区別する。合格した対象と、最後に残った成果物が同じ版かも確認する。

SSSFの `accepted` は既定値がtrueなので、各工程スクリプトが適切な条件を渡す必要がある。また配布時の品質検査は成功する仮コマンドである。状態を分けても、検査内容の不足は補えない。[quality.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/quality.py)

## 関連

- [決定的なverdict](deterministic-verdict.md): レビュー出力をどう読み取るか。
- [コミットに結び付けた合格記録](commit-bound-acceptance.md): どの版に対する合格か。
- [上限つきの修正ループ](bounded-fix-loop.md): 不合格を何回まで修正するか。
