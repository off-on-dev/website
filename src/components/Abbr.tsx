import { useId } from "react";
import type { JSX, ReactNode } from "react";

type AbbrProps = {
  title: string;
  children: ReactNode;
};

export const Abbr = ({ title, children }: AbbrProps): JSX.Element => {
  const tooltipId = useId();
  return (
    <span className="relative group/abbr inline">
      <abbr
        aria-describedby={tooltipId}
        className="cursor-help underline decoration-dotted decoration-1 underline-offset-2"
      >
        {children}
      </abbr>
      <span
        id={tooltipId}
        role="tooltip"
        className="absolute bottom-full left-0 mb-1.5 px-2 py-1 text-xs bg-foreground text-background rounded whitespace-nowrap opacity-0 pointer-events-none transition-opacity group-hover/abbr:opacity-100 z-[100]"
      >
        {title}
      </span>
    </span>
  );
};
