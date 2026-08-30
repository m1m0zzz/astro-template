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
    // Node で動くモジュール。ビルド時のもの（Astro の設定、単発のスクリプト、
    // src/pages 以下のエンドポイントと、そこから読まれるヘルパー）。
    //
    // src/lib 直下はブラウザでも動くコードなので含めない。含めると Node 専用の
    // グローバル（process など）を誤って使っても lint で気づけない。
    // ビルド時にしか動かないヘルパーは src/lib/server/ に置くこと
    files: [
      "astro.config.mjs",
      "scripts/**/*.ts",
      "src/pages/**/*.ts",
      "src/lib/server/**/*.ts",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
])
