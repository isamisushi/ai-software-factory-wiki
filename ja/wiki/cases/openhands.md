---
title: OpenHands Software Factory
kind: case
org: OpenHands
people: [Graham Neubig]
type: [product, dogfooding]
source: oss
license: MIT
repo: https://github.com/OpenHands/extensions
investigated_at: 2026-10-31
investigated_commit: 6fb2b676
concepts:
  - commit-bound-acceptance
  - tracker-as-control-plane
  - deterministic-loop-calls-llm
  - isolated-workspace
  - bounded-fix-loop
---

# OpenHands Software Factory

[← 事例一覧](../index.md) · [ループの図解](../loops/openhands.md)

調査日: 2026-10-31（JST）。公開OSSをcloneして静的に確認した。対象プロジェクトのスクリプトやテストは実行していない。

| 調査対象 | 固定したコミット | 範囲 |
| --- | --- | --- |
| [OpenHands/extensions](https://github.com/OpenHands/extensions/tree/6fb2b67680b9a5b41452a148e5705f99c7df1a75) | `6fb2b67680b9a5b41452a148e5705f99c7df1a75` | 四つのautomationのcatalog、worker、prompt、テスト、開発規約 |
| [OpenHands/automation](https://github.com/OpenHands/automation/tree/407bf8a021cce90656ee8d92292bd742b550080f) | `407bf8a021cce90656ee8d92292bd742b550080f` | スケジューラ、profile接続、実行時間設定、finish hook |
| [OpenHands/software-agent-sdk](https://github.com/OpenHands/software-agent-sdk/tree/c048a1eb82353b0586f3ce600708394a68ebb246) | `c048a1eb82353b0586f3ce600708394a68ebb246` | profileのsecret絞り込み、会話実行の費用設定 |
| [OpenHands/OpenHands](https://github.com/OpenHands/OpenHands/tree/073024546a5b47da3ff1a25eb49febfbb24062d3) | `073024546a5b47da3ff1a25eb49febfbb24062d3` | Canvasの現在の責任範囲・開発規約 |

これらは同時点の各リポジトリHEADであり、公式デモの配備バージョンを再現した組合せではない。

**この事例に出てくる概念**: [コミットに結び付けた合格記録](../concepts/commit-bound-acceptance.md) · [トラッカーを制御面にする](../concepts/tracker-as-control-plane.md) · [決定的なループからLLMを呼ぶ](../concepts/deterministic-loop-calls-llm.md) · [作業領域の分離](../concepts/isolated-workspace.md) · [上限つきの修正ループ](../concepts/bounded-fix-loop.md)

## TL;DR

- 人間がissueと受け入れ条件を用意し、**triage・developer・reviewer・watchdogという独立した四つの定期automation**を設定する。GitHubのissue、ラベル、PR、review、commit statusが役割間の受け渡しになる。単一の親エージェントが四役を順番に呼ぶ設計ではない。[公式手順](https://docs.openhands.dev/openhands/usage/use-cases/software-factory)
- triage・developer・reviewerは決定的なscannerが会話を起動する。watchdogはLLMを起動せず、指定されたPR headのstatus・Actions・baseの新しさ・mergeabilityを検査し、SHAを指定してsquash mergeを要求する。[watchdog実装](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-delivery-watchdog/scripts/worker.py)
- **ただし、現catalogを読んだ範囲では四役の接続に不整合がある。** watchdogは `software-factory/tests` と `software-factory/review` のsuccessを必須とし、developerも後者のfailure/errorで修正を始める。一方、現reviewerのpromptはnative reviewだけを結果にし、commit statusの作成を明示的に禁止する。調査したextensionsとautomation、SDKに両statusの発行経路は見つからなかった。公式手順どおりに最新テンプレートを組み合わせるだけで、自動修正・mergeまで完結するとは確認できない。[reviewer prompt](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/main.py#L934) · [developer条件](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-to-pr/scripts/worker.py#L136)
- 権限分離は、別promptだけでなく、役割別profileに渡すsecretと、GitHub側のtoken権限で行う。ただし、watchdog自体はstatus作成者の独立性を検査しない。SDKの費用上限機能と、factoryで上限が設定されていることも別である。

## 1. 組織・人物

OpenHandsが公開するOSSの開発基盤と再利用可能なautomationの事例。Graham Neubig（GitHub `neubig`）のデモ用リポジトリが公式手順に登場する。ライセンスは主対象extensionsのMIT。Canvas UI、Agent Server/SDK、automationサービス、再利用するテンプレートの責任範囲は各リポジトリのAGENTS.mdで分けられている。[extensionsの規約](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/AGENTS.md) · [Canvasの規約](https://github.com/OpenHands/OpenHands/blob/073024546a5b47da3ff1a25eb49febfbb24062d3/AGENTS.md)

活動量は品質・自律性と分けて扱う。2026-10-31に `gh search prs --repo OpenHands/extensions --merged --merged-at '>=2026-10-01' --limit 1000 --json number,author` で取得したマージ済みPRは83件、そのうち作者loginが `all-hands-bot` のものは7件。全件取得上限には達していない。この数字はextensions全体の開発活動であり、この四役factoryが作ったPRの件数ではない。bot作者であることだけでも起動経路・人間の介入・自動mergeは分からない。[同条件の公開検索](https://github.com/OpenHands/extensions/pulls?q=is%3Apr+is%3Amerged+merged%3A%3E%3D2026-10-01)

## 2. プロダクト / サービスの概要

公式手順はAgent Canvas 1.24.0以降、Automation有効化、会話ごとのDocker workspace、三つのrepository-scoped tokenを前提に、各automationを5分間隔で設定する。watchdogはdeveloper tokenを再利用する。設定後に人間が四つを有効化し、小さいissueから動作を観察する。[公式手順](https://docs.openhands.dev/openhands/usage/use-cases/software-factory)

現在の実装の置き場所は、CanvasがUI、automationが時刻・dispatch・run履歴、SDK/Agent Serverが会話とtool実行、extensionsが具体的なGitHub業務である。旧 `OpenHands/agent-canvas` は移転案内になっているため、その旧リポジトリをfactoryの現実装とは扱わない。[旧リポジトリの移転案内](https://github.com/OpenHands/agent-canvas) · [責任境界](https://github.com/OpenHands/automation/blob/407bf8a021cce90656ee8d92292bd742b550080f/AGENTS.md)

## 3. ソフトウェアファクトリーの仕組み（ソースコードから）

### 3.1 ファイルと責任

以下のextensionsリンクはすべて調査コミットに固定している。

| ファイル | 役割 |
| --- | --- |
| [automations/catalog/github-issue-triage/manifest.json](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/automations/catalog/github-issue-triage/manifest.json) | 配布bundle、設定値、300秒のscanner timeout。残り三役も同じcatalog配下 |
| [skills/github-issue-triage/scripts/worker.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-triage/scripts/worker.py) | issue・人間の議論・readiness変更のfingerprint、起動の重複除去、triage prompt |
| [skills/github-issue-to-pr/scripts/worker.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-to-pr/scripts/worker.py) | ready issueの起動、既存PRの修正起動、branchとissueの対応 |
| [skills/github-pr-reviewer/scripts/worker.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/worker.py) | review対象headの選定、CIによる起動制限、新規起動数、公開reviewの完了確認 |
| [skills/github-pr-reviewer/scripts/main.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/main.py) | catalog workerが再利用するreview prompt。standalone実行経路と混同しない |
| [skills/github-pr-reviewer/scripts/publication.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/publication.py) | opt-inの構造化review公開。通常catalogは `structured_publication` を指定していない |
| [skills/github-delivery-watchdog/scripts/worker.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-delivery-watchdog/scripts/worker.py) | 決定的なmergeゲートとbase更新 |
| [skills/github/scripts/agent_conversation.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github/scripts/agent_conversation.py) | subjectごとの会話、KVによるdeliveryの記録、profileとsecret、error再試行 |
| [skills/github/scripts/github_client.py](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github/scripts/github_client.py) | 名前を指定したsecret取得、GitHub API、statusの読み取り、依存issueの確認 |

### 3.2 入力とtriage

scannerはissue本文、人間の議論、readiness変更等のfingerprintを作り、処理済みの同じ入力を繰り返し送らない。promptは所有リポジトリを確認し、scope・non-goals・観測できる受け入れ条件を作り、未決事項があれば `decision_needed` とするよう指示する。ここでの「実装に着手できる」と、実装後の「受け入れ可能」は別の判定である。[worker](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-triage/scripts/worker.py#L29)

現catalogはguarded publisher設定を渡さず、prompt内の **legacy direct mode** を使う。この経路ではエージェントがGitHubを書き換える。別に存在する `triage_publisher_path` の入力再確認・JSON検査を、標準catalogで常に強制される条件とは数えない。[manifest](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/automations/catalog/github-issue-triage/manifest.json) · [モード分岐](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-triage/scripts/worker.py#L57)

extensions自身の開発では、write/maintain/admin権限を持つ利用者以外が付けた `ready-for-dev` を外すworkflowと、PR本文・リンク先issueのreadinessを調べるCIがある。これは対象リポジトリ側の追加ゲートであり、factoryを設定した任意のリポジトリへ自動導入されるものではない。[readiness workflow](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/.github/workflows/issue-readiness-check.yml) · [PR checker](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/.github/scripts/check_pr_description.py)

### 3.3 developerの選択と修正

コードで強制する新規着手条件は、open issue、設定したtrigger label、既存の管理対象open PRがないこと、`Depends on:` 行で参照された依存issueの完了である。priority:highを先にし、issue番号で並べる。branchは `prefix-issue番号` で識別する。[worker run](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-to-pr/scripts/worker.py#L117) · [依存の確認](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github/scripts/github_client.py#L352)

実装・テスト・commit・push・PR作成・review label付与はpromptの指示である。既存PRでは **current headの `software-factory/review` がfailure/error** のとき、review・discussion・失敗checkを読み、同じbranchを修正する会話を起動する。tests statusだけの失敗やnative reviewの指摘を、同条件の代わりとして直接は読まない。同じ修正headのdeliveryは重複除去され、新しいheadは別deliveryとなる。[修正条件とprompt](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-issue-to-pr/scripts/worker.py)

### 3.4 reviewer: headの固定と、合格記録の接続の限界

通常catalogは、エージェント自身がnative GitHub reviewを投稿する経路を使う。scannerは対象SHAをpromptへ渡し、detached HEADでのcheckout、変更直前のPR再読込、headが動いたら投稿しないこと、reviewの `commit_id` を対象SHAにすることを指示する。これはcheckoutや投稿直前の動作についてはpromptの規則である。一方、完了判定はGitHubからreviewを再取得し、reviewer account・commit_id等を照合するコードを持つ。[promptと完了判定](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/worker.py#L260)

reviewerの事前起動ゲートは、scheduled discoveryでGitHubがrequiredとするcurrent-head checkを読み、読めなければ全check/workflowへフォールバックする。明示的なreview requestにはゲートを迂回する経路がある。これは**reviewを始める条件**であり、mergeを許すwatchdogの条件とは違う。[起動ゲート](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/worker.py#L955)

**公式説明とのずれ**: 公式手順はreviewerがheadごとのreview/test statusを残すと説明する。しかし現promptはnative reviewを唯一の結果とし、commit statusとChecksの作成を禁止する。この仕様はテストでもassertされている。opt-in `publication.py` は構造化JSONを検査し、headを再確認してnative reviewを公開する別経路だが、ここにも二つのacceptance statusの発行は確認できない。extensions全体・automation・SDKの対象コードを検索し、automationのfinish hookも読んだ範囲では、watchdogが要求するstatusの発行者を特定できなかった。配備固有の別経路の存在までは否定できない。[明示的な禁止](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/main.py#L934) · [contract test](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/tests/test_github_reviewer_delivery.py#L146) · [構造化公開](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/publication.py) · [finish hook](https://github.com/OpenHands/automation/blob/407bf8a021cce90656ee8d92292bd742b550080f/openhands/automation/presets/finish_tool_hook.py)

### 3.5 watchdog: 機械で強制するmerge条件

[実装](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-delivery-watchdog/scripts/worker.py)から、次を区別できる。

| 条件 | 実際のコード |
| --- | --- |
| PRの範囲 | open、非draft、指定base、`prefix-数字` のbranch、head SHA一致、`mergeable is True` |
| 受け入れ記録 | 同じSHAの `software-factory/tests` と `software-factory/review` が両方success。native reviewのAPPROVEだけでは足りない |
| その他のstatus | 読み取った各contextの最新値がすべてsuccess。作成者・GitHub App・独立したreviewerかどうかは検査しない |
| Actions | head SHAが一致するrunを取得し、workflow/event/head_branchごとの最新実行がcompleted/success。取得不完全・API例外はmergeしない |
| Actionsゼロ件 | `required_workflow_ids` が空なら許す。現在のUI formはこのID一覧を露出しない。CIの存在自体は必須ではない |
| baseが古い | acceptance通過後にbehind/divergedを検出するとreview labelを付け、`expected_head_sha` 付きでupdate-branch。mergeは次回以降へ |
| 最終操作 | `PUT /pulls/N/merge` に検査したSHAとsquashを渡す。headの競合更新はGitHubに拒否させる |

SHAとの結び付きは実装で確認できる。一方「独立した合格」は**適切なtoken設定とstatus発行者を信頼する運用**を含む。statusのcontext名とsuccessだけでは独立性を証明できない。branch protectionやrequired checksの実際の配備設定は未確認。headを固定してもbaseは別の参照なので、compareとmergeの間のbase更新をこのSHA指定だけで固定することはできない。

### 3.6 役割別の権限と作業領域

公式手順のtoken権限は次のとおり。repositoryごとにfine-grained PATを作り、対応するprofileにはそのsecretだけを選ぶ。MCP serverを空にし、model switchingとsub-agentも無効にするよう求める。[公式手順](https://docs.openhands.dev/openhands/usage/use-cases/software-factory)

| 役割 | GitHub権限の要点 |
| --- | --- |
| triage | Contents read、Issues write。コードpush不可 |
| developer | Contents/Issues/PR write、Actions/Statuses read。コードとPRを変更できる |
| reviewer | Contents/Actions read、Issues/PR/Statuses write。コードpush不可 |
| watchdog | developer tokenを再利用。条件付きmergeをコードで行う |

dispatcherは選択された `AUTOMATION_AGENT_PROFILE_ID` を使って会話を開始し、そのprofileでsecretを取得する。SDK側はprofileの許可secret集合で要求secretを落とし、会話containerへの転送にも適用する。**配布する資格情報の範囲**と、**GitHubが許す書き込み操作**を二段で絞る仕組みである。profile未指定はactive/default profileを使うため、三役の明示設定が重要になる。[dispatcher](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github/scripts/agent_conversation.py#L175) · [SDKでの絞り込み](https://github.com/OpenHands/software-agent-sdk/blob/c048a1eb82353b0586f3ce600708394a68ebb246/openhands-agent-server/openhands/agent_server/launch.py#L211)

別profileやDockerがあることだけで、悪意あるコードからの完全な秘密隔離を証明したとは扱わない。reviewerも対象repoのテストを実行する。Agent Serverの認証資格情報へ到達できる範囲などの境界は今回の監査範囲外。Dockerの実際のmount・network・resource設定もデモ配備では未確認。

### 3.7 停止・再試行・費用

| 単位 | 確認した制限 | 限界 |
| --- | --- | --- |
| 定期scanner | 四役のcatalog bundleはtimeout 300秒 | 委譲したagent会話の全寿命と同じではない |
| 同じdeliveryの会話error | `_MAX_ERROR_RETRIES = 2` | 新deliveryで回数はリセット。変更を重ねる修正全体の上限ではない |
| reviewer新規起動 | `max_new_per_run` 既定2、全repo共通 | 1 scanの新規起動枠。次scanも含む総実行数・費用上限ではない |
| サービスsandbox | `max_run_duration` 既定30分 | 一般設定。四役factory全体の停止時間ではない |
| SDKのLLM費用 | `max_budget_per_run` 機能あり、既定None | catalogでfactory総額・各会話の金額を設定する経路は未確認 |
| 修正headの連鎖 | 全ラウンド数上限を確認できない | 「二回で人間へ」とは言えない |

根拠: [deliveryとretry](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github/scripts/agent_conversation.py#L37) · [review intake](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github-pr-reviewer/scripts/worker.py#L45) · [サービス設定](https://github.com/OpenHands/automation/blob/407bf8a021cce90656ee8d92292bd742b550080f/openhands/automation/config.py#L228) · [SDKの費用設定](https://github.com/OpenHands/software-agent-sdk/blob/c048a1eb82353b0586f3ce600708394a68ebb246/openhands-sdk/openhands/sdk/conversation/conversation.py#L76)

## 4. 公開されている主張と、実装との対応

| 公開説明 | 調査対象で確認したこと |
| --- | --- |
| 四独立automationでissueからmerge | catalogとscannerが別々に存在。現在のreviewer→acceptance status接続は未確認 |
| reviewerはpushできない | 公式token設定に従えばGitHubのContents readが制限する。watchdogがtoken権限を監査する仕組みではない |
| exact-headの独立review/testを通ってmerge | watchdogのSHA・context検査はコード。status作成者の独立性とテスト実行の証明は検査しない |
| stale branchを更新して再review | watchdogのupdate-branchとlabel再付与を確認。新headには別statusが必要 |
| Airbnb cloneの6 issuesを並列開発、PR #87〜#92を全merge | 公式デモ記録の主張。該当PRページは今回404で本文を取得できず、個別のreview/status/merge履歴を照合できなかった |
| Box cloneも同経路で完成 | 公式記述。配備版・全実行ログ・人間の介入割合は未確認 |

デモの二行は[公式手順](https://docs.openhands.dev/openhands/usage/use-cases/software-factory)による。具体的な成功例の記述であり、任意のrepoでの成功率や全社的な無人開発の証明ではない。

## 5. 考察

**GitHubを共有状態として独立したscannerをつなぐ。** triageのreadinessと実装後のacceptanceを分け、会話の外のラベル・head・review・statusで次の仕事を決める。会話はsubjectごとに再利用するため、毎回すべてを新鮮なcontextで独立評価する設計とは違う。[dispatcherのsubjectとdelivery](https://github.com/OpenHands/extensions/blob/6fb2b67680b9a5b41452a148e5705f99c7df1a75/skills/github/scripts/agent_conversation.py#L228)

**merge判断をコードへ移す効果と、入力証拠の限界が両方見える。** watchdogはLLMの「mergeしてよい」を実行しない。SHAに属する記録とGitHubの状態を検査する。ただし、その記録を誰がどう作ったかまで保証しなければ独立性は完成しない。現catalogではその記録を作る接続自体が確認できず、部品ごとのcontract testだけで四役を横断する整合性が成立するとは限らない。

**dogfoodingの証拠は段階的に読む必要がある。** 自repoにエージェント規約・review guide・readiness CIがあり、bot作者の変更もある。しかし、それだけでこの四役とwatchdogが自身の全開発を回しているとは言えない。公式cloneアプリのデモ、公開OSSのbot活動、製品全体の運用を分けて扱う。

## 6. 未確認・次に調べたいこと

- 公式デモが使用したextensions/SDK/automationの版と、二つのacceptance statusの発行元。現在のcatalogとの差を説明する履歴・配備設定。
- 6件のデモPRのreview・status・Actions・base更新・merge履歴、人間が変更した箇所。
- GitHub側のbranch protection、statusを作成可能なidentityの制限、merge権限。
- 委譲会話の実行時間・iteration・費用の実際の設定、全修正ラウンドの停止と人間への引き継ぎ。
- Docker隔離のmount/network/CPU・メモリ制限、secret取得APIと委譲先の信頼境界。

## Sources

- [公式 Software Factory 手順](https://docs.openhands.dev/openhands/usage/use-cases/software-factory)（2026-10-31取得。可変の運用説明）
- 上表の四つの固定commitをcloneし、AGENTS.md・review guide・catalog・worker・CI・contract testを直接確認。
- 活動量: 上記 `gh search prs`、2026-10-31時点。公開PR検索の件数であり、factory起動の監査ログではない。
- [公式が参照するAirbnb clone PR #87](https://github.com/neubig/airbnb-clone/pull/87)・[PR #92](https://github.com/neubig/airbnb-clone/pull/92)（今回本文未取得）。
