import { type JSX } from "react";
import { ExternalLink, Trophy } from "lucide-react";
import type { AdventureRewards } from "@/data/adventures/types";

type RewardsCardProps = {
  rewards: AdventureRewards;
  compact?: boolean;
  levelDeadline?: string;
};

export const RewardsCard = ({ rewards, compact = false, levelDeadline }: RewardsCardProps): JSX.Element => (
  <div className="rounded-xl border border-primary/30 bg-[hsl(var(--surface))] p-5">
    <div className="flex items-center gap-2 mb-4">
      <Trophy size={15} className="text-primary shrink-0" aria-hidden="true" />
      <h2 className="font-sans text-base font-semibold text-foreground">Rewards</h2>
    </div>

    {!compact && rewards.deadline && (
      <p className="text-xs text-[hsl(var(--text-faint))] mb-3">
        <span className="font-mono uppercase tracking-widest">Deadline:</span>{" "}
        <span className="font-medium text-foreground">{rewards.deadline}</span>
      </p>
    )}

    {!compact && (
      <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed mb-4">
        {rewards.eligibility}
      </p>
    )}

    <div className={`space-y-2${compact ? "" : " mb-4"}`}>
      {rewards.tiers.map((tier) => (
        <div key={tier.label}>
          <p className="text-xs font-semibold text-foreground">{tier.label}</p>
          <p className="text-xs text-[hsl(var(--text-secondary))]">{tier.description}</p>
        </div>
      ))}
    </div>

    {!compact && rewards.rankingNote && (
      <p className="text-xs text-[hsl(var(--text-faint))] leading-relaxed mt-4">
        {rewards.rankingNote}{" "}
        {rewards.rankingRulesUrl && (
          <a
            href={rewards.rankingRulesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="docs-ext-link"
          >
            See the points & ranking rules for the full breakdown
            <ExternalLink size={10} aria-hidden="true" />
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        )}
      </p>
    )}

    {(compact ? levelDeadline : rewards.deadline) && (
      <>
        <div className="border-t border-[hsl(var(--surface-border))] my-3" />
        <p className="text-xs text-[hsl(var(--text-faint))]">
          Deadline:{" "}
          <span className="font-medium text-foreground">
            {compact ? levelDeadline : rewards.deadline}
          </span>
        </p>
      </>
    )}
  </div>
);
