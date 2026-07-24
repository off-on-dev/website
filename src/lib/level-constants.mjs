/** Maps the level ID field to the canonical difficulty string. */
export const LEVEL_DIFFICULTY_BY_ID = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
};

/** Maps difficulty-indicator emoji to the canonical difficulty string. */
export const LEVEL_DIFFICULTY_BY_EMOJI = {
  "🟢": "Beginner",
  "🟡": "Intermediate",
  "🔴": "Expert",
};

/** Canonical sort order for level IDs. Unknown IDs sort last. */
export const LEVEL_ORDER = {
  beginner: 0,
  intermediate: 1,
  expert: 2,
};
