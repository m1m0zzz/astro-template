---
title: 下書きのサンプル
description: "draft: true を付けた記事の見え方を確認するためのサンプルです。"
pubDate: 2026-08-10
draft: true
tags:
  - お知らせ
author: mimoz
---

この記事には `draft: true` が付いています。

開発サーバー（`npm run dev`）では一覧にも記事ページにも出ますが、
本番ビルド（`npm run build`）の成果物には含まれません。
RSS や OG 画像、sitemap にも出ません。

公開するときは frontmatter から `draft` の行を消してください。
