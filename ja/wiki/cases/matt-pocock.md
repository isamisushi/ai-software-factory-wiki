---
title: Matt Pocock Software Factory
kind: case
org: Matt Pocock
people: [Matt Pocock]
type: [product]
source: oss
license: MIT
repo: https://github.com/mattpocock/skills
investigated_at: 2026-11-02
investigated_commit: b59cab42bf1206e1363eafc37f71b21c3bcaa12f
concepts:
  - human-checkpoints
  - bounded-fix-loop
  - tracker-as-control-plane
  - progress-ledger
  - fix-the-machine
  - trust-root-review
  - stateless-run-handoff
---

# Matt Pocock Software Factory

[← 事例一覧](../index.md) · [ループの図解](../loops/matt-pocock.md)

調査日: 2026-11-02（JST）。対象は[PR #1316](https://github.com/mattpocock/skills/pull/1316)の最終コミット `mattpocock/skills@b59cab42bf1206e1363eafc37f71b21c3bcaa12f`。公開ソースをcloneし、この版をcheckoutして読んだ。現在のmain全体や講座の実行環境を再現した調査ではない。

この事例に出てくる概念: [人間のチェックポイント](../concepts/human-checkpoints.md) · [上限つきの修正ループ](../concepts/bounded-fix-loop.md) · [トラッカーを制御面にする](../concepts/tracker-as-control-plane.md) · [会話の外に置く進捗台帳](../concepts/progress-ledger.md) · [機械を直す](../concepts/fix-the-machine.md) · [Trust rootのレビュー](../concepts/trust-root-review.md) · [実行を終了して人間へ引き継ぐ](../concepts/stateless-run-handoff.md)

## TL;DR

Matt Pocockが公開する、利用者自身のソフトウェアファクトリーを設計するためのskill。仕事の種類、1回の実行、実行環境、外部サービスを共通の語彙で分け、起動・引き継ぎ・重複防止まで設計させる。Superpowersと同じく、文章を通してエージェントの仕事の進め方を定める事例として扱う。ただし、このskillの対象はファクトリーの設計である。[SKILL.md](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md)

設計の特徴は、実行環境に前回の状態を残さず、人間の判断が必要なら実行を終了すること。人間によるチケットやPRの更新を、次の実行の起点にする。品質管理には自動検査・別実行でのAIレビュー・人間のPRレビューを置き、修正の反復に上限を求める。[用語と設計方針](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md#L8)

公開物はskill本文、タスクの例、サービス選択の調査資料である。このディレクトリにschedulerやrunner、マージゲートの実装はない。以下の上限・承認・使い捨て実行環境は設計上の規則で、配布コードによる強制ではない。

## 1. 組織・人物

| 項目 | 確認した内容 |
| --- | --- |
| 作者 | Matt Pocock。リポジトリのplugin manifestにも作者として記載 |
| ライセンス | MIT |
| 対象PR | #1316。2026-10-31 23:23 JSTにマージ、12コミット、変更8ファイル |
| 配布段階 | 対象コミットでは `skills/in-progress/` のbeta。通常pluginのskills配列には含まれない |
| 起動 | `disable-model-invocation: true`。利用者が明示的に呼ぶ設計 |

根拠: [PR](https://github.com/mattpocock/skills/pull/1316)、[LICENSE](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/LICENSE)、[plugin manifest](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/.claude-plugin/plugin.json)、[betaの説明](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/README.md)、[開発規約](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/CLAUDE.md)。

活動量は対象PRに限定した。GitHub APIのPR情報で12コミット・8ファイルを確認し、取得した12コミットの本文すべてに `Co-Authored-By: Claude Opus 5.5` があることをローカルgit履歴で確認した。これはエージェント支援の痕跡であり、このfactory自身が自動開発した証拠や自律率ではない。リポジトリ全体の人気・直近90日の活動は今回再集計していない。

## 2. プロダクト / サービスの概要

skillは設計を二つに分ける。外部サービスを担当する製品を選ぶことと、そのサービスを読み書きする仕事を定義することである。チケットの未整理、レビュー待ち、厳しい検査への移行など、利用者の問題から始めるよう指示する。[設計の入口](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md#L48)

| 語彙 | このskillでの意味 |
| --- | --- |
| Task | 実装・レビュー・調査など、繰り返し実行する仕事の種類 |
| Trigger | チケット更新、PR更新、時刻など、実行を始める契機 |
| Run | Taskの1回の実行。内部に複数のagent sessionがあっても一つの実行として扱う |
| Runner | Runを動かす使い捨ての作業環境 |
| Ticket tracker / source | チケットを保存する場所と、外部からチケットを作る入口 |
| Git host | branch・PR・reviewを保存する場所 |
| Orchestrator | 起動契機を受け、待機・実行中・完了を記録する部品 |
| Observability platform | ログや実行状況を人間が読む場所。既存の実行画面で足りれば不要 |

これらは製品名やマシン数ではなく役割である。GitHubだけで複数の役割を満たす構成、Linearを使う構成、自前trackerを使う構成を並べる。リモート実行と使い捨てRunnerはこの事例が選ぶ方針であり、wiki全体の定義にはしない。[定義と構成例](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md)

## 3. ソフトウェアファクトリーの仕組み（ソースコードから）

### 3.1 配布物と実行機構の境界

| ファイル | 役割 |
| --- | --- |
| [SKILL.md](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md) | 用語、段階的な自動化、構成の選択、設計完了条件 |
| [EXAMPLE-TASKS.md](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/EXAMPLE-TASKS.md) | 問題別のTask例。起動契機、処理、次に起動する仕事を記述 |
| [TICKET-TRACKERS.md](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/TICKET-TRACKERS.md) | trackerの種類と、状態・通知・API・identity等の選定観点 |
| [GIT-HOSTS.md](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/GIT-HOSTS.md) | PR・権限・required checks・イベント連鎖の選定観点 |
| [RUNNERS.md](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/RUNNERS.md) | 実行ループとマシンの管理主体、寿命・費用・隔離の選定観点 |
| [OBSERVABILITY-PLATFORMS.md](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/OBSERVABILITY-PLATFORMS.md) | 実行情報の送信経路、保存期間、費用、追加製品が必要かの判断 |

サービス調査は2026年10月の案内で、最新性を保証しないと各ファイルが明記する。実際の選定では一次資料を再調査する指示がある。本ページも価格・beta状況を現在の事実として転載しない。

### 3.2 実装・レビュー・修正の接続

Exploreはチケットを読み、実装可能なものをImplementerへ渡す。判断が必要ならチケットに待ち状態を残して終了する。Implementerは検査を通し、draft PRを作り、別のAutomated reviewを起動する。[タスク例](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/EXAMPLE-TASKS.md#L5)

Automated reviewは規約とチケットに対して差分を読む。不合格ならReworkが指摘された部分を直し、再レビューを起動する。規定回数の失敗で人間へ引き継ぐが、数値やカウンターの保存先は指定しない。合格した場合も人間がPRを読み、人間がマージする例である。[レビューと修正](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/EXAMPLE-TASKS.md#L19)

自動検査を毎Runで通すこと、全PRを人間がレビューすることはskillの設計方針である。検査コマンド、GitHubのrequired checks、承認者のidentity、検証対象SHAを確かめる実装は提供しない。これらを利用者が構築する必要がある。

### 3.3 人間待ちと状態の寿命

Runは人間の返答を待ったまま生き続けない。チケットやPRなどへ状態を残して終了し、人間の更新から新しいRunを始める。Runnerのローカルファイルを次回の記憶として扱わず、tracker・Git host・orchestratorへ記録する。[RunとRunner](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md#L18)

ログを見る場所と、仕事を進める根拠の置き場所も分ける。監視が問題を見つけたらチケットにし、そのチケットをRunが読む。実行ログから次の操作へ直接つなぐのではなく、管理する仕事として取り込む方針である。[Observabilityの役割](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md#L44)、[監視からチケットへ](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/EXAMPLE-TASKS.md#L57)

### 3.4 重複防止を設計の完了条件にする

各Taskに対して、起動契機、処理と読み書き先、次に起動するTask、人間が戻る場所、同じ仕事の二重実行を止める方法を答えさせる。Ticket sourceにもチケットを二重登録しない方法を求める。すべての役割に製品を割り当て、各質問へ回答した状態を設計完了とする。[設計質問](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md#L86)

ただし、ロック・lease・重複排除キーの方式は決めない。重複防止は実装済み機能ではなく、設計時に未決のまま残さない要求である。

### 3.5 自動化の拡大とファクトリー自身の改善

自動起動は少量から始める。例はバグ報告10件中1件や1日1回であり、製品の既定値ではない。自動検査・別実行レビュー・人間レビューが役に立つことを確かめてから処理量を増やす。[Start slow](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/SKILL.md#L54)

Fixは失敗したRunのログをチケットにし、修正可能ならfactoryの修正PRを作る。ただしFix自身の失敗から次のFixを起動しない。自己修理の連鎖を止め、factoryを変える修正には必ず人間のレビューを置くという設計である。[Fix](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/EXAMPLE-TASKS.md#L61)

RetroはマージPR、チケット、AIレビュー、実行ログからfactoryの指示の変更を提案する。例はマージ10件に1回の起動。Architectureは夜間に改善候補を一つのチケットへまとめ、人間が選ぶまで実装を起動しない。Ratchetは例外一覧の1ファイルずつを厳しい検査へ移し、例外がなくなれば完了する。[改善タスク](https://github.com/mattpocock/skills/blob/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/skills/in-progress/software-factory/EXAMPLE-TASKS.md#L39)

### 3.6 このskill自体の開発と評価

PR本文は、講座の設計課題や三つの構成例に語彙を当てはめた評価を報告する。一方で文章だけの変更としてテスト未実行を明記する。測定済みの実行成功率や費用対効果ではない。[PRのEvidence](https://github.com/mattpocock/skills/pull/1316)

対象コミットの `.github/workflows/` には、issueへのtriage label付与、返答のないneeds-info issueのクローズ、Changesetsによる版管理がある。これらはこのリポジトリの運用であり、EXAMPLE-TASKSのfactory全体を実行するCIではない。skillの指示遵守を測る専用評価は対象ディレクトリとこのCIには確認できなかった。[workflows](https://github.com/mattpocock/skills/tree/b59cab42bf1206e1363eafc37f71b21c3bcaa12f/.github/workflows)

## 4. 公開されている主張と、実装との対応

| 主張・方針 | 公開物で確認できることと限界 |
| --- | --- |
| 共通言語でfactoryを設計する | 用語・構成例・設計質問をskillとして配布する |
| 人間待ちでRunを終了する | 定義として明記。状態保存と再起動の実装は利用者側 |
| 修正回数を制限する | 上限を置く指示と失敗時の引き継ぎ例。具体的な回数・強制コードはない |
| factory自体を改善する | Fix・Retro・Ratchet等のTask例。稼働実績の公開ログは今回未確認 |
| 自動検査と二段階レビューで品質を守る | 設計方針。Gitの保護規則や独立性の機械的保証は未提供 |

## 5. 考察

Superpowersがエージェントセッションの工程を具体化するのに対し、この事例は外部サービスをまたぐRunの接続を設計させる。Symphonyとの比較では、人間がtrackerを通して仕事を動かす点が近い。一方、同じ作業領域を引き継ぐ方式とは異なり、この事例は毎Runのローカル状態を捨てる。

調査する価値は、再試行・人間待ち・重複実行・自己修理の再帰を、実装前の質問へ落としている点にある。実行コードがないため条件の強制力は限定されるが、どの条件を利用者側で実装する必要があるかを比較できる。

## 6. 未確認・次に調べたいこと

- 講座のPart Twoや実配備で、この語彙がどう実行コードへ対応するか。
- PR時点以降の正式pluginへの昇格と、他skillとの接続。今回の配布段階は対象コミットに限定した記述。
- Runの重複排除、費用上限、合格のSHA固定、権限分離の具体的な実装。
- 実際に処理したPRの成功率・人間の修正量・運用費用。

## Sources

本ページのソースリンクはPR最終コミットに固定。PR状態・時刻・12コミット・8ファイルは2026-11-02にGitHub APIから取得した。マージコミットは `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d`。コードや指示の確認のみを行い、対象リポジトリのスクリプトを実行したりskillをインストールしたりしていない。
