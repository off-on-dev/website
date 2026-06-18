import { useState, useRef, useEffect, type JSX } from "react";
import { Copy, Check } from "lucide-react";

type CodeBlockProps = {
  language: string;
  title?: string;
  code: string;
};

export const CodeBlock = ({ language, title, code }: CodeBlockProps): JSX.Element => {
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => (): void => {
    if (copyTimeoutRef.current !== null) clearTimeout(copyTimeoutRef.current);
  }, []);

  const handleCopy = (): void => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      if (copyTimeoutRef.current !== null) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    }).catch(() => {
      // writeText can fail when the document loses focus
    });
  };

  return (
    <div>
      <div className="code-block-header">
        <span className="code-lang-label" aria-hidden="true">
          {title ?? language}
        </span>
        <button
          type="button"
          className="code-header-btn"
          onClick={handleCopy}
          aria-label={copied ? "Code copied" : "Copy code"}
        >
          {copied ? (
            <Check size={12} aria-hidden="true" />
          ) : (
            <Copy size={12} aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="md-content code-block-body">
        <div className="md-pre-group">
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- makes scrollable code block keyboard-reachable per WCAG 2.1 SC 2.1.1 */}
          <pre tabIndex={0} aria-label={title ?? `${language} code block`}>
            <code>{code}</code>
          </pre>
        </div>
      </div>
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {copied ? "Code copied to clipboard" : ""}
      </span>
    </div>
  );
};
