---
title: 作業ごとに分離した作業領域
kind: concept
aliases: [per-issue workspace, git worktree isolation, sandboxed checkout]
category: 安全性
seen_in: [symphony, swamp, superpowers, openhands, orchestrator, gh-aw, stripe-minions]
---

# 作業ごとに分離した作業領域

[← 用語一覧](../concepts.md)

## 定義

エージェントの作業や検証を、作業1件ごとに分けたディレクトリ（git worktree、clone、コンテナなど）の中で行う。複数の作業が互いのファイルを壊さず、元の作業ツリーにも触れないようにする。

## なぜ必要か

- 複数のエージェントを並行して動かしても、変更が混ざらない。
- 検証を、開発者の手元の変更が混じらない、きれいな状態で行える。
- 失敗した作業を捨てても、他に影響しない。

## 観察のポイント

- 何の単位で分けるか（issue、ブランチ、検証の1回）。作業領域を使い回すか、毎回作り直すか。
- 境界をコードで強制するか（パスの検査、cwdの検査）、手順書の指示か。
- ディレクトリを分けるだけか、OSやネットワークの隔離まで行うか。
- 不要になった作業領域を、いつ誰が片付けるか。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Symphony](../cases/symphony.md) | issueごとに `<workspace.root>/<正規化したidentifier>` を作り、同じissueの次のワーカーが引き継ぐ。エージェントのcwdが作業ディレクトリと一致すること、作業ディレクトリがrootの下にあること、名前が `[A-Za-z0-9._-]` であることを、SPECが「最も重要な移植上の制約」として必須にする。issueがterminalになると削除する。ディレクトリの分離はOSのサンドボックスの代わりではない、とSPEC自身が書く | [SPEC §9](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L851)、[SPEC §15.1](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1721) |
| [Swamp](../cases/swamp.md) | ローカル検証の3つのworkflowを、ホスト上の新しい `git worktree` で実行する。コミットが変わったら再検証する | [事例ページ §3.2](../cases/swamp.md) |
| [Superpowers](../cases/superpowers.md) | `using-git-worktrees` skillが隔離された作業ツリーを作り、テストのベースラインを確かめる。最後に `finishing-a-development-branch` が片付ける。worktreeの外への副作用は、実行中に止まる条件の1つ | [事例ページ](../cases/superpowers.md) |
| [OpenHands](../cases/openhands.md) | 公式手順は会話ごとのDocker workspaceを指定する。実配備のmountやnetwork境界は未確認。 | [固定コミットの実装調査](../cases/openhands.md) |
| [Orchestrator.inc](../cases/orchestrator.md) | project workerにbranchとworktreeを割り当てる。projectless workerはAO管理ディレクトリを使う。 | [固定コミットの実装調査](../cases/orchestrator.md) |
| [GitHub Agentic Workflows](../cases/gh-aw.md) | Actionsのagent jobで作業し、sandboxを設定する。strictではsandbox無効化を拒否するが、外部AWFの全実装は今回未監査。 | [固定コミットの実装調査](../cases/gh-aw.md) |
| [Stripe Minions](../cases/stripe-minions.md) | devbox単位で作業し、本番データ・サービス・任意の外向き通信を制限すると説明する。設定は未監査。 | [Part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2) |

## 関連

- [認証情報を持つツールをホスト側で実行する](host-side-agent-tools.md)
- [ローカル検証とattestation](local-verification-attestation.md)
- [タスクごとの新しいサブエージェント](fresh-context-subagents.md)
- [古い実行の書き込みを拒否する](fenced-authority.md)
- [実行後に変更範囲を検査する](post-execution-write-audit.md)
