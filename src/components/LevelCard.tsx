import type { JSX } from "react";
import type { AdventureLevel } from "@/data/adventures";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ArrowRight } from "lucide-react";

type LevelCardProps = {
  level: AdventureLevel;
  // Pass "none" when the parent page already renders the level name as h1,
  // to avoid a duplicate heading in the document outline.
  headingLevel?: "h2" | "none";
}

export const LevelCard = ({ level, headingLevel = "h2" }: LevelCardProps): JSX.Element => (
  <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
    <span className="font-mono text-xs text-muted-foreground block mb-3">Challenge</span>
    <div className="flex items-center gap-3 mb-4">
      <DifficultyBadge difficulty={level.difficulty} showDot />
      {headingLevel === "h2" ? (
        <h2 className="text-lg font-semibold text-foreground min-w-0 flex-1">{level.name}</h2>
      ) : (
        <p className="text-lg font-semibold text-foreground min-w-0 flex-1">{level.name}</p>
      )}
    </div>

    <div className="mb-6">
      <p className="font-sans text-sm uppercase tracking-widest text-primary mb-3">Key Learnings</p>
      <ul className="space-y-2">
        {level.learnings.map((learning) => (
          <li key={learning} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            {learning}
          </li>
        ))}
      </ul>
    </div>

    <a
      href={level.codespacesUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-primary"
    >
      Open in GitHub Codespaces <ArrowRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
    </a>
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[hsl(var(--text-faint))] font-mono">
        Free GitHub account required
      </p>
      <a
        href={level.discussionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm inline-flex items-center gap-0.5"
      >
        Discussion <ArrowRight size={11} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
      </a>
    </div>
  </div>
);
