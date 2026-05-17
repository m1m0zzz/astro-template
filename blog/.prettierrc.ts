import { type Config } from "prettier"

const config: Config = {
  trailingComma: "all",
  tabWidth: 2,
  semi: false,
  singleQuote: false,
  overrides: [
    {
      "files": "*.astro",
      "options": {
        plugins: ["prettier-plugin-astro"]
      }
    }
  ],
}

export default config
