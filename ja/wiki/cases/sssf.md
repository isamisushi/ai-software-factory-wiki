---
title: Super Simple Software Factory
kind: case
org: IndyDevDan
people: [IndyDevDan]
type: [product]
source: oss
license: MIT
repo: https://github.com/disler/super-simple-software-factory
investigated_at: 2026-11-02
investigated_commit: de31374882e7a4e3e5b7bb9bd09e69dc2f779356
concepts: [deterministic-loop-calls-llm, bounded-fix-loop, deterministic-verdict, progress-ledger, execution-vs-acceptance, post-execution-write-audit]
---

# Super Simple Software Factory

[← 事例一覧](../index.md) · [ループの図解](../loops/sssf.md)

調査日: 2026-11-02。対象は `disler/super-simple-software-factory@de31374882e7a4e3e5b7bb9bd09e69dc2f779356`。cloneしたソースを静的に確認した。skillのインストール、LLM呼び出し、利用先への配備は行っていない。

この事例に出てくる概念: [決定的なループからLLMを呼ぶ](../concepts/deterministic-loop-calls-llm.md) · [上限つきの修正ループ](../concepts/bounded-fix-loop.md) · [決定的なverdict](../concepts/deterministic-verdict.md) · [会話の外に置く進捗台帳](../concepts/progress-ledger.md) · [工程の成功と成果物の受け入れを分ける](../concepts/execution-vs-acceptance.md) · [実行後に変更範囲を検査する](../concepts/post-execution-write-audit.md)

## TL;DR

Pythonが工程と受け入れ判定を持ち、Piエージェントが計画・実装・レビューを担当するテンプレート。型付きのJSON出力と検査結果を次の工程へ渡す。ただし、配布時の品質検査は成功終了する仮コマンドである。導入だけで実テストを伴うfactoryが完成するわけではない。[skill](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/SKILL.md)、[quality.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/quality.py)

## 1. 組織・人物

