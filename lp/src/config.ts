/**
 * サイト全体の設定。テンプレートを使い始めたら、まずこのファイルの TODO を
 * 置き換えること。レイアウト・OGP・RSS など、サイト名や説明を必要とする箇所は
 * すべてここを参照する。
 */
export const SITE = {
  /** サイト名。`<title>` の接尾辞と OGP に使う */
  name: "SITE NAME", // TODO
  /** ページ側で description を渡さなかったときの既定値 */
  description: "SITE DESCRIPTION", // TODO
  /** Twitter Card の `twitter:site`。不要なら空文字にする */
  twitterID: "@xxxxxx", // TODO
  /** `<html lang>` に入る言語コード */
  lang: "ja",
  /** `og:locale`。`Intl` 用のロケールもこの値から作る */
  locale: "ja_JP",
} as const
