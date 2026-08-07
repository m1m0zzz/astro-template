# TODO

- GitHub pages (actions) 設定
  - READMEをindexとして、lp, blogをそれぞれbuild, ルーティング

## 方針

現状の単一ブランチ構成（main がデフォルト、`lp/` と `blog/` は生成物として main にコミット済み）
のまま実装する。既存の `pull-request.yml` / `sync-templates.yml` / ルート `package.json` は変更しない。

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

- [ ] **2. `README.md` → `index.html` 変換スクリプト**
  - `scripts/build-pages-index.mjs`（仮）を追加
  - `marked` をルートの devDependency に追加（`.npmrc` の `min-release-age=3` に注意）
  - 相対リンクの書き換えが必要: `[LP](./lp/)` → `/astro-template/lp/`
  - 最低限の CSS をインラインで持たせる（外部 CDN は使わない）
  - `<title>`, `lang="ja"`, viewport meta を入れる

- [ ] **3. `pages.yml` を追加**
  - トリガー: `push: branches: [main]` + `workflow_dispatch`
  - `sync-templates.yml` が sync 結果を自動コミットすることがあるため、
    そのコミットでも Pages が再デプロイされる（＝意図通り）
  - 処理:
    1. checkout → setup-node（`node-version-file: ".nvmrc"`）→ `npm install -g npm@12` → `npm ci`
       （既存 workflow と同じ手順。npm 12 の明示インストールが必要）
    2. `npm run build`（config に site / base が書いてあるので追加の指定は不要）
    3. `node scripts/build-pages-index.mjs` で index を生成
    4. `_site/` に集約:
       ```
       _site/index.html   ← 2 の出力
       _site/lp/          ← lp/dist
       _site/blog/        ← blog/dist
       ```
       `base` を設定しても `dist/` の中身は入れ子にならない（`dist/` の直下が base に対応する）ので、
       `cp -r lp/dist _site/lp` でよい
    5. `actions/upload-pages-artifact` → `actions/deploy-pages`
  - `permissions: contents: read, pages: write, id-token: write`
  - `concurrency: group: pages, cancel-in-progress: false`
  - action は既存 workflow に倣って SHA ピン + バージョンコメントで固定する
  - `.nojekyll` の要否を確認（`deploy-pages` は Jekyll を通さないので原則不要）

- [ ] **4. リポジトリ設定で Pages を有効化**（手動）
  - Settings > Pages > Source を **GitHub Actions** に変更

- [ ] **5. 動作確認**
  - 3 つの URL が表示されること
  - CSS / 画像 / 内部リンク / OGP 画像が壊れていないこと（`base` 付きで正しく解決されているか）
  - `sitemap-index.xml` の URL に `base` が含まれていること

- [ ] **6. README に Pages へのリンクを追加**
  - `## Templates` の `[LP](./lp/)` は GitHub 上でのディレクトリリンクなので、
    デモサイトへのリンクは別途併記する

- [ ] **7. テンプレート側の README に `site` / `base` と `withBase()` を記載する**
  - 1・1-2 を「実例」として成立させるための仕上げ。scaffold したユーザーには
    `base: "/astro-template/lp"` という他人の設定が残るので、消し方の説明が要る
  - `builder/lp/README.md`, `builder/blog/README.md` の `## 🧞 Commands` 表の下に追記:
    - ドメイン直下に置くなら `base` を消す
    - サブディレクトリに置くなら `base` を書き換え、サイト内リンクは `withBase()` を通す
  - 両ファイルとも同一内容なので同時に更新する

## 別途検討

- **`BlogLayout.astro` が新 `Layout.astro` と重複している**
  `blog/src/pages/index.astro` は `@/layouts/Layout.astro` を import しており、
  `BlogLayout.astro` はどこからも使われていない。今回 base 対応だけ揃えたが、
  記事ページ用に作り直すか削除するかを決めたい。
- **sitemap に `/astro-template/lp` と `/astro-template/lp/` が両方出力される**
  `@astrojs/sitemap` が `base` 使用時に末尾スラッシュ有無の両方を出す。
  重複 URL になるので `trailingSlash` の設定か sitemap の `filter` で片方に寄せたい。
