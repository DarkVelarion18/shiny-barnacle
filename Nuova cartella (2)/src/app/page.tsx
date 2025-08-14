import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
import { Intro } from "@/app/_components/intro";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllPosts } from "@/lib/api";

/**
 * Page component that renders the homepage with a featured (hero) post and additional stories.
 *
 * Retrieves all posts synchronously via `getAllPosts()`, uses the first post as the hero post and the remaining posts as additional stories, then renders Intro, HeroPost (populated from the hero post's fields), and, if present, a MoreStories list.
 *
 * Note: This component assumes at least one post is returned by `getAllPosts()`; if the list is empty, the hero post access will be undefined and may cause a runtime error.
 *
 * @returns The homepage JSX element.
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
