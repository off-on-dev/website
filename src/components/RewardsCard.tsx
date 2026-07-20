import { type JSX } from "react";
import { ExternalLink, Trophy } from "lucide-react";
import type { AdventureRewards } from "@/data/adventures/types";
import { COMMUNITY_URL } from "@/data/constants";
import { formatDeadline } from "@/lib/utils";
import { InlineProse } from "@/components/InlineProse";

type RewardsCardProps = {
  rewards: AdventureRewards;
  compact?: boolean;
  levelDeadline?: string;
  deadlinePast?: boolean;
};

export const RewardsCard = ({ rewards, compact = false, levelDeadline, deadlinePast = false }: RewardsCardProps): JSX.Element => (
  <div className="rounded-xl border border-primary/30 bg-[hsl(var(--surface))] p-5">
    <div className="flex items-center gap-2 mb-4">
      <Trophy size={15} className="text-primary shrink-0" aria-hidden="true" />
      <h2 className="font-sans text-base font-semibold text-foreground">Rewards</h2>
    </div>

    {!compact && (
      deadlinePast ? (
        <div className="text-xs text-dim leading-relaxed mb-4 space-y-2">
          <p>The deadline has passed, but the adventure is still open. Play it, post your solution in the community.</p>
          <p>
            If you enjoyed the adventure and want to share what you learned, write a tutorial in{" "}
            <a
              href={`${COMMUNITY_URL}/c/community-voices/38`}
              target="_blank"
              rel="noopener noreferrer" aria-describedby="new-tab-hint"
              className="docs-ext-link"
            >
              Community Voices
              <ExternalLink size={10} aria-hidden="true" />
              
            </a>
            .
          </p>
        </div>
      ) : (
        <p className="text-xs text-dim leading-relaxed mb-4">
          <span className="md-inline" dangerouslySetInnerHTML={{ __html: rewards.eligibility }} />
        </p>
      )
    )}

    {compact && deadlinePast && (
      <p className="text-xs text-dim leading-relaxed mb-3">
        Deadline passed. Adventure still open.
      </p>
    )}

    <div className={`space-y-2${compact ? "" : " mb-4"}`}>
      {rewards.tiers.map((tier) => (
        <div key={tier.label}>
          <p className="text-xs font-semibold text-foreground">{tier.label}</p>
          <InlineProse html={tier.description} className="text-xs text-dim" />
        </div>
      ))}
    </div>

    {!compact && rewards.rankingNote && (
      <p className="text-xs text-faint leading-relaxed mt-4">
        <span className="md-inline" dangerouslySetInnerHTML={{ __html: rewards.rankingNote }} />{" "}
        {rewards.rankingRulesUrl && (
          <a
            href={rewards.rankingRulesUrl}
            target="_blank"
            rel="noopener noreferrer" aria-describedby="new-tab-hint"
            className="docs-ext-link"
          >
            See the points & ranking rules for the full breakdown
            <ExternalLink size={10} aria-hidden="true" />
            
          </a>
        )}
      </p>
    )}

    {(compact ? levelDeadline : rewards.deadline) && (
      <>
        <div className="border-t border-border my-3" />
        <p className="text-xs text-faint">
          Deadline:{" "}
          <span className="font-medium text-foreground">
            {compact ? (levelDeadline ? formatDeadline(levelDeadline) : null) : formatDeadline(rewards.deadline)}
          </span>
        </p>
      </>
    )}
  </div>
);
