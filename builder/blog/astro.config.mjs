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

  // TODO: Update these to your site's URL.
  //
  // このテンプレート自身は GitHub Pages のプロジェクトサイトとして
  // https://m1m0zzz.github.io/astro-template/blog/ に配信されている。
  // `site` にはオリジンだけを書き、サブディレクトリは `base` に分けること
  // （@astrojs/sitemap が site + base を結合するため）。
  //
  // ドメイン直下に配信する場合は `base` を削除する。
  site: "https://m1m0zzz.github.io",
  base: "/astro-template/blog",

  devToolbar: {
    enabled: false,
  },
})
