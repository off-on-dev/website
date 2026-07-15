import type { JSX, ReactNode } from "react";

type AbbrProps = {
  title: string;
  children: ReactNode;
};

export const Abbr = ({ title, children }: AbbrProps): JSX.Element => {
  return (
    <span className="relative group/abbr inline">
      <abbr
        title={title}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- makes abbreviation expansion keyboard-accessible per WCAG 1.4.13
        tabIndex={0}
        className="cursor-help underline decoration-dotted decoration-1 underline-offset-2 rounded-sm focus-ring-tight"
      >
        {children}
      </abbr>
      <span
        aria-hidden="true"
        className="absolute bottom-full left-0 mb-1.5 px-2 py-1 text-xs bg-foreground text-background rounded whitespace-nowrap opacity-0 pointer-events-none transition-opacity group-hover/abbr:opacity-100 group-focus-within/abbr:opacity-100 z-[100]"
      >
        {title}
      </span>
    </span>
  );
};
