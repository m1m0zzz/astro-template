# mimoz's Astro Starter Kit: Blog

[English](./README.en.md)

```sh
npm create astro@latest -- --template m1m0zzz/astro-template/blog
```

## ✨ Features

- Tailwind CSS（本文には `@tailwindcss/typography`）
- 記事と著者の Content Collections
- ページネーション付きの記事一覧、タグページ、RSS フィード
- 現在位置をハイライトする目次
- 読了時間、シェアボタン、前後記事へのリンク
- 記事ごとの OG 画像をビルド時に生成（satori + resvg）
- ライト / ダークテーマの切り替え
- astro/sitemap
- ESLint + Prettier
- husky + lint-staged
- VSCode 設定

## ✍️ 記事を書く

`src/content/posts/` に Markdown ファイルを置きます。ファイル名がそのまま slug に
なるので、`src/content/posts/hello.md` は `/posts/hello/` で配信されます。

```md
---
title: 記事のタイトル
description: 一覧と OGP に出る説明文
pubDate: 2026-08-01
updatedDate: 2026-08-07 # 任意
draft: false # 任意
tags:
  - astro
author: mimoz # 任意。src/content/authors.json のキー
---

本文をここに書く。
```

- `draft: true` の記事は `npm run dev` では表示されますが、ビルド結果・RSS・
  sitemap・OG 画像の生成からは除外されます。
- 著者は `src/content/authors.json` に定義し、キーで参照します。存在しないキーを
  書くとビルドが失敗します。`author` を書かなければ著者は表示されません。
- 数字だけの slug は避けてください。記事一覧は 2 ページ目に `/posts/2/` を使うため、
  `src/content/posts/2.md` は衝突します。

## 🔧 まず設定するもの

1. `src/config.ts` の `TODO`（サイト名・説明・Twitter ID）を置き換える。
2. `astro.config.mjs` の `site` / `base` を自分の URL に向ける。
3. `src/content/authors.json` を自分の情報に書き換える。
4. `src/content/posts/` のサンプル記事を削除する。`dummy-*.md` は一覧とタグページの
   ページ送りを確認するためだけに置いてあります。

`src/config.ts` にはブログ側の設定もあります（1 ページあたりの記事数、トップページに
並べる記事数、目次に載せる見出しレベル、読了時間の計算に使う 1 分あたりの文字数）。

## 🖼️ OG 画像

`src/pages/og/[...slug].png.ts` が記事ごとの PNG と、その他のページ用の
`og/default.png` を生成します。初回ビルドで Noto Sans JP（fontsource の woff を
jsDelivr から取得）をダウンロードして `node_modules/.cache/og-fonts/` にキャッシュ
するため、そのビルドにはネットワークが必要です。取得に失敗した場合は、OG 画像が
欠けたまま公開されないようビルドを停止します。

デザインを変えるときは `src/lib/server/og.ts` の `template()` を編集してください。

## 🧩 外せるパーツ

目次・読了時間・シェアボタン・前後記事リンク・コードのコピーボタンは、それぞれ独立した
コンポーネントです。不要なものは `src/layouts/PostLayout.astro` から該当の行を消せば
外せます。

## 🧞 コマンド

すべてプロジェクトのルートで実行します。

| コマンド                  | 内容                                               |
| :------------------------ | :------------------------------------------------- |
| `npm install`             | 依存関係をインストールする                         |
| `npm run dev`             | `localhost:4321` で開発サーバーを起動する          |
| `npm run build`           | 本番用サイトを `./dist/` にビルドする              |
| `npm run preview`         | デプロイ前にビルド結果をローカルで確認する         |
| `npm run astro ...`       | `astro add` や `astro check` などの CLI を実行する |
| `npm run astro -- --help` | Astro CLI のヘルプを表示する                       |

## 🌐 サブディレクトリへのデプロイ

`astro.config.mjs` には、このリポジトリのデモ用の値が入っています。

```js
site: "https://m1m0zzz.github.io",
base: "/astro-template/blog/",
```

- **ドメイン直下で配信する場合** — `base` を削除し、`site` に自分の URL を設定する。
- **サブディレクトリで配信する場合**（GitHub Pages のプロジェクトサイトなど） —
  `site` にはオリジンだけを書き、サブパスは `base` に入れる。`@astrojs/sitemap` が
  両者を結合するため、`site` にサブパスを含めると二重になる。
- **`base` の末尾スラッシュは省略しない** — `@astrojs/sitemap` はビルドされたページと
  ルート定義の 2 系統から URL を組み立てており、`base` をそのまま使うのは前者だけ。
  末尾スラッシュが無いとトップページだけ両者の表記が食い違い、二重に出力される。

サイト内のリンクとアセットのパスは、`src/lib/path.ts` の `withBase()` を通してください。

```astro
---
import { withBase } from "@/lib/path"
---

<a href={withBase("about")}>About</a>
<link rel="icon" href={withBase("favicon.svg")} />
```

`href="/favicon.svg"` のようなルート相対パスは `base` を無視するため、ルート以外で
配信した時点で壊れます。

## 👀 もっと知りたい場合

[Astro のドキュメント](https://docs.astro.build)や
[Discord サーバー](https://astro.build/chat)をどうぞ。
