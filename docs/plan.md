# TODO

- GitHub pages (actions) 設定
  - READMEをindexとして、lp, blogをそれぞれbuild, ルーティング

## 方針

現状の単一ブランチ構成（main がデフォルト、`lp/` と `blog/` は生成物として main にコミット済み）
のまま実装する。既存の `pull-request.yml` / `sync-templates.yml` は変更しない
（ルート `package.json` には `build:pages` スクリプトと `marked` のみ追加）。

環境変数や Pages 専用 config は使わない。`builder/lp/astro.config.mjs` と
`builder/blog/astro.config.mjs` に `site` / `base` を**直接書く**。
テンプレート利用者に対して「サブディレクトリ配信するときはこうする」という**実例をそのまま配布できる**のが狙い。

`site` にはオリジンのみを書き、サブパスは `base` に分ける（`@astrojs/sitemap` が両者を結合するため）。
サイト内のリンク・アセット参照は `src/lib/path.ts` の `withBase()` を通す。

想定 URL:

```
https://m1m0zzz.github.io/astro-template/        ← README.md を変換した index
https://m1m0zzz.github.io/astro-template/lp/
https://m1m0zzz.github.io/astro-template/blog/
```

---

## 実装タスク

- [x] **1. テンプレートごとに `astro.config.mjs` を置く**
  - `builder/shared/astro.config.mjs` を削除し、`builder/lp/`, `builder/blog/` に配置
  - `site: "https://m1m0zzz.github.io"` + `base: "/astro-template/{lp,blog}"` を直接記述
  - `// TODO: Update these to your site's URL.` と、ドメイン直下なら `base` を消す旨を併記

- [x] **1-2. `path.ts` / `Layout.astro` を組み込む**
  - `builder/shared/src/lib/path.ts`（`withBase` / `stripBase`）を追加
  - `builder/shared/src/layouts/Layout.astro` を新版に差し替え
  - ルート相対パスの排除:
    - `Layout.astro` の favicon → `withBase()`
    - `blog/src/layouts/BlogLayout.astro` の favicon → `withBase()`
    - `blog/src/pages/index.astro` の `href="/"` → `withBase()`
  - OGP 画像は `new URL(withBase("OGP.png"), Astro.site)` とした。
    元案の `new URL("OGP.png", Astro.site)` は `site` がオリジンのみのため base が落ちる
  - `og:url` は `new URL(Astro.url.pathname, Astro.site)` にした
    （元案の `import.meta.env.SITE` は全ページで同一 URL になってしまう）
  - 検証済み: `npm run check` 差分なし、`npm run build` 成功、
    出力 HTML の全パスに base が付与され、sitemap も `base` 込みの URL を出力

- [x] **1-3. `public/OGP.png` と `public/apple-touch-icon.png` を追加** → コメントアウトで対応
  - 新 `Layout.astro` が両方を参照しているが `builder/shared/public/` に存在せず、現状 404
  - OGP は 1200×630。README の Features にも "OGP template" と書かれているので、
    プレースホルダー画像を置く必要がある

- [x] **2. `README.md` → `index.html` 変換スクリプト**
  - `scripts/build-pages.mjs` を追加（`npm run build:pages`）。`marked` は `18.0.9` で固定
  - index の生成だけでなく **`_site/` の組み立て全体**を担わせた。
    ワークフローに散らすよりローカルで Pages 出力をそのまま検証できる方が確実なため
  - 相対リンクを書き換え: `[LP](./lp/)` → `/astro-template/lp/`
  - CSS はインライン。`prefers-color-scheme` でダークモード対応
  - `lang` は `ja` ではなく `en`（README が英語のため）
  - テンプレート一覧は `sync-templates.mjs` と同じく `builder/` から検出するので、
    テンプレートを増やしてもこのスクリプトの変更は不要
  - `_site/` は `.gitignore` に追加

- [x] **3. `pages.yml` を追加**
  - `build` / `deploy` の 2 ジョブ構成。action は SHA ピン + バージョンコメント
  - `npm ci` → `configure-pages` → `npm run build` → `npm run build:pages` →
    `upload-pages-artifact` → `deploy-pages`
  - `.nojekyll` は不要（`deploy-pages` は Jekyll を通さない）と判断し、入れていない

- [x] **3-2. `npm run preview` でローカル確認できるようにする**
  - `serve`（vercel/serve）を devDependency に追加、`14.2.6` で固定
  - 出力の全パスが `base` 付きの絶対パスなので、`serve _site` では全て 404 になる。
    `serve.json` の `rewrites` も試したが `:path*` が複数セグメントを展開できず、
    2 階層以深（`/astro-template/lp/sitemap-index.xml` など）が解決できなかった
  - 代わりに `build-pages.mjs --preview` で `_preview/astro-template/` に組み立て、
    `_preview/` を配信する方式にした。rewrite に頼らず本番と同じ URL を再現できる
  - 出力先は `BASE` 定数から導出しているので、リポジトリ名の変更時も 1 箇所で済む
  - 検証済み: 出力 HTML が参照する 15 URL すべてが 200
  - `_preview/` は `.gitignore` に追加

- [x] **4. リポジトリ設定で Pages を有効化**（手動）
  - Settings > Pages > Source を **GitHub Actions** に変更

- [x] **5. 動作確認**
  - #33 の merge で初回デプロイ成功（55s）
  - 公開サイトの `/`, `/lp/`, `/blog/`, `/lp/sitemap-index.xml`, `/favicon.svg` が 200
  - lp が参照する CSS・favicon・sitemap も実地で 200 を確認

- [x] **6. README に Pages へのリンクを追加**
  - `## Templates` をテーブル化し、Demo 列に公開 URL を追加
  - README は Pages のトップページでもあるので、`build-pages.mjs` に
    テーブルの CSS と横スクロール用のラッパーを追加した

- [x] **7. テンプレート側の README に `site` / `base` と `withBase()` を記載する**
  - `## 🌐 Deploying to a subdirectory` を両テンプレートの README に追加
  - ドメイン直下なら `base` を消す / サブディレクトリなら `site` はオリジンのみ
    （`@astrojs/sitemap` が結合するため二重になる）を明記
  - `withBase()` の使用例と、ルート相対パスが壊れる理由を記載

## 別途検討

- **`BlogLayout.astro` が新 `Layout.astro` と重複している**
  `blog/src/pages/index.astro` は `@/layouts/Layout.astro` を import しており、
  `BlogLayout.astro` はどこからも使われていない。今回 base 対応だけ揃えたが、
  記事ページ用に作り直すか削除するかを決めたい。
- **sitemap に `/astro-template/lp` と `/astro-template/lp/` が両方出力される**
  `@astrojs/sitemap` が `base` 使用時に末尾スラッシュ有無の両方を出す。
  重複 URL になるので `trailingSlash` の設定か sitemap の `filter` で片方に寄せたい。
