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
  site: "https://example.com", // TODO: Update this to your site's URL
  devToolbar: {
    enabled: false,
  },
})
