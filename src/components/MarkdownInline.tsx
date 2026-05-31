import type { JSX, ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { inlineComponents } from "@/components/markdownInlineComponents";

// Render author-controlled single-line strings as inline markdown. Block
// elements are unwrapped so the output is safe to drop inside <p>, <span>,
// <h*>, <button>, etc. without producing invalid HTML.
const components: Components = {
  ...inlineComponents,
  p: ({ children }: { children?: ReactNode }) => <>{children}</>,
};

const DISALLOWED_BLOCK = ["h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "pre", "hr", "table", "img"];

type MarkdownInlineProps = {
  source: string;
  // Strip markdown links to plain text. Required when rendering inside
  // another interactive element (<a>, <button>) since HTML forbids nesting
  // interactive content.
  noLinks?: boolean;
};

export const MarkdownInline = ({ source, noLinks = false }: MarkdownInlineProps): JSX.Element => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={components}
    disallowedElements={noLinks ? [...DISALLOWED_BLOCK, "a"] : DISALLOWED_BLOCK}
    unwrapDisallowed
  >
    {source}
  </ReactMarkdown>
);
