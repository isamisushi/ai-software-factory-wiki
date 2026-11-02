---
title: 認証情報を持つツールをホスト側で実行する
kind: concept
aliases: [host-side tool execution, credential isolation, dynamic tools]
category: 安全性
seen_in: [symphony]
---

# 認証情報を持つツールをホスト側で実行する

[← 用語一覧](../concepts.md)

## 定義

外部サービスの認証情報が必要な操作を、エージェントのプロセスの中ではなく、それを起動するホスト側のプロセスで実行する。エージェントにはツールの定義と実行結果だけを渡し、トークンそのものは見せない。

## なぜ必要か

- エージェントはプロンプトインジェクションを受けたり、コマンドを誤って実行したりする。トークンが手元になければ、それを持ち出すことも、意図しない範囲で使うこともできない。
- ツールの範囲（どのプロジェクトのどの操作か）を、ホスト側で絞れる。

## 観察のポイント

- 子プロセスの環境変数やファイルから、認証情報が実際に取り除かれているか。
- ツールが変更できる範囲。読み取りだけか、書き込みもできるか。
- 隔離しているのはどのサービスの認証情報か。それ以外（例: GitHub）はエージェントに見えていないか。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Symphony](../cases/symphony.md) | トラッカーを操作するツール（Linearなら `linear_graphql`）を、Codexのセッション開始時に動的ツールとして登録し、Symphonyのホスト側で設定された認証情報で実行する。アダプタが宣言した秘密の環境変数名は、子プロセスの環境から外し、さらに `unset` してから起動する。SPECは、`WORKFLOW.md` に認証情報を直接書かないよう求める（子プロセスから読めるため）。一方で、エージェントはpushやマージに作業ディレクトリ内の `gh` を使うので、GitHubの認証は同じ方法では隔離していない | [SPEC §10.5](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1065)、[SPEC §15.3](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1748)、[app_server.ex](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/codex/app_server.ex#L221) |

## 関連

- [Trust rootのレビュー](trust-root-review.md)
- [作業ごとに分離した作業領域](isolated-workspace.md)
- [入力の制御](closed-contribution.md)
