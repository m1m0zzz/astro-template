# ブログ機能 実装プラン

README の Blog セクションの TODO（Content Collections / Blog Layout / blog css / ToC /
list page / author frontmatter / Dynamic OG Images）を実装するためのプラン。

現在の `builder/blog/` の実装（`BlogLayout.astro`、スターター用の `index.astro`）は
作り直す前提で、互換性は考慮しない。

## 決定事項サマリ

| 項目             | 決定                                                                |
| ---------------- | ------------------------------------------------------------------- |
| 記事形式         | Markdown のみ（`.md`）。MDX / Markdoc は入れない                     |
| frontmatter      | `title` `description` `pubDate` `updatedDate` `draft` `tags` `author` |
| author           | `src/content/authors.json` を単一データソースにし、記事は ID 参照     |
| author の icon   | 外部 URL 文字列                                                      |
| URL              | 記事 `/posts/<slug>/`、一覧 `/posts/`・`/posts/2/`                   |
| トップページ     | 最新記事を並べたランディング                                          |
| 一覧             | ページネーション付き、タグ別ページ、RSS                              |
| 本文スタイル     | `@tailwindcss/typography`（`prose`）                                 |
| コードブロック   | Shiki デュアルテーマ + コピーボタン                                   |
| ToC              | サイドバー固定 + 現在位置ハイライト（IntersectionObserver）           |
| 記事の補助機能   | 前後記事ナビ / 読了時間 / SNS シェア。**それぞれ独立コンポーネント**  |
| ダークモード     | トグル付きで完全対応                                                  |
| OG 画像          | ビルド時生成（satori + resvg）。フォントはビルド時に fetch            |
| フォント fetch 失敗 | ビルドを失敗させる                                                 |
| draft            | dev では表示、build では除外                                          |
| サイト設定       | `src/config.ts` に集約                                               |
| サンプル記事     | 日本語 3〜4 本                                                        |

### shared に置くもの / blog に閉じるもの

`builder/shared/` に置く（lp にも配られる）:

- テーマ切替一式（`ThemeIcon.astro` の改修 + FOUC 防止スクリプト + dark トークン）
- `src/components/ShareButtons.astro`
- `src/config.ts`（共通フィールドのみ。blog 側で上書きする）

`builder/blog/` に閉じる:

- posts / authors コレクション、記事・一覧・タグ・RSS の各ページ
- `PostLayout.astro`、`Toc.astro`、`Pagination.astro`、`PostCard.astro` ほか記事系 UI
- OG 画像生成一式（`satori` / `@resvg/resvg-js` の依存を lp に持ち込まない）
- `@tailwindcss/typography`（prose）と Shiki デュアルテーマ設定

> 補足: 「汎用 UI」のうち `Pagination` と `Toc` は Markdown / コレクション前提の
> 使い方しかしないため blog に置く。`ShareButtons` は `url` / `title` を props で
> 受けるだけなので shared に置く。

## 追加する依存

`builder/blog/package.json` のみ:

| パッケージ                | 用途                                       |
| ------------------------- | ------------------------------------------ |
| `@astrojs/rss`            | `/rss.xml` の生成                          |
| `@tailwindcss/typography` | 本文の `prose` スタイル                     |
| `satori`                  | OG 画像の SVG 生成                          |
| `@resvg/resvg-js`         | SVG → PNG 変換                             |

lp / shared への依存追加はなし（`ShareButtons` が使う `@lucide/astro` は
lp・blog 双方に導入済み）。

## ファイル構成（完成形）

