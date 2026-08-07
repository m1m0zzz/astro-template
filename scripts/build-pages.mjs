// Assembles the GitHub Pages site from README.md and the built templates.
//
// Output:
//   _site/index.html   <- rendered README.md
//   _site/lp/          <- lp/dist
//   _site/blog/        <- blog/dist
//
// Each template's `base` (see its astro.config.mjs) must match the directory it
// lands in here, otherwise its asset URLs point nowhere.
//
// Run: `npm run build && npm run build:pages`
//      `node scripts/build-pages.mjs [outDir]`   (default: _site/)
//      `node scripts/build-pages.mjs --preview`  (_preview/<base>/, see below)

import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { marked } from 'marked';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// Pages serves this project site under the repository name. Must match the
// `base` in each template's astro.config.mjs, minus the template name.
const BASE = '/astro-template/';

// Every path in the output is absolute and rooted at BASE, so a plain static
// server must see the site nested under that path. `--preview` builds into
// `_preview/<base>/` and `npm run preview` serves `_preview/`, which reproduces
// the deployed URLs exactly instead of relying on server rewrite rules.
const args = process.argv.slice(2);
const preview = args.includes('--preview');

const previewRoot = join(root, '_preview');
const outDir = preview
  ? join(previewRoot, ...BASE.split('/').filter(Boolean))
  : (args.find((a) => !a.startsWith('-')) ?? join(root, '_site'));

// Same discovery rule as scripts/sync-templates.mjs, so a new template needs no
// change here.
function getTemplates() {
  return readdirSync(join(root, 'builder'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'shared')
    .map((e) => e.name);
}

function buildIndex() {
  const readme = readFileSync(join(root, 'README.md'), 'utf8');

  // The README's first h1 doubles as the page title.
  const title = readme.match(/^#\s+(.+)$/m)?.[1] ?? 'Astro Templates';

  // README links are relative so they work on GitHub (`./lp/`). On the deployed
  // page they must be rooted at the base, otherwise they break whenever the
  // index is reached without a trailing slash.
  const body = marked
    .parse(readme, { async: false })
    .replace(/href="\.\/([^"]*)"/g, (_, path) => `href="${BASE}${path}"`)
    // Tables are the one block that can outgrow the column, so let them scroll
    // on their own instead of the page.
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>');

  writeFileSync(
    join(outDir, 'index.html'),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="icon" href="${BASE}favicon.ico" sizes="32x32" />
    <link rel="icon" href="${BASE}favicon.svg" type="image/svg+xml" />
    <style>${css}</style>
  </head>
  <body>
    ${body}
    <footer>
      Generated from <code>README.md</code>. Source on
      <a href="https://github.com/m1m0zzz/astro-template">GitHub</a>.
    </footer>
  </body>
</html>
`,
  );

  // The landing page is not an Astro build, so its favicons are copied straight
  // from the shared template assets.
  for (const icon of ['favicon.ico', 'favicon.svg']) {
    copyFileSync(join(root, 'builder', 'shared', 'public', icon), join(outDir, icon));
  }
}

const css = `
  :root {
    color-scheme: light dark;
    --bg: #ffffff;
    --fg: #1f2328;
    --muted: #59636e;
    --border: #d1d9e0;
    --surface: #f6f8fa;
    --accent: #0969da;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0d1117;
      --fg: #f0f6fc;
      --muted: #9198a1;
      --border: #3d444d;
      --surface: #151b23;
      --accent: #4493f8;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0 auto;
    padding: 3rem 1.5rem 6rem;
    max-width: 48rem;
    background: var(--bg);
    color: var(--fg);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue",
      "Hiragino Sans", "Noto Sans JP", Arial, sans-serif;
    line-height: 1.7;
  }
  h1, h2, h3 { line-height: 1.3; margin: 2.5rem 0 1rem; }
  h1 { margin-top: 0; font-size: 2rem; }
  h2 {
    padding-bottom: 0.3rem;
    border-bottom: 1px solid var(--border);
    font-size: 1.4rem;
  }
  a { color: var(--accent); }
  ul, ol { padding-left: 1.5rem; }
  li { margin: 0.25rem 0; }
  code {
    padding: 0.2em 0.4em;
    border-radius: 6px;
    background: var(--surface);
    font-size: 0.9em;
  }
  pre {
    overflow-x: auto;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
  }
  pre code { padding: 0; background: none; }
  .table-wrap { overflow-x: auto; }
  table { border-collapse: collapse; }
  th, td {
    padding: 0.5rem 0.9rem;
    border: 1px solid var(--border);
    text-align: left;
  }
  th { background: var(--surface); }
  footer {
    margin-top: 4rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    color: var(--muted);
    font-size: 0.9rem;
  }
`;

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

buildIndex();

for (const name of getTemplates()) {
  const dist = join(root, name, 'dist');
  if (!existsSync(dist)) {
    console.error(`missing ${name}/dist — run \`npm run build\` first.`);
    process.exit(1);
  }
  // `base` does not nest the output: dist/ itself maps to the base path.
  cpSync(dist, join(outDir, name), { recursive: true });
  console.log(`copied: ${name}/dist -> ${name}/`);
}

console.log(`built: ${outDir}`);

if (preview) {
  console.log(`\nserve ${previewRoot}, then open http://localhost:4321${BASE}`);
}
