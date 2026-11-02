# 用語一覧（パターン辞書）

[← トップ](../index.md) · [事例一覧](index.md) · [ループ](loops/index.md) · [比較表](compare.md)

事例を比較するためのパターンをまとめた辞書。各ページには定義、根拠、保証の限界を載せる。単一事例から抽出した用語も含む。実装で確認したもの、公開説明に基づくもの、教材でのみ確認したものを区別する。

## 入力

| 用語 | 説明 | 事例 |
| --- | --- | --- |
| [入力の制御](concepts/closed-contribution.md) | 外部からのコードを受け取らない、または人間の関与と出所の開示を条件にする | Swamp, Superpowers, Symphony, GitHub Agentic Workflows |

## プロセス

| 用語 | 説明 | 事例 |
| --- | --- | --- |
| [Issue lifecycleのステートマシン](concepts/issue-lifecycle-state-machine.md) | issueから出荷までをフェーズと遷移で定義し、状態を永続化する | Swamp, Symphony |
| [人間のチェックポイント](concepts/human-checkpoints.md) | 人間が判断する場所を少数に限って明示する | Swamp, Superpowers, Symphony, Orchestrator.inc, Matt Pocock, Stripe Minions |
| [ワークフローのブートストラップ注入](concepts/workflow-bootstrap-injection.md) | セッション開始時に起動規則を文脈へ入れ、工程の入口を確保する | Superpowers |
| [上限つきの修正ループ](concepts/bounded-fix-loop.md) | レビューと修正の繰り返しに上限・交代・上限後の扱いを決める | Superpowers, Symphony, OpenHands, Orchestrator.inc, Matt Pocock, Stripe Minions, Super Simple Software Factory |
| [トラッカーを制御面にする](concepts/tracker-as-control-plane.md) | トラッカーの状態でエージェントの起動と停止を決め、人間はカードを動かして管理する | Symphony, OpenHands, Matt Pocock |
| [実行を終了して人間へ引き継ぐ](concepts/stateless-run-handoff.md) | 判断が必要なら外部へ記録してRunを終了し、人間の更新から新Runを起動する | Matt Pocock |

## 検証

| 用語 | 説明 | 事例 |
| --- | --- | --- |
| [Adversarial review](concepts/adversarial-review.md) | 実装者の説明を信用せず、壊し方や欠落を探すレビュアーを置く | Swamp, Superpowers, Symphony, Orchestrator.inc |
| [ローカル検証とattestation](concepts/local-verification-attestation.md) | 手元で検証し、結果の証明書をCIが確かめる | Swamp |
| [決定的なverdict](concepts/deterministic-verdict.md) | LLMレビューのマーカーやJSONを、決まった規則で読み取り判定する | Swamp, Super Simple Software Factory |
| [ブラックボックスUATの分離](concepts/black-box-uat.md) | 受け入れ評価を実装から分離し、配置と変更権限を確かめる | Swamp, StrongDM Software Factory |
| [skillをテストされるコードとして扱う](concepts/skills-as-tested-code.md) | 手順書の変更前後でエージェントの振る舞いを測る | Superpowers, Swamp |
| [コミットに結び付けた合格記録](concepts/commit-bound-acceptance.md) | テスト・レビューの結果を対象コミットに結び付け、マージ時も同じ版であることを条件にする | OpenHands, Orchestrator.inc |
| [外部サービスの振る舞いを再現する](concepts/behavioral-service-twins.md) | 外部APIの挙動や障害を試験環境で再現し、利用側を評価する | StrongDM Software Factory |
| [工程の成功と成果物の受け入れを分ける](concepts/execution-vs-acceptance.md) | 工程が正常に終わったことと、成果物が合格したことを別に判定する | Super Simple Software Factory |

## 安全性

| 用語 | 説明 | 事例 |
| --- | --- | --- |
| [Trust rootのレビュー](concepts/trust-root-review.md) | ファクトリー自体を形作るファイルの変更を専用に見張る | Swamp, Matt Pocock |
| [認証情報を持つツールをホスト側で実行する](concepts/host-side-agent-tools.md) | 認証が必要な操作をホスト側で実行し、エージェントにトークンを見せない | Symphony |
| [作業ごとに分離した作業領域](concepts/isolated-workspace.md) | 作業や検証を、作業1件ごとのディレクトリやworktreeに閉じ込める | Symphony, Swamp, Superpowers, OpenHands, Orchestrator.inc, GitHub Agentic Workflows, Stripe Minions |
| [提案と書き込みの分離](concepts/delegated-write-gate.md) | エージェントの変更提案を別処理が検査し、限定した権限で適用する | GitHub Agentic Workflows |
| [古い実行の書き込みを拒否する](concepts/fenced-authority.md) | 保存先で世代を照合し、担当交代前の実行による上書きを拒否する | 教材のモデルを確認。収録事例での強制は未確認 |
| [実行後に変更範囲を検査する](concepts/post-execution-write-audit.md) | 実行前後を比較し、許可外の変更を検出して受け入れを止める | Super Simple Software Factory |

## アーキテクチャ

| 用語 | 説明 | 事例 |
| --- | --- | --- |
| [DDDをエージェントの語彙に](concepts/ddd-as-agent-vocabulary.md) | 既知の設計語彙をskillにして、計画とレビューに使う | Swamp |
| [Architecture fitness tests](concepts/architecture-fitness-tests.md) | 境界や規約を静的なテストとratchetで守る | Swamp |
| [決定的なループからLLMを呼ぶ](concepts/deterministic-loop-calls-llm.md) | 流れはコードが持ち、判断のステップでだけLLMを呼ぶ | Swamp, Symphony, OpenHands, Orchestrator.inc, GitHub Agentic Workflows, Stripe Minions, StrongDM Software Factory, Super Simple Software Factory |
| [タスクごとの新しいサブエージェント](concepts/fresh-context-subagents.md) | コントローラーが、文脈を持たない実装者とレビュアーにタスクを渡す | Superpowers |
| [仕様を配布物にする](concepts/spec-as-product.md) | 実装ではなく言語に依存しない仕様を配り、利用者のエージェントに実装させる | Symphony, StrongDM Software Factory |

## 運用

| 用語 | 説明 | 事例 |
| --- | --- | --- |
| [機械を直す](concepts/fix-the-machine.md) | 失敗の種類ごとに、ファクトリーの側を改善する | Swamp, Superpowers, GitHub Agentic Workflows, Matt Pocock |
| [会話の外に置く進捗台帳](concepts/progress-ledger.md) | 進捗と決定をファイルやデータストアに記録し、圧縮後もそこから再開する | Superpowers, Swamp, Symphony, Orchestrator.inc, Matt Pocock, Super Simple Software Factory |