```
builder/shared/
  src/
    config.ts                     # 新規: siteName / description / twitterID / locale
    components/
      ThemeIcon.astro             # 改修: 初期化スクリプトを ThemeScript に分離
      ThemeScript.astro           # 新規: head 用の FOUC 防止インラインスクリプト
      ShareButtons.astro          # 新規
    layouts/
      Layout.astro                # 改修: config 参照 / ogImage prop / ThemeScript
    styles/
      global.css                  # 改修: dark 用トークンを追加

builder/blog/
  astro.config.mjs                # 改修: shikiConfig（デュアルテーマ）+ remark プラグイン
  package.json                    # 改修: 依存追加
  README.md                       # 改修: ブログ機能の説明
  src/
    config.ts                     # 上書き: 共通 + POSTS_PER_PAGE など blog 固有
    content.config.ts             # 新規: posts / authors コレクション
    content/
      authors.json                # 新規
      posts/
        hello-astro.md            # 新規: サンプル記事 3〜4 本
        markdown-cheatsheet.md
        tags-and-authors.md
    components/
      Header.astro                # 新規: nav + テーマトグル
      Footer.astro                # 新規
      PostCard.astro              # 新規: 一覧の 1 件
      Pagination.astro            # 新規
      Toc.astro                   # 新規
      TagList.astro               # 新規
      AuthorBadge.astro           # 新規: name / link / icon
      ReadingTime.astro           # 新規
      PrevNextNav.astro           # 新規
      CodeCopy.astro              # 新規: コピーボタンを注入するスクリプト
    layouts/
      PostLayout.astro            # 新規（BlogLayout.astro は削除）
    styles/
      global.css                  # 上書き: shared 版 + typography / Shiki / コピーボタン
    lib/
      posts.ts                    # 新規: draft 除外 / ソート / タグ集計 / 読了時間
      date.ts                     # 新規: 表示用の日付フォーマット
      og.ts                       # 新規: satori + resvg
      fonts.ts                    # 新規: フォント fetch + キャッシュ
    pages/
      index.astro                 # 改修: ランディング
      posts/
        [...page].astro           # 新規: 一覧（/posts/, /posts/2/ …）
        [slug].astro              # 新規: 記事
      tags/
        index.astro               # 新規: タグ一覧
        [tag]/[...page].astro     # 新規: タグ別一覧
      og/
        [slug].png.ts             # 新規: OG 画像エンドポイント
      rss.xml.ts                  # 新規
```

削除: `builder/blog/src/layouts/BlogLayout.astro`（shared の `Layout.astro` に一本化）。

## 実装詳細

### 1. サイト設定（`src/config.ts`）

shared 側に共通フィールドを定義し、blog 側の同名ファイルが sync で上書きする
（`builder/<name>/` が `shared/` に優先する仕組みをそのまま使う）。

```ts
// builder/shared/src/config.ts
export const SITE = {
  name: "SITE NAME", // TODO
  description: "SITE DESCRIPTION", // TODO
  twitterID: "@xxxxxx", // TODO
  locale: "ja_JP",
  lang: "ja",
} as const
```

blog 側は上記に加えて `POSTS_PER_PAGE`（既定 10）、`RECENT_POSTS_ON_TOP`（既定 5）、
`TOC_DEPTH`（`[2, 3]`）を持つ。`Layout.astro` / RSS / OG 生成はすべてここを参照し、
利用者が書き換える TODO を 1 ファイルに集約する。

### 2. コンテンツコレクション（`src/content.config.ts`）

Astro 7 の Content Layer API（`glob` / `file` ローダー）を使う。

```ts
import { file, glob } from "astro/loaders"
import { defineCollection, reference, z } from "astro:content"

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/[^_]*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    author: reference("authors"),
  }),
})

const authors = defineCollection({
  loader: file("src/content/authors.json"),
  schema: z.object({
    name: z.string(),
    link: z.string().url().optional(),
    icon: z.string().url().optional(),
  }),
})

export const collections = { posts, authors }
```

`authors.json` はキーを ID とするオブジェクト形式にする（`file()` ローダーが
キーを `id` として扱うため、スキーマに `id` を書かなくてよい）:

```json
{
  "mimoz": {
    "name": "mimoz",
    "link": "https://github.com/m1m0zzz",
    "icon": "https://github.com/m1m0zzz.png"
  }
}
```

記事側は `author: mimoz` と ID で参照し、表示時に `getEntry("authors", ...)` で解決する。

### 3. 記事の取得ヘルパー（`src/lib/posts.ts`）

- `getPosts()` — `getCollection("posts", ...)` に draft フィルタとソートをまとめる。
  draft は **dev では表示、build では除外**するため `import.meta.env.PROD` で分岐する。
- `getSortedPosts()` — `pubDate` 降順。
- `getAllTags()` — タグと件数の集計（`Map<string, number>`）。
- `getPrevNext(posts, id)` — 前後記事の取得。

一覧・タグ・RSS・OG・前後ナビがすべてこの 1 箇所を通るようにして、draft の扱いが
ページごとにずれないようにする。

### 4. レイアウト

- `shared/Layout.astro`（改修）
  - ハードコードされた `siteName` などを `SITE` 参照に置換。
  - `ogImage?: URL | string` prop を追加（未指定なら `public/OGP.png` を使う従来動作）。
  - `<head>` の先頭で `ThemeScript` を読み、テーマ適用を描画前に済ませる（FOUC 防止）。
  - `<html lang={SITE.lang}>`。
- `blog/PostLayout.astro`（新規）
  - `Layout` をラップし、`Header` / `Footer`、記事ヘッダ（タイトル・日付・
    `AuthorBadge`・`TagList`・`ReadingTime`）、`prose` 本文、`Toc`、`ShareButtons`、
    `PrevNextNav`、`CodeCopy` を配置。
  - 補助コンポーネントは **props で受け取って並べるだけ** にし、不要なら
    PostLayout から 1 行削除すれば消せる形にする（利用者が抜き差ししやすいこと優先）。

