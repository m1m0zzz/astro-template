import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

/**
 * OG 画像生成（satori）が使うフォントの取得。
 *
 * satori が読めるのは ttf / otf / woff で、woff2 は読めない。
 * Google Fonts の CSS API は日本語フォントに woff2 の分割サブセットしか返さず、
 * レガシー UA で得られる ttf は日本語グリフを含まないラテン専用サブセットなので、
 * woff をそのまま配布している fontsource（jsDelivr）から取得している。
 *
 * 取得したフォントは node_modules 配下にキャッシュするため、ネットワークに
 * 出るのは初回ビルドだけ。取得に失敗した場合は OG 画像が欠けたまま公開されない
 * よう、例外を投げてビルドを止める。
 */

const CDN = "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files"

const CACHE_DIR = join(process.cwd(), "node_modules", ".cache", "og-fonts")

/**
 * 日本語サブセットにはラテン文字も含まれているので、これだけで足りる。
 * 同じ名前で複数のフォントを渡しても satori は先頭のものしか使わず、
 * ラテン用サブセットを一緒に登録すると日本語が豆腐になる点に注意。
 */
const FILES = [
  { file: "noto-sans-jp-japanese-400-normal.woff", weight: 400 },
  { file: "noto-sans-jp-japanese-700-normal.woff", weight: 700 },
] as const

export interface OgFont {
  name: string
  data: Buffer
  weight: 400 | 700
  style: "normal"
}

let fonts: Promise<OgFont[]> | null = null

/** フォントを読み込む。1 回のビルド中は最初の呼び出し結果を使い回す */
export function loadFonts(): Promise<OgFont[]> {
  fonts ??= Promise.all(FILES.map(loadFont))
  return fonts
}

async function loadFont({
  file,
  weight,
}: (typeof FILES)[number]): Promise<OgFont> {
  return {
    name: "Noto Sans JP",
    data: await readCached(file),
    weight,
    style: "normal",
  }
}

async function readCached(file: string): Promise<Buffer> {
  const cached = join(CACHE_DIR, file)

  try {
    return await readFile(cached)
  } catch {
    // キャッシュが無いだけなので、取得して作る
  }

  const url = `${CDN}/${file}`
  let response: Response
  try {
    response = await fetch(url)
  } catch (cause) {
    throw new Error(`OG 画像用フォントの取得に失敗しました: ${url}`, { cause })
  }

  if (!response.ok) {
    throw new Error(
      `OG 画像用フォントの取得に失敗しました: ${url} (${response.status} ${response.statusText})`,
    )
  }

  const data = Buffer.from(await response.arrayBuffer())

  await mkdir(CACHE_DIR, { recursive: true })
  await writeFile(cached, data)

  return data
}
