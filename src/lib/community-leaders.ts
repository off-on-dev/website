import { z } from "zod";

// Shared schema and types for community-leaders.json, which is refreshed hourly
// by the refresh-community-data CI workflow. The schema is the source of truth for
// the types: add new section IDs here and in SECTION_ICON_NAMES (CommunityLeaders.astro)
// when the refresh script starts producing them.
//
// Build failure on validation is intentional: same rationale as community-data.ts.

export const SECTION_IDS = [
  "top-contributors",
  "top-challenge-solvers",
  "challenge-rockstars",
  "challenge-grand-builders",
  "challenge-builders",
  "adventure-designers",
  "most-liked",
  "most-replies",
  "most-supportive",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

const leaderUserSchema = z.object({
  username: z.string(),
  // Optional, not loose: buildAvatarUrl in scripts/refresh-community-leaders.mjs
  // returns undefined if it ever fails to construct an https URL, and JSON.stringify
  // drops the key, so a row legitimately arrives without one. Validated as a URL when
  // present, because the value goes straight into an <img src>.
  avatarUrl: z.url().optional(),
  count: z.number(),
});

const leaderSectionSchema = z.object({
  id: z.enum(SECTION_IDS),
  title: z.string(),
  users: z.array(leaderUserSchema),
});

const communityLeadersDataSchema = z.object({
  lastUpdated: z.string(),
  sections: z.array(leaderSectionSchema),
});

export type LeaderUser = z.infer<typeof leaderUserSchema>;
export type LeaderSection = z.infer<typeof leaderSectionSchema>;
export type CommunityLeadersData = z.infer<typeof communityLeadersDataSchema>;

// The types above describe community-leaders.json, where `username` is always a
// Discourse handle. The types below describe what the leaderboard *renders*,
// which mixes two sources: Discourse-fetched sections keyed by handle, and
// adventure-derived sections keyed by a contributor's display name from YAML.
// Keeping them in separate fields means a handle can never be rendered as a
// name, or a name looked up as a handle.

export type LeaderRow = {
  /** Text shown beside the avatar. A Discourse handle or a real name. */
  displayName: string;
  /** Discourse handle, when one is known. Only ever used to resolve an avatar. */
  discourseUsername?: string;
  avatarUrl?: string;
  count: number;
};

export type LeaderRowSection = {
  id: SectionId;
  title: string;
  rows: LeaderRow[];
};

/** A Discourse-sourced row: the handle is both the display text and the lookup key. */
export function rowFromDiscourse(user: LeaderUser): LeaderRow {
  return {
    displayName: user.username,
    discourseUsername: user.username,
    ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
    count: user.count,
  };
}

export function parseCommunityLeadersData(raw: unknown): CommunityLeadersData {
  const result = communityLeadersDataSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `community-leaders.json failed schema validation:\n${result.error.message}`,
    );
  }
  return result.data;
}
