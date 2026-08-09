---
title: このテンプレートについて
description: Astro のブログテンプレートに最初から入っている機能と、使い始めるまでの手順をまとめます。
pubDate: 2026-08-01
tags:
  - お知らせ
  - astro
# author: mimoz
---

このテンプレートは、Astro でブログを始めるための最小限の土台です。
記事の管理、一覧、タグ、RSS、OG 画像の生成までが最初から動きます。

## 使い始める

1. `src/config.ts` の TODO を書き換える
2. `astro.config.mjs` の `site` と `base` を自分のサイトに合わせる
3. `src/content/authors.json` に自分の情報を書く
4. このファイルを含むサンプル記事を消して、記事を書き始める

## 記事を追加する

`src/content/posts/` に Markdown ファイルを置くだけです。
ファイル名がそのまま URL の slug になります。

```md
---
title: 記事のタイトル
description: 一覧と OGP に出る説明文
pubDate: 2026-08-01
tags:
  - astro
author: mimoz
---

本文をここに書く。
```

`draft: true` を付けた記事は、開発サーバーでは表示されますが、
本番ビルドの成果物には含まれません。

## 入っているもの

- 記事一覧（ページネーション付き）とタグ別ページ
- 目次（読んでいる位置をハイライト）
- 読了時間の表示
- SNS シェアボタン
- 前後の記事へのリンク
- RSS フィード
- 記事ごとの OG 画像をビルド時に生成
- ライト / ダークテーマの切り替え
