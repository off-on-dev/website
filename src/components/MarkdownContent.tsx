import { useRef, useState, type JSX, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, ExternalLink } from "lucide-react";
import { getSectionIcon, slugify } from "@/lib/markdown";

const isExternalHref = (href: string | undefined): boolean =>
  typeof href === "string" && /^https?:\/\//i.test(href);

const isLocalhostHref = (href: string | undefined): boolean =>
  typeof href === "string" && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i.test(href);

const childrenToText = (children: ReactNode): string => {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join("");
  if (children && typeof children === "object" && "props" in children) {
    const { props } = children as { props?: { children?: ReactNode } };
    return childrenToText(props?.children);
  }
  return "";
};

// Strip the leading "N. " prefix from the first text node in a ReactNode tree,
// preserving all subsequent nodes (inline code, bold, etc.) unchanged.
const stripLeadingStepNumber = (children: ReactNode): ReactNode => {
  if (typeof children === "string") return children.replace(/^\d+\.\s+/, "");
  if (Array.isArray(children)) {
    const [first, ...rest] = children as ReactNode[];
    return [stripLeadingStepNumber(first), ...rest];
  }
  return children;
};

const CodeBlock = ({ children, showCopy = true }: { children: ReactNode; showCopy?: boolean }): JSX.Element => {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const onCopy = (): void => {
    const text = preRef.current?.textContent ?? "";
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="relative mb-4 group">
      <pre
        ref={preRef}
        tabIndex={0}
        className={`overflow-x-auto rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-4 font-mono text-sm leading-relaxed text-foreground [&>code]:border-none [&>code]:bg-transparent [&>code]:p-0 [&>code]:rounded-none [&>code]:text-[1em]${showCopy ? " pr-14" : ""}`}
      >
        {children}
      </pre>
      {showCopy && (
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
          className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border border-[hsl(var(--surface-border))] bg-background/80 px-2 py-1 text-xs font-medium text-[hsl(var(--text-secondary))] opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <Check size={12} aria-hidden="true" /> Copied
            </>
          ) : (
            <>
              <Copy size={12} aria-hidden="true" /> Copy
            </>
          )}
        </button>
      )}
    </div>
  );
};

const components: Components = {
  h2: ({ children }) => {
    const text = childrenToText(children);
    const slug = slugify(text);
    const Icon = getSectionIcon(slug);
    return (
      <h2
        id={slug}
        className="font-heading text-2xl font-semibold tracking-tight text-foreground mt-14 mb-5 scroll-mt-28 flex items-center gap-3"
      >
        {Icon && (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <Icon size={18} />
          </span>
        )}
        <span>{children}</span>
      </h2>
    );
  },
  h3: ({ children }) => {
    const text = childrenToText(children);
    const stepMatch = text.match(/^(\d+)\.\s+(.+)$/);
    if (stepMatch) {
      return (
        <h3 className="font-heading text-lg font-semibold text-foreground mt-10 mb-3 scroll-mt-28 flex items-center gap-3">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold"
            aria-hidden="true"
          >
            {stepMatch[1]}
          </span>
          <span>{stripLeadingStepNumber(children)}</span>
        </h3>
      );
    }
    return (
      <h3 className="font-heading text-lg font-semibold text-foreground mt-8 mb-3">
        {children}
      </h3>
    );
  },
  p: ({ children }) => (
    <p className="text-[hsl(var(--text-secondary))] leading-relaxed mb-4">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-5 marker:text-[hsl(var(--text-faint))]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-5 marker:text-[hsl(var(--text-faint))]">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-[hsl(var(--text-secondary))] leading-relaxed pl-1">
      {children}
    </li>
  ),
  a: ({ href, children }) => {
    // Block dangerous URI schemes (XSS protection)
    if (typeof href === "string" && /^(javascript|data|vbscript):/i.test(href.trim())) {
      return <span>{children}</span>;
    }
    // Render localhost URLs as plain text (not clickable)
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
      <a
        href={href}
        className="docs-ext-link"
      >
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
  pre: ({ children }) => {
    const child = Array.isArray(children) ? children[0] : children;
    // Show copy for all fenced code blocks; language-tagged and bare blocks both wrap <code>
    const hasCode = child != null && typeof child === "object" && "props" in (child as object);
    return <CodeBlock showCopy={hasCode}>{children}</CodeBlock>;
  },
  blockquote: ({ children }) => (
    <blockquote className="mb-6 rounded-lg border-l-4 border-primary bg-[hsl(var(--surface))]/60 px-5 py-4 text-[hsl(var(--text-secondary))]">
      {children}
    </blockquote>
  ),
  // Tables in adventure markdown are used as feature-card grids (2-column key/value).
  // Rendered as divs because applying display:grid on <table> breaks semantic table
  // structure for screen readers. Real tabular data would need a different component.
  table: ({ children }) => (
    <div role="list" className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {children}
    </div>
  ),
  thead: ({ children }) => <div className="hidden">{children}</div>,
  tbody: ({ children }) => <div className="contents">{children}</div>,
  tr: ({ children }) => (
    <div role="listitem" className="flex flex-col gap-2 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
      {children}
    </div>
  ),
  th: ({ children }) => <span className="sr-only">{children}</span>,
  td: ({ children }) => (
    <span className="block first:font-mono first:font-semibold first:text-foreground last:text-sm last:leading-relaxed last:text-[hsl(var(--text-secondary))]">
      {children}
    </span>
  ),
  hr: () => (
    <hr className="my-8 border-t border-[hsl(var(--surface-border))]" />
  ),
};

type MarkdownContentProps = {
  source: string;
};

export const MarkdownContent = ({ source }: MarkdownContentProps): JSX.Element => (
  <div className="font-sans">
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {source}
    </ReactMarkdown>
  </div>
);
