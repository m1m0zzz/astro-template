/**
 * favicon.svg から favicon.ico と apple-touch-icon.png を作る。
 *
 *   npx tsx scripts/generate-favicon.ts
 *   npx tsx scripts/generate-favicon.ts --apple-background "#0b1020"
 *   npx tsx scripts/generate-favicon.ts --dir public
 *
 * `--dir` は元の svg を読む場所と生成物を書く場所の両方を指す（この3つは同じ
 * ディレクトリに並んでいる前提の作りなので、片方だけずらせるようにはしていない）。
 *
 * SVG に対応しているブラウザは favicon.svg をそのまま使うので、ここで作るのは
 * 対応していない環境（Safari、Windows のピン留めなど）向けの控えになる。
 */
import { Buffer } from "node:buffer"
import { writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

/**
 * 不透明な下地を渡されたかどうかを見るので、alpha は省略できない。
 * sharp 0.35 で `Color` が `@img/colour` の緩い型（`Record<string, any>` を含む）に
 * 変わり、そこから RGBA を絞り込めなくなったので自前で持つ。
 */
interface Background {
  r: number
  g: number
  b: number
  alpha: number
}

interface IcoImage {
  /** 一辺の長さ(px) */
  size: number
  png: Buffer
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const DEFAULT_DIR = "public"

const TRANSPARENT: Background = { r: 0, g: 0, b: 0, alpha: 0 }

/**
 * ico に入れる一辺の長さ。16 はタブとブックマーク、32 は高 DPI のタブと
 * タスクバー、48 は Windows のショートカット用。
 */
const SIZES = [16, 32, 48]

/** ico のヘッダのバイト数 */
const HEADER_SIZE = 6
/** 画像 1 枚ぶんの索引のバイト数 */
const ENTRY_SIZE = 16

/** apple-touch-icon の一辺。iOS が求める最大のサイズに合わせる */
const APPLE_TOUCH_SIZE = 180
/**
 * apple-touch-icon の下地の既定。(iOS は透過を白ではなく黒で塗り潰す)
 * 地の色が濃いサイトに合わせたいときは `--apple-background` で変えられる。
 * `transparent` も渡せるが、それはこの黒塗りを承知で選ぶ場合に限る。
 */
const DEFAULT_APPLE_TOUCH_BACKGROUND: Background = {
  r: 255,
  g: 255,
  b: 255,
  alpha: 1,
}

/**
 * `#rgb` `#rgba` `#rrggbb` `#rrggbbaa`（`#` は省略可）と `transparent` を受ける。
 * 色名を sharp に丸投げしないのは、下地が透けるかどうかを alpha で見ているため。
 *
 * alpha は 00 か ff だけで、その間は受け付けない（下の throw を参照）。
 */
function parseBackground(value: string): Background {
  const input = value.trim().toLowerCase()
  if (input === "transparent") return TRANSPARENT

  const hex = input.startsWith("#") ? input.slice(1) : input
  if (!/^[0-9a-f]+$/.test(hex) || ![3, 4, 6, 8].includes(hex.length)) {
    throw new Error(
      `--apple-background に解釈できない色です: ${value}\n` +
        `#rgb / #rgba / #rrggbb / #rrggbbaa か transparent を渡してください。`,
    )
  }

  // 3桁と4桁は1桁を2桁へ伸ばす（#abc → #aabbcc）
  const pairs =
    hex.length <= 4
      ? [...hex].map((digit) => digit + digit)
      : (hex.match(/../g) ?? [])
  const [r = 0, g = 0, b = 0, a = 255] = pairs.map((pair) =>
    Number.parseInt(pair, 16),
  )

  /*
   * 半透明の下地は、意図どおりに出る表示先が無いので受け取らない。
   * iOS は apple-touch-icon の alpha を捨てて黒で塗り潰し、Android の Chrome は
   * ホーム画面のアイコンに自前のマスクと背景を被せる。
   *
   * 加えてこの実装では、そもそも絵に届かない。全面を塗るのは renderPng() の
   * flatten() で、それが走るのは alpha が 1 のときだけ。resize() に渡す
   * background はレターボックスしか塗らないため、favicon.svg のような正方形が
   * 相手だと塗る場所が無く、指定が黙って消える。
   */
  if (a !== 0 && a !== 255) {
    throw new Error(
      `--apple-background の alpha は 00 か ff だけです: ${value}\n` +
        `半透明の下地は、iOS でも Android でも指定どおりには出ません。`,
    )
  }

  return { r, g, b, alpha: a / 255 }
}

/** `--name value` を読む。値を伴わない指定は打ち間違いとみなす */
function readOption(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(`--${name}`)
  if (index < 0) return undefined

  const value = argv[index + 1]
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`--${name} には値を渡してください`)
  }
  return value
}

