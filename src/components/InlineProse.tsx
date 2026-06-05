import type { JSX } from "react";

// Nesting a block element inside <p> is invalid HTML; browsers auto-correct it
// in ways that diverge from React's VDOM, producing hydration error #418.
export const BLOCK_ELEMENT_RE = /<(p|ul|ol|blockquote|h[1-6]|pre|table|hr|figure|div)\b/;

type InlineProseProps = {
  html: string;
  className?: string;
};

export const InlineProse = ({ html, className }: InlineProseProps): JSX.Element => {
  // filter(Boolean) strips empty/whitespace-only className so no spurious
  // leading space appears in the final class string.
  const cls = (mdClass: string): string =>
    [className?.trim(), mdClass].filter(Boolean).join(" ");
  if (BLOCK_ELEMENT_RE.test(html)) {
    return (
      <div
        className={cls("md-content")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <p
      className={cls("md-inline")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
