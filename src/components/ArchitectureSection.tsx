import type { JSX } from "react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { MarkdownContent } from "@/components/MarkdownContent";

type ArchitectureSectionProps = {
  architecture: string;
  diagram?: string;
};

export const ArchitectureSection = ({ architecture, diagram }: ArchitectureSectionProps): JSX.Element => (
  <CollapsibleSection id="architecture" title="Architecture">
    {diagram ? (
      <img
        src={diagram}
        alt="Architecture diagram"
        className="w-full rounded-lg"
      />
    ) : (
      <MarkdownContent source={architecture} />
    )}
  </CollapsibleSection>
);
