# CLAUDE.md

## プロジェクト概要

Astro スターターテンプレートと、それを生成するためのツール群。

ユーザーは以下のコマンドでテンプレートを利用する:
```sh
npm create astro@latest -- --template m1m0zzz/astro-template/blog
npm create astro@latest -- --template m1m0zzz/astro-template/lp
```

## ディレクトリ構造

```
builder/
  shared/          # 全テンプレートに共通してコピーされるファイル
  blog/            # blog 固有のファイル（shared と競合した場合はこちらが優先）
  lp/              # lp 固有のファイル（shared と競合した場合はこちらが優先）
scripts/
  sync-templates.mjs  # builder/ からテンプレートを生成するスクリプト
blog/              # 生成された出力 — 直接編集禁止
lp/                # 生成された出力 — 直接編集禁止
```

## 重要: 生成されたテンプレートを直接編集しないこと

`blog/`, `lp/` などのトップレベルのテンプレートディレクトリは、**sync スクリプトによって `builder/` から自動生成される**。直接編集しても `npm run sync` の実行時に上書きされる。

**変更は必ず `builder/` 内で行い、その後 sync を実行すること:**

```sh
npm run sync         # 再生成
```

sync の後は必ず `npm run check`（lint + format）を実行すること。

## よく使うコマンド

```sh
npm run sync         # builder/ から全テンプレートを再生成
npm run build        # 全ワークスペースをビルド
npm run lint         # 全ワークスペースをリント
npm run format       # 全ワークスペースをフォーマット
npm run check        # lint + format を実行
```

## sync の仕組み

1. `builder/shared/` の内容が全テンプレートディレクトリにコピーされる。
2. `builder/<name>/` の内容がその上にコピーされる（テンプレート固有ファイルが優先）。
3. 出力先はリポジトリルートの `<name>/` ディレクトリ。
4. `node_modules`, `.astro`, `dist` は sync 時に保持される。

## 新しいテンプレートの追加

1. `builder/<テンプレート名>/` を作成し、固有ファイルを配置する。
2. `npm run sync` を実行するとルートに `<テンプレート名>/` ディレクトリが生成される。
3. 必要に応じてルートの `package.json` の `workspaces` に追加する。