### 5. 本文スタイルとコードブロック

- `@tailwindcss/typography` を `global.css` で `@plugin "@tailwindcss/typography";`
  として読み込み、本文ラッパに `prose prose-neutral dark:prose-invert` を当てる。
  - Tailwind v4 の `@plugin` は `@import "tailwindcss"` と同じファイルに書く必要があり、
    lp に依存を増やさない方針なので、**blog は `src/styles/global.css` を丸ごと上書き**
    している（shared 版の内容 + ブログ用の追記）。shared 側を変更したときは
    blog 側の先頭部分にも反映すること。
- Shiki は `astro.config.mjs` でデュアルテーマ:

  ```js
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      wrap: true,
    },
  }
  ```

  Shiki のデュアルテーマは `.shiki` に CSS 変数を吐き、`prefers-color-scheme` ではなく
  クラス/属性で切り替えるための CSS を自分で書く必要がある。本テンプレートのダークは
  `[data-theme=dark]` 属性なので、`global.css` に
  `[data-theme=dark] .astro-code, [data-theme=dark] .astro-code span { color: var(--shiki-dark) !important; background-color: var(--shiki-dark-bg) !important; }`
  相当を追加する。
- `CodeCopy.astro` は `is:inline` スクリプトで `pre.astro-code` を走査し、コピーボタンを
  追加する。PostLayout から 1 行消せば無効化できる。

### 6. ToC（`Toc.astro`）

- props は `headings: MarkdownHeading[]`（`render(post)` の戻り値をそのまま渡す）。
- `SITE.TOC_DEPTH`（既定 `h2`〜`h3`）でフィルタ。
- 広い画面（`lg` 以上）では `sticky top-N` のサイドバー、狭い画面では本文上部の
  `<details>` に切り替える。
- IntersectionObserver で現在表示中の見出しに対応する項目をハイライト。
  見出しが 0 個のときは何も描画しない。

### 7. 一覧・タグ・RSS

- `/posts/[...page].astro` — `paginate(posts, { pageSize: POSTS_PER_PAGE })` で
  `/posts/`, `/posts/2/`, … を生成。`PostCard` と `Pagination` を使う。
- `/posts/[slug].astro` — `getStaticPaths` で記事ページを生成。
  - **制約**: 一覧が `/posts/2/` を使うため、記事 slug に数字のみの名前は使えない。
    README に注記する。
- `/tags/index.astro` — タグと件数の一覧。
- `/tags/[tag]/[...page].astro` — タグ別一覧（`/tags/astro/`, `/tags/astro/2/`）。
  タグは `encodeURIComponent` してパスに使う。
- `/rss.xml.ts` — `@astrojs/rss`。`site` + `base` を含む絶対 URL を出すため、
  `link` は `withBase("posts/<id>/")` を通す。

### 8. OG 画像（ビルド時生成）

- `src/pages/og/[slug].png.ts` を静的エンドポイントにし、`getStaticPaths` で
  全記事 + `default`（トップ・一覧用）を返す。出力は `/og/<slug>.png`。
- `src/lib/og.ts`
  - satori に渡すのは **プレーンなオブジェクトツリー**（`{ type, props }`）。
    JSX ランタイムを入れないため、`.astro` プロジェクトの設定を変えずに済む。
  - レイアウトはタイトル（最大 3 行、はみ出しは省略）+ サイト名 + 著者名の
    シンプルな 1200×630。
  - satori の出力 SVG を `@resvg/resvg-js` で PNG 化して返す。
- `src/lib/fonts.ts`
  - Noto Sans JP（Regular / Bold）を fontsource（jsDelivr）から **woff** で取得する。
    satori は woff2 を読めず、Google Fonts の CSS API は日本語フォントに woff2 の
    分割サブセットしか返さない（レガシー UA で得られる TTF は日本語グリフを含まない
    ラテン専用サブセット）ため、woff をそのまま配布している fontsource を使う。
  - 日本語サブセットにはラテン文字も含まれるので、読み込むのはこの 2 ファイルだけ。
    同名フォントを複数渡すと satori は先頭しか使わないため、ラテン専用サブセットを
    併せて登録すると逆に日本語が豆腐になる。
  - 取得したフォントは `node_modules/.cache/og-fonts/` にキャッシュし、
    2 回目以降のビルドとページごとの生成で再取得しない。
  - **fetch に失敗したらエラーを投げてビルドを落とす**（OG 画像が欠けたまま
    公開されるのを防ぐ）。CI（`.github/workflows/pages.yml`）でもこの挙動になる。
