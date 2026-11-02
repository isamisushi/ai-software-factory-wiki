---
title: GitHub Agentic Workflows（gh-aw）
kind: case
org: GitHub Next
people: []
type: [product, dogfooding]
source: oss
license: MIT
repo: https://github.com/github/gh-aw
investigated_at: 2026-10-31
investigated_commit: 633bb2c2383d3ec0623e46b8c928c20c209b38ff
concepts:
  - delegated-write-gate
  - deterministic-loop-calls-llm
  - isolated-workspace
  - closed-contribution
  - fix-the-machine
---

# GitHub Agentic Workflows（gh-aw）

[← 事例一覧](../index.md) · [ループの図解](../loops/gh-aw.md)

調査日: 2026-10-31（JST）
調査対象コミット: `github/gh-aw@633bb2c2383d3ec0623e46b8c928c20c209b38ff`（2026-10-31 JST）。公開ソースをcloneし、コード・生成済みworkflow・開発規約を直接確認した。調査対象のスクリプトは実行していない。

**この事例に出てくる概念**: [提案と書き込みの分離](../concepts/delegated-write-gate.md) · [決定的なループからLLMを呼ぶ](../concepts/deterministic-loop-calls-llm.md) · [作業ごとに分離した作業領域](../concepts/isolated-workspace.md) · [入力の制御](../concepts/closed-contribution.md) · [機械を直す](../concepts/fix-the-machine.md)

## TL;DR

Markdownの指示とYAMLの設定をGitHub Actionsの `.lock.yml` にコンパイルする。エージェントの推論と、GitHubへ変更を適用する処理を別ジョブに分ける設計が中心である。生成済みの `ci-coach` ではagentはリポジトリ読み取り権限、`safe_outputs` は必要な書き込み権限を持つ。安全性はプロンプトだけでなく、コンパイル時の検証と適用時のハンドラーにも置く。[生成済みagent](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L564)、[safe_outputs](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L2856)

