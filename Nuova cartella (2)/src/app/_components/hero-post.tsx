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
 * Renders a hero-style post preview with cover image, linked title, date, excerpt, and author avatar.
 *
 * The component lays out a large cover image followed by a two-column content area:
 * the left column shows a linked post title and formatted date; the right column shows
 * the excerpt and the author's avatar.
 *
 * @param title - The post title shown as the main heading and link text.
 * @param coverImage - Source URL for the cover image (passed to CoverImage).
 * @param date - ISO date string rendered by DateFormatter.
 * @param excerpt - Short HTML-free summary shown beneath the title.
 * @param author - Author object; at minimum `author.name` and `author.picture` are used for the Avatar.
 * @param slug - Post slug used to build the link URL (`/posts/{slug}`) and passed to CoverImage.
 * @returns A JSX element representing the hero post section.
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
