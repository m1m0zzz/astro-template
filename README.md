# astronaut (astro-template)

[English](./README.en.md)

Demo: [LP](https://m1m0zzz.github.io/astro-template/lp/) |  [Blog](https://m1m0zzz.github.io/astro-template/blog/)

## 🖨️ Templates

テンプレートの使い方

1. 次のいずれかのコマンドを実行する。

```sh
npm create astro@latest -- --template m1m0zzz/astro-template/lp
```

```sh
npm create astro@latest -- --template m1m0zzz/astro-template/blog
```

2. エディタ（VSCode 推奨）で開き、`TODO` の文字列を置き換える。

### ✨ Features

タスクリストは TODO

#### Base

- Tailwind CSS
- AGENTS.md
- OGP テンプレート
- ダークモード（テーマ切り替え）
- シェアボタン
- ESLint + Prettier
- husky + lint-staged
- VSCode 設定
- その他のツール・設定: nvm (Node=24), npmrc, editorconfig, cspell, renovate
- [ ] ~~astro/sitemap~~
- [ ] アイコン変換スクリプト

#### [LP](./lp) \[[Demo](https://m1m0zzz.github.io/astro-template/lp/)\]

- [ ] フォント最適化
- [ ] カルーセルコンポーネント（`Embla Carousel` を使用）

#### [Blog](./blog/) \[[Demo](https://m1m0zzz.github.io/astro-template/blog/)\]

- astro/sitemap
- Content Collections（posts + authors）
- ブログ用レイアウト
  - 本文のスタイル（`@tailwindcss/typography`）
  - 目次（ToC）コンポーネント
- 一覧ページ（ページネーション・タグページ・RSS）
- author の frontmatter（name / link / icon）
- OG 画像の動的生成（satori + resvg、ビルド時に生成）
- 読了時間 / シェアボタン / 前後記事リンク
- ダークモードの切り替え

## 🧩 Components (ToDo)

インストール

```sh
npm i @m1m0zzz/astronaut
```

コンポーネント一覧

- [ ] `Carousel`
- `GoogleAnalytics`
