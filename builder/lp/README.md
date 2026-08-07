# mimoz's Astro Starter Kit: LP

```sh
npm create astro@latest -- --template m1m0zzz/astro-template/lp
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## ✨ Features

- Tailwind CSS
- astro/sitemap
- OGP template
- ESLint + Prettier
- husky + lint-staged
- VSCode config

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
base: "/astro-template/lp/",
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
