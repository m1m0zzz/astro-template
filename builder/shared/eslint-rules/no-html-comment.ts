import type { AST } from "astro-eslint-parser"
import type { Rule } from "eslint"

/**
 * `.astro` テンプレート内の HTML コメント (`<!-- ... -->`) を禁止し、
 * 出力に残らない JSX 形式のコメント (`{/* ... *\/}`) へ自動修正する。
 *
 * - `<script>` / `<style>` の中身は `AstroRawText` として扱われるため、
 *   そこに含まれる `<!--` は検出対象にならない。
 * - コメント本文に `*\/` を含む場合は JSX コメントを閉じてしまうため、
 *   報告のみ行い自動修正はスキップする。
 */
const noHtmlComment: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow HTML comments in Astro templates, since they are emitted to the output",
    },
    fixable: "code",
    schema: [],
    messages: {
      unexpected:
        "HTML コメントは出力に残ります。{/* ... */} を使ってください。",
      unfixable:
        "HTML コメントは出力に残ります。{/* ... */} を使ってください（本文に '*/' を含むため自動修正はスキップしました）。",
    },
  },

  create(context) {
    return {
      AstroHTMLComment(node: AST.AstroHTMLComment) {
        const inner = node.value

        if (inner.includes("*/")) {
          context.report({ loc: node.loc, messageId: "unfixable" })
          return
        }

        context.report({
          loc: node.loc,
          messageId: "unexpected",
          fix: (fixer) => fixer.replaceTextRange(node.range, `{/*${inner}*/}`),
        })
      },
    } as Rule.RuleListener
  },
}

export default noHtmlComment
