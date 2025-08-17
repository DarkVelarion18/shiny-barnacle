import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

/**
 * Renders a styled post title as an `<h1>` with responsive typography and alignment.
 *
 * @param children - Content to display inside the title (string or JSX).
 */
export function PostTitle({ children }: Props) {
  return (
    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-left">
      {children}
    </h1>
  );
}
