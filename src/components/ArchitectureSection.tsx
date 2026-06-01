import type { JSX } from "react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { MarkdownContent } from "@/components/MarkdownContent";

type ArchitectureSectionProps = {
  architecture?: string;
  diagram?: string;
  diagramAlt?: string;
  ascii?: string;
};

export const ArchitectureSection = ({ architecture, diagram, diagramAlt, ascii }: ArchitectureSectionProps): JSX.Element => (
  <CollapsibleSection id="architecture" title="Architecture">
    <div className="space-y-4">
      {diagram ? (
        <img
          src={diagram}
          alt={diagramAlt ?? "Architecture diagram"}
          loading="eager"
          width={1200}
          height={560}
          className="w-full h-auto max-h-[560px] object-contain block rounded-lg"
        />
      ) : ascii ? (
        <pre className="overflow-x-auto rounded-lg border border-[hsl(var(--surface-border))] bg-background/60 px-4 py-3 font-mono text-xs text-foreground leading-relaxed whitespace-pre">
          {ascii}
        </pre>
      ) : null}
      {architecture && <MarkdownContent source={architecture} />}
    </div>
  </CollapsibleSection>
);
