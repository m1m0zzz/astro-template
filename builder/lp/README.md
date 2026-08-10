# mimoz's Astro Starter Kit: LP

[English](./README.en.md)

```sh
npm create astro@latest -- --template m1m0zzz/astro-template/lp
```

## ✨ Features

- Tailwind CSS
- astro/sitemap
- OGP テンプレート
- ESLint + Prettier
- husky + lint-staged
- VSCode 設定

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
base: "/astro-template/lp/",
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