- 記事ページは `Layout` の `ogImage` prop に `new URL(withBase("og/<slug>.png"), Astro.site)`
  を渡す。トップ・一覧・タグは `og/default.png`。

### 9. 読了時間

`src/lib/posts.ts` の `getReadingTime(post)` が、記事本文（`post.body`）から Markdown の
記法をおおまかに落とし、残った文字数を **500 文字/分** で割って概算する
（`reading-time` パッケージは英単語区切り前提のため使わない）。

当初は remark プラグインで frontmatter に書き込む予定だったが、Astro 7 では Markdown の
処理系が Sätteri に変わり、`markdown.remarkPlugins` を使うには `@astrojs/markdown-remark`
の追加インストールが必要な非推奨 API になったため、本文から直接計算する方式にした。
依存が 1 つ減り、一覧ページからも `render()` なしで呼べる。

### 10. ダークモード（shared）

- `global.css` に `[data-theme=dark]` のトークンを追加
  （`--c-foreground` / `--c-background` / `--c-primary` の dark 値）。
  `@custom-variant dark` は既に定義済みなのでそのまま使える。
- 現在 `ThemeIcon.astro` はボタンと初期化スクリプトが同居しており、ボタンを body に
  置くと適用が描画後になる。初期化部分を `ThemeScript.astro` に切り出して
  `Layout.astro` の `<head>` で読み、`ThemeIcon.astro` はトグルのイベント登録だけにする。

### 11. トップページ / Header / Footer

`index.astro` を作り直し、ヒーロー + 最新 `RECENT_POSTS_ON_TOP` 件の `PostCard` +
「記事一覧へ」リンク + タグ一覧へのリンクを置く。`Header`（サイト名・記事一覧・
タグ・テーマトグル）と `Footer` を切り出し、`PostLayout` と共有する。

## 作業手順

各フェーズの終わりに `npm run sync:strict` と `npm run build` を通す。

1. **基盤** — shared: `config.ts` / dark トークン / `ThemeScript` 分離 /
   `Layout.astro` 改修。blog: `config.ts` 上書き、`content.config.ts`、`authors.json`、
   サンプル記事 3〜4 本、`lib/posts.ts`、`lib/date.ts`。`BlogLayout.astro` を削除。
2. **記事ページ** — 依存追加（typography / Shiki 設定）、`PostLayout`、`Header` /
   `Footer`、`AuthorBadge`、`TagList`、`/posts/[slug].astro`。
3. **一覧まわり** — `PostCard`、`Pagination`、`/posts/[...page].astro`、
   `/tags/index.astro`、`/tags/[tag]/[...page].astro`、`index.astro` のランディング化。
4. **記事の補助機能** — `Toc`、`PrevNextNav`、`ReadingTime`（remark プラグイン込み）、
   `ShareButtons`（shared）、`CodeCopy`。
5. **RSS と OG 画像** — `@astrojs/rss` で `/rss.xml`、`lib/fonts.ts` / `lib/og.ts` /
   `/og/[slug].png.ts`、`Layout` への `ogImage` 配線。
6. **仕上げ** — `builder/blog/README.md` 更新、ルート `README.md` の Blog チェックリスト
   を消化、`.cspell.json` に語彙追加（`satori`, `resvg`, `shiki`, `frontmatter`,
   `paginate`, `noto`, `mdast`, `hatena` など）、`npm run build:pages` と
   `npm run preview` でサブディレクトリ配信を確認。

## 注意点

- **`builder/` を編集し、`npm run sync:strict` で反映する。** `blog/` を直接編集しない。
- **内部リンクとアセットは必ず `withBase()` を通す。** 一覧のページ送り、タグ、
  RSS の `link`、OG 画像の URL がすべて対象。ルート相対パスは
  `/astro-template/blog/` 配信で壊れる。
- **OG 画像の URL は絶対 URL** にする（`new URL(withBase(...), Astro.site)`）。
- **`base` の末尾スラッシュは維持する**（`@astrojs/sitemap` が重複 `<loc>` を出すため）。
- 記事 slug に数字だけの名前を使わない（一覧のページ番号と衝突する）。
- lp の依存・設定は変更しない。shared に入れる 4 点（config / date / ShareButtons /
  テーマ切替）は lp でもビルドが通ることを確認する。

## 今回やらないこと

- 著者別ページ（`/authors/[author]/`）
- 関連記事（同一タグ）表示
- heroImage（記事アイキャッチ）
- MDX / Markdoc、全文検索、コメント欄
- lp 側への prose / Shiki 設定の導入
