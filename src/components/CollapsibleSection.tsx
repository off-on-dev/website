import type { JSX, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type CollapsibleSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  headingLevel?: 2 | 3 | 4;
};

export const CollapsibleSection = ({
  id,
  title,
  children,
  defaultOpen = true,
  headingLevel = 2,
}: CollapsibleSectionProps): JSX.Element => {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <details
      id={id}
      open={defaultOpen}
      className="card-glow group mb-6 scroll-mt-28 rounded-lg"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-t-lg border border-border bg-[hsl(var(--surface))] px-4 py-3 group-open:rounded-b-none group-open:border-b-0 rounded-b-lg focus-ring [&::-webkit-details-marker]:hidden">
        <Heading className="font-sans text-sm font-semibold tracking-wide text-primary flex-1 m-0">
          {title}
        </Heading>
        <ChevronDown
          size={18}
          className="shrink-0 text-faint transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="rounded-b-lg border border-t-0 border-border bg-[hsl(var(--surface))] px-4 py-5 text-sm">
        {children}
      </div>
    </details>
  );
};
