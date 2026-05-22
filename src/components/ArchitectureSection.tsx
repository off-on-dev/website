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
      /* The SVG has a hardcoded dark background, so we keep it on a dark surface in all modes. */
      <div className="rounded-lg overflow-hidden bg-[#111110]">
        <img
          src={diagram}
          alt={diagramAlt ?? "Architecture diagram"}
          width={1102}
          height={660}
          loading="eager"
          className="w-full"
        />
      </div>
    ) : (
      <MarkdownContent source={architecture} />
    )}
  </CollapsibleSection>
);
