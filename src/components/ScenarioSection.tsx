import type { JSX } from "react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { InlineProse } from "@/components/InlineProse";

type ScenarioSectionProps = {
  backstory: string[];
};

export const ScenarioSection = ({ backstory }: ScenarioSectionProps): JSX.Element => (
  <CollapsibleSection id="backstory" title="The Story" headingLevel={2}>
    <div className="space-y-3">
      {backstory.map((para, i) => (
        <InlineProse
          key={i}
          html={para}
          className="text-sm text-dim leading-relaxed"
        />
      ))}
    </div>
  </CollapsibleSection>
);
