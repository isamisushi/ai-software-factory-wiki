---
title: Orchestrator.inc
kind: case
org: Orchestrator Inc.
people: []
type: [product]
source: partial
license: Apache-2.0
repo: https://github.com/OrchestratorInc/agent-orchestrator
investigated_at: 2026-10-31
investigated_commit: c0b351a31e
concepts:
  - isolated-workspace
  - deterministic-loop-calls-llm
  - progress-ledger
  - human-checkpoints
  - adversarial-review
  - bounded-fix-loop
  - commit-bound-acceptance
---

# Orchestrator.inc

[← 事例一覧](../index.md) · [ループの図解](../loops/orchestrator.md)

調査日: 2026-10-31（JST）<br/>
調査対象コミット: `OrchestratorInc/agent-orchestrator@c0b351a31eccaf1ac55f8e5015fd21ab414545ca`（2026-10-31）。以下のソースリンクはこのコミットに固定。

**この事例に出てくる概念**: [分離した作業領域](../concepts/isolated-workspace.md) · [決定的なループからLLMを呼ぶ](../concepts/deterministic-loop-calls-llm.md) · [進捗台帳](../concepts/progress-ledger.md) · [人間のチェックポイント](../concepts/human-checkpoints.md) · [Adversarial review](../concepts/adversarial-review.md) · [上限つきの修正ループ](../concepts/bounded-fix-loop.md) · [コミットに結び付けた合格記録](../concepts/commit-bound-acceptance.md)

## TL;DR

