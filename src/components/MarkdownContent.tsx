import { useRef, useState, type JSX, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, ExternalLink } from "lucide-react";
import { getSectionIcon, slugify } from "@/lib/markdown";

const isExternalHref = (href: string | undefined): boolean =>
  typeof href === "string" && /^https?:\/\//i.test(href);

const childrenToText = (children: ReactNode): string => {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join("");
  if (children && typeof children === "object" && "props" in children) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = (children as any).props;
    return childrenToText(props?.children);
  }
  return "";
};

const CodeBlock = ({ children }: { children: ReactNode }): JSX.Element => {
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
        className="overflow-x-auto rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-4 pr-14 font-mono text-sm leading-relaxed text-foreground"
      >
        {children}
      </pre>
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
          <span>{stepMatch[2]}</span>
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
    <ul className="mb-4 list-disc space-y-2 pl-5 marker:text-primary">{children}</ul>
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
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  blockquote: ({ children }) => (
    <blockquote className="mb-6 rounded-lg border-l-4 border-primary bg-[hsl(var(--surface))]/60 px-5 py-4 text-[hsl(var(--text-secondary))]">
      {children}
    </blockquote>
  ),
  // Tables in adventure markdown are used as feature-card grids (2-column key/value).
  // If real tabular data is ever needed, add a detection heuristic or a separate component.
  table: ({ children }) => (
    <table className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {children}
    </table>
  ),
  thead: ({ children }) => <thead className="hidden">{children}</thead>,
  tbody: ({ children }) => <tbody className="contents">{children}</tbody>,
  tr: ({ children }) => (
    <tr className="flex flex-col gap-2 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
      {children}
    </tr>
  ),
  th: ({ children }) => <th className="sr-only">{children}</th>,
  td: ({ children }) => (
    <td className="block first:font-mono first:font-semibold first:text-foreground last:text-sm last:leading-relaxed last:text-[hsl(var(--text-secondary))]">
      {children}
    </td>
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
