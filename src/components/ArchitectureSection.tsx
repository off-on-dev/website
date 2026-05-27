import type { JSX } from "react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { MarkdownContent } from "@/components/MarkdownContent";

type ArchitectureSectionProps = {
  architecture: string;
  diagram?: string;
  diagramAlt?: string;
};

export const ArchitectureSection = ({ architecture, diagram, diagramAlt }: ArchitectureSectionProps): JSX.Element => (
  <CollapsibleSection id="architecture" title="Architecture">
    {diagram ? (
      <div className="rounded-lg overflow-hidden">
        <img
          src={diagram}
          alt={diagramAlt ?? "Architecture diagram"}
          loading="eager"
          className="w-full h-auto max-h-[560px] object-contain block"
        />
      </div>
    ) : (
      <MarkdownContent source={architecture} />
    )}
  </CollapsibleSection>
);
