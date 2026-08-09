import { SITE } from "@/config"

/** `SITE.locale`（"ja_JP"）を `Intl` が解釈できる形（"ja-JP"）に直したもの */
const LOCALE = SITE.locale.replace("_", "-")

/**
 * 表示用の日付。タイムゾーンは UTC に固定している。
 * frontmatter の `2026-08-10` は UTC 0 時として解釈されるため、
 * ローカルタイムゾーンで整形すると地域によって 1 日ずれてしまう。
 *
 * `<time datetime>` に入れる機械可読な値は `date.toISOString()` をそのまま使う。
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}
