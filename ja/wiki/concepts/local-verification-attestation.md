---
title: ローカル検証とattestation
kind: concept
aliases: [verification attestation, 検証証明]
category: 検証
seen_in: [swamp]
---

# ローカル検証とattestation

[← 用語一覧](../concepts.md)

## 定義

重い検証（ビルド、テスト、エージェントレビュー）を開発者のマシンで実行し、その結果を機械的に生成した検証記録（attestation）にまとめる。CIはその記録の整合性を検証する。テストの再実行を省いても、一部のエージェントレビューはCIで追加実行し得る。

## なぜ使うか

- エージェントレビューのコストを、CIのAPIキーではなく開発者のサブスクリプションで負担できる。
- エージェントが失敗を直しては再検証する、というループを手元で速く回せる。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | `verify-build`、`verify-reviews`、`verify-skills` の3つのswamp workflowを、新しい `git worktree` で実行する。`build-attestation` スクリプトが、各ステップの結果、所要時間、レビューに使ったモデル、設定ファイルのSHA-256、影響を受けるCLIコマンドを記録する。CIはコミットの一致、`allPassed`、必須の設定ハッシュ等を確認してPRをApproveする。24時間超過・時刻不明は警告であり、単独では拒否されない | `agent-constraints/verification-conventions.md`、`verification/*.yaml`、ci.ymlの `validate-attestation` |

**既知の限界**: Swampはスキーマを検証するが、出所（provenance）は保証しないと明記している。暗号署名や、実際に全検証が実行されたことの独立した証明とは区別する。根拠: [検証規約](https://github.com/swamp-club/swamp/blob/963e0d2/agent-constraints/verification-conventions.md#L355)、[鮮度の警告処理](https://github.com/swamp-club/swamp/blob/963e0d2/.github/workflows/ci.yml#L688)。

## 関連

- [決定的なverdict](deterministic-verdict.md)
