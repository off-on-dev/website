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
  "most-liked",
  "most-replies",
  "most-supportive",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

const leaderUserSchema = z.object({
  username: z.string(),
  avatarUrl: z.string(),
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

export function parseCommunityLeadersData(raw: unknown): CommunityLeadersData {
  const result = communityLeadersDataSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `community-leaders.json failed schema validation:\n${result.error.message}`,
    );
  }
  return result.data;
}
