import { useState } from "react";
import type { JSX } from "react";
import { ChevronDown } from "lucide-react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { MarkdownContent } from "@/components/MarkdownContent";
import type { WalkthroughStep } from "@/data/adventures";

type WalkthroughSectionProps = {
  steps: WalkthroughStep[];
};

export const WalkthroughSection = ({ steps }: WalkthroughSectionProps): JSX.Element => {
  const [openSteps, setOpenSteps] = useState<boolean[]>(() => steps.map(() => true));

  const toggle = (i: number): void =>
    setOpenSteps((prev) => prev.map((open, idx) => (idx === i ? !open : open)));

  return (
    <CollapsibleSection id="walkthrough" title="Walkthrough">
      <ol className="space-y-3">
        {steps.map((step, i) => {
          const isOpen = openSteps[i] ?? true;
          const contentId = `walkthrough-step-${i}`;
          return (
            <li
              key={i}
              className="rounded-lg border border-[hsl(var(--surface-border))] bg-background/40"
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={contentId}
                className="flex w-full items-start gap-4 p-5 text-left"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
                  {step.title ?? `Step ${i + 1}`}
                </span>
                <ChevronDown
                  size={16}
                  className={`mt-0.5 shrink-0 text-[hsl(var(--text-faint))] transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
                  aria-hidden="true"
                />
              </button>
              {isOpen && (
                <div
                  id={contentId}
                  className="grid grid-cols-[1.25rem_1fr] gap-4 px-5 pb-5"
                >
                  <div aria-hidden="true" />
                  <div className="min-w-0 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                    <MarkdownContent source={step.body} />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </CollapsibleSection>
  );
};
