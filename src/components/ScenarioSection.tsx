import type { JSX } from "react";
import { CollapsibleSection } from "@/components/CollapsibleSection";

type ScenarioSectionProps = {
  backstory: string[];
};

export const ScenarioSection = ({ backstory }: ScenarioSectionProps): JSX.Element => (
  <CollapsibleSection id="backstory" title="The Story">
    <div className="space-y-3">
      {backstory.map((para, i) => (
        <p key={i} className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
          {para}
        </p>
      ))}
    </div>
  </CollapsibleSection>
);
