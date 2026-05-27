import type { JSX } from "react";
import { Trophy, Target, Building2, Wrench, Heart, MessageCircle, HandHeart } from "lucide-react";
import communityLeadersData from "@/data/community-leaders.json";
import { AvatarLink } from "@/components/AvatarLink";

type LeaderUser = {
  username: string;
  avatarUrl: string;
  count: number;
};

type LeaderSection = {
  id: string;
  title: string;
  users: LeaderUser[];
};

type CommunityLeadersProps = {
  /** Which section IDs to show. Omit to show all. */
  sections?: string[];
};

const SECTION_ICONS: Record<string, JSX.Element> = {
  "top-contributors": <Trophy size={14} aria-hidden="true" />,
  "top-challenge-solvers": <Target size={14} aria-hidden="true" />,
  "challenge-grand-builders": <Building2 size={14} aria-hidden="true" />,
  "challenge-builders": <Wrench size={14} aria-hidden="true" />,
  "most-liked": <Heart size={14} aria-hidden="true" />,
  "most-replies": <MessageCircle size={14} aria-hidden="true" />,
  "most-supportive": <HandHeart size={14} aria-hidden="true" />,
};

const ALL_SECTIONS: LeaderSection[] = communityLeadersData.sections;

const LeaderRow = ({ user, rank }: { user: LeaderUser; rank: number }): JSX.Element => (
  <li className="flex items-center gap-3">
    <span
      className="font-mono text-xs text-[hsl(var(--text-faint))] w-4 shrink-0 text-right"
      aria-hidden="true"
    >
      {rank}
    </span>
    <AvatarLink
      username={user.username}
      avatarUrl={user.avatarUrl}
      size={28}
      linkClassName="docs-ext-link text-sm font-medium min-w-0 flex-1"
    />
    <span
      className="text-xs font-mono text-[hsl(var(--text-secondary))] tabular-nums shrink-0"
      aria-label={`${user.count} contributions`}
    >
      {user.count}
    </span>
  </li>
);

const LeaderCategory = ({ section }: { section: LeaderSection }): JSX.Element => (
  <div>
    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
      <span className="text-primary">{SECTION_ICONS[section.id]}</span>
      {section.title}
    </h3>
    <ol className="space-y-2.5" aria-label={section.title}>
      {section.users.map((user, i) => (
        <LeaderRow key={user.username} user={user} rank={i + 1} />
      ))}
    </ol>
  </div>
);

export const CommunityLeaders = ({
  sections: sectionFilter,
}: CommunityLeadersProps): JSX.Element => {
  const visibleSections = sectionFilter
    ? ALL_SECTIONS.filter((s) => sectionFilter.includes(s.id))
    : ALL_SECTIONS;

  return (
    <div
      className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5"
    >
      <h2 className="font-sans text-base font-semibold text-foreground mb-5">
        Community Leaders
      </h2>
      <div className="space-y-5">
        {visibleSections.map((section) => (
          <div
            key={section.id}
            className="pb-5 border-b border-[hsl(var(--surface-border))] last:border-b-0 last:pb-0"
          >
            <LeaderCategory section={section} />
          </div>
        ))}
      </div>
    </div>
  );
};