- 複数のコーディングエージェントを、タスクごとのworktree・ブランチ・セッションで動かすデスクトップ製品。人間向けの主エージェントが計画・委任し、ワーカーが実装する。**役割分担は主にプロンプト、PRの観測と担当ワーカーへの差し戻しはGoコード**で実装されている。[README](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/README.md)、[役割プロンプト](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/session_manager/prompt.go#L215)
- ローカルの中核はGo daemon + SQLite、UIはElectron + React。`観測 → 事実の保存 → 状態の導出 / 処置` を分離する。ボードの表示状態を独立に保存せず、エージェントの活動・PR・CI・レビューの事実から算出する。[architecture](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/architecture.md#L38)
- CI失敗、未解決コメント、changes requested、衝突を**互いに抑制しない通知として担当ワーカーへ戻す**。送信署名と通知回数を保存し、再起動後の重複送信を抑える。ただし通知は修正や合格そのものを保証しない。[reactions.go](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/lifecycle/reactions.go#L65)
- 別のレビュアーはPR/head/harnessごとに結果を記録する。**AO内のapprovedはGitHub承認でもマージ権限でもない**。マージAPIは最新CI・レビューを取り直し、期待head SHAをGitHubのマージ要求にも渡すが、AOレビュー合格を必須条件にはしていない。[review prompt](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/review/prompt.go)、[merge action](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/service/pr/action_service.go#L125)
- **公開範囲に注意**。AO Cloudの制御面は非公開の別リポジトリ。公開側の契約・クライアントから、クラウドのreconciler、DB、サンドボックス運用を実装確認したとは言えない。[AGENTS.md](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/AGENTS.md#L7)

## 1. 組織・人物

| 項目 | 確認できた内容 |
| --- | --- |
| 組織・製品 | READMEの製品名はOrchestrator.inc。公開GitHub組織はOrchestratorInc |
| 公開ライセンス | Apache-2.0。[LICENSE](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/LICENSE) |
| 配布 | デスクトップアプリが正規の配布経路。npm版は0.10.0で更新を止めたlegacy経路。[AGENTS.md](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/AGENTS.md#L109) |
| 公開と非公開 | デスクトップ、CLI、cloud contractは公開。hosted control planeは非公開。[CONTRIBUTING](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/CONTRIBUTING.md) |
| 人物 | 創業者・役職の確定は今回の調査範囲外。git authorは人物・在籍確認の根拠にしない |

### 活動量とdogfoodingの証拠の強さ

cloneしたHEADから到達する履歴を、**2026-08-01 00:00以上、2026-10-31 00:00未満（JST、committer日時）**で集計した。直近90日のGitHub検索件数とは期間・集計経路が異なる。

| 指標 | 結果と境界 |
| --- | --- |
| 到達可能コミット | 1,693件。merge経由の履歴を含む |
| first-parentコミット | 1,662件。上の内数 |
| author表記 | `name <email>` の異なる表記92件。実人数ではない |
| co-authorあり | 大小文字を区別せず `Co-authored-by:` を含むコミット813件 |
| エージェント名を含むco-author | `Claude / Codex / Cursor / Kimchi / Copilot / Gemini` のいずれかをco-author行に含むコミット557件。行数ではなくコミット数。別表記・別エージェントは取りこぼす |
| マージ済みPR・release・stars | 今回はAPIによる再集計をしていない。提供レポートの数値を転載しない |

再現する基本コマンドは `git log HEAD --since='2026-08-01T00:00:00+09:00' --until='2026-10-31T00:00:00+09:00'`。co-authorはコミット本文の行頭を正規表現で数えた。gitの日時絞り込みと、GitHub APIの検索件数を同一視しない。

エージェント支援による開発の痕跡は強い。しかしco-authorだけでは、**このAO自身が起動したワーカーか、別のCLIで作った変更かを区別できない**。リポジトリには自分自身を開発するAGENTS・PR作成skill・UI検証skillがあるが、AO経由の全自動開発率や本番採用規模は未確認。[AGENTS.md](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/AGENTS.md)、[desktop-dev skill](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/.agents/skills/ao-desktop-dev/SKILL.md)

## 2. プロダクト / サービスの概要

READMEは「主エージェントへ依頼 → タスクを分けてワーカーを起動 → 必要なときだけ人間へ戻す」と説明する。各ワーカーのチャット、端末、ブラウザ、PR、CI、レビューを一つのデスクトップで監督する。エージェントとモデルはタスクごとに選ぶため、単一モデルに固定したファクトリーではない。ChatとTUIは同じセッションを扱う別の操作面で、実行中controllerの所有権をdaemonが管理する。[README](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/README.md)、[architecture](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/architecture.md#L390)

Cloud AgentsとMobileも製品機能だが、以下は主に**公開ローカルdaemonの実装**を扱う。古いTypeScript実装や設計案を、現行Go実装の動作として読まない。AGENTS自身も現行rewriteを優先するよう指示している。

## 3. ソフトウェアファクトリーの仕組み（ソースコードから）

| ファイル / ディレクトリ | 役割 |
| --- | --- |
| `backend/internal/session_manager/prompt.go` | 主エージェント・ワーカーの役割、委任、レビュー利用、報告の指示 |
| `backend/internal/skillassets/using-ao/` | 起動・送信・レビュー・報告・ブラウザなどCLIのカタログ |
| `backend/internal/observe/scm/observer.go` | PR・CI・レビュースレッドを観測 |
| `backend/internal/lifecycle/reactions.go` | 観測結果から通知、重複排除、完了時の停止を決める |
| `backend/internal/sessionguard/` | 送信直前の活動状態を読み、承認待ちなどへの入力を抑止 |
| `backend/internal/autoreview/coordinator.go` | idleワーカーの自動レビュー起動条件と失敗再試行の上限 |
| `backend/internal/review/` | head単位のレビュー計画、起動、復元、プロンプト |
| `backend/internal/service/review/review.go` | 構造化した判定の受付、runとworkerの対応確認、通知 |
| `backend/internal/service/pr/action_service.go` | マージ前の最新状態再取得と条件判定 |
| `backend/internal/storage/sqlite/` | セッション・PR・レビュー・送信履歴・CDCの永続化 |
| `.github/workflows/` | この製品自身のGo/React検証、生成物のdrift、公開境界など |

### 3.1 入力と役割分担: 主エージェントは調整、ワーカーは実装

主エージェントへの指示は、状態を調べ、重複する仕事がないか確認し、`ao spawn` でworkerを起動し、`ao send` で調整するというもの。実装、push、PR作成を主エージェント自身が行わないこと、ランタイム内蔵subagentではなくAO workerを使うことを指示する。これは**プロンプト上の役割制約**であり、主エージェントからファイル書き込み権限を除くコードとは別である。[prompt.go](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/session_manager/prompt.go#L215)

ワーカーはissueまたは自由文を受ける。プロジェクトのworkerはworktreeとbranchを持つ。projectless workerはAO管理ディレクトリを持ち、PR/CI/トラッカーを当然の前提にしない。`ao report` で意味のある進捗・blocker・成果物を永続化するよう促す。報告は会話の要約だけに依存しないが、すべての作業が自動で報告される保証ではない。[prompt.go](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/session_manager/prompt.go#L143)、[report指示](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/session_manager/prompt.go#L324)

### 3.2 状態の管理: 観測した事実を保存し、表示状態を導出

SQLiteに `activity_state`、`is_terminated`、実行controllerの世代、引き継ぎcheckpoint、PR/check/comment/reviewを保存する。`working / needs_input / ci_failed / mergeable` のような表示状態は読み出し時に導出する。DB triggerが `change_log` を作り、pollerからUIなどへ変更を流す。**ボードの列を動かすこと自体が、Symphonyのようなissue状態の制御面なのではない**。[architecture](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/architecture.md#L38)、[CDC](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/architecture.md#L719)

SCM observerは既定30秒でPR/CI、review threadは既定2分の間隔で取得する。runtime reaperは既定5秒。**probe失敗をプロセス死亡と同一視しない**ことが設計規則。表示上の「要対応」と、実行controllerが生きているか、ユーザー入力を待つかを別の事実として扱う。[observer定数](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/observe/scm/observer.go#L29)、[reaper](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/observe/reaper/reaper.go#L19)、[AGENTS hard rules](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/AGENTS.md)

### 3.3 CI・レビュー・衝突を担当ワーカーへ差し戻す

`ApplyPRObservation` は保存済みのPR状態を受け、複数の問題が同時にあれば通知をそれぞれqueueに積む。CI失敗が先に見つかったためレビュー指摘が消える、といった早期returnを避けている。[reactions.go](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/lifecycle/reactions.go#L65)

| 観測した問題 | コード上の条件と差し戻し |
| --- | --- |
| CI失敗 | PRの `AutoInjectCI` が有効で、失敗checkがあれば詳細を送る |
| 未解決コメント | コメントごとの `AutoInjectReview` が有効なものを送る。thread全体でなくコメントごとの署名を持つ |
| changes requested | 対応するレビューごとの設定とreview IDに従って送る |
| merge conflict | 開いた親PRに積まれたPRを除外してrebaseを指示。衝突が解消したと確定したら重複排除を解除し、再発を通知できる |

送信先はPRを所有するsession。ChatではSQLiteのqueueからprovider turnへ、TUIではruntimeへの入力へ流す。入力・承認待ちを同じものとして扱わず、通常のCI/レビュー通知はneeds-input中に保留する。衝突だけは安全と確認できるidle入力欄へurgent通知できるが、**生きたpermission dialogへ入力しない**。[routing](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/architecture.md#L594)、[guard直前の再確認](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/lifecycle/reactions.go#L929)

送信成功 → メモリに署名を記録 → DBへ保存の順序。保存に失敗して再起動した場合は余分な通知があり得る。厳密なexactly-onceではなく、送っていない通知を送信済みとして失うことを避ける設計である。

**上限の範囲**: review/commentの通知はkeyごと最大3回で、同一署名は再送しない。CIと衝突通知は `maxAttempts=0` で回数上限を持たないが、同一署名の重複は抑える。これは**通知の上限**であり、実装の修正ラウンド全体の上限ではない。タスク全体の金額上限・総修正回数上限は、調べたローカルのlifecycle/review経路では確認できなかった。[sendOnce](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/lifecycle/reactions.go#L929)

### 3.4 別エージェントのレビュー: 構造化判定と、実行権限の境界

レビュアーは実装ワーカーと別に起動する。指定PR/headの差分、正しさ、エラー処理、安全性、テスト不足を読む。プロンプトはリポジトリ内容を信頼しないこと、ビルド・テスト・インストールなどを実行しないこと、編集・commit・pushをしないことを指示する。したがって、このレビューは**テスト実行者ではない**。[prompt](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/review/prompt.go)

GitHubには `COMMENT` reviewを投稿し、必須修正はinline commentへ、任意の提案はsummaryへ分ける。その後 `ao review submit` で `approved / changes_requested`、run ID、GitHub review ID、本文を報告する。同じアカウントで自分のPRをAPPROVEできないため、AO内の判定を別に持つ。GitHub投稿に失敗してもreview IDなしでAOへ記録できるため、**AOの判定記録があることとGitHubにレビューが存在することは同義ではない**。[prompt](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/review/prompt.go)、[submit検証](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/service/review/review.go#L884)

コードは判定enum、runの所属worker、実行中か、同じ結果の再提出かを検査する。レビュー内容の妥当性をコードで判定してはいない。headが変わると別レビュー対象となる。同じheadの意図的な再レビューは `--rerun` で可能。[planner](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/review/planner.go)、[workerへの説明](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/session_manager/prompt.go#L368)

自動レビューが有効なworkerは既定1分idle後、既定1分のsweepで起動対象になる。draft/closed/mergedやhead不明は除外し、同じheadでapproved、changes requested、cancelledなどなら自動再起動しない。同一headの**自動レビュー実行失敗は3件で打ち切る**。変更を求められたコードを3回まで修正するという意味ではない。[coordinator](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/autoreview/coordinator.go)

読み取り専用の強制はadapterごとに異なる。Codex adapterは `--sandbox read-only` を付加し、Claude Code adapterはallowed/disallowed toolsを設定する。capability gatewayは固定manifestでPR/run/SHAを縛る土台を持つが、ADRは**gatewayだけではprocess sandboxにならず、実験的host-trusted reviewerをcontained/read-onlyと呼ばない**と明記する。一律に「全レビュアーが安全なsandbox内」とは書けない。[Codex](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/adapters/reviewer/codex/codex.go)、[Claude Code](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/adapters/reviewer/claudecode/claudecode.go)、[ADR 0002](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/adr/0002-secure-interactive-reviewer-gateway.md)

### 3.5 マージ経路と人間のチェックポイント

マージ要求の `expectedHeadSHA` を保存済みheadと照合し、providerからPR・CI・review threadを再取得する。CIのheadがPRのheadと一致し、レビュー取得がpartialでなく、draft/closed/mergedでなく、CIが失敗・pending・unknownでなく、changes requestedや未解決の人間コメントがなく、mergeableであることを確かめる。GitHubにはsquashとSHAを送り、確認後にheadが変わった場合も拒否させる。CIなしの状態はunknown/pendingと区別され、レビュー承認が不要なPRも通り得る。[ActionService](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/service/pr/action_service.go#L125)、[ReadyToMerge](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/domain/pr.go#L235)、[GitHub SHA条件](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/adapters/scm/github/merge_action.go#L19)

このAPIは**AO native reviewのapprovedを必須にしない**し、「別の人間が承認した」というAO独自の証明も要求しない。GitHub側のbranch protectionは別の境界。プロンプトもAO内承認がマージを認可しないことを明記している。したがって「自動レビュアーが合格を出せば必ず自動マージ」という構成ではない。[worker review指示](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/session_manager/prompt.go#L368)

人間は依頼、エージェント/モデル選択、質問・permissionへの応答、レビュー起動の設定、最終のPR判断に関われる。`WorkersRequestReview` が無効ならworkerはレビュー起動前に人間またはorchestratorへ尋ねるよう指示され、有効なら自分で起動する。これもプロンプトの方針と、自動レビューcoordinatorの起動条件を分けて読む。

マージ後の停止も単純な「1 PR mergedならkill」ではない。`TerminateOnPRMerge` が有効で、sessionのPRに少なくとも1件mergedがあり、open PRがなく、workerがactiveでないときに終了する。複数PRや次のPR作成中のworkerを早期停止しない。[reactions.go](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/backend/internal/lifecycle/reactions.go#L65)

### 3.6 この製品自身の開発を守るCI

Go CIはbuild、vet、format、race付きテスト、lint、sqlc/API生成物のdriftを検証する。frontend CIにはtypecheck、Vitest分割実行、renderer smoke、実Electronでの境界確認などがある。Public boundary CIは非公開control planeへの依存が公開側へ入るのを検査する。**これはAO自身のCIであり、利用先プロジェクトに同じテストが自動設置されるという意味ではない**。[Go workflow](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/.github/workflows/go.yml)、[frontend workflow](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/.github/workflows/frontend.yml)、[公開境界](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/.github/workflows/public-boundary.yml)

AGENTSはPR引き渡し前のローカルCIとremote checks確認、CONTRIBUTINGは新規featureの事前承認、maintainerによるreview/mergeを求める。これらの運用指示と、公開ソースだけでは読めないGitHubのrequired checks設定を混同しない。

## 4. 公開されている主張と、実装との対応

| 公開説明 | 実装で確認できたこと / 限界 |
| --- | --- |
| 主エージェントがfleetを運営 | 役割プロンプトとAO CLIの起動・通信経路はある。自動で正しい分割計画になる保証はない |
| CI失敗が正しいagentへ戻る | PR所有sessionへの実ルーティング、policy、永続dedupがある。通知後の修正品質はagentに依存 |
| reviewerが人間より先にPRを読む | 別reviewer、head単位run、起動設定がある。全PR必須の強制ゲートではない |
| コードは自分のマシンに残る | local desktopの説明。READMEが別に提供するCloud Agentsへ一般化しない |
| laptopを閉じてもCloudで継続 | 製品側の主張。公開契約/clientは読めるが非公開制御面の運用は未確認 |

主張の出典は[README](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/README.md)。性能改善率、全自動マージ率、費用削減率は今回確認していない。

## 5. 考察

この事例の特徴は、**LLMの役割分担を、再起動に耐えるPRフィードバック配送へ接続していること**にある。状態を一つのボード列で上書きせず、外部PRと実行中agentの事実を分けるため、CIとレビューが同時に失敗しても別々に処理できる。永続dedup、衝突再発のre-arm、送信直前のpermission確認は、プロンプトだけのファクトリーから一段具体化した部分である。

一方、レビューの合格、GitHub承認、merge readiness、実際のマージは別の判断である。構造化したapprovedがあるだけでは独立した人間の承認にならず、merge APIがAOレビューを必須にするわけでもない。全工程を「合格まで自動修正して自動マージ」と一括して表現すると、この境界が消える。

既存概念との対応では、worktree分離、別reviewer、決定的な起動判定、永続進捗が当てはまる。`bounded-fix-loop` は**通知回数と自動レビュー失敗の局所上限**に限った対応で、タスク全体の反復予算ではない。新しい整理候補は「観測事実から表示状態を導出する」「永続dedup付きの担当者別フィードバック配送」。どちらも本ケースの読み方であり、製品の正式用語ではない。

## 6. 未確認・次に調べたいこと

- 非公開AO Cloud control planeのreconciler、実行環境、DB、費用・再試行制限。
- 公開GitHubのbranch protection、required checks、各PRで誰が承認・マージしたかの網羅的集計。
- reviewer adapterごとの実OSでの権限逸脱・networkの実験。今回はコード読解のみで、外部repoのスクリプト・テストは実行していない。
- AO経由で開発されたPRの割合、agentの修正成功率、外部組織での継続利用。
- タスク全体の費用上限と総修正回数。今回の局所上限を全体上限として補わない。

## Sources

- [固定したリポジトリ](https://github.com/OrchestratorInc/agent-orchestrator/tree/c0b351a31e)
- [README](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/README.md)、[AGENTS](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/AGENTS.md)、[CONTRIBUTING](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/CONTRIBUTING.md)
- [Architecture](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/architecture.md)、[reviewer gateway ADR](https://github.com/OrchestratorInc/agent-orchestrator/blob/c0b351a31e/docs/adr/0002-secure-interactive-reviewer-gateway.md)
- 実装の個別根拠は各節のコミット固定リンク。活動量は同コミットのローカルgit履歴から集計。提供レポートは調査の手掛かりとしてのみ使用。
