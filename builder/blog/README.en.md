# mimoz's Astro Starter Kit: Blog

[日本語](./README.md)

```sh
npm create astro@latest -- --template m1m0zzz/astro-template/blog
```

## ✨ Features

- Tailwind CSS (+ `@tailwindcss/typography` for post bodies)
- Content Collections for posts and authors
- Post list with pagination, tag pages, and an RSS feed
- Table of contents with scroll highlighting
- Reading time, share buttons, prev/next links
- Per-post OG images generated at build time (satori + resvg)
- Light / dark theme with a toggle
- astro/sitemap
- ESLint + Prettier
- husky + lint-staged
- VSCode config

## ✍️ Writing posts

Put a Markdown file in `src/content/posts/`. The file name becomes the slug, so
`src/content/posts/hello.md` is served at `/posts/hello/`.

```md
---
title: 記事のタイトル
description: 一覧と OGP に出る説明文
pubDate: 2026-08-01
updatedDate: 2026-08-07 # optional
draft: false # optional
tags:
  - astro
author: mimoz # optional, a key in src/content/authors.json
---

本文をここに書く。
```

- `draft: true` posts show up in `npm run dev` but are excluded from the build,
  the RSS feed, the sitemap, and OG image generation.
- Authors live in `src/content/authors.json` and are referenced by key. A key that
  does not exist fails the build. Leave `author` out and no author is shown.
- Avoid slugs that are only digits — the post list uses `/posts/2/` for its
  second page, so `src/content/posts/2.md` would collide with it.

## 🔧 Where to start

1. Replace the `TODO`s in `src/config.ts` (site name, description, Twitter ID).
2. Point `site` / `base` in `astro.config.mjs` at your own URL.
3. Put your own entries in `src/content/authors.json`.
4. Delete the sample posts in `src/content/posts/`. The `dummy-*.md` ones only
   exist so the list and tag pages have enough posts to paginate.

`src/config.ts` also holds the blog settings: posts per page, how many posts the
landing page shows, which heading levels go into the table of contents, and the
characters-per-minute used for reading time.

## 🖼️ OG images

`src/pages/og/[...slug].png.ts` renders one PNG per post plus `og/default.png`
for the other pages. The first build downloads Noto Sans JP (woff, from
fontsource via jsDelivr) and caches it under `node_modules/.cache/og-fonts/`, so
that build needs network access. If the download fails the build stops rather
than shipping pages without OG images.

To change the design, edit `template()` in `src/lib/server/og.ts`.

## 🧩 Optional pieces

The table of contents, reading time, share buttons, prev/next links, and the code
copy button are separate components. Drop the corresponding line from
`src/layouts/PostLayout.astro` to remove any of them.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🌐 Deploying to a subdirectory

`astro.config.mjs` ships with the values this repository uses for its own demo:

```js
site: "https://m1m0zzz.github.io",
base: "/astro-template/blog/",
```

- **Serving from the root of a domain** — delete `base` and set `site` to your URL.
- **Serving from a subdirectory** (GitHub Pages project sites, etc.) — keep only
  the origin in `site` and put the subpath in `base`. `@astrojs/sitemap` joins the
  two, so a `site` that already contains the subpath would double it.
- **Keep the trailing slash on `base`** — `@astrojs/sitemap` builds its URLs from
  both the built pages and the route definitions, and only the former uses `base`
  verbatim. Without the trailing slash the two disagree on the home page and it
  is listed twice.

Internal links and asset paths must go through `withBase()` from `src/lib/path.ts`:

```astro
---
import { withBase } from "@/lib/path"
---

<a href={withBase("about")}>About</a>
<link rel="icon" href={withBase("favicon.svg")} />
```

A root-relative path such as `href="/favicon.svg"` ignores `base` and breaks as
soon as the site is not served from the root.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
