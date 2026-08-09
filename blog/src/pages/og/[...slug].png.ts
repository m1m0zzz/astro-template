import type { APIRoute, GetStaticPaths } from "astro"
import { getEntry } from "astro:content"

import { SITE } from "@/config"
import { renderOgImage } from "@/lib/og"
import { getPosts } from "@/lib/posts"

/**
 * OG 画像をビルド時に生成する。
 *
 * - 記事: `/og/<slug>.png`
 * - トップ・一覧・タグ用: `/og/default.png`
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts()

  const postPaths = await Promise.all(
    posts.map(async (post) => {
      const author = post.data.author
        ? await getEntry(post.data.author)
        : undefined

      return {
        params: { slug: post.id },
        props: { title: post.data.title, subtitle: author?.data.name },
      }
    }),
  )

  return [
    {
      params: { slug: "default" },
      props: { title: SITE.name, subtitle: SITE.description },
    },
    ...postPaths,
  ]
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage({
    title: props.title,
    subtitle: props.subtitle,
  })

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  })
}
