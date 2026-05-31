import type { Components } from "react-markdown";
import { ExternalLink } from "lucide-react";

const isExternalHref = (href: string | undefined): boolean =>
  typeof href === "string" && /^https?:\/\//i.test(href);

const isLocalhostHref = (href: string | undefined): boolean =>
  typeof href === "string" && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i.test(href);

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
    if (isExternalHref(href)) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="docs-ext-link"
        >
          {children}
          <ExternalLink size={12} aria-hidden="true" className="shrink-0" />
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      );
    }
    return (
      <a href={href} className="docs-ext-link">
        {children}
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
