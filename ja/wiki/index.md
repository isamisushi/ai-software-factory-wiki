# 事例一覧

[← トップ](../index.md) · [用語一覧](concepts.md) · [ループ](loops/index.md) · [比較表](compare.md)

| 事例 | 種別 | ソース | 調査日 | 一言 |
| --- | --- | --- | --- | --- |
| [Swamp](cases/swamp.md) | プロダクト + 自社開発 | OSS (AGPLv3) | 2026-10-29 | 意図を決定的なbehaviorに変換するCLI。自社の開発も、issue lifecycle、attestation、自動マージで構成されたファクトリーで行っている |
| [Superpowers](cases/superpowers.md) | プロダクト + 自社開発 | OSS (MIT) | 2026-10-29 | エージェントのセッションに設計→計画→サブエージェント実装→レビュー→統合の工程を持ち込むskillプラグイン。skill自体を評価ラボで測りながら改善している |
| [Symphony](cases/symphony.md) | プロダクト + 自社開発 | OSS (Apache-2.0) | 2026-10-29 | issueトラッカーを監視し、issueごとに分離した作業ディレクトリでCodexを動かし続けるオーケストレーター。配布物の中心は言語に依存しない仕様。検証・レビュー・マージの規則はリポジトリの `WORKFLOW.md` に置く |
| [OpenHands](cases/openhands.md) | プロダクト + 開発運用 | OSS（複数リポジトリ） | 2026-10-31 | 4つの独立した自動処理でIssueからマージへ進める構成。現行reviewerとwatchdogの合格記録の接続に未確認部分がある |
| [Orchestrator.inc](cases/orchestrator.md) | プロダクト | 公開部分 Apache-2.0、Cloud制御面は非公開 | 2026-10-31 | PR・CI・レビューの事実を保存し、問題を担当ワーカーに戻す。AO内のレビュー判定とGitHub上のマージ条件を分ける |
| [GitHub Agentic Workflows](cases/gh-aw.md) | プロダクト + 自社開発 | OSS（MIT） | 2026-10-31 | MarkdownをActionsへ変換。エージェントの提案と、限定した権限で書き込むジョブを分ける |
| [Matt Pocock Software Factory](cases/matt-pocock.md) | プロダクト（設計用skill） | OSS（MIT） | 2026-11-02 | Task・Run・外部サービスの共通語彙でfactoryを設計する。人間待ちでRun終了、修正上限、自己修理の連鎖防止を方針として定める |
| [Stripe Minions](cases/stripe-minions.md) | 社内開発 | 非公開（公式記事） | 2026-11-02 | 依頼から実装・CIまで無人で進め、人間のPRレビューへ渡す。CI最大2巡は公式説明 |
| [StrongDM Software Factory](cases/strongdm.md) | 社内開発 + 公開仕様 | 一部公開（Attractor仕様 Apache-2.0） | 2026-11-02 | コードの外のシナリオで受け入れを評価。社内運用の説明と公開Attractor仕様を分離 |
| [Super Simple Software Factory](cases/sssf.md) | プロダクト | OSS（MIT） | 2026-11-02 | Pythonが工程と受け入れを制御。配布時の品質検査は仮コマンド。変更の事後検査にも限界がある |

種別:

- **プロダクト**: ソフトウェアファクトリーを作るための製品やツール。
- **自社開発**: その組織が、自分たちのソフトウェアをファクトリーで作っている事例。
