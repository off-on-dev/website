import { ArrowRight } from "lucide-react";

export const VerificationSection = (): JSX.Element => (
  <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
    <h2 className="text-xl font-semibold text-foreground mb-4">Verification</h2>
    <p className="text-sm text-muted-foreground mb-4">
      Run the verification script inside your Codespace. It checks your solution and reports the result.
    </p>
    <a
      href="https://github.com/dynatrace-oss/open-ecosystem-challenges"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm"
    >
      View full verification guide on GitHub <ArrowRight size={13} aria-hidden="true" />
    </a>
  </div>
);
