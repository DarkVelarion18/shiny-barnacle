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
 * Server component that renders a blog post page for a given slug.
 *
 * Fetches the post by slug, converts its Markdown content to HTML, and renders
 * the post layout including preview alert, header, post header, and post body.
 * If the post is not found, this function triggers a 404 via `notFound()`.
 *
 * @param props - An object whose `params` promise resolves to route params containing `slug`.
 * @returns A React server component representing the full post page.
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
 * Generates page metadata for a post route based on the post's data.
 *
 * Awaits route params to obtain the `slug`, loads the corresponding post, and returns
 * a Metadata object containing a composed `title` and Open Graph `images`. If the
 * post is not found, calls `notFound()` to render a 404 response.
 *
 * @param props - Route props containing a promise for `params` with `slug`.
 * @returns Metadata with `title` and `openGraph.images` for the post.
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
 * Produces route parameters for static generation of all post pages.
 *
 * Retrieves all posts and returns an array of objects each containing a `slug` property
 * suitable for Next.js `generateStaticParams`.
 *
 * @returns An array of route param objects: `{ slug: string }[]`.
 */
export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
