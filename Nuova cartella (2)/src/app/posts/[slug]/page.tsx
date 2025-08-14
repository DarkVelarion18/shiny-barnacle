import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import { CMS_NAME } from "@/lib/constants";
import markdownToHtml from "@/lib/markdownToHtml";
import Alert from "@/app/_components/alert";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { PostBody } from "@/app/_components/post-body";
import { PostHeader } from "@/app/_components/post-header";

/**
 * Server component that renders a blog post page for the given slug.
 *
 * Awaits props.params to obtain the `slug`, fetches the post via `getPostBySlug`,
 * converts its Markdown content to HTML, and returns the composed page (header,
 * post meta, and post body). If the post is not found, this triggers a 404 via `notFound()`.
 *
 * @param props - Component props containing a `params` promise which resolves to an object with a `slug` string.
 * @returns A JSX element representing the fully rendered blog post page.
 */
export default async function Post(props: Params) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");

  return (
    <main>
      <Alert preview={post.preview} />
      <Container>
        <Header />
        <article className="mb-32">
          <PostHeader
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
          />
          <PostBody content={content} />
        </article>
      </Container>
    </main>
  );
}

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * Produces page metadata (title and Open Graph data) for a post identified by slug.
 *
 * Resolves props.params to obtain the slug, loads the post via getPostBySlug, and returns a Metadata
 * object with a composed page title ("<post title> | Next.js Blog Example with <CMS_NAME>") and
 * Open Graph images derived from the post (post.ogImage.url).
 *
 * If the post cannot be found, calls and returns notFound() to signal a 404.
 *
 * @param props - An object whose `params` promise resolves to `{ slug: string }`.
 * @returns A Metadata object containing `title` and `openGraph.images` for the post.
 */
export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const title = `${post.title} | Next.js Blog Example with ${CMS_NAME}`;

  return {
    title,
    openGraph: {
      title,
      images: [post.ogImage.url],
    },
  };
}

/**
 * Returns route parameters used to statically generate all post pages.
 *
 * Retrieves all posts and maps them to an array of objects with a `slug` property,
 * suitable for Next.js dynamic route static generation.
 *
 * @returns An array of `{ slug: string }` objects for use as static route params.
 */
export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
