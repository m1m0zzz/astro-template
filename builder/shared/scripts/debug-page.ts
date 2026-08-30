/**
 * ページの状態を覗くための道具。E2Eテストではなく、実機の見た目と数値を
 * 手元に持ってくるために使う（AIが直接ブラウザを見られないため）。
 *
 * 例:
 *   npx tsx scripts/debug-page.ts --probe "header,main"
 *   npx tsx scripts/debug-page.ts --viewport 402x874 --scroll 0,800 --full
 *
 * サーバーは指定が無ければ、ビルドしてから `astro preview` を専用ポートで立て、
 * 終わったら止める。手元の dev サーバーとポートを分けているのは、開けっぱなしの
 * ものを巻き込まないため。既に立っているものを見たいときは `--url` を渡す。
 */
import { type ChildProcess, spawn } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { chromium, type Page } from "playwright"

import astroConfig from "../astro.config.mjs"

interface Options {
  url: string
  viewport: { width: number; height: number }
  /** 見に行くスクロール位置(px)。ページ座標ではなく素のscrollY */
  scrolls: number[]
  /** 状態を書き出すセレクタ */
  probes: string[]
  /** ページの中で評価して結果を出す式。込み入った調べ物はこちらで */
  evaluate?: string
  outDir: string
  /** ページ全体を撮る。既定は表示範囲のみ */
  full: boolean
  /** 既に立っているサーバーを使う場合はtrue */
  externalServer: boolean
  /** 撮る前にビルドし直すか */
  build: boolean
}

/** 手元のdevサーバー(4321)とぶつからないよう、専用のポートを使う */
const DEFAULT_PORT = 4331

/**
 * 見に行く既定のパス。`astro preview` は base の下でしか配信しないので、
 * astro.config.mjs の値をそのまま使う（決め打ちにすると base を変えた瞬間に
 * 404 を撮ることになる）
 */
const BASE = astroConfig.base ?? "/"

function parseArgs(argv: string[]): Options {
  const get = (name: string) => {
    const index = argv.indexOf(`--${name}`)
    return index >= 0 ? argv[index + 1] : undefined
  }
  const viewport = (get("viewport") ?? "1280x900").split("x").map(Number)
  const url = get("url")
  return {
    url: url ?? `http://localhost:${DEFAULT_PORT}${BASE}`,
    viewport: { width: viewport[0] ?? 1280, height: viewport[1] ?? 900 },
    scrolls: (get("scroll") ?? "0")
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value)),
    probes: (get("probe") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    evaluate: get("eval"),
    outDir: get("out") ?? "tmp/debug",
    full: argv.includes("--full"),
    externalServer: url !== undefined,
    build: url === undefined && !argv.includes("--no-build"),
  }
}

/** 子プロセスを最後まで走らせる */
function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" })
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} が ${code} で終了`)),
    )
  })
}

/** サーバーが応答するまで待つ */
async function waitForServer(url: string, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // まだ立ち上がっていない
    }
    if (Date.now() > deadline) throw new Error(`サーバーが応答しない: ${url}`)
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
}

/**
 * 指定位置までスクロールして、アニメーションが落ち着くのを待つ。
 * ScrollTriggerはスクロールイベントで動くので、1フレームでは足りない。
 *
 * ブラウザへ渡す関数の中で名前の付いた関数を作らないこと。tsx(esbuild)が
 * 名前を保つために __name を差し込むが、その定義はページ側に無いので落ちる
 */
async function scrollTo(page: Page, y: number) {
  await page.evaluate((target) => window.scrollTo(0, target), y)
  for (let frame = 0; frame < 4; frame++) {
    await page.evaluate(
      () =>
        new Promise((resolve) => requestAnimationFrame(() => resolve(null))),
    )
  }
}

/** セレクタごとに、位置・寸法・効いているCSSを集める */
async function probe(page: Page, selectors: string[]) {
  return page.evaluate((list) => {
    const readable = [
      "position",
      "top",
      "left",
      "width",
      "height",
      "transform",
      "translate",
      "opacity",
      "display",
      "visibility",
      "zIndex",
      "marginTop",
      "backgroundColor",
      "backgroundImage",
    ] as const
    return list.map((selector) => {
      const element = document.querySelector(selector)
      if (!element) return { selector, found: false }
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      const css: Record<string, string> = {}
      for (const name of readable) {
        const value = style[name]
        if (value && value !== "none" && value !== "auto") css[name] = value
      }
      return {
        selector,
        found: true,
        // 画面上の位置。ページ座標ではないので、スクロール位置と併せて読むこと
        rect: {
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        parent: element.parentElement?.tagName.toLowerCase() ?? null,
        parentId: element.parentElement?.id || null,
        css,
      }
    })
  }, selectors)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  await mkdir(options.outDir, { recursive: true })

  if (options.build) {
    console.log("building...")
    await run("npm", ["run", "build"])
  }

  let server: ChildProcess | undefined
  if (!options.externalServer) {
    server = spawn(
      "npx",
      ["astro", "preview", "--port", String(DEFAULT_PORT)],
      {
        stdio: "ignore",
      },
    )
  }

  const browser = await chromium.launch()
  try {
    await waitForServer(options.url)
    const page = await browser.newPage({ viewport: options.viewport })
    const consoleErrors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text())
    })
    page.on("pageerror", (error) => consoleErrors.push(String(error)))

    await page.goto(options.url, { waitUntil: "networkidle" })

    const report: unknown[] = []
    for (const scroll of options.scrolls) {
      await scrollTo(page, scroll)
      // 評価は撮る前。目印を入れてから撮る、といった使い方ができる
      const evaluated = options.evaluate
        ? await page.evaluate(`(() => (${options.evaluate}))()`)
        : undefined
      const name = `${options.viewport.width}x${options.viewport.height}-${scroll}`
      const file = join(options.outDir, `${name}.png`)
      await page.screenshot({ path: file, fullPage: options.full })
      const state = {
        scroll,
        // 実際に止まった位置。ページ末尾より下は指定しても届かない
        actualScrollY: await page.evaluate(() => window.scrollY),
        maxScrollY: await page.evaluate(
          () => document.documentElement.scrollHeight - window.innerHeight,
        ),
        screenshot: file,
        probes: options.probes.length
          ? await probe(page, options.probes)
          : undefined,
        evaluated,
      }
      report.push(state)
      console.log(JSON.stringify(state, null, 2))
    }

    if (consoleErrors.length > 0) {
      console.log("\nconsole errors:")
      for (const error of consoleErrors) console.log("  " + error)
    }
    await writeFile(
      join(options.outDir, "report.json"),
      JSON.stringify({ options, report, consoleErrors }, null, 2),
    )
  } finally {
    await browser.close()
    server?.kill("SIGTERM")
  }
}

await main()
