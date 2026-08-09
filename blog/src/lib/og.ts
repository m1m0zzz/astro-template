import { Resvg } from "@resvg/resvg-js"
import satori from "satori"

import { SITE } from "@/config"
import { loadFonts } from "@/lib/fonts"

/**
 * OG 画像（1200×630 の PNG）をビルド時に生成する。
 *
 * satori に渡す要素ツリーはプレーンなオブジェクトで組み立てている。
 * JSX を使うと Astro プロジェクト全体に JSX ランタイムの設定が必要になるため。
 */

const WIDTH = 1200
const HEIGHT = 630

/** OG 画像の配色。CSS 変数は読めないので global.css とは別に持つ */
const COLORS = {
  background: "#1b1b1f",
  foreground: "#ffffff",
  muted: "#a1a1aa",
  primary: "#f9881e",
}

/** 画像に収まる長さにタイトルを丸める */
const MAX_TITLE_LENGTH = 70

interface OgImageOptions {
  title: string
  /** 画像下部に出す補足。記事なら著者名など */
  subtitle?: string
}

type OgNode = {
  type: string
  props: { style?: Record<string, unknown>; children?: unknown }
}

const el = (type: string, props: OgNode["props"]): OgNode => ({ type, props })

function truncate(text: string): string {
  return text.length > MAX_TITLE_LENGTH
    ? `${text.slice(0, MAX_TITLE_LENGTH - 1)}…`
    : text
}

function template({ title, subtitle }: OgImageOptions): OgNode {
  return el("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      width: "100%",
      height: "100%",
      padding: "72px",
      backgroundColor: COLORS.background,
      // 上端のアクセントライン
      borderTop: `16px solid ${COLORS.primary}`,
      fontFamily: "Noto Sans JP",
    },
    children: [
      el("div", {
        style: {
          display: "flex",
          fontSize: 64,
          fontWeight: 700,
          lineHeight: 1.3,
          color: COLORS.foreground,
        },
        children: truncate(title),
      }),
      el("div", {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 32,
          color: COLORS.muted,
        },
        children: [
          el("div", {
            style: { display: "flex", color: COLORS.primary, fontWeight: 700 },
            children: SITE.name,
          }),
          el("div", {
            style: { display: "flex" },
            children: subtitle ?? "",
          }),
        ],
      }),
    ],
  })
}

export async function renderOgImage(options: OgImageOptions): Promise<Buffer> {
  const svg = await satori(template(options) as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: await loadFonts(),
  })

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  })
    .render()
    .asPng()

  return Buffer.from(png)
}
