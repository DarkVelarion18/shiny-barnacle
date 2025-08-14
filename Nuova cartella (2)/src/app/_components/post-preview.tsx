import { type Author } from "@/interfaces/author";
import Link from "next/link";
import Avatar from "./avatar";
import CoverImage from "./cover-image";
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
 * Renders a blog post preview card with cover image, linked title, formatted date, excerpt, and author avatar.
 *
 * The `slug` is used to build the post link (`/posts/{slug}`) and is passed to the CoverImage component.
 *
 * @param title - Post title displayed as a linked heading
 * @param coverImage - Source URL for the cover image
 * @param date - Date string (e.g., ISO) formatted by DateFormatter
 * @param excerpt - Short post excerpt shown beneath the date
 * @param author - Author object (provides `name` and `picture`) displayed via Avatar
 * @param slug - Post identifier used for links and image routing
 * @returns A JSX element containing the post preview
 */
export function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}: Props) {
  return (
    <div>
      <div className="mb-5">
        <CoverImage slug={slug} title={title} src={coverImage} />
      </div>
      <h3 className="text-3xl mb-3 leading-snug">
        <Link href={`/posts/${slug}`} className="hover:underline">
          {title}
        </Link>
      </h3>
      <div className="text-lg mb-4">
        <DateFormatter dateString={date} />
      </div>
      <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
      <Avatar name={author.name} picture={author.picture} />
    </div>
  );
}
