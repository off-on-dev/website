import { useId, useEffect, useRef, useState, type JSX, type KeyboardEvent, type ReactNode } from "react";

type AbbrProps = {
  title: string;
  children: ReactNode;
};

export const Abbr = ({ title, children }: AbbrProps): JSX.Element => {
  const descId = useId();
  // null = pre-mount. Tooltip is hidden (display: none) until useEffect computes
  // the available space, preventing an invisible tooltip from contributing to
  // document.scrollWidth on prerendered HTML at narrow viewports.
  const [maxWidth, setMaxWidth] = useState<string | null>(null);
  const outerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const compute = (): void => {
      const rect = el.getBoundingClientRect();
      // At desktop widths the available space exceeds 16rem so the cap resolves
      // to 16rem (existing behavior). On narrow viewports (e.g. 200% zoom) the
      // tooltip is constrained to the space between the abbr and the viewport
      // right edge, wrapping text to more lines rather than overflowing.
      const available = window.innerWidth - rect.left - 16;
      setMaxWidth(`min(16rem, ${Math.max(80, available)}px)`);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>): void => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <span ref={outerRef} className="relative group/abbr inline">
      {/* No title attribute: aria-describedby provides the expansion to AT
          without triggering the browser's native title tooltip. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Escape handler satisfies WCAG 1.4.13 dismissible; tabIndex makes it intentionally keyboard-reachable */}
      <abbr
        aria-describedby={descId}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- makes abbreviation expansion keyboard-accessible per WCAG 1.4.13
        tabIndex={0}
        className="cursor-help underline decoration-dotted decoration-1 underline-offset-2 rounded-sm focus-ring-tight"
        onKeyDown={handleKeyDown}
      >
        {children}
      </abbr>
      <span id={descId} className="sr-only">{title}</span>
      {/*
        Outer span: positioned at top-full with pt-1.5 gap that bridges the space
        between the abbr bottom edge and the visible tooltip below.
        Hidden (display:none) until useEffect sets maxWidth so the invisible span
        does not widen document.scrollWidth before layout is known.
        pointer-events-none by default; activates on hover/focus so the cursor can
        move onto the tooltip without it closing (WCAG 1.4.13 hoverable).
      */}
      <span
        aria-hidden="true"
        className={`absolute top-full left-0 pt-1.5 w-max opacity-0 pointer-events-none transition-opacity group-hover/abbr:opacity-100 group-hover/abbr:pointer-events-auto group-focus-within/abbr:opacity-100 group-focus-within/abbr:pointer-events-auto z-[100]${maxWidth === null ? " hidden" : ""}`}
        style={maxWidth !== null ? { maxWidth } : undefined}
      >
        <span className="block px-2 py-1 text-xs bg-foreground text-background rounded break-words">
          {title}
        </span>
      </span>
    </span>
  );
};
