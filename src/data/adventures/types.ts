// Prose fields (learnings, audience, objective, step titles and content,
// tool descriptions, contributor bios, rewards text, story, intro, backstory,
// scenario) contain pre-rendered HTML generated at build time by the content
// loader. Render via set:html (Astro) or v-html (Vue); never as {value} directly.

/** A tool that ships pre-configured inside the level's Codespace. */
export type ToolboxItem = {
  name: string;
  description: string;
  url?: string;
}

/** One step in the Walkthrough section. content is pre-rendered HTML generated at build time and rendered via set:html in Astro. */
export type WalkthroughStep = {
  title: string;
  content: string;
}

/** Compact card shown beneath the Walkthrough, summarising how to confirm completion. */
export type VerificationInfo = {
  command: string;
  description: string;
}

/** A reference documentation link shown at the end of the challenge walkthrough. */
export type HelpfulLink = {
  title: string;
  url: string;
  description?: string;
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
  topics: string[];
  learnings: string[];
  codespacesUrl: string;
  discussionUrl: string;
  // Submission deadline for this level (ISO 8601 string after parsing). Only shown when rewards are active.
  deadline?: string;
  // Short narrative hook shown directly under the page title.
  hook?: string;
  // Brief intro paragraph(s) shown under the page title before the main content.
  intro?: string[];
  // Narrative backstory paragraphs shown as a collapsible scenario section.
  backstory?: string[];
  // Concrete acceptance criteria shown as the "Objective" card.
  objective: string[];
  // Audience line shown inside the Start CTA card (e.g. "Best for platform engineers, SREs…").
  audience?: string;
  // Optional estimated completion time shown as a pill (e.g. "~30 min", "1–2 hours").
  estimatedTime?: string;
  // Long-form narrative shown as a styled scenario block under the hero.
  scenario?: string;
  // Plain-prose architectural context paragraphs for the challenge.
  architecture?: string[];
  // SVG import for an architecture diagram (rendered as an image). Takes priority over architectureAscii.
  architectureDiagram?: string;
  // Accessible alt text for the architecture diagram image.
  diagramAlt?: string;
  // ASCII art diagram rendered as a <pre> block when no SVG diagram is available.
  architectureAscii?: string;
  // Tools pre-installed in the Codespace, rendered as a row of cards.
  toolbox: ToolboxItem[];
  // Numbered walkthrough rendered as a vertical stepper.
  howToPlay: WalkthroughStep[];
  // Reference documentation links shown after the walkthrough.
  helpfulLinks?: HelpfulLink[];
  // Verification card rendered as the final section.
  verification: VerificationInfo;
  // SEO meta description (max 160 chars). Always set by the content loader.
  metaDescription: string;
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
  // SEO meta description (max 160 chars). Always set by the content loader.
  metaDescription: string;
  tags: string[];
  levels: AdventureLevel[];
  contributor?: { name: string; url?: string; aboutHtml?: string };
  // Narrative backstory paragraphs shown on the adventure overview page.
  backstory?: string[];
  // Context paragraphs explaining what technologies or concepts the adventure covers.
  overview?: string[];
  // Lucide icon name representing this adventure (e.g. 'FlaskConical').
  icon?: string;
  rewards?: AdventureRewards;
  // Mock placeholders for levels that haven't shipped yet. Rendered in the
  // "More levels" sidebar card alongside actual sibling levels.
  upcomingLevels?: UpcomingLevel[];
}

export type AdventureContributor = {
  name: string;
  url?: string;
  /** Pre-rendered HTML from markdown. Always render via InlineProse or set:html. */
  aboutHtml?: string;
  adventures: { id: string; title: string }[];
};

