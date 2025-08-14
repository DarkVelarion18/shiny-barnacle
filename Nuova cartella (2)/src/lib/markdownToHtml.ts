import { remark } from "remark";
import html from "remark-html";

/**
 * Converts a Markdown string to HTML using remark with the `remark-html` plugin.
 *
 * @param markdown - The input Markdown content to convert.
 * @returns The generated HTML as a string.
 */
export default async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}
