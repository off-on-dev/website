import type { JSX } from "react";
import { Wrench } from "lucide-react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import type { ToolboxItem } from "@/data/adventures";

type ToolboxSectionProps = {
  toolbox: ToolboxItem[];
};

export const ToolboxSection = ({ toolbox }: ToolboxSectionProps): JSX.Element => (
  <CollapsibleSection id="toolbox" title="Toolbox" icon={Wrench}>
    <p className="text-[hsl(var(--text-secondary))] leading-relaxed mb-5">
      Your Codespace comes pre-configured with the following tools.
    </p>
    <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {toolbox.map((tool) => (
        <li
          key={tool.name}
          className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5"
        >
          <p className="font-mono text-sm font-semibold text-foreground mb-2">
            {tool.name}
          </p>
          <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
            {tool.description}
          </p>
        </li>
      ))}
    </ul>
  </CollapsibleSection>
);
