import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

/**
 * Renders a post title inside an H1 using the component's responsive typographic styles.
 *
 * The component is stateless and side-effect-free; it simply outputs its `children` as the heading content.
 *
 * @param children - Content to display as the title (typically plain text or inline React nodes). If omitted, the heading will render empty.
 * @returns A styled `<h1>` element containing `children`.
 */
export function PostTitle({ children }: Props) {
  return (
    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-left">
      {children}
    </h1>
  );
}
