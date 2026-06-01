import type { JSX } from "react";
import { Link } from "react-router";
import { Layers } from "lucide-react";
import type { AdventureCardSummary } from "@/data/adventures";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ContributorBadge } from "@/components/ContributorBadge";
import { LivePill } from "@/components/LivePill";


type AdventureCardProps = { adventure: AdventureCardSummary };

export const AdventureCard = ({ adventure }: AdventureCardProps): JSX.Element => (
  <Link
    to={`/adventures/${adventure.id}`}
    className={cn(
      "group card-glow relative rounded-xl border-2 bg-[hsl(var(--surface))] p-6 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      adventure.isLive
        ? "border-primary/50"
        : "border-[hsl(var(--surface-border))]"
    )}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="font-mono text-xs text-muted-foreground">Adventure</span>
      <div className="flex items-center gap-2">
        {adventure.isLive && <LivePill />}
        <span className="badge-levels inline-flex items-center gap-1.5 rounded-sm border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-primary">
          <Layers className="h-3 w-3" aria-hidden="true" />
          {adventure.levels.length} Level{adventure.levels.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>

    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
      {adventure.title}
    </h3>
    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{adventure.story}</p>

    <div className="mt-4 flex flex-wrap items-center gap-2">
      {adventure.levels.map((level) => (
        <DifficultyBadge key={level.id} difficulty={level.difficulty} />
      ))}
    </div>

    <div className="mt-4 flex flex-wrap gap-1.5">
      {adventure.tags.slice(0, 4).map((tag) => (
        <span key={tag} className="rounded-sm border border-[hsl(var(--surface-border))] px-2 py-0.5 text-xs text-[hsl(var(--text-faint))]">
          {tag}
        </span>
      ))}
    </div>

    {adventure.contributor && (
      <div className="mt-auto pt-4">
        <ContributorBadge name={adventure.contributor.name} />
      </div>
    )}
  </Link>
);
