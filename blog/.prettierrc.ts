import { type Config } from "prettier"

const config: Config = {
  trailingComma: "all",
  tabWidth: 2,
  semi: false,
  singleQuote: false,
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/styles/global.css",
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
}

export default config
