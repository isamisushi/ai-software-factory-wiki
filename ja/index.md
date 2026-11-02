# AI Software Factory Wiki

AIによる「ソフトウェアファクトリー」の事例と、事例に共通するパターンをまとめるwiki。OSSやサービスの事例を、同じ観点で読み比べられるようにする。

ヘッダーの EN / JA で、同じページの英語版と日本語版を切り替えられる。

## 入り口

- [事例一覧](wiki/index.md): OSS、サービス、組織ごとの調査ページ
- [用語一覧（パターン辞書）](wiki/concepts.md): 事例をまたいで出てくるパターン
- [ループで読む](wiki/loops/index.md): 事例ごとのループを1つずつ図にしたもの
- [比較表](wiki/compare.md): 事例を同じ観点で並べた表

## 参考リンク

[Awesome Software Factories](https://github.com/varun1505/awesome-software-factories) は、ソフトウェアファクトリーのプロジェクトと関連資料をまとめたリンク集。追加の事例や調査資料を探すときの参考になる。

## ローカルで見る

```sh
npm install
npm run dev      # http://localhost:5173
```

ローカルのURLは `/ai-software-factory-wiki/` 配下になる。`main` へのpush後、GitHub Actionsがビルドして公開する。[公開サイト](https://isamisushi.github.io/ai-software-factory-wiki/)から閲覧できる。サイドバーは各ページのfrontmatter（`title`、`category`）から自動で作られる。

## 収録状況

| 事例 | 用語ページ |
| --- | --- |
| 10 | 28 |

## 構成

```
wiki/
  index.md        事例一覧
  concepts.md     用語一覧
  compare.md      比較表
  cases/          事例ページ（1事例1ファイル）
  concepts/       用語ページ（1パターン1ファイル）
  loops/          ループの図解（1事例1ファイル）
templates/        事例と用語のテンプレート
```

## 調査の方針

- OSSとして公開されている事例は、ソースコードをcloneして直接読む。記事やポッドキャストは主張として扱い、実装との対応を確かめる。
- 主張には根拠（ファイルパス、コミット、URL）を付ける。確認できなかったことは「未確認」と書く。
- 事例ページで見つけたパターンは用語ページに切り出し、事例と相互にリンクする。

追加の手順は [CLAUDE.md](https://github.com/isamisushi/ai-software-factory-wiki/blob/main/CLAUDE.md) にまとめてある。
