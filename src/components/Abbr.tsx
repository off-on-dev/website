import type { JSX, ReactNode } from "react";

type AbbrProps = {
  title: string;
  children: ReactNode;
};

export const Abbr = ({ title, children }: AbbrProps): JSX.Element => (
  <span className="relative group/abbr inline">
    <abbr title={title} className="cursor-help underline decoration-dotted decoration-1 underline-offset-2">
      {children}
    </abbr>
    <span
      role="tooltip"
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs bg-popover text-popover-foreground rounded border border-border shadow-sm whitespace-nowrap opacity-0 pointer-events-none transition-opacity group-hover/abbr:opacity-100 z-50"
    >
      {title}
    </span>
  </span>
);
