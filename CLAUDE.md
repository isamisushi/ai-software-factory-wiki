# AI Software Factory Wiki

This wiki collects research on AI software factories.
Write the default pages in plain English under `README.md` and `wiki/`.
Keep matching Japanese pages under `ja/index.md` and `ja/wiki/`.
Use the same file names, facts, evidence links, and explicit anchor IDs in both languages.
Update both versions when research changes.

## 事例を追加する手順

1. OSSならソースをcloneして直接読む（scratchpadにclone）。最初に読むのは CLAUDE.md / AGENTS.md、`.claude/skills/`、CIの設定、レビュープロンプト、CONTRIBUTING。
2. 活動量を測る（例: `gh search prs --repo <repo> --merged --merged-at ">=<日付>"`、コミットの `Co-authored-by`）。
3. `templates/case.md` をもとに `wiki/cases/<slug>.md` を作る。調査日とコミットを必ず書く。
4. 新しいパターンを見つけたら、`templates/concept.md` をもとに `wiki/concepts/<slug>.md` を作る。既存のパターンにあたるなら、その用語ページの「事例での実装」表に行を足し、`seen_in` を更新する。
5. `wiki/loops/<slug>.md` にループの図を描く（下の「ループの図」を参照）。
6. 次の4つを更新する: `wiki/index.md`、`wiki/concepts.md`（「事例」列）、`wiki/compare.md`（列を追加）、`README.md` の収録状況。

## ループの図

- Mermaidの `flowchart` で描く。1つの図には1つのループだけを描く。
- 中に別のループがあるときは、中身を描かずに参照の箱 `[["ループX: 名前"]]:::loopref` を置き、別の図で説明する。
- ページの最初に、名前だけの関係の地図と、「回る単位 / 評価と戻り先 / 抜ける条件」の表を置く。包含・実行順序・フィードバックを区別し、根拠のない入れ子を描かない。
- 全体の工程、反復実行、評価で作り方を変える修正ループを区別する。ループ名と分解が調査者の整理なら明記する。
- コードで強制する条件、手順書の指示、推論、未確認を分ける。停止・回数・費用の上限も調べ、確認できなければ補わない。
- ソースのコメントと実装が違う場合は実装を優先する。根拠は調査対象コミットに固定したリンクを添える。
- 子ループの参照箱の下には、該当図へのMarkdownリンクを置く。見出しには安定したID（例: `{#loop-b}`）を付ける。
- 色の分け方は `wiki/loops/index.md` の凡例に合わせる。人間の判断は `:::human`、機械のゲートは六角形 `{{"..."}}:::gate`、差し戻しは点線 `-.->` で描く。
- 長いラベルは `<br/>` で区切る。描いたら、ブラウザで文字が切れていないか確かめる。

## ローカルサイト

- VitePressで表示する（`npm run dev`）。`main` へのpush後、GitHub ActionsでGitHub Pagesに公開する。
- サイドバーは `.vitepress/config.mjs` が `wiki/cases/`、`wiki/concepts/`、`wiki/loops/` のfrontmatterから作る。英語版の `category` は `Input / Process / Verification / Safety / Architecture / Operations`、日本語版は `入力 / プロセス / 検証 / 安全性 / アーキテクチャ / 運用` のどれかにする。
- ページを追加したら `npx vitepress build` を実行し、リンク切れがないことを確かめる。

## 書き方

- 主張には根拠（ファイルパス、URL）を付ける。確認できなかったことは「未確認」と書く。
- 会社側の数字（トークン削減率など）は「会社側の主張」と明記する。
- slugは英小文字とハイフン。リンクは相対パスで書く（GitHub上でそのまま読めるようにする）。
