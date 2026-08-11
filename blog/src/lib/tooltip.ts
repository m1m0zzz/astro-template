import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  type Placement,
  shift,
} from "@floating-ui/dom"

/** Tooltip.astro のマークアップと合わせる */
const CONTENT_SELECTOR = "[data-tooltip-content]"

/**
 * Tooltip.astro に振る舞いを付けるカスタム要素。
 *
 * カスタム要素にしているのは、`<template>` から複製して後から差し込んだ
 * ノードでもブラウザが connectedCallback を呼んでくれるため
 * （CodeCopy.astro はコピーボタンを複製してコードブロックごとに挿入する）。
 */
export class TooltipElement extends HTMLElement {
  /** ツールチップの中身。位置は @floating-ui/dom が決める */
  #content: HTMLElement | null = null
  /** ツールチップを出す基準要素（slot に渡された最初の要素） */
  #reference: HTMLElement | null = null
  /** autoUpdate の後始末。null なら非表示 */
  #cleanup: (() => void) | null = null
  #hovered = false

  connectedCallback() {
    this.#content = this.querySelector<HTMLElement>(CONTENT_SELECTOR)
    this.#reference = this.querySelector<HTMLElement>(
      `:scope > :not(${CONTENT_SELECTOR})`,
    )

    if (this.trigger === "manual" || !this.#reference) return

    this.#reference.addEventListener("pointerenter", this.#onEnter)
    this.#reference.addEventListener("pointerleave", this.#onLeave)
    this.#reference.addEventListener("focusin", this.#onEnter)
    this.#reference.addEventListener("focusout", this.#onLeave)
  }

  disconnectedCallback() {
    this.#reference?.removeEventListener("pointerenter", this.#onEnter)
    this.#reference?.removeEventListener("pointerleave", this.#onLeave)
    this.#reference?.removeEventListener("focusin", this.#onEnter)
    this.#reference?.removeEventListener("focusout", this.#onLeave)
    this.hide()
  }

  /** ツールチップに表示するテキスト */
  get text() {
    return this.#content?.textContent ?? ""
  }

  set text(value: string) {
    if (!this.#content) return
    this.#content.textContent = value
    // 幅が変わるので開いていれば位置を取り直す（autoUpdate 任せだと 1 フレーム遅れる）
    void this.#update()
  }

  get placement() {
    return (this.dataset.placement as Placement | undefined) ?? "top"
  }

  /** "manual" のときは show() / hide() を呼んだときだけ表示する */
  get trigger() {
    return this.dataset.trigger === "manual" ? "manual" : "hover"
  }

  get open() {
    return this.#cleanup !== null
  }

  /** 基準要素にポインタ・フォーカスが乗っているか */
  get hovered() {
    return this.#hovered
  }

  show() {
    const content = this.#content
    const reference = this.#reference
    if (!content || !reference || this.open) return

    content.classList.remove("hidden")
    // スクロールやリサイズに追従させる。戻り値が後始末の関数
    this.#cleanup = autoUpdate(reference, content, () => void this.#update())
    document.addEventListener("keydown", this.#onKeydown)
  }

  hide() {
    this.#cleanup?.()
    this.#cleanup = null
    this.#content?.classList.add("hidden")
    document.removeEventListener("keydown", this.#onKeydown)
  }

  async #update() {
    const content = this.#content
    const reference = this.#reference
    if (!content || !reference || !this.open) return

    const { x, y } = await computePosition(reference, content, {
      placement: this.placement,
      // fixed にしておくと、overflow を持つ祖先（コードブロック）に切られない
      strategy: "fixed",
      middleware: [offset(8), flip(), shift({ padding: 8 })],
    })

    content.style.left = `${x}px`
    content.style.top = `${y}px`
  }

  #onEnter = () => {
    this.#hovered = true
    this.show()
  }

  #onLeave = () => {
    this.#hovered = false
    this.hide()
  }

  #onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") this.hide()
  }
}

if (!customElements.get("ui-tooltip")) {
  customElements.define("ui-tooltip", TooltipElement)
}
