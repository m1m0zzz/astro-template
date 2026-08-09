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
npm run sync:strict  # 再生成 + lint/format + builder/ へ書き戻し
```

ローカルでの確認は `npm run sync:strict` を使うこと。これは sync に加えて
lint・フォーマットを実行し、整形結果を `builder/` のファイルにも反映する
（`sync` → `check` → `sync --reverse` の順に実行される）。
`npm run sync` 単体では整形が行われず、`builder/` と生成物がずれる。

**例外: `npm run dev:blog` / `npm run dev:lp` の実行中は生成物側を編集してよい。**
これらは生成物ディレクトリを watch していて、変更を `builder/` に書き戻す
（詳細は「dev サーバー」の節）。

## dev サーバー

```sh
npm run dev          # 全テンプレートの dev サーバー + 書き戻し watch
npm run dev:blog     # blog/ の dev サーバー + blog/ → builder/ の書き戻し watch
npm run dev:lp       # lp/ の dev サーバー + lp/ → builder/ の書き戻し watch
```

`npm run dev` は blog を `:4321`、lp を `:4322` で同時に立てる
（`dev:blog` / `dev:lp` 単体はテンプレート既定の `:4321`）。

動きは 2 段階:

1. `builder/` → 対象テンプレートの forward sync
2. `concurrently -k` で次を並列実行する
   - 生成物ディレクトリの watch（変更を `builder/` に書き戻す）
   - 各テンプレートの `npm run dev`

`-k` を付けているので、どれか 1 つが終われば（Ctrl-C を含め）他も止まる。

テンプレートを増やしたときは、`npm run dev` の `concurrently` の並びにも
追加すること（watch 側は `--template` を付けなければ全テンプレートを見る）。

書き戻し先は、そのファイルが `builder/<name>/` にあればテンプレート固有、
無くて `builder/shared/` にあれば shared。どちらにも無い新規ファイルは
テンプレート固有として `builder/<name>/` に置かれる（勝手に shared に
入れて他のテンプレートに配ってしまわないため）。**削除は書き戻されない**ので、
ファイルを消すときは `builder/` 側も自分で消すこと。

watch するのは生成物 → `builder/` の一方向だけ（両方向を watch すると
互いの同期を無限に拾い合う）。

`dev:*` は人間が手元で使うための script。AI エージェントから使う場合、
Astro 7 の `astro dev` はエージェント環境を自動検出してバックグラウンドの
デーモンとして起動し CLI 自体はすぐ終了するため、`-k` によって watch も
一緒に落ちる。エージェントから使うときは 2 つを個別に起動すること:

```sh
npm run sync -- --template blog
node scripts/sync-templates.mjs --template blog --reverse --watch
npm run dev -w @astro-template/blog   # 別プロセスで
```

## よく使うコマンド

```sh
npm run dev          # 全テンプレートの dev サーバー（+ 書き戻し watch）
npm run dev:blog     # blog の dev サーバー（+ 書き戻し watch）
npm run dev:lp       # lp の dev サーバー（+ 書き戻し watch）
npm run sync:strict  # 再生成 + lint/format + builder/ へ書き戻し（ローカル確認はこれ）
npm run sync         # builder/ から全テンプレートを再生成（整形なし）
npm run build        # 全ワークスペースをビルド
npm run lint         # 全ワークスペースをリント
npm run format       # 全ワークスペースをフォーマット
npm run check        # lint + format を実行
npm run build:pages  # GitHub Pages 用に _site/ を組み立てる（先に build が必要）
npm run preview      # Pages の出力をローカル配信する
```

## GitHub Pages

`main` への push で `.github/workflows/pages.yml` が
`https://m1m0zzz.github.io/astro-template/` に公開する。
`README.md` がトップページになり、各テンプレートは `/lp/`, `/blog/` に配置される。

出力の全パスは `base`（`/astro-template/<name>`）付きの絶対パスなので、
静的サーバーはその階層の下でサイトを見る必要がある。`npm run preview` は
`_preview/astro-template/` に組み立ててから `_preview/` を配信することで、
本番と同じ URL を再現している。開いた後のトップは
`http://localhost:4321/astro-template/`。

テンプレート内のリンクとアセット参照は `src/lib/path.ts` の `withBase()` を通すこと。
`href="/favicon.svg"` のようなルート相対パスは `base` を無視して壊れる。

## sync の仕組み

1. `builder/shared/` の内容が全テンプレートディレクトリにコピーされる。
2. `builder/<name>/` の内容がその上にコピーされる（テンプレート固有ファイルが優先）。
3. 出力先はリポジトリルートの `<name>/` ディレクトリ。
4. `node_modules`, `.astro`, `dist` は sync 時に保持される。

`scripts/sync-templates.mjs` のフラグ:

| フラグ              | 動作                                                     |
| ------------------- | -------------------------------------------------------- |
| （なし）            | forward sync（`builder/` → 生成物）                       |
| `--watch`           | `builder/` を watch して forward sync を繰り返す           |
| `--reverse`         | 生成物 → `builder/` を一度だけ書き戻す                     |
| `--reverse --watch` | 生成物を watch して、変更のたびに `builder/` へ書き戻す    |
| `--template <name>` | 上記の対象を 1 テンプレートに限定する                      |

## 新しいテンプレートの追加

1. `builder/<テンプレート名>/` を作成し、固有ファイルを配置する。
2. `npm run sync` を実行するとルートに `<テンプレート名>/` ディレクトリが生成される。
3. 必要に応じてルートの `package.json` の `workspaces` に追加する。
4. ルートの `package.json` に `dev:<テンプレート名>` を足し、`dev` の
   `concurrently` の並びにも追加する（ポートは他とぶつからない値にする）。
