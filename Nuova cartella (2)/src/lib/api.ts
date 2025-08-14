import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_posts");

/**
 * Returns the list of post slugs (file names) from the posts directory.
 *
 * @returns An array of file names found in the `_posts` directory (for example `"my-post.md"`).
 */
export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

/**
 * Load a markdown post by slug, parse its front matter, and return a Post object.
 *
 * The `slug` may include a trailing `.md`; that suffix is removed before locating the file
 * in the module's `_posts` directory. The file's front matter is parsed with `gray-matter`
 * and merged with the content into the returned `Post`.
 *
 * @param slug - The post filename or slug (with or without a trailing `.md`)
 * @returns A `Post` composed of the front matter fields, `slug`, and `content`
 */
export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content } as Post;
}

/**
 * Returns all posts found in the posts directory, sorted by date descending.
 *
 * Retrieves all post slugs, loads each post (including front matter and content),
 * and returns an array ordered newest first.
 *
 * @returns An array of Post objects sorted by `date` descending (newest first).
 */
export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
