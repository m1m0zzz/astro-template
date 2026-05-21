import sitemap from "@astrojs/sitemap"
import { defineConfig } from "astro/config"

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap()],
  // site: "TODO", // deployed URL
  trailingSlash: "never",
})
