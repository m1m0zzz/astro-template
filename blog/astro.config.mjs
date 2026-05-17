import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import sitemap from "@astrojs/sitemap"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
  // site: "TODO", // deployed URL
  trailingSlash: "never",
})
