# npm パッケージ化と `astro add` への移行

テンプレートに同梱している機能のうち、汎用的なものを npm パッケージとして切り出し、
`npm create astro` 直後の利用者が `astro add` で足せる形にしていくための方針メモ。

まだ着手していない。決めたことと、調べて分かった制約を残す。

## なぜ

現状、テンプレートの機能は `builder/shared/` に置いたファイルを丸ごとコピーして配って
いる。この方式には次の限界がある。

- 配った後に改善しても、既存のプロジェクトには届かない（コピーなので更新経路が無い）
- テンプレートから作らなかったプロジェクトは、機能だけを取り込めない
- テンプレートに入れるほど、生成直後のプロジェクトに不要なファイルが増える

パッケージにすれば、更新は `npm update` で届き、要る人だけが入れられる。

## リポジトリの構成

**このリポジトリをモノレポ化して、公開物もここに置く。** 別リポジトリには分けない。

既に npm workspaces にはなっているが、現在の workspace は `blog` と `lp` の 2 つだけで、
どちらも `builder/` から生成される出力である。ここに手書きの公開パッケージを足す。

```
builder/          # テンプレートの原本（既存）
blog/  lp/        # builder から生成される出力。直接編集禁止（既存）
packages/         # 新規: npm に公開するパッケージ。手書き
  <package>/
```

`scripts/sync-templates.mjs` は `builder/` 直下のディレクトリだけを走査するので、
`packages/` は sync の対象外になる。生成物と手書きが混ざる心配は無い。

ルート `package.json` の `workspaces` に `packages/*` を足すこと。

## `astro add` の要件

astro 7.2.4 の `dist/cli/add/index.js` を読んで確認した。サードパーティのパッケージが
`astro add` で入るには、次の 3 つを満たす必要がある。

1. **npm レジストリに公開されていること** — レジストリから package.json を取得する。
   GitHub URL やローカルパスでは動かない
2. **`keywords` に `"astro-integration"` が入っていること** — 無いと
   `doesn't appear to be an integration or an adapter` で停止する
3. **default export であること** — `imported: "default"` で import 文を生成する

加えて、挿入されるのは **引数なしの呼び出し**（`builders.functionCall`）である。

```js
integrations: [fontOptimizer()]
```

設定値を渡すのは利用者の手作業になるので、**引数なしで壊れないこと**を前提に作る。
必須オプションを持たせてはいけない。

optional でない `peerDependencies`（`astro` を除く）は利用者側にも一緒に入る。
利用者が意識しなくてよい依存は `dependencies` に置くこと。

## パッケージ名

`toIdent()` を実際に動かして確認した結果。

| 名前 | 生成される設定 | 「公式ではない」確認プロンプト |
| --- | --- | --- |
| `astro-font-optimizer` | `integrations: [ fontOptimizer() ]` | **出る** |
| `@m1m0zzz/astro-font-optimizer` | `integrations: [ m1m0zzzfontOptimizer() ]` | 出ない |

スコープ無しの名前は、先に `@astrojs/<name>` の存在を確認しに行き、無ければ
`is not an official Astro package` と警告して続行可否を聞く（`--yes` で飛ばせる）。
スコープ付きは即サードパーティ扱いで素通りするが、識別子が汚れる。

**スコープ無しを採る。** プロンプトは 1 回きりだが、生成される設定は永続的に読まれる。

## 移行候補

**`astro add` で入れられるのは integration だけである。** UI コンポーネントは
`integrations` 配列に入らないので、`astro add` では配れない。ここが候補を分ける境界。

| 対象 | integration にできるか | 備考 |
| --- | --- | --- |
| `src/integrations/font-optimizer`（dream-trip） | **できる。既になっている** | `export default (options = {}) => AstroIntegration`。外部依存は `jsdom` のみ。3 要件のうち残るは公開と `keywords` だけ |
| `GoogleAnalytics.astro` | **できる** | `injectScript("head-inline", ...)` で全ページの `<head>` に gtag スニペットを入れられる。現状の外部 `<script src>` は、インライン側から差し込む形に書き換える |
| `ThemeScript.astro` + `ThemeIcon.astro` | **半分だけ** | FOUC 防止の `ThemeScript` は `head-inline` に載る。`ThemeIcon` はトグルの見た目なのでコンポーネントのまま。分割して配ることになり、利用者から見て中途半端になる |
| `src/lib/path.ts`（`withBase`） | できない | ただのユーティリティ。`astro add` ではなく `npm i` で入れるもの |
| `Button.astro` / `ShareButtons.astro` | できない | UI コンポーネント。配るならコンポーネント集として公開し、`import Button from "<pkg>/Button.astro"` で使う形になる |
| `scripts/generate-favicon.ts`（dream-trip から持ち込み予定） | できる | ビルド時に生成する integration にもできるが、単発スクリプトのままでも困らない。急がない |

### GoogleAnalytics の未決事項

`astro add` は引数なしで挿入するので、測定 ID をどう受け取るかを決める必要がある。

- 利用者が `googleAnalytics({ id: "G-XXXX" })` と手で書き足す
- 環境変数（`PUBLIC_GA_ID` など）から読み、未設定なら何もしない

後者なら `astro add` した直後から設定ファイルを触らずに済むが、ID の在り処が
astro.config から見えなくなる。**まだ決めていない。**

## 順序

1. `font-optimizer` を最初の 1 つにする。既に integration の形をしており、
   プロジェクト固有の参照も無いため、パッケージ化の型を作る題材として一番軽い
2. 型が固まってから `GoogleAnalytics` を追う
3. UI コンポーネント群は、`astro add` の枠組みに乗らないので後回し。
   そもそも配るべきかから考える

## 判断の前に確認すること

**astro 7 には組み込みの `fonts` がある。** `experimental` の外にある安定機能で、
プロバイダーに google / fontsource / adobe / bunny / fontshare が揃っている。

ただし組み込みの `subsets` / `unicodeRange` は「どのフォントファイルを落とすか」の
制御であり、ページに実際に出ている字だけを含むフォントを作るわけではない。
dream-trip の font-optimizer は Google Fonts の `text=` パラメータを使って
**グリフ単位**でサブセットを要求しており、そこが別物になっている。

Google Fonts を self-host したいだけなら組み込みで足りる。日本語フォントを
実際に使う字まで削りたい場合にだけ、font-optimizer に意味がある。
**パッケージ化に着手する前に、テンプレートとしてどちらを要るとするかを決めること。**
