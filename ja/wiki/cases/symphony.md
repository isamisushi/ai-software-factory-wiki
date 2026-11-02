---
title: Symphony
kind: case
org: OpenAI
people: [Alex Kotliarskyi]
type: [product, dogfooding]
source: oss
license: Apache-2.0
repo: https://github.com/openai/symphony
investigated_at: 2026-10-29
investigated_commit: be10a1b
concepts:
  - tracker-as-control-plane
  - spec-as-product
  - host-side-agent-tools
  - isolated-workspace
  - human-checkpoints
  - progress-ledger
  - issue-lifecycle-state-machine
  - deterministic-loop-calls-llm
  - bounded-fix-loop
  - closed-contribution
  - adversarial-review
---

# Symphony（OpenAI）

[← 事例一覧](../index.md) · [ループの図解](../loops/symphony.md)

調査日: 2026-10-29
調査対象コミット: `openai/symphony@be10a1b`（2026-09-15）

**この事例に出てくる概念**: [トラッカーを制御面にする](../concepts/tracker-as-control-plane.md) · [仕様を配布物にする](../concepts/spec-as-product.md) · [認証情報を持つツールをホスト側で実行する](../concepts/host-side-agent-tools.md) · [作業ごとに分離した作業領域](../concepts/isolated-workspace.md) · [人間のチェックポイント](../concepts/human-checkpoints.md) · [会話の外に置く進捗台帳](../concepts/progress-ledger.md) · [Issue lifecycleのステートマシン](../concepts/issue-lifecycle-state-machine.md) · [決定的なループからLLMを呼ぶ](../concepts/deterministic-loop-calls-llm.md) · [上限つきの修正ループ](../concepts/bounded-fix-loop.md) · [入力の制御](../concepts/closed-contribution.md) · [Adversarial review](../concepts/adversarial-review.md)

## TL;DR

- Symphonyは、**issueトラッカー（Linearなど）を監視し、issueごとに分離した作業ディレクトリでCodexを起動し続ける常駐サービス**。人間はエージェントのセッションを見張らず、ボード上のカードを動かして仕事を管理する、というのがOpenAIの説明。
- 配布物の中心はコードではなく**言語に依存しない仕様 `SPEC.md`（2312行）**。READMEは「好きなコーディングエージェントにこの仕様を渡して、好きな言語で実装させる」ことを第一の使い方として勧め、Elixirの参考実装を「実験的」として同梱する。
- 役割分担がはっきりしている。**オーケストレーター（決定的なコード）はトラッカーを読んで、起動・継続・リトライ・停止だけを決める**。チケットの状態遷移、コメント、PR作成、レビュー対応、マージは、エージェントが `WORKFLOW.md` のプロンプトとskillに従って行う。
- 人間の判断は、トラッカーの状態を動かすことで入る。`Backlog → Todo`（着手）、`Human Review → Merging`（承認）または `Rework`（差し戻し）。
- 「検証がgreenになるまでHuman Reviewに出さない」「CIとレビューが片付くまでマージしない」といった品質の条件は、**ほぼすべて手順書の指示**。コードで強制するのは、作業ディレクトリの境界、active/terminalな状態に基づく起動と停止、ターン数とタイムアウトなど。
- 活動量（品質や自律性とは別）: マージ済みPRは64件（2026-02〜09）、うちWORKFLOW.mdが付けるよう指示する `symphony` ラベル付きが22件。最後のコミットは2026-09-15で、調査時点では約6週間更新がない。

## 1. 組織・人物

