import type { JSX } from "react";
import { Link } from "react-router";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { stripLinks } from "@/lib/markdown";
import type { AdventureLevelSummary } from "@/data/adventures";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { LivePill } from "@/components/LivePill";

type FilteredLevelCardProps = {
  level: AdventureLevelSummary;
  adventureId: string;
  adventureTitle: string;
  isLive?: boolean;
  className?: string;
};

export const FilteredLevelCard = ({
  level,
  adventureId,
  adventureTitle,
  isLive,
  className,
}: FilteredLevelCardProps): JSX.Element => (
  <Link
    to={`/adventures/${adventureId}/levels/${level.id}/`}
    className={cn(
      "group card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
  >
    <div className="flex items-center justify-between mb-3">
      <DifficultyBadge difficulty={level.difficulty} showDot />
      {isLive && <LivePill />}
    </div>
    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
      {level.name}
    </h3>
    <ul className="mt-3 space-y-1.5">
      {level.learnings.slice(0, 3).map((learning) => (
        <li key={learning} className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span className="min-w-0 md-inline" dangerouslySetInnerHTML={{ __html: stripLinks(learning) }} />
        </li>
      ))}
    </ul>
    <div className="mt-auto pt-4 flex flex-wrap gap-1.5 items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-xs text-muted-foreground">Challenge</span>
        {level.estimatedTime && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--surface-border))] px-2 py-0.5 font-mono text-xs text-[hsl(var(--text-faint))]">
            <Clock size={10} aria-hidden="true" />
            {level.estimatedTime}
          </span>
        )}
      </div>
      <span className="rounded-sm border border-[hsl(var(--surface-border))] px-2 py-0.5 text-xs text-[hsl(var(--text-faint))]">
        {adventureTitle}
      </span>
    </div>
  </Link>
);
