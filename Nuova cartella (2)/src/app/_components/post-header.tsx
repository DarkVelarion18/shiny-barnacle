import Avatar from "./avatar";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";
import { PostTitle } from "@/app/_components/post-title";
import { type Author } from "@/interfaces/author";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  author: Author;
};

/**
 * Renders the header for a blog post: title, responsive author avatar, cover image, and formatted date.
 *
 * The avatar is shown in two responsive places (hidden on small screens / shown on small screens)
 * so layout adapts across breakpoints.
 *
 * @param title - Post title displayed by PostTitle and used as the cover image alt/title.
 * @param coverImage - URL or src for the cover image.
 * @param date - ISO date string passed to DateFormatter.
 * @param author - Author metadata (name and picture) used by Avatar.
 * @returns A JSX fragment containing the composed post header.
 */
export function PostHeader({ title, coverImage, date, author }: Props) {
  return (
    <>
      <PostTitle>{title}</PostTitle>
      <div className="hidden md:block md:mb-12">
        <Avatar name={author.name} picture={author.picture} />
      </div>
      <div className="mb-8 md:mb-16 sm:mx-0">
        <CoverImage title={title} src={coverImage} />
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="block md:hidden mb-6">
          <Avatar name={author.name} picture={author.picture} />
        </div>
        <div className="mb-6 text-lg">
          <DateFormatter dateString={date} />
        </div>
      </div>
    </>
  );
}