| 項目 | 内容 |
| --- | --- |
| 組織 | OpenAI |
| 主な作者 | Alex Kotliarskyi（GitHub `frantic-openai`）。mainの47コミット中34、マージ済みPR 64件中50 |
| 公開 | リポジトリ作成は2026-02-26。公式記事は2026-04-28（二次報道による） |
| ライセンス | Apache-2.0 |
| 位置づけ | READMEは "low-key engineering preview for testing in trusted environments" と書く。二次報道によれば、OpenAIは単独の製品として保守する予定はなく、参考実装として位置づけている |
| 前提 | READMEは [harness engineering](https://openai.com/index/harness-engineering/) を採り入れたコードベースで最もよく動く、と書く。Symphonyはその「次の段階」という位置づけ |

公式記事（https://openai.com/index/open-source-codex-orchestration-symphony/ ）は調査時にHTTP 403で本文を取得できなかった。記事の内容は[Help Net Security](https://www.helpnetsecurity.com/2026/04/28/openai-symphony-codex-orchestration-linear/)などの二次報道で確認した。

## 2. プロダクトの概要

[README](https://github.com/openai/symphony/blob/be10a1b/README.md) と [SPEC §1](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L16) より:

- トラッカーから作業を読み続け、issueごとに作業ディレクトリを作り、その中でコーディングエージェントのセッションを動かす長時間稼働のサービス。
- 解決する問題は4つ: issueの実行を手作業のスクリプトではなく繰り返せるデーモンにする、エージェントの実行をissueごとの作業ディレクトリに閉じ込める、ワークフローの方針を `WORKFLOW.md` としてリポジトリに置きコードと一緒にバージョン管理する、複数のエージェントの並行実行を運用・デバッグできるだけの観測性を持つ。
- **重要な境界**: Symphonyは「スケジューラ兼ランナー兼トラッカーの読み手」。チケットへの書き込みは、Symphonyがホスト側で実行するツールを通してエージェントが行う。成功した実行は `Done` ではなく `Human Review` のような引き渡しの状態で終わってよい。
- Non-Goals に、リッチなWeb UI、汎用ワークフローエンジン、チケットやPRの扱いを組み込むこと、強いサンドボックスの義務化が並ぶ。

Elixir実装が対応するトラッカーはLinear、GitHub Issues、GitLab、Jira Cloud、Asana（`elixir/lib/symphony_elixir/*/adapter.ex`）。リモートホストへSSHでワーカーを出す拡張もある（[SPEC 付録A](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L2252)）。

## 3. ソフトウェアファクトリーの仕組み（ソースコードから）

```
SPEC.md                          言語に依存しない仕様（RFC 2119の語彙。実装チェックリストつき）
elixir/                          参考実装（Elixir/OTP）
  WORKFLOW.md                    このリポジトリ自身を開発するためのワークフロー（設定 + プロンプト）
  AGENTS.md                      Elixir実装に手を入れるエージェント向けの規約
  lib/symphony_elixir/orchestrator.ex   ポーリング、起動、リトライ、照合（1990行）
  lib/symphony_elixir/agent_runner.ex   1 issueのワーカー。ターンの継続
  lib/symphony_elixir/codex/app_server.ex  Codex app-serverとのJSON-RPC。承認要求の扱い
  lib/symphony_elixir/workspace.ex      issueごとの作業ディレクトリとhook
  lib/mix/tasks/pr_body.check.ex        PR本文がテンプレートに沿うかを検査
.codex/skills/                   エージェントが使うskill: linear, commit, push, pull, land, debug, release
  land/land_watch.py             マージ前にレビューコメント・CI・headの更新を並行して見張る
.github/workflows/
  make-all.yml                   format / lint / coverage / dialyzer（`make all`）
  pr-description-lint.yml        PR本文の形式チェック
```

### 3.1 2つの層: 決定的なオーケストレーターと、プロンプトで動くエージェント

SPECは層を分けている（[§3.2](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L118)）。`WORKFLOW.md` の本文（Policy層）がチームごとのチケット処理・検証・引き渡しの規則を持つ。オーケストレーター（Coordination層）は、ポーリング、起動の可否、並行数、リトライ、照合だけを持つ。

オーケストレーターがコードで決めること:

| 決めること | 内容 | 根拠 |
| --- | --- | --- |
| 起動の可否 | 状態が `active_states` に入っていて `terminal_states` に入っていない、アダプタが `dispatchable=true` を返す、必須ラベルをすべて持つ、実行中・予約済みでない、並行数に空きがある | [SPEC §8.2](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L754) |
| Linearの `dispatchable` | 担当者の絞り込み（`assignee`、`me` 可）に合い、`Todo` のときは未完了のblockerがない | [linear/client.ex L496](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/linear/client.ex#L496) |
| 優先順位 | priority 1〜4の昇順 → 作成日の古い順 → identifier | [SPEC §8.2](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L771) |
| 並行数 | 全体で `max_concurrent_agents`（既定10）、状態ごとの上限も設定できる | [SPEC §8.3](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L777) |
| 照合 | 毎tick、実行中issueの状態を取り直す。terminalなら停止して作業ディレクトリを消す。activeでなくなれば停止（ディレクトリは残す） | [orchestrator.ex L421](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L421) |
| ターンの継続 | 1ターン終わるごとにissueを取り直し、activeなら同じスレッドで次のターンへ。最大 `max_turns`（既定20） | [agent_runner.ex L101](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/agent_runner.ex#L101) |
| リトライ | 正常終了後は1秒後に継続チェック。失敗・停滞は `10秒 × 2^(n-1)`、上限 `max_retry_backoff_ms`（既定5分）の指数バックオフ | [orchestrator.ex L1232](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L1232) |
| 停滞 | 最後のイベントから `stall_timeout_ms`（既定5分）経てば停止してリトライ | [orchestrator.ex L608](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L608) |

**リトライ回数の上限はない。** SPECにも実装にも試行回数の上限はなく、issueがactiveなままなら、最大5分間隔で再起動を続ける。止めるのは、人間（または他の何か）がトラッカーの状態を変えたときだけ。費用の上限も設定にない。トークン数は観測用に集計する（[SPEC §13.5](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1419)）が、それで止める処理は確認できなかった。

**SPECにない、Elixir実装の追加**: エージェントが人間の入力や承認を求めたまま止まると、リトライせず `blocked` として保留する。トラッカーの状態がactiveでなくなるかterminalになるまで、再起動しない（[orchestrator.ex L757](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/orchestrator.ex#L757)）。

再起動時の復旧はトラッカーとファイルシステムから行う。リトライのタイマーや実行中のセッションは復元しない（[SPEC §14.3](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1690)）。オーケストレーター自身は永続的なDBを持たない。

### 3.2 WORKFLOW.md: リポジトリに置くワークフロー

`WORKFLOW.md` はYAMLのfront matter（設定）と、Liquid互換のプロンプト本文からなる。変更は再起動なしで次の起動から反映される。不正な変更では落ちず、直前の正しい設定で動き続ける（[SPEC §6.2](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L560)）。テンプレートの未知の変数はエラーにする。

このリポジトリ自身の [elixir/WORKFLOW.md](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md) の設定:

- トラッカー: Linearのプロジェクト。active = `Todo / In Progress / Merging / Rework`、terminal = `Closed / Cancelled / Canceled / Duplicate / Done`。
- **`Human Review` はactiveにもterminalにも入っていない**。エージェントがここへ移すと、オーケストレーターはワーカーを止め、作業ディレクトリは残す。
- ポーリング5秒、並行数10、`max_turns: 20`。
- `after_create` hookでリポジトリを `--depth 1` でcloneし、依存を入れる。
- Codexは `gpt-5.5`、`model_reasoning_effort=xhigh`、`approval_policy: never`、`workspace-write` のサンドボックス、ネットワーク許可。

プロンプトの状態ごとの指示（[Status map](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L107)）:

| 状態 | エージェントへの指示 |
| --- | --- |
| `Backlog` | 対象外。触らず、人間が `Todo` に移すのを待つ |
| `Todo` | すぐ `In Progress` に移し、workpadのコメントを作ってから着手。PRがすでに付いていれば、PRのフィードバック対応から始める |
| `In Progress` | 計画 → 再現 → `origin/main` との同期 → 実装 → 検証 → PR → フィードバックとCIの確認 |
| `Human Review` | コードもチケットも触らない。人間の判断を待つ |
| `Merging` | `land` skillをループで実行してマージし、`Done` に移す。`gh pr merge` を直接呼ばない |
| `Rework` | 全面やり直し。既存PRを閉じ、workpadを消し、`origin/main` から新しいブランチで最初から |

その他の指示:

- **無人で動く前提**: 「人間にフォローアップを頼まない」「最終メッセージに "next steps for user" を書かない」。早く止まってよいのは、ツール・認証・権限・秘密情報が欠けているときだけ（escape hatch）。そのときはblockerの説明をworkpadに書いて `Human Review` に移す。GitHubへのアクセスは既定ではblockerと認めず、代替手段を試させる。
- **workpad**: Linearのissueに `## Codex Workpad` という1つのコメントを置き、計画・受け入れ条件・検証・メモをそこだけに書く。冒頭に `<host>:<path>@<sha>` を入れる。別の完了報告コメントは禁止。不明点があれば最後に `### Confusions` を書く（[Workpad template](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L295)）。
- **チケットの検証項目は必須**: チケットに `Validation` / `Test Plan` / `Testing` 節があれば、workpadの受け入れ条件に写し、すべて実行する。
- **スコープを広げない**: 範囲外の改善は、受け入れ条件つきの別issueとして `Backlog` に登録する。
- **再現を先に**: コードを変える前に、現在の挙動を示すシグナル（コマンド出力、スクリーンショットなど）をworkpadに記録する。

### 3.3 検証とレビュー: 手順書のゲート

`Human Review` に出す前の完了条件（[Completion bar](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L265)）は、workpadのチェックリストが完了、受け入れ条件とチケットの検証項目が完了、最新コミットで検証がgreen、PRのフィードバック対応が完了、PRのチェックがgreen、`symphony` ラベル付き、など。

- **PRフィードバックのsweep**（[L171](https://github.com/openai/symphony/blob/be10a1b/elixir/WORKFLOW.md#L171)）: トップレベルのコメント、インラインのレビューコメント、レビューの要約をすべて集め、人間のものもbotのものも、対応するか理由つきで反論するまでブロッカーとして扱う。対応後に再検証してpushし、未対応がなくなるまで繰り返す。回数の上限はない。
- **pushの前に検証**: `push` skillは `make -C elixir all` を実行してからpushし、PR本文を `mix pr_body.check` で検査する（[push SKILL.md](https://github.com/openai/symphony/blob/be10a1b/.codex/skills/push/SKILL.md)）。
- **Elixir実装の規約**（[AGENTS.md L36](https://github.com/openai/symphony/blob/be10a1b/elixir/AGENTS.md#L36)）: 「自明でない変更では早めにadversarial reviewを使い、複雑さを疑い、隣接するライフサイクルの経路を壊しにいく。再現できる失敗は、他のレビューがきれいでもlandを止める」。ただし、それを実行する仕組みやプロンプトはこのリポジトリにない（指示のみ）。
- **CI**: `make all`（format、lint、coverage、dialyzer）とPR本文の形式チェックだけ。LLMによるレビューのジョブはない。

**コードが強制していない点**: 上の完了条件を満たしたかを確かめてから `Human Review` への遷移を許す仕組みはない。状態を移すのはエージェント自身のツール呼び出しで、オーケストレーターは遷移の正しさを見ない。

### 3.4 マージ: land skill

人間が `Merging` に移すと、エージェントは [land skill](https://github.com/openai/symphony/blob/be10a1b/.codex/skills/land/SKILL.md) をループで回す。

- 衝突があれば `pull` skillで `origin/main` をmergeして解決し、`push` skillで更新する。
- `land_watch.py` がレビューコメント、CI、PRのheadの更新を並行して見張る。終了コードは 2 = レビューコメント、3 = CI失敗、4 = headの更新。
- CIが失敗したらログを読んで直し、再度見張る。flakyと判断した失敗は直さずに進んでよい（エージェントの判断）。
- レビューコメントには、受け入れ・確認・反論のどれかを先に `[codex]` 付きで返信してから変更する。
- すべてgreenでレビュー対応が済んだら `gh pr merge --squash`。**auto-mergeは使わない**。理由は「このリポジトリにはrequired checksがないので、auto-mergeだとテストを飛ばしうる」と書かれている。

**公開リポジトリと合わない記述**: land skillは、GitHub Actionsが投稿する `## Codex Review — <persona>` コメントを待つループや、「pnpmのlockfileが壊れたとき」の対処を含む。しかしこのリポジトリはElixirでpnpmを使わず、レビューを投稿するworkflowもない。`symphony` ラベル付きの公開PR 22件には `## Codex Review` コメントが1件もなく、`[codex]` 返信も1件だけだった。skillは別のリポジトリ（OpenAI社内と推測）から持ってきたもので、このレビューの仕組みは公開リポジトリでは動いていない、と読むのが妥当（推論）。

### 3.5 安全性

- **作業ディレクトリの不変条件**（[SPEC §9.5](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L928)）: エージェントのcwdはissueの作業ディレクトリと一致すること、作業ディレクトリは `workspace.root` の下にあること、ディレクトリ名は `[A-Za-z0-9._-]` に正規化すること（変わる場合はハッシュを付ける）。SPECはこれを「最も重要な移植上の制約」と呼ぶ。
- **認証情報をエージェントに渡さない**（[SPEC §10.5](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1065)）: トラッカーを操作するツール（Linearなら `linear_graphql`）は、Symphonyのホスト側で、設定された認証情報で実行する。子プロセスには結果だけを返す。Elixir実装は、アダプタが宣言した環境変数名を子プロセスの環境から外し、`unset` してからCodexを起動する（[app_server.ex L221](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/codex/app_server.ex#L221)）。
- **承認ポリシー**: SPECは承認・サンドボックスの方針を実装に任せ、文書化だけを求める。Elixir実装の既定はサンドボックス承認・ルール・MCPのelicitationを拒否する設定（[schema.ex L183](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/config/schema.ex#L183)）。このリポジトリのWORKFLOW.mdは `approval_policy: never` で、その場合は**承認要求を自動で許可する**（[app_server.ex L55](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/codex/app_server.ex#L55)）。MCPツールの承認以外の質問には自動で答えず、`blocked` になる。
- **hookは完全に信頼された設定**として扱う。タイムアウトは必須（[SPEC §15.4](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1760)）。
- **ハーネスの硬化**（[SPEC §15.5](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1771)）: トラッカーのデータ、リポジトリの内容、プロンプト、ツール引数を信頼できるとみなさないこと。起動の対象になるissue・プロジェクト・ラベルを絞り、信頼できないタスクが自動でエージェントに届かないようにすること、などを勧める（義務ではない）。
- **GitHubの認証は隔離していない**: エージェントは作業ディレクトリ内で `gh` を使ってpushやマージを行う。WORKFLOW.mdはCodexに `shell_environment_policy.inherit=all` を渡す。トラッカー以外の認証をどこまで子プロセスに見せるかは、運用者の環境次第。

### 3.6 仕様を配布物にする

- SPECは「この節は、コーディングエージェントがconfig層を素早く実装できるよう、意図的に冗長にしてある」と書くチートシートを含む（[§6.4](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L605)）。読み手としてエージェントを想定している。
- 実装のテスト行列（§17）と、適合の定義（§18 "Definition of Done"）を持つ。必須（Core Conformance）、拡張、実環境での確認（skipしたら「skip」と報告し、passにしない）を分ける。
- Elixirの `AGENTS.md` は「実装はSPECの上位集合でよいが、衝突してはならない。挙動を変えたら同じ変更でSPECも更新する」と規定する。
- 二次報道によれば、OpenAIはCodexにこのSPECからTypeScript、Python、Rustの実装を作らせたとしている（会社側の主張。リポジトリには含まれない）。

## 4. 公開されている主張と、実装との対応

| 主張 | リポジトリでの実装 |
| --- | --- |
| エンジニアはCodexを見張らず、仕事を管理する | 人間の操作はトラッカーの状態変更（Todo、Merging、Rework）。オーケストレーターは状態だけを見て起動・停止する |
| エージェントはproof of work（CI、レビュー対応、複雑度分析、説明動画）を添える | CIの確認とレビュー対応は手順書にある。UIに触れる変更では `launch-app` での確認と `github-pr-media` でのメディア添付を指示するが、これらのskillはリポジトリにない。複雑度分析の手順は確認できなかった |
| 承認されたらエージェントが安全にlandする | `land` skillの手順と `land_watch.py`。マージ条件は手順書の指示で、required checksはない |
| 一部のチームでlandしたPRが最初の3週間で500%増えた | 会社側の主張（二次報道経由）。測り方は未確認 |
| harness engineeringを採り入れたコードベースで最もよく動く | Symphonyは検証やレビューの中身を持たず、`WORKFLOW.md` と対象リポジトリの規約・テストに任せる。品質は対象リポジトリのハーネス次第、という設計と一致する |
| 信頼できる環境でのテスト用 | `approval_policy: never` と自動承認、ネットワーク許可という高信頼の設定例。SPECも高信頼の例として自動承認を挙げる |

## 5. 考察

- **ファクトリーの「外枠」だけを製品にしている。** Symphonyが持つのは、作業の取り込み、分離、起動、継続、停止。検証、レビュー、マージの規則は、プロンプトとskillとして利用者のリポジトリに置く。Swampが検証とattestationとマージゲートをコードで固めるのとは逆の割り振り。
- **人間の判断はトラッカーの状態に変換される。** 承認はLinearでカードを動かすだけで、モバイルアプリからでもできる（二次報道の例）。ただし、`Human Review` に来たPRが完了条件を満たしているかを機械が確かめる仕組みはない。最後の砦は人間のレビュー。
- **プロンプトと実装の小さなずれ。** プロンプトは `Human Review` で「待ってポーリングする」と指示するが、この状態はactiveではないので、オーケストレーターはワーカーを止め、再起動もしない。実際の「待ち」はエージェントではなく、オーケストレーターが起動しないことで実現されている。
- **止まらないことを優先した設計。** 失敗はすべてリトライに変え、回数の上限を置かない。人間に入力を求めない。止めるのは、トラッカーの状態とタイムアウトだけ。費用の暴走を防ぐ上限は、並行数とバックオフの間隔だけ。
- **ドッグフーディングは部分的に見える。** `symphony` ラベルとWORKFLOW.mdの存在から、このリポジトリ自身の開発にも使われたと考えられる。ただし、公開リポジトリから見えるのは結果のPRだけ。Linearのworkpadや社内のレビューの仕組みは見えない。

## 6. 未確認・次に調べたいこと

- 公式記事の本文（403で取得できなかった）。500%という数字の測り方、使ったチーム、期間。
- 公開PRのうち、実際にSymphony経由で作られたものの割合（`symphony` ラベルは目安にすぎない）。
- `## Codex Review — <persona>` を投稿するレビューの仕組み、`launch-app`、`github-pr-media` の各skillの中身（公開リポジトリにない）。
- harness engineeringの記事（2026-02-11）の内容と、Symphonyとの具体的なつながり。別の事例ページにする候補。
- 他言語の実装（TypeScript、Python、Rust）が公開されているか。
- 6週間更新がないことが、保守の終了を意味するのか。

## Sources

- ソースコード: https://github.com/openai/symphony @ `be10a1b`
- 活動量（2026-10-29に実行）: `gh search prs --repo openai/symphony --merged --limit 200`（64件、`symphony` ラベル付き22件）、`git log`（mainのコミット47件、`Co-authored-by: Codex` 付き10件）、`symphony` ラベル付きPRのissueコメントとレビューの取得
- [Help Net Security: OpenAI releases Symphony to automate Codex work through Linear（2026-04-28）](https://www.helpnetsecurity.com/2026/04/28/openai-symphony-codex-orchestration-linear/)
- [Better Stack: OpenAI Symphony](https://betterstack.com/community/guides/ai/openai-symphony/)
- [Noqta: OpenAI Releases Symphony](https://www.noqta.tn/en/news/openai-symphony-codex-autonomous-orchestrator-linear-2026)
- OpenAI公式記事（本文未取得）: https://openai.com/index/open-source-codex-orchestration-symphony/
- harness engineering（本文未取得）: https://openai.com/index/harness-engineering/ 、[InfoQ](https://www.infoq.com/news/2026/02/openai-harness-engineering-codex)
