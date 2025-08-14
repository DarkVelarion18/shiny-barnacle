import markdownStyles from "./markdown-styles.module.css";

type Props = {
  content: string;
};

/**
 * Renders HTML content inside a centered, width-constrained container with markdown styling.
 *
 * The `content` string is injected into the DOM using `dangerouslySetInnerHTML`; it must be trusted/sanitized HTML to avoid XSS vulnerabilities.
 *
 * @param content - HTML string to render inside the styled post body
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
