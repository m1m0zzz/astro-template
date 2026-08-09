import { SITE } from "@/config"

/** `SITE.locale`（"ja_JP"）を `Intl` が解釈できる形（"ja-JP"）に直したもの */
const LOCALE = SITE.locale.replace("_", "-")

/**
 * 表示用の日付。タイムゾーンは UTC に固定している。
 * frontmatter の `2026-08-10` は UTC 0 時として解釈されるため、
 * ローカルタイムゾーンで整形すると地域によって 1 日ずれてしまう。
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}

/**
 * `<time datetime="...">` に入れる ISO 形式の日付（YYYY-MM-DD）。
 *
 * @example toDateAttr(new Date("2026-08-10")) // "2026-08-10"
 */
export function toDateAttr(date: Date): string {
  return date.toISOString().slice(0, 10)
}
