// build:pages の成果物（_site/）をローカルで配信するための準備をする。
//
// vite preview や astro preview と同じく、ここではビルドしない。成果物が無ければ
// エラーで止まる。
//
// 出力の全パスは BASE 付きの絶対パスなので、静的サーバーはその階層の下でサイトを
// 見る必要がある。`_preview/<base>` を `_site/` へのシンボリックリンクにして
// `_preview/` を配信することで、コピーもビルドもせずに本番と同じ URL を再現する。
//
// Run: `npm run preview`（このあと `serve _preview` が起動する）

import { existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// scripts/build-pages.mjs の BASE と揃えること。
const BASE = '/astro-template/';
const PORT = 4321;

const siteDir = join(root, '_site');

if (!existsSync(siteDir)) {
  console.error(
    '_site/ が見つかりません。先に `npm run build && npm run build:pages` を実行してください。',
  );
  process.exit(1);
}

const previewRoot = join(root, '_preview');
const linkPath = join(previewRoot, ...BASE.split('/').filter(Boolean));

rmSync(previewRoot, { recursive: true, force: true });
mkdirSync(dirname(linkPath), { recursive: true });
// Windows でシンボリックリンクを張るには権限が要るので junction を使う。
symlinkSync(siteDir, linkPath, process.platform === 'win32' ? 'junction' : 'dir');

console.log(`linked: _site/ -> _preview${BASE}`);
console.log(`open http://localhost:${PORT}${BASE}`);