/** 出力の報告用。`{ r, g, b, alpha }` を読める形に戻す */
function formatBackground({ r, g, b, alpha }: Background): string {
  if (alpha === 0) return "transparent"
  const hex = [r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")
  return `#${hex}`
}

/**
 * SVG を size×size の PNG にする。SVG は解像度を持たないので、目標のサイズに
 * なるよう density を決めてから描かせる（拡大縮小を挟まないぶん輪郭が濁らない）。
 */
async function renderPng(
  source: string,
  size: number,
  background: Background = TRANSPARENT,
): Promise<Buffer> {
  const { width = size, height = size } = await sharp(source).metadata()
  const density = Math.round((72 * size) / Math.max(width, height))

  const image = sharp(source, { density }).resize(size, size, {
    fit: "contain",
    background,
  })
  // 透けない下地を渡されたときは、絵の透明な部分もその色で埋める
  if (background.alpha === 1) image.flatten({ background })

  return image.png({ compressionLevel: 9, palette: false }).toBuffer()
}

function packIco(images: IcoImage[]): Buffer {
  const header = Buffer.alloc(HEADER_SIZE)
  header.writeUInt16LE(0, 0) // 予約領域
  header.writeUInt16LE(1, 2) // 1 = アイコン（2 だとカーソル）
  header.writeUInt16LE(images.length, 4)

  let offset = HEADER_SIZE + ENTRY_SIZE * images.length
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(ENTRY_SIZE)
    entry.writeUInt8(size === 256 ? 0 : size, 0) // 256 は 0 で表す
    entry.writeUInt8(size === 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2) // パレットの色数。フルカラーなので 0
    entry.writeUInt8(0, 3) // 予約領域
    entry.writeUInt16LE(1, 4) // プレーン数
    entry.writeUInt16LE(32, 6) // 1 ピクセルのビット数（RGBA）
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += png.length
    return entry
  })

  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)])
}

// 引数の間違いで ico だけ書けた状態にならないよう、書き出す前に読む
const argv = process.argv.slice(2)
// 相対パスは cwd ではなくリポジトリの root から辿る（どこから呼んでも同じ場所を指す）
const dir = path.resolve(root, readOption(argv, "dir") ?? DEFAULT_DIR)
const backgroundOption = readOption(argv, "apple-background")
const appleTouchBackground =
  backgroundOption === undefined
    ? DEFAULT_APPLE_TOUCH_BACKGROUND
    : parseBackground(backgroundOption)

const source = path.join(dir, "favicon.svg")
const icoPath = path.join(dir, "favicon.ico")
const appleTouchIconPath = path.join(dir, "apple-touch-icon.png")

const images: IcoImage[] = await Promise.all(
  SIZES.map(async (size) => ({ size, png: await renderPng(source, size) })),
)
const ico = packIco(images)
await writeFile(icoPath, ico)

const appleTouchIcon = await renderPng(
  source,
  APPLE_TOUCH_SIZE,
  appleTouchBackground,
)
await writeFile(appleTouchIconPath, appleTouchIcon)

const summary = images
  .map(({ size, png }) => `${size}px ${png.length}B`)
  .join(", ")
// root の外を指されたときは、辿り直した相対パスより絶対パスの方が読める
const relative = path.relative(root, dir)
const where = relative === "" ? "." : relative.startsWith("..") ? dir : relative
console.log(
  `${where}/favicon.ico を書き出しました（${summary} / 合計 ${ico.length}B）`,
)
console.log(
  `${where}/apple-touch-icon.png を書き出しました` +
    `（${APPLE_TOUCH_SIZE}px ${appleTouchIcon.length}B` +
    ` / 下地 ${formatBackground(appleTouchBackground)}）`,
)
