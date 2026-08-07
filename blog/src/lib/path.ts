/**
 * 末尾スラッシュを保証した base。`import.meta.env.BASE_URL` は
 * `astro.config.mjs` の `base` に由来し、書き方によって末尾スラッシュの
 * 有無が変わるため、ここで揃えておく。
 */
const BASE = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`

/**
 * サイト内のリンクやアセットのパスを base 付きで組み立てる。
 * サブディレクトリ配信では `href="/about"` のようなルート相対パスが
 * base を無視して壊れるため、内部リンクは必ずこの関数を通すこと。
 *
 * @param path 先頭のスラッシュは付けても付けなくてもよい。省略すると base 自身
 * @example withBase("about") // base が "/lp" なら "/lp/about"
 */
export function withBase(path = ""): string {
  return `${BASE}${path.replace(/^\//, "")}`
}

/**
 * `Astro.url.pathname` から base を取り除く。現在どのページを開いているかの
 * 判定など、base を含まないパスで比較したいときに使う。
 *
 * @example stripBase("/lp/about") // base が "/lp" なら "about"
 */
export function stripBase(pathname: string): string {
  return pathname.startsWith(BASE)
    ? pathname.slice(BASE.length)
    : pathname.replace(/^\//, "")
}
