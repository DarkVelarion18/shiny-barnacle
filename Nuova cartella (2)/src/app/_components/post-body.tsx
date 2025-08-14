import markdownStyles from "./markdown-styles.module.css";

type Props = {
  content: string;
};

/**
 * Render HTML content inside a centered, styled container.
 *
 * Renders the provided HTML string into a div styled with the component's
 * markdown CSS module. The `content` is injected using `dangerouslySetInnerHTML`;
 * it must be sanitized before being passed to this component to avoid XSS.
 *
 * @param content - HTML string (expected to be sanitized) to render as post body
 * @returns A React element containing the rendered HTML
 */
export function PostBody({ content }: Props) {
  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={markdownStyles["markdown"]}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
