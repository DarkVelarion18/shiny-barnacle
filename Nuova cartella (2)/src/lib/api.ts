import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_posts");

/**
 * Returns the list of filenames in the posts directory.
 *
 * Reads the configured posts directory synchronously and returns an array of file names.
 *
 * @returns The file names (slugs) present in the `_posts` directory.
 */
export function getPostSlugs(): string[] {
  return fs
    .readdirSync(postsDirectory, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith(".md"))
    .map((d) => d.name);
}

/**
 * Load a post by slug from the `_posts` directory and return its front matter and content.
 *
 * The `slug` may include or omit a trailing `.md`; the function normalizes it, reads the
 * corresponding Markdown file, parses its front matter using `gray-matter`, and returns a
 * `Post` object that merges the parsed front matter with the normalized `slug` and the file
 * `content`.
 *
 * @param slug - The post identifier (filename with or without the trailing `.md`)
 * @returns The `Post` composed of front matter fields, `slug`, and Markdown `content`
 */
export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content } as Post;
}

/**
 * Returns all posts sorted by date in descending (newest-first) order.
 *
 * Retrieves every post available to the local posts API and returns them as an array of `Post` objects sorted so the most recent post appears first.
 *
 * @returns An array of `Post` objects sorted by `date` (newest first).
 *
 * @remarks
 * Any I/O errors encountered while reading post files are not handled here and will propagate to the caller.
 */
export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
