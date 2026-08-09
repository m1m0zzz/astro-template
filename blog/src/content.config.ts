import { file, glob } from "astro/loaders"
import { z } from "astro/zod"
import { defineCollection, reference } from "astro:content"

/**
 * 記事。`src/content/posts/*.md` の 1 ファイルが 1 記事で、
 * ファイル名（拡張子を除く）がそのまま URL の slug になる。
 *
 * `_` で始まるファイルは読み込まれないので、下書きの置き場として使える。
 */
const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/[^_]*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** true の記事は dev では見えるが、ビルド結果には含まれない */
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    /** authors.json のキーを指定する */
    author: reference("authors"),
  }),
})

/**
 * 著者。`src/content/authors.json` のキーが ID になる。
 * 記事側は `author: <キー>` で参照する。
 */
const authors = defineCollection({
  loader: file("src/content/authors.json"),
  schema: z.object({
    name: z.string(),
    /** プロフィールページなどの URL */
    link: z.string().url().optional(),
    /** アイコン画像の URL */
    icon: z.string().url().optional(),
  }),
})

export const collections = { posts, authors }
