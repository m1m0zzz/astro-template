---
title: タグと著者の設定
description: 記事につけるタグと、authors.json で管理する著者情報の関係を説明します。
pubDate: 2026-08-08
tags:
  - astro
  - tips
author: mimoz
---

タグと著者は、どちらも frontmatter から指定します。

## タグ

`tags` に文字列の配列を書くと、タグ別のページが自動で生成されます。

```yaml
tags:
  - astro
  - tips
```

生成される URL は `/tags/<タグ名>/` です。記事が多いタグはページ送りが付きます。
タグ全体の一覧は `/tags/` から見られます。

## 著者

著者は記事ごとに書くのではなく、`src/content/authors.json` にまとめて定義し、
記事からは ID で参照します。

```json
{
  "mimoz": {
    "name": "mimoz",
    "link": "https://github.com/m1m0zzz",
    "icon": "https://github.com/m1m0zzz.png"
  }
}
```

記事側の指定はキーだけです。

```yaml
author: mimoz
```

`authors.json` に無い ID を書くとビルド時にエラーになるので、
書き間違いに気付けます。

### 表示される場所

著者名は記事ページと一覧のカードに出ます。OG 画像の右下にも入ります。
`icon` と `link` は省略できます。
