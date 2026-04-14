import type { AdventureLevel } from "@/data/adventures";
import { DifficultyBadge } from "@/components/DifficultyBadge";

type LevelCardProps = {
  level: AdventureLevel;
}

export const LevelCard = ({ level }: LevelCardProps): JSX.Element => (
  <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
    <span className="font-mono text-xs text-muted-foreground block mb-3">Challenge</span>
    <div className="flex items-center gap-3 mb-4">
      <DifficultyBadge difficulty={level.difficulty} showDot />
      <h2 className="text-lg font-semibold text-foreground min-w-0 flex-1">{level.name}</h2>
    </div>

    <div className="mb-6">
      <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Key Learnings</h3>
      <ul className="space-y-2">
        {level.learnings.map((learning, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
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
      Open in GitHub Codespaces →
    </a>
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[hsl(var(--text-faint))] font-mono">
        Free GitHub account required
      </p>
      <a
        href={level.discussionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm"
      >
        Discussion →
      </a>
    </div>
  </div>
);
