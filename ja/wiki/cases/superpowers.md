---
title: Superpowers
kind: case
org: Prime Radiant
people: [Jesse Vincent, Drew Ritter]
type: [product, dogfooding]
source: oss
license: MIT
repo: https://github.com/obra/superpowers
investigated_at: 2026-10-29
investigated_commit: 2ce8aa1
concepts:
  - workflow-bootstrap-injection
  - fresh-context-subagents
  - bounded-fix-loop
  - progress-ledger
  - skills-as-tested-code
  - human-checkpoints
  - adversarial-review
  - closed-contribution
  - fix-the-machine
  - isolated-workspace
---

# Superpowers（Prime Radiant / obra）

[← 事例一覧](../index.md) · [ループの図解](../loops/superpowers.md)

調査日: 2026-10-29
調査対象コミット: `obra/superpowers@2ce8aa1`（2026-10-21、`main` のリリース v7.0.1）。開発ブランチ `dev`（`b58deb3`、`main` より317コミット先行）は差分の確認だけ行った（後述）。

**この事例に出てくる概念**: [ワークフローのブートストラップ注入](../concepts/workflow-bootstrap-injection.md) · [タスクごとの新しいサブエージェント](../concepts/fresh-context-subagents.md) · [上限つきの修正ループ](../concepts/bounded-fix-loop.md) · [会話の外に置く進捗台帳](../concepts/progress-ledger.md) · [skillをテストされるコードとして扱う](../concepts/skills-as-tested-code.md) · [人間のチェックポイント](../concepts/human-checkpoints.md) · [Adversarial review](../concepts/adversarial-review.md) · [入力の制御](../concepts/closed-contribution.md) · [機械を直す](../concepts/fix-the-machine.md) · [作業ごとに分離した作業領域](../concepts/isolated-workspace.md)

## TL;DR

- **ソフトウェアファクトリーにあたるか**: あたる。ただしSwampのような「組織のリポジトリに据え付けたライン」ではなく、**1人の開発者のエージェントセッションの中に、設計→計画→実装→レビュー→統合の工程を持ち込むプラグイン**（工程の型を配るプロダクト）である。CIやサーバー側のゲートはなく、工程の大半はskill（手順書）の指示で回る。
- 工程の中心は `subagent-driven-development`（SDD）。コントローラー役のエージェントが、計画の各タスクを**新しい文脈のサブエージェント**に実装させ、タスクごとに別のレビュアー（spec準拠と品質の2つの判定）を通し、失敗したら**最大5ラウンドの修正ループ**を回す。進捗は会話ではなく**ファイルの台帳**に記録し、コンテキスト圧縮後もそこから再開する。
- 人間が判断するのは、設計の承認（HARD-GATE）、計画のレビューと実行方式の選択、最後の統合方法の選択。それ以外は「止まらずに進め、迷ったら自分で裁定して台帳に書け」と指示している。
- Superpowers自体もSuperpowersで作っている（`docs/superpowers/specs/` にbrainstormingで作った設計書が並ぶ）。skillを「振る舞いを決めるコード」とみなし、変更にはサブエージェントでの圧力テストと、別リポジトリの評価ラボ（Quorum）での実エージェント評価を求める。
- 強制の多くはプロンプトによる。コードで強制しているのは、セッション開始時のskill注入（hook）、レビュー差分の範囲チェック、Native実行の `task-done` によるテスト成功時の完了記録など一部に限られる。

## 1. 組織・人物

