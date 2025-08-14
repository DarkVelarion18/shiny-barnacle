import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
import { Intro } from "@/app/_components/intro";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllPosts } from "@/lib/api";

/**
 * Renders the blog index page: an Intro, a primary HeroPost (first post), and optional MoreStories for remaining posts.
 *
 * The component synchronously obtains posts via getAllPosts(), uses the first post as the hero post, and passes any remaining posts to MoreStories (rendered only when there are additional posts).
 *
 * Note: If no posts are returned by getAllPosts(), accessing the hero post fields will throw at runtime.
 *
 * @returns The JSX for the blog index page.
 */
export default function Index() {
  const allPosts = getAllPosts();

  const heroPost = allPosts[0];

  const morePosts = allPosts.slice(1);

  return (
    <main>
      <Container>
        <Intro />
        <HeroPost
          title={heroPost.title}
          coverImage={heroPost.coverImage}
          date={heroPost.date}
          author={heroPost.author}
          slug={heroPost.slug}
          excerpt={heroPost.excerpt}
        />
        {morePosts.length > 0 && <MoreStories posts={morePosts} />}
      </Container>
    </main>
  );
}