IndyDevDanによるMITライセンスの公開物。取得したHEADから到達する履歴は2026-08-02の1コミット。2026-08-04以降、調査時点までのコミットは0件。単一公開コミットなので、開発過程や自動生成率を測れない。[LICENSE](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/LICENSE)、[固定コミット](https://github.com/disler/super-simple-software-factory/commit/de31374882e7a4e3e5b7bb9bd09e69dc2f779356)

## 2. プロダクト / サービスの概要

skillが利用先へ工程スクリプト、設定、プロンプト、可視化用の部品を配置する。依頼は文章またはファイルで渡す。以下では全テンプレートを同じ挙動とみなさず、`adw_build_review.py` と `adw_build_test.py` を代表として読む。[テンプレート群](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws)

## 3. ソフトウェアファクトリーの仕組み（ソースコードから）

### 3.1 配布物と責任の境界

| ファイル | 役割 |
| --- | --- |
| [SKILL.md](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/SKILL.md) | 起動・生成・運用の手順。記載だけでは強制にならない |
| [adw_build_review.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_review.py) | 実装、レビュー、修正、最終判定 |
| [adw_build_test.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_test.py) | テストをコードで起動し、失敗をbuilderへ返す |
| [agents.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agents.py) | Pi呼び出し、JSON解析、検査の再試行 |
| [gates.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/gates.py) | 出力の主張に対する機械的な検査 |
| [runner.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/runner.py) | 工程の状態とRun全体の受け入れを分ける |
| [permissions.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/permissions.py) | 許可されていない変更の事後検出と復元の試行 |
| [quality.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/quality.py) | 利用先のテスト・lint等を接続する場所 |
| [tracer.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/tracer.py) | SQLiteへ状態・イベント・使用量を記録 |

対象ツリーにはルートのAGENTS.md・CLAUDE.md・CONTRIBUTINGと `.github/workflows` はない。skill本文、reviewerプロンプト、設定、上記の実行経路を調査した。

### 3.2 実装とレビューの往復

builderの後に別のreviewerを呼ぶ。reviewerは要求ごとに実ファイルを読み、未達と根拠を返すよう指示される。`approved` と未達項目・blockingの整合をコードで検査するが、要求が本当に満たされたかを判断するのはモデルである。[reviewer](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/prompt_engineering/reviewer/system.md)、[verdict_consistent](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/gates.py)

`MAX_REVISION_LOOPS = 3` はレビュー最大3回を意味する。3回目の不承認後は修正せず抜けるので、初回実装後の修正は最大2回。定数名や終了メッセージの「revision(s)」だけから、修正3回とは数えない。[実際のループ](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_review.py#L50)

JSON解析失敗とゲート違反による再送は、同じPiセッションへ戻す。新しい担当へ文脈を捨ててやり直す方式ではない。これはレビュー・修正の外側の回数とは別の上限である。[agents.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agents.py)

### 3.3 テスト工程とRunの合格

テストを実行できたことと、テストが合格したことを分ける。`run.finish(accepted=...)` は工程の成功と受け入れ条件の両方を使い、記録と終了コードを決める。[runner.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/runner.py#L114)

ただし `quality.py` のtest・lint・typecheck・buildは、既定では説明文を出す `echo` である。終了コード0を合格にするため、そのままでは実際の品質検査を行わず合格する。利用先のコマンドへの置き換えは必須の導入作業である。[仮コマンドと判定](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/quality.py)

`adw_build_test.py` は最大3回テストし、不合格なら各回の後で修正する。3回目の失敗後にも修正するが、その変更を再テストせず、最後の失敗結果でRunを不合格にする。未検証の修正を合格にする経路ではないが、最終ファイルと最後の検査対象が一致するとは限らない。[テストのループ](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_build_test.py#L55)

### 3.4 変更権限の事後検査と限界

設定はreviewerの `writes: []` と、全体の `protected_files` を定める。`permissions.enforce()` は違反を検出すると復元を試み、工程を失敗にする。ただし、これはOSの隔離や書き込み時の拒否ではない。[設定](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/sssf.config.yaml)、[permissions.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/permissions.py)

検出の基準は追跡ファイルの `git diff HEAD --numstat` と未追跡ファイル名であり、内容のハッシュではない。同じ増減行数のまま内容が変わる場合や、同名の未追跡ファイルの内容変更を区別できない。さらに `enforce()` は解析とゲート検査の後にあり、それ以前の例外経路では呼ばれない。この読み取りから、あらゆる変更を確実に防ぐ仕組みとは評価しない。[snapshot / changed_paths](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/permissions.py#L50)、[呼び出し順](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agents.py#L141)

`diff_matches_claims` も、報告されたファイルの存在を確かめるだけである。実際の差分との完全一致や、報告されなかった変更の不存在を保証しない。[gates.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/gates.py)

### 3.5 状態と費用

Run IDと担当ごとのセッションIDを保存し、SQLiteへ工程と使用量を記録する。エージェントは利用先のリポジトリルートで動く。作業ごとのworktreeやsandboxの自動作成はこの経路にない。費用の記録はあるが、Run全体の予算を超えたら強制停止する処理は今回読んだ経路では未確認。[runner.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/runner.py)、[agents.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agents.py)

## 4. 公開されている主張と、実装との対応

| 方針 | コードで確認した内容と限界 |
| --- | --- |
| コードが工程と合否を持つ | Pythonのループと `finish`。実テストの設定は利用者側 |
| 型付き出力を渡す | JSON解析とゲート検査。内容の正しさとは別 |
| reviewerはコードを変えない | 指示と事後検査。検出漏れの余地と例外経路がある |
| 修正を制限する | レビュー3回・修正2回。テスト系は別の反復構造 |
| 履歴で観測できる | SQLite・出力ファイル。改ざん防止や分散復旧の保証ではない |

## 5. 考察

工程の終了と成果物の受け入れを分ける小さな実装として参考になる。同時に、ゲートの名前、説明文、実際に検査する条件を分けて読む必要がある。既定の合格表示だけを、実テストや独立した検証の証拠にしてはならない。

## 6. 未確認・次に調べたいこと

利用先での実テスト接続、権限検査の故障試験、同じ作業領域で複数Runを動かす場合の競合、障害後の再開、PR・CI・マージへの接続、実運用の成功率は未確認。ソースを読んだ範囲での調査であり、脆弱性の実証や網羅監査ではない。

## Sources

上記リンクを対象コミットに固定した。活動量はcloneした全履歴に対して `git rev-list --count HEAD` と2026-08-04以降の `git log` を集計した。GitHubのマージPR数は未集計。リポジトリの公開頻度と、製品が処理した仕事の量は区別する。
