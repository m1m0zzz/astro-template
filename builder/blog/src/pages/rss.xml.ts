import rss from "@astrojs/rss"
import type { APIContext } from "astro"

import { SITE } from "@/config"
import { withBase } from "@/lib/path"
import { getPosts } from "@/lib/posts"

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error(
      "RSS の生成には astro.config.mjs の `site` が必要です。設定してください。",
    )
  }

  const posts = await getPosts()

  return rss({
    title: SITE.name,
    description: SITE.description,
    // サブディレクトリ配信でもフィードのリンクがサイトのトップを指すよう base を含める
    site: new URL(withBase(), context.site),
    // `link` は site からの相対パス。base を含める必要があるので withBase を通す
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: withBase(`posts/${post.id}/`),
      categories: post.data.tags,
    })),
    customData: `<language>${SITE.lang}</language>`,
  })
}
