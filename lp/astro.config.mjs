import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
  site: "https://example.com", // TODO: Update this to your site's URL
  devToolbar: {
    enabled: false,
  },
})
