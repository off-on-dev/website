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

const DISALLOWED = ["h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "pre", "hr", "table", "img"];

type MarkdownInlineProps = {
  source: string;
};

export const MarkdownInline = ({ source }: MarkdownInlineProps): JSX.Element => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={components}
    disallowedElements={DISALLOWED}
    unwrapDisallowed
  >
    {source}
  </ReactMarkdown>
);
