import { isValidElement, type ReactNode } from "react";
import type { Components } from "react-markdown";
import { ExternalLink } from "lucide-react";

const isExternalHref = (href: string | undefined): boolean =>
  typeof href === "string" && /^https?:\/\//i.test(href);

const isLocalhostHref = (href: string | undefined): boolean =>
  typeof href === "string" && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i.test(href);

// Recursively extract plain text from React nodes. Used to strip code chips
// and other styled elements from inside link text so the link renders cleanly.
function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) return extractText((node.props as { children?: ReactNode }).children);
  return "";
}

// Inline-only renderers (links, inline code, strong, em). Shared by
// MarkdownContent and MarkdownInline so all author prose styles consistently.
export const inlineComponents: Components = {
  a: ({ href, children }) => {
    if (typeof href === "string" && /^(javascript|data|vbscript):/i.test(href.trim())) {
      return <span>{children}</span>;
    }
    if (isLocalhostHref(href)) {
      return <code className="rounded bg-[hsl(var(--surface))] px-1.5 py-0.5 text-sm font-mono text-foreground">{children}</code>;
    }
    // Strip code chips and other inline elements from link text — code chips inside
    // links look awkward (especially with comma-separated terms) and inline-flex
    // anchors should contain plain text only.
    const linkText = extractText(children);
    if (isExternalHref(href)) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="docs-ext-link"
        >
          {linkText}
          <ExternalLink size={12} aria-hidden="true" className="shrink-0" />
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      );
    }
    return (
      <a href={href} className="docs-ext-link">
        {linkText}
      </a>
    );
  },
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-[hsl(var(--text-secondary))]">{children}</em>
  ),
  code: ({ className, children }) => {
    const isBlock = typeof className === "string" && className.startsWith("language-");
    if (isBlock) {
      return <code className={className}>{children}</code>;
    }
    return (
      <code className="rounded-sm border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
        {children}
      </code>
    );
  },
};
