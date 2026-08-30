## プロジェクト概要

<!-- TODO: このテンプレートから生成したプロジェクトの概要を記述する -->

## コマンド

```sh
npm run dev          # 開発サーバーを起動
npm run build        # 本番ビルド。先に型検査が走る（astro build 自体は型を見ない）
npm run preview      # ビルド結果をローカルでプレビュー
npm run check        # 検証をまとめて実行（lint / format:check）
npm run lint         # ESLint（検出のみ）
npm run lint:fix     # ESLint（自動修正あり）
npm run format       # Prettier（--write）
npm run format:check # フォーマット崩れの検出
npm run typecheck    # 型検査のみ。build から呼ばれる
npm run favicon      # public/favicon.svg から favicon.ico と apple-touch-icon.png を作る
```

`check` はファイルを書き換えない。CI と、変更したあとの確認にはこれを使う。
直したいときは `lint:fix` と `format` を明示的に呼ぶこと。

## スタイリング

- ESLintとPrettierの設定に従う
- アイコンは [`@lucide/astro`](https://lucide.dev/) を使用する

## 書き方

### `.astro` のコメントは `{/* */}` を使う

`<!-- -->` はマークアップの一部なので、ビルド後のHTMLにそのまま出力される。
`{/* */}` はコンパイル時に消えるため配信物に残らない。実装の意図を書いたコメントは
読者が開発者なので、後者にする。`local/no-html-comment` が検出し、自動修正できる。

フロントマター（`---` の中）のコメントはJSのコメントなので元から出力されない。
出力に残る `<!--astro:end-->` はislandの範囲を示すAstroの内部マーカーで、これは消せない。

## タスク完了チェックリスト

作業を完了する前に、以下を必ず実行・確認すること:

1. `npm run check`（lint + format:check）を実行し、エラーがないこと
2. `npm run build` が成功すること（型検査を含む）
