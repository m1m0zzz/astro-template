# astronaut (astro-template)

[日本語](./README.md)

## 🧩 Components (ToDo)

Install

```sh
npm i @m1m0zzz/astronaut
```

List of Components

- `Carousel`
- `GoogleAnalytics`


## 🖨️ Templates

use Template

1. Run one of the commands below.

```sh
npm create astro@latest -- --template m1m0zzz/astro-template/lp
```

```sh
npm create astro@latest -- --template m1m0zzz/astro-template/blog
```

2. Open your preferred editor (VSCode is recommended) and replace the string `TODO`.

### ✨ Features

Task List is TODO

#### Base

- Tailwind CSS
- AGENTS.md
- OGP template
- dark mode (theme toggle)
- share buttons
- ESLint + Prettier
- husky + lint-staged
- VSCode config
- additional tools and configs: nvm (Node=24), npmrc, editorconfig, cspell, renovate
- [ ] ~~astro/sitemap~~
- [ ] icon convert script

#### [LP](./lp) \[[Demo](https://m1m0zzz.github.io/astro-template/lp/)\]

- [ ] Font Optimizer
- [ ] Carousel Component (use `Embla Carousel`)

#### [Blog](./blog/)  \[[Demo](https://m1m0zzz.github.io/astro-template/blog/)\]

- astro/sitemap
- Content Collections (posts + authors)
- Blog Layout
  - blog css (`@tailwindcss/typography`)
  - ToC (Table of Content) Component
- list page (pagination, tag pages, RSS)
- author frontmatter (name,link,icon)
- Dynamic OG Images (satori + resvg, generated at build time)
- reading time / share buttons / prev-next links
- dark mode toggle
