import js from "@eslint/js"
import typescriptParser from "@typescript-eslint/parser"
import { defineConfig, globalIgnores } from "eslint/config"
import eslintConfigPrettier from "eslint-config-prettier"
import eslintPluginAstro from "eslint-plugin-astro"
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort"
import globals from "globals"

import noHtmlComment from "./eslint-rules/no-html-comment"

export default defineConfig([
  globalIgnores([".astro", "dist"]),
  js.configs.recommended,
  eslintConfigPrettier,
  ...eslintPluginAstro.configs["flat/recommended"],
  ...eslintPluginAstro.configs["flat/jsx-a11y-recommended"],
  {
    plugins: {
      "simple-import-sort": eslintPluginSimpleImportSort,
      // npm に出す予定の無いリポジトリ内のルール。公開パッケージと名前が
      // ぶつからないよう local という名前にしている
      local: {
        rules: {
          "no-html-comment": noHtmlComment,
        },
      },
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Node.js の組み込みモジュールと外部パッケージ
            ["^node:", "^@?\\w"],
            // エイリアス（@/）、そのあとに親・兄弟・index の相対 import
            [
              "^@/",
              "^\\.\\.(?!/?$)",
              "^\\.\\./?$",
              "^\\./(?=.*/)(?!/?$)",
              "^\\.(?!/?$)",
              "^\\./?$",
            ],
            // スタイルの import
            ["^.+\\.css$"],
            // 画像の import
            ["^.+\\.(png|jpe?g|gif|svg|webp|avif|ico)$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "local/no-html-comment": "error",
    },
  },
  {
    files: ["**/*.astro"],
    languageOptions: {
      globals: {
        ...globals.browser,
        // gtag.js の dataLayer
        dataLayer: false,
      },
    },
  },
  {
    // `client-side-ts` プロセッサ使用時の `<script>` タグ向けの設定。
    // `<script>` の中身には `.ts` 拡張子の仮想ファイル名が割り当てられる。
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: typescriptParser,
    },
  },
  {
    // ビルド時に Node で動くモジュール。src/pages 以下のエンドポイントと、
    // そこから読まれるヘルパー（OG 画像の生成、フォントの取得など）。
    files: ["src/lib/**/*.ts", "src/pages/**/*.ts", "scripts/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
])
