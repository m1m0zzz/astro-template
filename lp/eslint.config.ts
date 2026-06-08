import js from "@eslint/js"
import typescriptParser from "@typescript-eslint/parser"
import { defineConfig, globalIgnores } from "eslint/config"
import eslintConfigPrettier from "eslint-config-prettier"
import eslintPluginAstro from "eslint-plugin-astro"
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort"
import globals from "globals"

export default defineConfig([
  globalIgnores([".astro", "dist"]),
  js.configs.recommended,
  eslintConfigPrettier,
  ...eslintPluginAstro.configs["flat/recommended"],
  ...eslintPluginAstro.configs["flat/jsx-a11y-recommended"],
  {
    plugins: {
      "simple-import-sort": eslintPluginSimpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Node.js builtins and external packages.
            ["^node:", "^@?\\w"],
            // Internal alias (@/), then parent/sibling/index relative imports.
            [
              "^@/",
              "^\\.\\.(?!/?$)",
              "^\\.\\./?$",
              "^\\./(?=.*/)(?!/?$)",
              "^\\.(?!/?$)",
              "^\\./?$",
            ],
            // Style imports.
            ["^.+\\.css$"],
            // Image imports.
            ["^.+\\.(png|jpe?g|gif|svg|webp|avif|ico)$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  {
    files: ["**/*.astro"],
    languageOptions: {
      globals: {
        ...globals.browser,
        dataLayer: false,
      },
    },
  },
  {
    // Define the configuration for `<script>` tag when using `client-side-ts` processor.
    // Script in `<script>` is assigned a virtual file name with the `.ts` extension.
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: typescriptParser,
    },
  },
])
