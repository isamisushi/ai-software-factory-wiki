---
title: コミットに結び付けた合格記録
kind: concept
aliases: [head-bound acceptance, stale review prevention]
category: 検証
seen_in: [openhands, orchestrator]
---

# コミットに結び付けた合格記録

[← 用語一覧](../concepts.md)

## 定義

テストやレビューの結果を、PR番号だけでなく対象コミットのSHAに結び付ける。SHAはコミットを識別する値である。コードが変わったら、前の版への合格を新しい版への合格として扱わない。

マージ時にも期待するSHAを渡す。確認後に別のコミットが追加された場合は、マージを拒否する。

## なぜ必要か

レビューが終わってからマージするまでに、別の作業者やエージェントがコードを変更できる。PRに「合格」とだけ記録すると、検証していないコードまで合格したように見える。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [OpenHands](../cases/openhands.md) | watchdogが現在のheadの2つのstatusとActionsを調べ、マージAPIにも同じSHAを渡す。ただし調査したreviewerテンプレートには必要なstatusを発行する経路を確認できず、工程の接続に未確認部分がある | [watchdog](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-delivery-watchdog/scripts/worker.py#L43)、[reviewerの出力指示](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/main.py#L938) |
| [Orchestrator.inc](../cases/orchestrator.md) | GitHubのマージAPIに期待するhead SHAを渡し、変更済みならエラーにする。この条件はAO独自レビューの承認必須とは別である | [GitHub merge adapter](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31eccaf1ac55f8e5015fd21ab414545ca/backend/internal/adapters/scm/github/merge_action.go#L20) |

## 観察のポイント

合格が結び付く対象と、合格を発行できる主体を分けて調べる。SHAが一致しても、結果の発行者が適切である保証にはならない。

テスト対象がPRのheadなのか、統合後の仮のコミットなのかも確認する。対象ブランチの更新をどう扱うかによって、合格の意味が変わる。

## 関連

- [決定的なverdict](deterministic-verdict.md)
- [ローカル検証とattestation](local-verification-attestation.md)
- [作業ごとに分離した作業領域](isolated-workspace.md)
- [古い実行の書き込みを拒否する](fenced-authority.md)
- [工程の成功と成果物の受け入れを分ける](execution-vs-acceptance.md)
