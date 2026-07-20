import { useId, useEffect, useRef, useState, type JSX, type KeyboardEvent, type ReactNode } from "react";

type AbbrProps = {
  title: string;
  children: ReactNode;
};

type TooltipPosition = { maxWidth: string; side: "left" | "right" } | null;

export const Abbr = ({ title, children }: AbbrProps): JSX.Element => {
  const descId = useId();
  // null = pre-mount. Tooltip is hidden until useEffect computes the available
  // space, preventing an invisible tooltip from widening document.scrollWidth
  // on prerendered HTML at narrow viewports.
  const [pos, setPos] = useState<TooltipPosition>(null);
  const outerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const compute = (): void => {
      const rect = el.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.left - 16;
      // If there is enough space to the right, open the tooltip leftward-
      // anchored (left-0). Otherwise flip it to right-anchored (right-0) so
      // it opens toward the left edge and never overflows the viewport.
      if (spaceRight >= 80) {
        setPos({ maxWidth: `min(16rem, ${spaceRight}px)`, side: "left" });
      } else {
        const spaceLeft = rect.right - 16;
        setPos({ maxWidth: `min(16rem, ${Math.max(80, spaceLeft)}px)`, side: "right" });
      }
    };
    compute();
    // Debounce resize so multiple Abbr instances on one page don't each fire a
    // getBoundingClientRect() on every pixel of a drag-resize.
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = (): void => {
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(compute, 100);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (debounceTimer !== null) clearTimeout(debounceTimer);
    };
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
          without triggering the browser's native title tooltip.
          The tooltip is revealed on hover (mouse) and focus (keyboard). onClick
          calls focus() so touch works too: iOS Safari does not reliably focus a
          tabindex-only element on tap, and attaching a click handler is what makes
          it dispatch the tap as a click in the first place. Escape dismisses. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- interactive tooltip trigger: focus reveals it (touch/keyboard), Escape dismisses it (WCAG 1.4.13). */}
      <abbr
        aria-describedby={descId}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so keyboard and touch users can reveal the expansion tooltip
        tabIndex={0}
        className="cursor-help underline decoration-dotted decoration-1 underline-offset-2 rounded-sm focus-ring-tight"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.currentTarget.focus()}
      >
        {children}
      </abbr>
      <span id={descId} className="sr-only">{title}</span>
      {/*
        pt-1.5 gap bridges the space between the abbr and the visible tooltip
        so the cursor can move onto it without the tooltip closing (WCAG 1.4.13
        hoverable). Hidden until useEffect computes side and maxWidth.
        side="left" → left-0 (opens rightward); side="right" → right-0 (opens
        leftward, used when the abbr is near the viewport right edge).
      */}
      <span
        aria-hidden="true"
        className={`absolute top-full pt-1.5 w-max opacity-0 pointer-events-none transition-opacity group-hover/abbr:opacity-100 group-hover/abbr:pointer-events-auto group-focus-within/abbr:opacity-100 group-focus-within/abbr:pointer-events-auto z-[100]${pos === null ? " hidden" : pos.side === "left" ? " left-0" : " right-0"}`}
        style={pos !== null ? { maxWidth: pos.maxWidth } : undefined}
      >
        <span className="block px-2 py-1 text-xs bg-foreground text-background rounded break-words">
          {title}
        </span>
      </span>
    </span>
  );
};
