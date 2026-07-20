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
  <CollapsibleSection id="architecture" title="Architecture" headingLevel={2}>
    <div className="space-y-4">
      {diagram ? (
        <img
          src={diagram}
          alt={diagramAlt ?? "Architecture diagram"}
          loading="lazy"
          decoding="async"
          width={1200}
          height={560}
          className="w-full h-auto max-h-[560px] object-contain block rounded-lg"
        />
      ) : ascii ? (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- tabIndex={0} makes this scrollable block keyboard-reachable per WCAG 2.1 SC 2.1.1
        <pre tabIndex={0} aria-label="Architecture diagram" className="overflow-x-auto rounded-lg border border-border bg-background/60 px-4 py-3 font-mono text-xs text-foreground leading-relaxed whitespace-pre">
          {ascii}
        </pre>
      ) : null}
      {architecture && <MarkdownContent source={architecture} />}
    </div>
  </CollapsibleSection>
);
