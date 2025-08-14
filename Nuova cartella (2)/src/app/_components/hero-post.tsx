import Avatar from "@/app/_components/avatar";
import CoverImage from "@/app/_components/cover-image";
import { type Author } from "@/interfaces/author";
import Link from "next/link";
import DateFormatter from "./date-formatter";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  excerpt: string;
  author: Author;
  slug: string;
};

/**
 * Renders a hero-style post preview with cover image, title link, date, excerpt, and author avatar.
 *
 * Displays a prominent cover image, the post title linked to `/posts/{slug}`, a formatted date,
 * a short excerpt, and the author's avatar and name.
 *
 * @param title - The post title shown prominently.
 * @param coverImage - Source URL or path for the cover image.
 * @param date - Date string passed to DateFormatter for display (e.g., ISO 8601).
 * @param excerpt - Short summary or excerpt of the post.
 * @param author - Author object (contains `name` and `picture`) used for the Avatar.
 * @param slug - Post slug used to build the internal link to the full post.
 * @returns A JSX element rendering the hero post layout.
 */
export function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}: Props) {
  return (
    <section>
      <div className="mb-8 md:mb-16">
        <CoverImage title={title} src={coverImage} slug={slug} />
      </div>
      <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <h3 className="mb-4 text-4xl lg:text-5xl leading-tight">
            <Link href={`/posts/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          <div className="mb-4 md:mb-0 text-lg">
            <DateFormatter dateString={date} />
          </div>
        </div>
        <div>
          <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
          <Avatar name={author.name} picture={author.picture} />
        </div>
      </div>
    </section>
  );
}
