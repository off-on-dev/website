import type { JSX } from "react";
import { CircleCheck } from "lucide-react";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import type { VerificationInfo } from "@/data/adventures";

type VerificationCardProps = {
  verification: VerificationInfo;
};

export const VerificationCard = ({ verification }: VerificationCardProps): JSX.Element => (
  <CollapsibleSection id="verification" title="Verification" icon={CircleCheck}>
    <div className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
      <pre className="mb-4 overflow-x-auto rounded-lg border border-[hsl(var(--surface-border))] bg-background/60 px-4 py-3 font-mono text-sm text-foreground">
        <code>{verification.command}</code>
      </pre>
      <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
        {verification.description}
      </p>
    </div>
  </CollapsibleSection>
);