ただし「脅威を見つけたらすべて停止」ではない。脅威検知は既定で警告モードで、PRやコメントは警告付きで公開でき、ブランチへのpushはレビュー用PRへ変換し、mergeなどは中止する。また、実験的merge機能はあるが、既定ブランチ・保護ブランチへのmergeを拒否し、別の開いたPRのheadブランチを宛先に限定する。通常のmainへの自動マージまで担う工場として扱うのは過大評価になる。[検知設定](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/threat_detection_config.go#L32)、[適用時の分類](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_output_handler_manager.cjs#L175)、[merge制限](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/merge_pull_request.cjs#L502)

## 1. 組織・人物

GitHub NextのOSS。MITライセンス。2026-10-28の一般提供開始は[GitHub公式Changelog](https://github.blog/changelog/2026-10-28-github-agentic-workflows-generally-available/)で確認した。開発への入力はissueを中心とし、`CONTRIBUTING.md` は非コアメンバーの直接PRを受け付けず、詳細なagentic planをissueに書き、コアチームがエージェントで実装する方式を示す。これは貢献方針であり、その方針だけから全PRがAI製と判定はできない。[貢献方針](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/CONTRIBUTING.md#L1)、[LICENSE](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/LICENSE)

### 活動量

2026-10-31 JSTにGitHub Search APIで再集計した。期間は **UTCの2026-08-01〜2026-10-30（両端を含む）**。commit検索 `repo:github/gh-aw committer-date:2026-08-01..2026-10-30` の `total_count` は **3,787**、issue検索 `repo:github/gh-aw is:pr is:merged merged:2026-08-01..2026-10-30` は **3,693**。前者はGitHub commit検索で見えるコミット、後者は期間内にマージされたPRで、同じ母集団ではない。AI作成率・成功率・本番採用数は測っていない。提供レポートの数字を転記していない。[commit検索](https://github.com/search?q=repo%3Agithub%2Fgh-aw+committer-date%3A2026-08-01..2026-10-30&type=commits)、[PR検索](https://github.com/github/gh-aw/pulls?q=is%3Apr+is%3Amerged+merged%3A2026-08-01..2026-10-30)

## 2. プロダクト / サービスの概要

`gh aw compile` が、トリガー・権限・ツール・エンジンを記すfrontmatterと、作業を指示するMarkdown本文をActionsへ変換する。用途はissue分類、レビュー、CI失敗分析、文書保守など。通常のビルド・テストを置き換えるものではない。Copilot、Claude、Codex、Gemini、Piなどの実行エンジンを選べる。[README](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/README.md)、[コンパイラ入口](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/compiler.go#L50)

## 3. ソフトウェアファクトリーの仕組み（ソースコードから）

| ファイル | 役割 |
| --- | --- |
| `pkg/workflow/compiler.go` | Markdown解析から検証・YAML生成・lockファイル出力までの入口 |
| `pkg/workflow/strict_mode_permissions_validation.go` | 書き込み権限、sandbox無効化などのstrict検証 |
| `actions/setup/js/safe_outputs_handlers.cjs` | agent側で変更要求を構造化し、対象や明示的な件数上限を確認 |
| `actions/setup/js/safe_output_type_validator.cjs` | 出力の型・フィールドなどの検証 |
| `actions/setup/js/safe_output_handler_manager.cjs` | 出力を対応する適用ハンドラーへ送り、検知結果を適用 |
| `actions/setup/js/merge_pull_request.cjs` | 実験的mergeの対象・レビュー・チェックの検証 |
| `.github/workflows/ci-coach.md` / `.lock.yml` | 自分のCIを分析して改善PRを提案する実例と生成物 |

### 3.1 入力とコンパイル時のゲート

コンパイラは解析済みデータを検証し、Actions YAMLを生成する。CLIの説明ではstrictが既定で、frontmatterの `strict: false` で緩められる。strict時はagentに関係するトップレベルの `contents`・`issues`・`pull-requests` のwriteを拒否する。一方、`copilot-requests: write` は推論用なので、この3種の変更権限と区別する。「全権限がreadだけ」と書くと不正確になる。[CLI設定](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/cmd/gh-aw/main.go#L843)、[3スコープの拒否](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/strict_mode_permissions_validation.go#L20)

strictは `sandbox.agent: false` やXPIA防御プロンプトの無効化も拒否する。`strict: false` は検証を緩める明示的な逃げ道であり、設定者まで含めた不変の安全性ではない。任意のcustom job、独自トークンや外部MCPを足せる構成を、標準safe outputsの境界だけで保証することもできない。[sandbox検証](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/strict_mode_permissions_validation.go#L77)、[custom job生成](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/compiler_custom_job_execution.go)

### 3.2 エージェントの提案と書き込みを分離する

生成された `ci-coach.lock.yml` はworkflow全体を `permissions: {}` とし、agentとsafe outputsに個別の権限を与える。agentはローカルの作業領域でコードを編集し、GitHub変更要求をsafe outputとして残す。リポジトリへの書き込み権限を持つ後段ジョブがその要求を処理する。**read-onlyはGitHubの変更権限の話で、作業ディレクトリの編集禁止ではない。** [workflow権限](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L81)、[agent](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L564)、[適用ジョブ](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L2856)

要求は単なる自由文ではない。作成PRの対象リポジトリを許可設定と照合し、出力型の検証と、実際にPRを作るハンドラー側の件数制限を持つ。MCP呼び出し時にも明示的な `max` を確認するが、未指定時の既定上限は後段に任せる。したがって「すべての制約を同じスキーマが二度検証する」という説明は避ける。[対象検証](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_outputs_handlers.cjs#L850)、[呼び出し時の上限](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_outputs_handlers.cjs#L438)、[型検証](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_output_type_validator.cjs)、[PRの適用上限](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/create_pull_request.cjs#L718)

保護ファイルの変更は単純に常時禁止されるわけでもない。PR作成ハンドラーは `request_review` を既定とし、警告と変更要求レビューを付ける経路や、`fallback-to-issue` でレビュー用issueにする経路を持つ。ci-coachは後者を選ぶ。検証する設定と、それを許可する管理者が信頼の根になる。[保護ファイルの処理](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/create_pull_request.cjs#L1351)、[ci-coach設定](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.md#L32)

### 3.3 脅威検知はコードのゲートとAIの評価の組み合わせ

検知用のプロンプトは出力やパッチの悪意、秘密の漏洩、指示の乗っ取りを評価させる。評価そのものはAIなので、完全な検出の保証ではない。後段でどう扱うかはコードが決める。[検知プロンプト](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/md/threat_detection.md)、[適用時の判定](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_output_handler_manager.cjs#L1115)

- **既定の警告モード**: レビュー可能と分類したPR・コメントなどは警告付きで適用。PRブランチへのpushはレビュー用PRに変換。merge・close・dispatchなどの状態変更は中止する。
- **`continue-on-error: false`**: 検知失敗・脅威検出を検知ジョブの失敗にし、safe outputsを止める。
- **`threat-detection: false` / `enabled: false`**: 検知を無効にできる。`engine: false` はAI評価を止める設定で、独自検査stepがあれば検知ジョブは残る。
- 未分類の出力型は警告モードで警告しつつハンドラー実行を許可する分岐もある。独自出力の追加時まで自動的に閉じる設計ではない。

根拠: [既定と無効化の解析](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/threat_detection_config.go#L32)、[3分類](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_output_handler_manager.cjs#L175)、[未分類の扱い](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/safe_output_handler_manager.cjs#L1136)、[strictな検知step](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/threat_detection_steps.go#L309)

### 3.4 停止と再試行の範囲

AWF API proxyへ渡す既定値は1回の実行につき **500ターン、1,000 AI Credits、連続cache miss 5回**。検知予算の既定は400 AI Credits。これらはコンパイラが外部AWFランタイムへ渡す制限で、AWF本体の全実装まで本調査で監査していない。予算は負数で無効化でき、設定・環境変数で既定値も変わる。[定数](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/constants/constants.go#L433)、[proxy設定](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/awf_config_build.go#L109)、[予算の渡し方](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/workflow/awf_command_builder.go#L346)

生成済みci-coachではagent job 60分、detection 10分、safe outputs 45分の上限を持つ。ci-coach本文の `timeout-minutes: 30` をジョブ全体の30分上限と読み替えてはいけない。ビルド失敗から成功まで無条件に何度も再起動する、製品共通の修正ループは確認できなかった。CLIのrepeatは指定した回数だけ繰り返す機能で、初回実行がエラーならそこで返る。mergeability取得の再試行は `maxRetries: 3` と最終取得のfallbackであり、実装の作り直し回数ではない。[生成物](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.lock.yml#L564)、[repeat](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/pkg/cli/retry.go#L37)、[mergeability再試行](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/merge_pull_request.cjs#L36)

### 3.5 PR作成とmergeの違い

実験的な `merge-pull-request` は存在する。レビュー・未解決スレッド・ラベル・mergeabilityなどを評価するが、**既定ブランチと保護ブランチは拒否し、宛先は別の開いたPRのheadに限定**する。積み重ねたPRを途中のブランチにまとめる用途に近い。通常のmainへの最終統合は、この機能だけでは完結しない。また、チェック評価に使ったPRのhead SHAをmerge APIの `sha` 引数へ渡す処理はこの実装では見当たらず、「評価したコミットだけを原子的にmerge」とも断定できない。[制約と評価](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/merge_pull_request.cjs#L449)、[merge API呼び出し](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/actions/setup/js/merge_pull_request.cjs#L595)

### 3.6 自分自身のCIを直す運用

`ci-coach` は平日の定期起動と手動起動を持ち、直近60回のCI実行データ、検証stepの終了コード、ログを読む。事前検証に失敗があれば最優先で修理し、正常なら効率改善を探す。本文は `make lint`・`make build`・`make test-unit` が通った場合だけPRを作るよう指示する。これは**プロンプトの指示**であり、safe-outputハンドラーがこの3コマンドの成功を証明してからPR作成するゲートとは確認できない。[ci-coachの使命と入力](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.md#L80)、[完了条件](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci-coach.md#L320)

一方、通常の `ci.yml` はmain push、時間起動、手動起動で統合検証し、CLI workflowやmarketplace workflowのコンパイルも実行する。このCI設定の存在と、全PRでrequired checksとして強制されているかは別で、後者は未確認。`AGENTS.md` の最終報告前テスト、workflow変更後の再コンパイルも開発エージェントへの手順である。[通常CI](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci.yml#L1)、[marketplaceコンパイル](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/.github/workflows/ci.yml#L1087)、[開発規約](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/AGENTS.md#L19)

## 4. 公開されている主張と、実装との対応

| 主張 | 確認した対応・限界 |
| --- | --- |
| 「Actions + Agent + Safety」 | コンパイラ、分離ジョブ、出力ハンドラーが存在。ただし設定者がstrictや検知を緩められる |
| agentは既定でread-only | GitHub変更権限と後段書き込みジョブの分離を生成物で確認。ローカル編集や推論用write権限まで禁止する意味ではない |
| safe outputsを検証する | 型・対象・件数・保護ファイルを検証。テストが正しいか、提案が有用かまで機械的には保証しない |
| 自分の開発にエージェントを利用する | 貢献規約とci-coachのソース・生成物を確認。実際の稼働成功率とAI作成率は未測定 |

READMEの主張は[固定コミットのREADME](https://github.com/github/gh-aw/blob/633bb2c2383d3ec0623e46b8c928c20c209b38ff/README.md)を参照。提供レポートのリリース数・セキュリティ事件・スター増加は本ページの根拠には使っていない。

## 5. 考察

取り入れやすいのは、モデルに直接リポジトリを書かせず、変更案を型のある要求に変え、権限を持つ決定的な処理で適用する構造である。AIのレビュー精度と、操作範囲の制限を別々に改善できる。ただし、警告付きコメントやPRも外部に公開する書き込みであり、「検知が失敗すれば何も外へ出ない」設計ではない。

工場の改善という面では、CIの記録を次の改善案の入力にするci-coachが重要である。ただし、定期起動は反復実行、検証を読んで変更する部分は指示に従う修正であり、PRの採用まで閉じた自律ループとは分けて読む必要がある。

## 6. 未確認・次に調べたいこと

- リポジトリのbranch protection、required checks、環境承認の実際の設定。
- AWF・MCP gateway・外部detectorの固定版実装と、制限超過時の停止動作。
- ci-coachなどの実行履歴、作成PRの採用率、費用、警告付き出力が後続自動化に与える影響。
- custom jobs・独自トークン・独自safe outputsを使う構成全体の権限境界。

## Sources

一次資料は上記の固定コミットリンク。発表日だけ[GitHub公式Changelog](https://github.blog/changelog/2026-10-28-github-agentic-workflows-generally-available/)を補助的に利用した。cloneした公開リポジトリの規約やプロンプトは調査対象として読み、調査作業の実行指示としては扱っていない。