| 項目 | 内容 |
| --- | --- |
| 組織 | Prime Radiant（READMEのCommunity節。商用サポートの窓口もある） |
| 中心人物 | Jesse Vincent（obra）。直近200コミットのうち145件。次いでDrew Ritter（41件） |
| 公開 | 2025-10-09にリポジトリ作成。同日に[リリース告知](https://blog.fsck.com/2025/10/09/superpowers/) |
| 規模 | GitHubのstar約30.8万、fork約2.7万（2026-10-29に `gh repo view` で取得） |
| ライセンス | MIT |
| 配布 | Claude Codeの公式プラグインマーケットプレイス、Codexのプラグインマーケットプレイスほか、Cursor、Gemini CLI、Copilot CLI、OpenCode、Pi、Kimi、Hermes、Museなど十数種類のハーネスに対応（[README](https://github.com/obra/superpowers/blob/2ce8aa1/README.md)） |

## 2. プロダクトの概要

READMEの説明は「coding agentのための完全なソフトウェア開発方法論。組み合わせ可能なskillと、それをエージェントに使わせる初期指示でできている」。

基本の流れ（[README「The Basic Workflow」](https://github.com/obra/superpowers/blob/2ce8aa1/README.md)）:

1. `brainstorming`: 作る前に意図を聞き出し、設計書にまとめて承認を得る。
2. `using-git-worktrees`: 隔離された作業ツリーを作り、テストのベースラインを確かめる。
3. `writing-plans`: 2〜5分の粒度のタスクに分けた実装計画を書く。
4. `subagent-driven-development` または `executing-plans`: 計画を実行する。
5. `test-driven-development`: 実装中のRED-GREEN-REFACTOR。
6. `requesting-code-review`: レビューを依頼し、重大度で分類する。
7. `finishing-a-development-branch`: テストを確かめ、マージ / PR / 保留を人間に選ばせ、worktreeを片付ける。

このほか、`systematic-debugging`、`verification-before-completion`、`receiving-code-review`、`dispatching-parallel-agents`、`writing-skills`、`diagnosing-superpowers` がある（`skills/` に15個）。

「READMEの説明では、数時間自律して計画から外れずに作業することも珍しくない」とあるが、これは会社側の主張で、測定方法は書かれていない。

## 3. ソフトウェアファクトリーの仕組み（ソースコードから）

```
hooks/session-start              セッション開始時に using-superpowers の全文を文脈へ注入
skills/using-superpowers/        「1%でも当てはまるならskillを使え」という起動規則
skills/brainstorming/            意図の聞き出し、設計書、builder check、HARD-GATE
skills/writing-plans/            計画書の形式（Global Constraints、Review Focus、Interfaces）
skills/subagent-driven-development/
  SKILL.md                       コントローラーの手順（止まる条件、モデル選択、タスクループ）
  implementer-prompt.md          実装者サブエージェントのテンプレート
  task-reviewer-prompt.md        タスクレビュアーのテンプレート（spec準拠 + 品質）
  re-review-prompt.md            修正後の範囲を絞った再レビュー
  references/                    preflight / fix-loop / final-review / resuming など
  scripts/                       sdd-workspace / task-brief / review-package
skills/executing-plans/          同じ文脈で実装。task-doneでテスト成功時だけ完了を記録
  scripts/                       task-start / task-done
skills/writing-skills/           skillをTDDで書く方法（圧力テスト）
AGENTS.md / PULL_REQUEST_TEMPLATE.md   エージェントが書くPRへの条件
tests/                           プラグイン基盤のテスト（claude -p などで実行）
docs/superpowers/specs/          Superpowers自身の設計書（brainstormingの出力）
```

`.github/workflows/` は存在しない。このリポジトリにはCIがなく、テストもskillの評価もメンテナーが手元で実行する。

### 3.1 起動: hookで工程の入口を強制する

`hooks/hooks.json` が `SessionStart`（startup / clear / compact）で [`hooks/session-start`](https://github.com/obra/superpowers/blob/2ce8aa1/hooks/session-start#L41) を実行し、`using-superpowers` の全文を `<EXTREMELY_IMPORTANT>` で包んで文脈に入れる。中身は「1%でも当てはまる可能性があればskillを呼べ。質問やコードの探索より先に」（[using-superpowers L11](https://github.com/obra/superpowers/blob/2ce8aa1/skills/using-superpowers/SKILL.md#L11)）という規則と、それを言い逃れる思考の一覧（Red Flags表）。

AGENTS.mdは、新しいハーネスの対応が「本物」かどうかの受け入れテストを決めている。きれいなセッションで `Let's make a react todo list` と送り、コードを書く前に `brainstorming` が自動で起動すること（[AGENTS.md L84](https://github.com/obra/superpowers/blob/2ce8aa1/AGENTS.md#L84)）。skillファイルをコピーしただけの対応は認めない。**工程の入口を、エージェントの気分ではなくhookで確保する**のがこの事例の土台になっている。

### 3.2 設計: 承認までは作らない

`brainstorming` は、意図を聞き出し、2〜3の作り方を示して人間に選ばせ、設計書を書いて承認を得るまで実装を禁じる（[HARD-GATE](https://github.com/obra/superpowers/blob/2ce8aa1/skills/brainstorming/SKILL.md#L247)）。

- 依頼にすべてが含まれていれば（「アイコンをコーンフラワーブルーに」）その場でやる。人間が質問を断れば、このskillは終わり、ゲートもなくなる。
- プロジェクト規模なら、設計書を `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` にコミットする。人間に渡す前に、新しいサブエージェントに「この設計書だけで計画を立てられるか」を読ませる（builder check）。質問は「既に答えがある / 自分で決めてよい / 人間にしか答えられない」に分け、最後の山だけを1回だけ人間に聞く。

### 3.3 計画: 実装者が自分では決められないことだけを書く

`writing-plans` の計画書は、実装者が「このコードベースも仕様も見ていない」前提で書く（[writing-plans](https://github.com/obra/superpowers/blob/2ce8aa1/skills/writing-plans/SKILL.md)）。

- 冒頭に **Spec**（計画は仕様から論じるもので、仕様と一緒に渡す）、**Global Constraints**（バージョンや命名など全タスクを縛る値を仕様から転記）、**Review Focus**（仕様は触れていないが利用者を困らせそうな入力・失敗を5つ挙げ、それぞれのテストを担当タスクに足す）を置く。
- 各タスクに対象ファイル、**Interfaces**（前のタスクから使うもの / 後のタスクに渡すもの）、失敗するテスト → 失敗を確認 → 最小の実装 → 成功を確認 → コミット、のステップを書く。
- 自己レビューで「計画がコードの書き写しになっていないか」（計画の長さを仕様と比べる）も確かめる。
- 計画ができたら人間にレビューを頼み、実行方式（Subagent-driven か、同じセッションで実行するNative）を選んでもらう（[Execution Handoff](https://github.com/obra/superpowers/blob/2ce8aa1/skills/writing-plans/SKILL.md#L179)）。

### 3.4 実行: コントローラーと使い捨てのサブエージェント

SDDでは、メインのエージェントはコントローラーに徹する（[SKILL.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md)）。

| 役割 | やること | 文脈 |
| --- | --- | --- |
| コントローラー | タスクを渡す、レビューを出す、台帳をつける、裁定する。自分では修正しない | 計画全体とタスク間の事情を持つ |
| 実装者 | 1タスクを実装・テスト・コミット・自己レビューし、報告ファイルを書く。サブエージェントを出してはいけない | `task-brief` が抜き出したタスク本文、前のタスクのInterfaces、裁定 |
| タスクレビュアー | 差分ファイルを1回読み、spec準拠（✅/❌/⚠️）と品質（Approved / Needs fixes）を返す。読み取り専用 | brief、報告、`review-package` が作った差分 |
| 最終レビュアー | ブランチ全体を、使える中で最も強いモデルでレビューする | ブランチ全体の差分、台帳の先送り項目 |

工夫している点:

- **報告を信用しない**: レビュアーには「実装者の報告は未検証の主張。『YAGNIなので省いた』などの理由づけも自己採点にすぎない」と指示する（[task-reviewer-prompt L64](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/task-reviewer-prompt.md#L64)）。
- **文脈を汚さない**: タスク本文・差分・報告はファイルで受け渡し、コントローラーの文脈に貼り付けない。過去のタスクの要約を後のタスクに貼るのも禁止（実セッションで42k文字のうち99%が貼り付けた履歴だった、という観察が書かれている）。
- **モデルを役割で選ぶ**: 計画にコードが全部書いてあれば実装は最安のモデル、統合や判断は標準、最終レビューは最強。モデル指定を省くとセッションの高価なモデルを継承してしまうので、必ず明示する（[Model Selection](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md#L139)）。
- **止まらない**: タスクの間で人間に確認しない。止まってよいのは、取り返しのつかない操作、セキュリティに関わる操作、worktreeの外への副作用（マージ、共有ブランチへのpush、公開）、どの道も推測になるほど計画が壊れているとき、の4つだけ（[L27](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md#L27)）。それ以外は `Ruling: <決めたこと> — <理由> — <間違っていた場合のコスト>` を台帳に書いて進む。
- 実装者は並列に出さない（衝突するため）。

`executing-plans`（Native）は同じ計画を1つの文脈で実装する。タスクごとのレビューを省き、最後にサブエージェントが使えれば最強モデルの新しいレビュアーを1回出す。使えなければ自分で別のレビュー工程を行い、その限界を台帳と最終報告に書く。Critical / Importantは実装者自身が1回の修正パスで直し、各修正をRED→GREENと全テストで検証する。再レビューは禁止で、SDDの最終レビューとは手順が異なる（[Final Review](https://github.com/obra/superpowers/blob/2ce8aa1/skills/executing-plans/SKILL.md#L234)）。

### 3.5 検証と修正ループ

- **タスクレビュー**: spec ❌、CriticalかImportantの指摘、確認済みの⚠️があれば原則として修正ループに入る。ただし計画の要求と衝突する指摘は、ループに入る前にコントローラーが仕様を基準に裁定し、台帳に記録してから対応する（[fix-loop L14](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/references/fix-loop.md#L14)）。Minorは台帳に「deferred」として書き、最終レビューに回す。
- **修正ループ**（[fix-loop.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/references/fix-loop.md#L21)）: 1ラウンド = 修正1回 + 範囲を絞った再レビュー1回。最大5ラウンド。1〜3は元の実装者を再開し、4〜5は一段強いモデルの新しい実装者に交代させる。再レビューは修正差分と元の指摘だけを見る（毎回フルレビューすると新しい指摘が出続けて収束しないため）。5ラウンドで残った指摘はコントローラーが裁定し、「保留（理由つき）」か「後続を止めないための最小の決定」として台帳に書く。
- **SDDの最終レビュー**（[final-review.md](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/references/final-review.md#L17)）: 指摘はまとめて1つの修正サブエージェントに渡し、範囲を絞った再レビューは1回だけ。2回目の修正ウェーブはない。残りは裁定し、最後のメッセージに台帳の `Ruling:` 行をすべて「Rulings I made」として並べる。
- **完了を名乗る前の証拠**: `verification-before-completion` は「新しい検証の証拠なしに完了を主張しない」（[Iron Law](https://github.com/obra/superpowers/blob/2ce8aa1/skills/verification-before-completion/SKILL.md#L14)）。「エージェントが成功と報告した」は証拠にならず、VCSの差分を見よ、としている。
- **TDD**: 「失敗するテストより先に本番コードを書いたら、消してやり直す」（[TDD L31](https://github.com/obra/superpowers/blob/2ce8aa1/skills/test-driven-development/SKILL.md#L31)）。ただし実装者テンプレートでは「タスクがTDDを指示していれば」という条件つき。
- **デバッグ**: 修正が3回失敗したら、仮説ではなく設計を疑うよう指示する（[systematic-debugging L195](https://github.com/obra/superpowers/blob/2ce8aa1/skills/systematic-debugging/SKILL.md#L195)）。

SDDのレビューの合否は、コントローラー（LLM）がレビュアーの文章を読んで判断する。レビュー結果をSwampの `VERDICT: pass` のように機械的に判定するスクリプトはない。Nativeのテスト結果に応じた完了記録は、次節の `task-done` が担う。

### 3.6 状態: 会話ではなく台帳とgitに置く

「会話の記憶は圧縮を越えて残らない。実セッションでは、場所を見失ったコントローラーが完了済みのタスク列をまるごと再実行した。これが観察された中で最も高くつく失敗」（[SKILL.md L108](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/SKILL.md#L108)）。

- `scripts/sdd-workspace` が計画ごとに `.superpowers/sdd/<plan>/` を作り、台帳 `progress.md`、brief、報告、レビュー用差分をそこに置く。1行目に計画のパスを書き、別の計画の台帳を自分のものと誤読しないようにする。git管理外にする `.gitignore` もスクリプトが置く。
- 台帳には完了（`Task N: complete (commits a..b, review clean)`）、修正ラウンド、先送り、裁定を書く。圧縮後は「自分の記憶より台帳と `git log` を信じる」。
- `review-package` は、BASEがHEADの祖先でないとき、範囲が空のときに終了コード3で止まる（[L27-28](https://github.com/obra/superpowers/blob/2ce8aa1/skills/subagent-driven-development/scripts/review-package#L27)）。ただし `HEAD~1` も祖先かつ非空なら受け付けるため、タスク全体を含むかは検査しない。取りこぼしを防ぐには、タスク開始時に記録したBASEを正しく渡す必要がある。
- Nativeの [`scripts/task-done`](https://github.com/obra/superpowers/blob/2ce8aa1/skills/executing-plans/scripts/task-done#L39) は、渡されたテストコマンドを実行し、成功時だけ完了行を台帳へ追記する。失敗時はログを残して終了し、完了は記録しない。**このスクリプトを使った場合の条件分岐はコードによる**が、適切なテストを渡すことや、スクリプトを使い台帳を直接書き換えないことは手順に依存する。

### 3.7 統合: 人間が選ぶ

`finishing-a-development-branch` は、全テストが通らなければ止まり、通れば「ローカルでマージ / pushしてPR / そのまま残す」の3択を示して人間の答えを待つ（[Step 4](https://github.com/obra/superpowers/blob/2ce8aa1/skills/finishing-a-development-branch/SKILL.md#L53)）。作業の破棄は、人間が明示的に頼んだときだけ。ローカルマージ後もテストを再実行し、失敗したらworktreeを消さずに止まる。

### 3.8 Superpowers自体の開発（ドッグフーディング）

- **入力**: PRは受け付けるが条件が厳しい（[AGENTS.md](https://github.com/obra/superpowers/blob/2ce8aa1/AGENTS.md)）。モデル・ハーネス・バージョン・全プラグインの開示、人間が自分の言葉で書いた200語以内の要約、人間が差分全体を見たこと、重複PRの調査、実際に起きた問題であること。他人が立てたissueをエージェントが直すPRは、メンテナーが頼んでいない限り受け付けない。`main` ではなく `dev` に出す。
- **skillの変更には評価が要る**: 「skillは散文ではなく、エージェントの振る舞いを形作るコード」。`writing-skills` でRED（skillなしで失敗する様子を見る）→ GREEN（skillを書いて従うのを見る）→ REFACTOR（新しい言い逃れを塞ぐ）を回し、PRには前後の評価結果を載せる。調整済みの文言（Red Flags表、言い逃れ一覧、「your human partner」という呼び方）は証拠なしに変えさせない。
- **評価ラボ**: 別リポジトリ [prime-radiant-inc/superpowers-evals](https://github.com/prime-radiant-inc/superpowers-evals)（調査時 `e64684c`）の **Quorum** が、Claude Code、Codex、Geminiなどの実際のCLIを動かし、QA役のエージェント（Gauntlet）が利用者のように会話し、非公開の受け入れ基準と決定的な事後チェックで採点する。シナリオは95個（例: `code-review-catches-planted-bugs` はSQLインジェクションを仕込んだ差分でレビュアーがCritical/Importantとして指摘し、マージを承認しないかを見る）。Superpowersありの群と `superpowers: none` の群を比べるsuiteもある。live評価はエージェントを権限確認なしで動かすため、公開CIでは実行せず、信頼されたメンテナーが手元か専用のappliance上で実行する。
- **設計書が残っている**: `docs/superpowers/specs/` に、修正ループの再設計（2026-07-15、「承認済み設計。Jesseとbrainstormした」）や、計画ごとの作業領域の評価結果（2026-07-06、sonnetのサブエージェント5体×各群で圧力テストし、全回答を人手で採点）がある。修正ループの上限5回は「Jesseの判断」と明記され、無限のレビューループという実セッションでの観察から生まれた。
- **ブランチ名**: `codex/...`、`fix/2081-...`、`exp/loop-econ-r` などが並び、エージェントでの作業やコスト実験をブランチ単位で進めている様子がうかがえる（運用の詳細は未確認）。

## 4. 公開されている主張と、実装との対応

| 主張 | 実装 | 評価 |
| --- | --- | --- |
| skillは自動で起動する。特別なことをしなくてよい（README） | SessionStart hookで `using-superpowers` を注入し、起動規則を常に文脈に置く | hookがあるハーネスでは実装どおり。起動するかどうかの最終判断はモデル次第で、Quorumのtriggering系シナリオで測っている |
| 数時間、計画から外れずに自律して作業することも珍しくない（README） | 「止まらない」指示、4つの停止条件、裁定の台帳、圧縮後の再開手順 | 仕組みはある。時間や逸脱率の測定値はリポジトリにない（会社側の主張） |
| PRの却下率は94%（AGENTS.md） | 2026-10-29時点の検索で、マージ済み223件、未マージでクローズ965件、オープン176件。クローズ済みのうち未マージは約81% | 会社側の主張。集計の範囲や期間の違いで数字は変わる。メンテナー自身のPRもマージ数に含まれる |
| Critical issueは先に進むのを止める（README） | SDDは原則修正ループへ進むが、計画と衝突する指摘はループ前に裁定する。5ラウンド後も裁定で保留にできる | 「必ず止まる」ではない。裁定を台帳に残して進む経路があり、最後に人間へ列挙する |
| テストを先に書く。前に書いたコードは消す（TDD skill） | skillの指示。実装者テンプレートでは「タスクが指示すれば」TDD | 手順書の強制。実装者が守ったかは報告のTDD証拠とレビューで見る |

## 5. 考察

- **ファクトリーの置き場所が違う**: Swampはリポジトリ・CI・サーバーにゲートを持つ。Superpowersは**開発者のエージェントセッションの中**に工程を持ち込み、どのリポジトリにも持ち運べる。その代わり、サーバー側でマージを止めるゲートや、記録の改ざん耐性はない。ローカルには差分範囲チェックやNativeのテスト成功時だけ完了を記録するスクリプトがあるが、その利用自体は手順に依存する。両者は競合というより、層が違う。
- **強制の手段がプロンプト**: hookと一部のスクリプトを除けば、強制は手順書の言葉による。だからこそ、言い逃れの表（Red Flags、Rationalizations）を各skillに置き、圧力テストとQuorumでその言葉が効くかを測る。「skillの文言そのものをテスト対象のコードとして扱う」のが、この事例の品質保証の中心になっている。
- **文脈の経済**: 新しいサブエージェント、ファイルでの受け渡し、モデルの使い分け、範囲を絞った再レビュー、最終修正を1回にまとめる、などの規則の多くは、品質だけでなくトークンと時間のコストから来ている（「最終レビューの修正ウェーブが全タスクの合計より高くついた」など）。Quorumにも `cost-*` シナリオがある。
- **人間の関わり方**: 入口（設計の承認、計画のレビュー）と出口（統合方法の選択）に集中させ、実行中は止めない。実行中にAIが代わりに決めたことは「Rulings I made」として出口でまとめて見せる。決定を隠さず、後から人間がやり直せるようにする設計。
- **Swampとの共通点**: 計画の承認を人間が持つ、状態を会話の外に置いて圧縮に耐える、skillを評価する（Swampはtessl + promptfoo、SuperpowersはQuorum）、失敗の種類ごとに仕組みの側を直す。

## 6. 未確認・次に調べたいこと

- `dev` ブランチ（`main` より317コミット先行）。v7.0.1以降の差分のうち、skillとhookの差分は `hooks/` の3ファイルだけだった（`git diff --stat main origin/dev -- skills hooks AGENTS.md`）。残りはテストやドキュメントと思われるが、全体は読んでいない。
- Quorumの実際の評価結果（通過率、Superpowersあり/なしの差、コスト）。`results/` やダッシュボードは中身を確認していない。
- 修正ループや最終レビューの上限が、実セッションでどの程度守られているか（守られているかを測るシナリオの有無を含む）。
- 費用の上限: skillにトークンや金額の上限はない。Quorumのcampaignは試行回数・実行時間・予備の上限で区切り、金額のしきい値では止めない（READMEの記述。実装は未確認）。
- `superpowers-private`（ABOUT.mdが評価対象として挙げる非公開リポジトリ）と公開版の関係。
- Prime Radiantの組織、資金、商用サービスの内容。
- 活動量の内訳: 2026-09-29以降、マージ済みPRは18件（17件がobra。リリースや `dev` へのマージを含む）、作成されたPRは92件（オープン55、未マージでクローズ19）。`dev` のコミットは43件で、`Co-Authored-By: Claude Fable 5.1` が20件、`Muse Spark` が8件。PR数やco-author表記だけでは自律度や品質は評価できない。

## Sources

- ソースコード: https://github.com/obra/superpowers @ `2ce8aa1`（`dev` @ `b58deb3` は差分のみ）
- 評価ラボ: https://github.com/prime-radiant-inc/superpowers-evals @ `e64684c`（README、ABOUT.md、`scenarios/`）
- [Superpowers リリース告知（2025-10-09）](https://blog.fsck.com/2025/10/09/superpowers/)（READMEからのリンク。本文は今回読んでいない）
- PR数: `gh search prs --repo obra/superpowers --merged --merged-at ">=2026-09-29"`、`--created ">=2026-09-29"`、GitHub Search APIの `is:pr is:merged` / `is:closed is:unmerged` / `is:open`（2026-10-29に実行）
- コミット: `git log origin/dev --since=2026-09-29` の作者と `Co-Authored-By`
