import { remark } from "remark";
import html from "remark-html";

/**
 * Convert a Markdown string to HTML.
 *
 * Processes the given Markdown using remark with the `remark-html` plugin and returns the generated HTML.
 *
 * @param markdown - The Markdown source to convert.
 * @returns A promise that resolves to the resulting HTML string. Processing errors propagate as rejections.
 */
export default async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}
