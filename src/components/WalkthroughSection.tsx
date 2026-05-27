import type { JSX } from "react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { MarkdownContent } from "@/components/MarkdownContent";
import type { WalkthroughStep } from "@/data/adventures";

type WalkthroughSectionProps = {
  steps: WalkthroughStep[];
};

export const WalkthroughSection = ({ steps }: WalkthroughSectionProps): JSX.Element => (
  <CollapsibleSection id="walkthrough" title="Walkthrough">
    <ol className="space-y-5">
      {steps.map((step, i) => (
        <li
          key={i}
          className="rounded-lg border border-[hsl(var(--surface-border))] bg-background/40 p-5"
        >
          <div className="flex items-start gap-4">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              {step.title && (
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
              )}
              <div className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                <MarkdownContent source={step.body} />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  </CollapsibleSection>
);
