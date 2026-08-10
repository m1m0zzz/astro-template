import { type CollectionEntry, getCollection } from "astro:content"

import { BLOG } from "@/config"

export type Post = CollectionEntry<"posts">

/**
 * 公開対象の記事を新しい順で返す。
 *
 * `draft: true` の記事は dev では見えるが、本番ビルドからは除外される。
 * 一覧・タグ・RSS・OG 画像すべてがこの関数を通ることで、draft の扱いが
 * ページごとにずれないようにしている。
 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  )

  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  )
}

/** タグと記事数の一覧。件数の多い順、同数ならタグ名順 */
export function getAllTags(posts: Post[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>()

  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export function filterByTag(posts: Post[], tag: string): Post[] {
  return posts.filter((post) => post.data.tags.includes(tag))
}

/**
 * 読了時間（分）。Markdown の本文から記法をおおまかに取り除き、
 * 残った文字数を `BLOG.charsPerMinute` で割って概算する。
 *
 * 英単語区切りで数える `reading-time` 系のパッケージは日本語だと当てにならず、
 * remark プラグインを使うと `@astrojs/markdown-remark` の追加が必要になるため、
 * 本文（`post.body`）から直接計算している。
 */
export function getReadingTime(post: Post): number {
  const text = (post.body ?? "")
    .replace(/```[\s\S]*?```/g, "") // コードブロック
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // リンク・画像
    .replace(/[#>*_`~|-]/g, "") // 記法の記号
    .replace(/\s+/g, "")

  return Math.max(1, Math.round([...text].length / BLOG.charsPerMinute))
}

/**
 * 前後の記事。`posts` は新しい順である前提。
 * `prev` が古い記事、`next` が新しい記事。
 */
export function getPrevNext(
  posts: Post[],
  id: string,
): { prev?: Post; next?: Post } {
  const index = posts.findIndex((post) => post.id === id)
  if (index === -1) return {}

  return {
    prev: posts[index + 1],
    next: posts[index - 1],
  }
}
