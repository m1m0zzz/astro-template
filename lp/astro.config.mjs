import { fileURLToPath } from "node:url"
import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Vite 8 が巻き上げられたときに必要。@tailwindcss/vite はこのオブジェクトを
      // createResolver() に展開するが、Vite 8 は `tsconfigPaths` の無い resolve を
      // 受け付けない。
      tsconfigPaths: true,
      alias: {
        // tsconfig.json を solution 形式（references だけ）にしたため、ここから
        // paths を辿れなくなった。ビルド側の解決はこの alias で明示する。
        // 型側は tsconfig.app.json の paths。両方を揃えること
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
  integrations: [sitemap()],

  // TODO: 自分のサイトの URL に書き換える。
  //
  // このテンプレート自身は GitHub Pages のプロジェクトサイトとして
  // https://m1m0zzz.github.io/astro-template/lp/ に配信されている。
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
  base: "/astro-template/lp/",

  devToolbar: {
    enabled: false,
  },
})
