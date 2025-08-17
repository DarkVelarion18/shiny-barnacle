import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
import { Intro } from "@/app/_components/intro";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllPosts } from "@/lib/api";

/**
 * Renders the homepage with a featured (hero) post and optional additional stories.
 *
 * Calls `getAllPosts()` synchronously, uses the first post as the hero post and the remaining posts as "more" posts. If a hero post exists, renders `HeroPost` populated from that post and, when present, `MoreStories` with the remaining posts. If no posts are available, renders a centered "No posts yet." message.
 *
 * @returns The homepage JSX element.
 */
export default function Index() {
  const allPosts = getAllPosts();
  const [heroPost, ...morePosts] = allPosts;

  return (
    <main>
      <Container>
        <Intro />
        {heroPost ? (
          <>
            <HeroPost
              title={heroPost.title}
              coverImage={heroPost.coverImage}
              date={heroPost.date}
              author={heroPost.author}
              slug={heroPost.slug}
              excerpt={heroPost.excerpt}
            />
            {morePosts.length > 0 && <MoreStories posts={morePosts} />}
          </>
        ) : (
          <p className="text-center text-neutral-500">No posts yet.</p>
        )}
      </Container>
    </main>
  );
}
}

