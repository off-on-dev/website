import type { JSX, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";

type CollapsibleSectionProps = {
  id: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  defaultOpen?: boolean;
};

export const CollapsibleSection = ({
  id,
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps): JSX.Element => (
  <details
    id={id}
    open={defaultOpen}
    className="group mb-14 scroll-mt-28"
  >
    <summary className="flex cursor-pointer list-none items-center gap-3 mb-5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <Icon size={18} />
      </span>
      <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground flex-1">
        {title}
      </h2>
      <ChevronDown
        size={20}
        className="shrink-0 text-[hsl(var(--text-faint))] transition-transform group-open:rotate-180"
        aria-hidden="true"
      />
    </summary>
    {children}
  </details>
);
