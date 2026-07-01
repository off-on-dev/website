import { useState, useRef, useEffect } from "react";
import type { JSX } from "react";
import { ChevronDown } from "lucide-react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { MarkdownContent } from "@/components/MarkdownContent";
import { stripLinks } from "@/lib/markdown";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import type { WalkthroughStep } from "@/data/adventures";

type WalkthroughSectionProps = {
  steps: WalkthroughStep[];
};

export const WalkthroughSection = ({ steps }: WalkthroughSectionProps): JSX.Element => {
  const [openSteps, setOpenSteps] = useState<boolean[]>(() => steps.map(() => true));
  const listRef = useRef<HTMLOListElement>(null);

  const toggle = (i: number): void =>
    setOpenSteps((prev) => prev.map((open, idx) => (idx === i ? !open : open)));

  // Manage hidden="until-found" synchronously before paint so there is no flash
  // between the React commit and the attribute being applied.
  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    openSteps.forEach((isOpen, i) => {
      const panel = list.querySelector<HTMLElement>(`#walkthrough-step-${i}`);
      if (!panel) return;
      if (isOpen) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "until-found");
      }
    });
  }, [openSteps]);

  // beforematch fires on the element with hidden="until-found" when the browser
  // auto-reveals it via find-in-page or fragment navigation. It does not bubble,
  // so listeners are attached individually to each panel on mount.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const cleanups = steps.map((_, i) => {
      const panel = list.querySelector<HTMLElement>(`#walkthrough-step-${i}`);
      if (!panel) return (): void => {};
      const onBeforeMatch = (): void => {
        setOpenSteps((prev) => prev.map((open, idx) => (idx === i ? true : open)));
      };
      panel.addEventListener("beforematch", onBeforeMatch);
      return (): void => panel.removeEventListener("beforematch", onBeforeMatch);
    });
    return () => cleanups.forEach((fn) => fn());
  }, [steps]);

  return (
    <CollapsibleSection id="walkthrough" title="Walkthrough">
      <ol ref={listRef} className="space-y-3">
        {steps.map((step, i) => {
          const isOpen = openSteps[i] ?? true;
          const contentId = `walkthrough-step-${i}`;
          return (
            <li
              key={i}
              className="rounded-lg border border-border bg-background/40"
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={contentId}
                className="flex w-full items-start gap-4 p-5 text-left focus-ring rounded-lg"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
                  {step.title ? <span className="md-inline" dangerouslySetInnerHTML={{ __html: stripLinks(step.title) }} /> : `Step ${i + 1}`}
                </span>
                <ChevronDown
                  size={16}
                  className={`mt-0.5 shrink-0 text-faint transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                  aria-hidden="true"
                />
              </button>
              <div
                id={contentId}
                className="grid grid-cols-[1.25rem_1fr] gap-4 px-5 pb-5"
              >
                <div aria-hidden="true" />
                <div className="min-w-0 text-sm text-dim leading-relaxed">
                  <MarkdownContent source={step.content} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </CollapsibleSection>
  );
};
