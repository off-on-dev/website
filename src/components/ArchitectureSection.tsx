import type { JSX } from "react";
import { Layers } from "lucide-react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { MarkdownContent } from "@/components/MarkdownContent";

type ArchitectureSectionProps = {
  architecture: string;
};

export const ArchitectureSection = ({ architecture }: ArchitectureSectionProps): JSX.Element => (
  <CollapsibleSection id="architecture" title="Architecture" icon={Layers}>
    <MarkdownContent source={architecture} />
  </CollapsibleSection>
);
