---
title: 決定的なverdict
kind: concept
aliases: [verdict marker, fail-closed judgement]
category: 検証
seen_in: [swamp, sssf]
---

# 決定的なverdict

[← 用語一覧](../concepts.md)

## 定義

LLMレビューの合否を、レビューの文章から推測しない。決まった形式のマーカーやJSONフィールドをコードで読み取り、定義済みの規則で判定する。必要な出力がない場合や解析に失敗した場合を、合格として扱わない。再送して訂正させる場合も、その回数と最終的な失敗条件を定める。

## 判定する範囲

形式の検査、出力内の整合、内容の正しさを区別する。たとえばJSONを解析できても、承認と重大な未解決項目が同時に含まれることがある。それらをコードで拒否しても、レビュアーが見落とした欠陥まで検出できるわけではない。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | 行頭の `VERDICT: pass` だけを合格とみなす。provider-errorは引用コードを除いて先に検出するが、verdictは元の出力から抽出するため、コードブロック内のマーカーも除外しない。マーカーがない場合だけ50バイト未満かを見て失敗理由を分類し、短いpassマーカー自体は通る。きっかけは、文章から推測していた頃に、ブロッキングな指摘が2件あるレビューを通してしまったこと（swamp-club#2265） | `scripts/check_review_verdict.ts`、`verification-conventions.md` |
| [Super Simple Software Factory](../cases/sssf.md) | JSONのapproved、blocking、findingsの整合を検査し、finishで受け入れ条件と終了コードを結ぶ。内容の正しさはモデルの判断に残る。 | [gates.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/gates.py)、[runner.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/runner.py) |

**限界**: 決定的なのは出力の読み取り規則であり、レビュー内容の正しさではない。上記はコメントの意図だけでなく、[determineVerdict本体](https://github.com/swamp-club/swamp/blob/963e0d2/scripts/check_review_verdict.ts#L110) の処理順を確認した内容。

## 関連

- [Adversarial review](adversarial-review.md)
- [決定的なループからLLMを呼ぶ](deterministic-loop-calls-llm.md)
- [工程の成功と成果物の受け入れを分ける](execution-vs-acceptance.md)
