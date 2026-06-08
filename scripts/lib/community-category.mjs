/**
 * Inserts `community_category_id` into an adventure YAML document.
 *
 * The field is placed directly after `slug` so its position is stable across
 * re-syncs. Insertion is a no-op when the key already exists or the category ID
 * is not a positive integer.
 */

import { YAMLMap } from "yaml";

export function insertCommunityCategoryId(doc, categoryId) {
  if (!Number.isInteger(categoryId) || categoryId <= 0) return false;
  if (doc.get("community_category_id") != null) return false;

  const root = doc.contents;
  if (!(root instanceof YAMLMap) || !Array.isArray(root.items)) return false;

  const slugIdx = root.items.findIndex((pair) => pair?.key?.value === "slug");
  const insertIdx = slugIdx >= 0 ? slugIdx + 1 : 0;
  root.items.splice(insertIdx, 0, doc.createPair("community_category_id", categoryId));
  return true;
}
