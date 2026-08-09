import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Required when Vite 8 is hoisted: @tailwindcss/vite spreads this object into
      // createResolver() and Vite 8 rejects resolve options without `tsconfigPaths`.
      tsconfigPaths: true,
    },
  },
  integrations: [sitemap()],

  markdown: {
    // ライト / ダークの 2 テーマ分を CSS 変数として同時に出力する。
    // 切り替えは global.css の `[data-theme="dark"] .astro-code` 側で行う。
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      wrap: true,
    },
  },

  // TODO: Update these to your site's URL.
  //
  // このテンプレート自身は GitHub Pages のプロジェクトサイトとして
  // https://m1m0zzz.github.io/astro-template/blog/ に配信されている。
  // `site` にはオリジンだけを書き、サブディレクトリは `base` に分けること
  // （@astrojs/sitemap が site + base を結合するため）。
  //
  // ドメイン直下に配信する場合は `base` を削除する。
  //
  // `base` の末尾スラッシュは省略しないこと。@astrojs/sitemap は
  // ビルドされたページとルート定義の 2 系統から URL を組み立てており、
  // 末尾スラッシュが無いとトップページだけ両者の表記が食い違って、
  // sitemap に重複した <loc> が出力される。
  site: "https://m1m0zzz.github.io",
  base: "/astro-template/blog/",

  devToolbar: {
    enabled: false,
  },
})
