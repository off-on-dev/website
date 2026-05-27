/** A tool that ships pre-configured inside the level's Codespace. */
export type ToolboxItem = {
  name: string;
  description: string;
  url?: string;
}

/** One step in the Walkthrough section. body is rendered as markdown so it can contain code blocks and links. */
export type WalkthroughStep = {
  title: string;
  body: string;
}

/** Compact card shown beneath the Walkthrough, summarising how to confirm completion. */
export type VerificationInfo = {
  command: string;
  description: string;
}

/** A reference documentation link shown at the end of the challenge walkthrough. */
export type HelpfulLink = {
  label: string;
  url: string;
}

/** Mock entry in the "Top players" leaderboard inside the CommunitySidebar. */
export type TopPlayer = {
  username: string;
  count: number;
}

/** Placeholder for a level that hasn't shipped yet. Rendered in the "More levels" sidebar card. */
export type UpcomingLevel = {
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Expert";
}

/** A single challenge level within an adventure. Difficulty affects visual presentation and prerequisite expectations. */
export type AdventureLevel = {
  id: string;
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Expert";
  // Short topic tags shown on the adventure overview card (e.g. ["Argo CD", "GitOps"]).
  topics?: string[];
  learnings: string[];
  codespacesUrl: string;
  discussionUrl: string;
  // Submission deadline for this level (e.g. "10 December 2025 at 09:00 CET"). Only shown when rewards are active.
  deadline?: string;
  // Short narrative hook shown directly under the page title.
  hook?: string;
  // Brief intro paragraph(s) shown under the page title before the main content.
  intro?: string[];
  // Narrative backstory paragraphs shown as a collapsible scenario section.
  backstory?: string[];
  // Concrete acceptance criteria shown as the "Objective" card.
  objective?: string[];
  // Audience line shown inside the Start CTA card (e.g. "Best for platform engineers, SREs…").
  audience?: string;
  // Long-form narrative shown as a styled scenario block under the hero.
  scenario?: string;
  // Plain-prose architectural context paragraphs for the challenge.
  architecture?: string[];
  // SVG import for an architecture diagram (rendered as an image).
  architectureDiagram?: string;
  // Accessible alt text for the architecture diagram image.
  diagramAlt?: string;
  // Tools pre-installed in the Codespace, rendered as a row of cards.
  toolbox?: ToolboxItem[];
  // Numbered walkthrough rendered as a vertical stepper.
  howToPlay?: WalkthroughStep[];
  // Reference documentation links shown after the walkthrough.
  helpfulLinks?: HelpfulLink[];
  // Verification card rendered as the final section.
  verification?: VerificationInfo;
  // Mock community stats shown in the CommunitySidebar. Real data will replace
  // these once we aggregate certificate posts and cross-challenge contribution.
  solvedCount?: number;
  topPlayers?: TopPlayer[];
}

export type AdventureRewardTier = {
  label: string;
  description: string;
};

export type AdventureRewards = {
  deadline: string;
  eligibility: string;
  tiers: AdventureRewardTier[];
  rankingNote?: string;
  rankingRulesUrl?: string;
};

/** An adventure with multiple difficulty levels, grouped by theme and monthly release. */
export type Adventure = {
  id: string;
  title: string;
  month: string;
  story: string;
  tags: string[];
  levels: AdventureLevel[];
  contributor?: { name: string; url?: string; about?: string };
  // Narrative backstory paragraphs shown on the adventure overview page.
  backstory?: string[];
  // Optional "What you'll be using" style context section shown after the backstory.
  context?: { title: string; body: string[] };
  rewards?: AdventureRewards;
  // Mock placeholders for levels that haven't shipped yet. Rendered in the
  // "More levels" sidebar card alongside actual sibling levels.
  upcomingLevels?: UpcomingLevel[];
}

export type AdventureContributor = {
  name: string;
  url?: string;
  about?: string;
  adventures: { id: string; title: string }[];
};

/** A level with its parent adventure context, returned when filtering by tag. */
export type RelatedLevel = {
  level: AdventureLevel;
  adventureId: string;
  adventureTitle: string;
};
