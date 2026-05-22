import { Fragment, type JSX } from "react";
import { ExternalLink, Trophy } from "lucide-react";
import type { AdventureRewards } from "@/data/adventures/types";

type RewardsCardProps = {
  rewards: AdventureRewards;
  compact?: boolean;
};

export const RewardsCard = ({ rewards, compact = false }: RewardsCardProps): JSX.Element => (
  <div className="rounded-xl border border-primary/30 bg-[hsl(var(--surface))] p-5">
    <div className="flex items-center gap-2 mb-4">
      <Trophy size={15} className="text-primary shrink-0" aria-hidden="true" />
      <h2 className="font-sans text-base font-semibold text-foreground">Rewards</h2>
    </div>

    {!compact && (
      <>
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-[hsl(var(--text-faint))] mb-1">
          Deadline
        </p>
        <p className="text-sm font-medium text-foreground mb-4">{rewards.deadline}</p>
        <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed mb-4">
          {rewards.eligibility}
        </p>
      </>
    )}

    <dl className={`grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5${compact ? "" : " mb-4"}`}>
      {rewards.tiers.map((tier) => (
        <Fragment key={tier.label}>
          <dt className="text-xs font-semibold text-foreground whitespace-nowrap">{tier.label}:</dt>
          <dd className="text-xs text-[hsl(var(--text-secondary))] m-0">{tier.description}</dd>
        </Fragment>
      ))}
    </dl>

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
  </div>
);
