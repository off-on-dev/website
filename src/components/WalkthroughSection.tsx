import type { JSX } from "react";
import { ListChecks } from "lucide-react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { MarkdownContent } from "@/components/MarkdownContent";
import type { WalkthroughStep } from "@/data/adventures";

type WalkthroughSectionProps = {
  steps: WalkthroughStep[];
};

export const WalkthroughSection = ({ steps }: WalkthroughSectionProps): JSX.Element => (
  <CollapsibleSection id="walkthrough" title="Walkthrough" icon={ListChecks}>
    <ol className="space-y-5">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {step.title}
            </h3>
          </div>
          <div className="ml-11">
            <MarkdownContent source={step.body} />
          </div>
        </li>
      ))}
    </ol>
  </CollapsibleSection>
);
