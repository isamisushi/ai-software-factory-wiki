---
title: 入力の制御
kind: concept
aliases: [input control, closed contribution, 条件付き受け入れ]
category: 入力
seen_in: [swamp, superpowers, symphony, gh-aw]
---

# 入力の制御

[← 用語一覧](../concepts.md)

## 定義

ファクトリーが受け入れる変更の出所や、人間の関与に条件を設ける方針。ここでは「入力の制御」を上位概念として、次の2つを区別する。

- **外部PRの拒否（Closed contribution）**: コードは自分たちが管理する人間・エージェントが作り、外部からはバグ報告や要望だけを受け取る。Swampが該当する。
- **外部PRの条件付き受け入れ**: 外部コードも受け取るが、使用モデル等の開示や人間による差分確認を条件にする。Superpowersが該当する。

## なぜ必要か

エージェントは人間がレビューしきれない速さで変更を作れる。大きな変更が人間によるものかエージェントによるものかは見分けられない。両事例では、このレビュー負荷を理由に、外部PRの拒否や受け入れ条件の設定を行っている。こうした条件だけで安全や品質が保証されるわけではない。

## 事例での実装

| 事例 | 実装 | 根拠 |
| --- | --- | --- |
| [Swamp](../cases/swamp.md) | 社員以外のPRは即クローズする。issueはプロンプトインジェクションや悪意がないか確認してから社内で実装する。報告者はco-authorとしてクレジットされる | `CONTRIBUTING.md`、ci.ymlの `auto-merge` はforkからのPRを対象外にしている |
| [Superpowers](../cases/superpowers.md) | 外部PRは受け付けるが、条件で絞る。モデル・ハーネス・全プラグインの開示、人間が自分の言葉で書いた要約、人間が差分全体を見たこと、実際に起きた問題であることを求める。他人のissueをエージェントが直すPRや、まとめて出すPRは閉じる。新しいskillは原則受け付けない。閉じる判断はメンテナーが行い、CIのゲートはない | [AGENTS.md](https://github.com/obra/superpowers/blob/2ce8aa1/AGENTS.md)、[PULL_REQUEST_TEMPLATE.md](https://github.com/obra/superpowers/blob/2ce8aa1/.github/PULL_REQUEST_TEMPLATE.md) |
| [Symphony](../cases/symphony.md) | 入力は「エージェントを起動するissue」の側で絞る。active/terminalな状態、必須ラベル、Linearの担当者（`assignee`、`me` 可）、`Todo` で未完了のblockerがないこと。`Backlog` は対象外で、人間が `Todo` に移したものだけを扱う。SPECは、信頼できないissueが自動でエージェントに届かないよう、起動の対象を絞ることを勧める（義務ではない） | [SPEC §8.2](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L754)、[SPEC §15.5](https://github.com/openai/symphony/blob/be10a1b/SPEC.md#L1771)、[linear/client.ex](https://github.com/openai/symphony/blob/be10a1b/elixir/lib/symphony_elixir/linear/client.ex#L496) |
| [GitHub Agentic Workflows](../cases/gh-aw.md) | 非コアメンバーの直接PRを受け付けず、issueに詳細な計画を出し、コアチームがエージェントで実装する貢献方針。 | [固定コミットの実装調査](../cases/gh-aw.md) |

Swampは「受け取らない」、Superpowersは「受け取るが、人間の関与と出所の開示を条件にする」。どちらも、エージェントが大量に作る変更をレビューしきれないことを理由に挙げている。

## 関連

- [Issue lifecycleのステートマシン](issue-lifecycle-state-machine.md)
- [Trust rootのレビュー](trust-root-review.md)
