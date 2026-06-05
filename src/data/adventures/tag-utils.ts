import { SUMMARY_TAGS } from "./summaries";

/** Convert a tag display name to a URL-safe slug. */
export const tagToSlug = (tag: string): string =>
  tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Lookup map from slug back to the original tag name. Built from SUMMARY_TAGS so this module
    does not import the full generated adventure detail files. */
const SLUG_TO_TAG: Record<string, string> = Object.fromEntries(
  SUMMARY_TAGS.map((tag) => [tagToSlug(tag), tag])
);

/** Resolve a URL slug back to the original tag name, or undefined if not found. */
export const slugToTag = (slug: string): string | undefined => SLUG_TO_TAG[slug];
