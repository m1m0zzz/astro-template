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
// The landing page is rendered from scripts/pages-templates/ (index.html +
// style.css). Placeholders in the template are written as `${NAME}`.
//
// Run: `npm run build && npm run build:pages`
//      `node scripts/build-pages.mjs [outDir]`   (default: _site/)
//
// Serving the result locally is `npm run preview` (scripts/preview.mjs).

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

const REPO = 'https://github.com/m1m0zzz/astro-template';

// Where the README's relative links point once they leave GitHub.
const REPO_TREE = `${REPO}/tree/main/`;

// The deployed URL as written in the README. Rewritten to a site-relative path
// so the demo links stay inside whatever is being served -- including
// `npm run preview`, which would otherwise jump to the published site.
const SITE_URL = `https://m1m0zzz.github.io${BASE}`;

const args = process.argv.slice(2);
const outDir = args.find((a) => !a.startsWith('-')) ?? join(root, '_site');

const templateDir = join(root, 'scripts', 'pages-templates');

// Fills `${NAME}` placeholders. Substituted values are inserted verbatim: they
// are never scanned for further placeholders.
function render(template, values) {
  return template.replace(/\$\{(\w+)\}/g, (match, key) =>
    key in values ? values[key] : match,
  );
}

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

  // The README is written for GitHub: relative links point at the sources in the
  // repository, and the demo links are absolute. Rewrite both for the generated
  // page.
  const body = marked
    .parse(readme, { async: false })
    .replace(/href="\.\/([^"]*)"/g, (_, path) => `href="${REPO_TREE}${path}"`)
    .replaceAll(SITE_URL, BASE)
    // Tables are the one block that can outgrow the column, so let them scroll
    // on their own instead of the page.
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>');

  writeFileSync(
    join(outDir, 'index.html'),
    render(readFileSync(join(templateDir, 'index.html'), 'utf8'), {
      TITLE: title,
      BASE,
      REPO,
      STYLE: readFileSync(join(templateDir, 'style.css'), 'utf8').trimEnd(),
      BODY: body,
    }),
  );

  // The landing page is not an Astro build, so its favicons are copied straight
  // from the shared template assets.
  for (const icon of ['favicon.ico', 'favicon.svg']) {
    copyFileSync(join(root, 'builder', 'shared', 'public', icon), join(outDir, icon));
  }
}

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
