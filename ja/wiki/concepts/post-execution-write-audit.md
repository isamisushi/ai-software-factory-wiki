---
title: 実行後に変更範囲を検査する
kind: concept
aliases: [post-execution write audit, post-hoc permission check]
category: 安全性
seen_in: [sssf]
---

# 実行後に変更範囲を検査する

[← 用語一覧](../concepts.md)

## 定義

エージェントを動かす前後のファイル状態を比較し、許可された範囲以外の変更を検出する。違反した場合は成果物を受け入れず、復元を試みる。書き込みが起きる前に拒否する仕組みとは区別する。

## なぜ必要か

「読むだけ」というプロンプトや、編集ツールを渡さない設定だけでは、変更を防げない。シェルなど別の経路でファイルを書き換えられるため、実際に何が変わったかを調べる必要がある。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [SSSF](../cases/sssf.md) | 担当別の `writes` と全体の `protected_files` に対して、実行前後の変更を照合する。検出した違反では復元を試み、`PermissionBreach` を送出する | [permissions.py](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/permissions.py#L163) |

## 観察のポイントと限界

比較する値が内容そのものか、ハッシュか、行数やファイル名だけかを確認する。SSSFは追跡ファイルの増減行数と未追跡ファイル名を使う。同じ値のまま内容が変わった場合は区別できない。[snapshot](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/permissions.py#L50)

失敗した実行でも検査に到達するか、元からあった未コミット変更を保持して復元できるかも調べる。SSSFはJSON解析とゲート検査の後に権限を検査するため、その前の例外経路では検査に到達しない。[呼び出し順](https://github.com/disler/super-simple-software-factory/blob/de31374882e7a4e3e5b7bb9bd09e69dc2f779356/.claude/skills/sssf/templates/adws/adw_modules/agents.py#L141)

事後検査では、実行中に読まれた情報や外部へ送った要求を取り消せない。ファイルの復元に成功しても、実行環境の安全な隔離を証明したことにはならない。

## 関連

- [作業ごとに分離した作業領域](isolated-workspace.md): 作業間でファイルが混ざることを抑える。
- [Trust rootのレビュー](trust-root-review.md): 検証機構自体の変更を判断する。
- [古い実行の書き込みを拒否する](fenced-authority.md): 保存先で古い担当の書き込みを拒否する。
