import type { JSX, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type CollapsibleSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export const CollapsibleSection = ({
  id,
  title,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps): JSX.Element => (
  <details
    id={id}
    open={defaultOpen}
    className="card-glow group mb-6 scroll-mt-28 rounded-lg"
  >
    <summary className="flex cursor-pointer list-none items-center gap-3 rounded-t-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-4 py-3 group-open:rounded-b-none group-open:border-b-0 rounded-b-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
      <span className="font-sans text-sm font-semibold tracking-wide text-primary flex-1">
        {title}
      </span>
      <ChevronDown
        size={18}
        className="shrink-0 text-[hsl(var(--text-faint))] transition-transform group-open:rotate-180"
        aria-hidden="true"
      />
    </summary>
    <div className="rounded-b-lg border border-t-0 border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-4 py-5 text-sm">
      {children}
    </div>
  </details>
);
