import { useId, useRef, type JSX, type ReactNode } from "react";
import { useAbbrTooltips } from "@/hooks/useAbbrTooltips";

type AbbrProps = {
  title: string;
  children: ReactNode;
};

// Inline abbreviation with an accessible expansion. Renders the same markup the
// content generator emits for prose <abbr> (data-title + an sr-only span linked
// by aria-describedby) and shares one tooltip implementation via
// useAbbrTooltips, so JSX and pre-rendered prose behave identically. The visible
// token stays the accessible name; the expansion is a description. Styling and
// the no-JS hover tooltip come from the global `abbr[data-title]` CSS rules.
export const Abbr = ({ title, children }: AbbrProps): JSX.Element => {
  const descId = useId();
  const ref = useRef<HTMLSpanElement>(null);
  useAbbrTooltips(ref, [title]);

  return (
    <span ref={ref}>
      {/* No title attribute: it would trigger the browser's native tooltip
          alongside the custom one. tabIndex makes the tooltip reachable by
          keyboard and touch; useAbbrTooltips wires hover/focus/click/Escape. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so keyboard and touch users can reveal the expansion tooltip */}
      <abbr data-title={title} aria-describedby={descId} tabIndex={0}>
        {children}
      </abbr>
      <span id={descId} className="sr-only">{title}</span>
    </span>
  );
};
