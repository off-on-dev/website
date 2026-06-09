/**
 * Targeted text-based helpers for editing adventure YAML files.
 *
 * These operate on raw file text rather than a parsed YAML document so that
 * only the specific lines being changed appear in diffs. A full parse →
 * serialize cycle reformats the entire file even when only one value changes.
 */

/**
 * Replaces the value of a named field within a specific level block.
 * Only the matching line is changed; the rest of the file is untouched.
 *
 * @param {string} text - Raw YAML file contents.
 * @param {string} targetLevelId - The `level:` value identifying the block (e.g. "intermediate").
 * @param {string} field - The field name to update (e.g. "community_url"). Must be a plain identifier; regex special characters are not escaped.
 * @param {string} value - The new value to write (unquoted).
 * @returns {string} Updated file contents.
 * @throws {Error} If the field is not found within the target level block.
 */
export function setLevelField(text, targetLevelId, field, value) {
  const lines = text.split("\n");
  let inTarget = false;

  for (let i = 0; i < lines.length; i++) {
    const levelMatch = lines[i].match(/^(\s*)-\s+level:\s*(\S+)/);
    if (levelMatch) {
      inTarget = levelMatch[2] === targetLevelId;
      continue;
    }
    if (inTarget) {
      const fieldMatch = lines[i].match(new RegExp(`^(\\s+)${field}:\\s*`));
      if (fieldMatch) {
        lines[i] = `${fieldMatch[1]}${field}: ${value}`;
        return lines.join("\n");
      }
    }
  }
  throw new Error(`Field '${field}' not found in level '${targetLevelId}'`);
}

/**
 * Inserts a root-level field on the line immediately after `slug:`.
 *
 * The `^slug:` anchor targets only unindented lines, so nested `slug:` keys
 * inside level or step blocks are not matched.
 *
 * Caller is responsible for verifying the field does not already exist before
 * calling this — no duplicate-key guard is applied here.
 *
 * @param {string} text - Raw YAML file contents.
 * @param {string} field - The field name to insert.
 * @param {string|number} value - The value to assign.
 * @returns {string} Updated file contents.
 * @throws {Error} If no root-level `slug:` line is found.
 */
export function insertRootFieldAfterSlug(text, field, value) {
  const lines = text.split("\n");
  const slugIdx = lines.findIndex((l) => /^slug:\s/.test(l));
  if (slugIdx === -1) throw new Error("'slug' field not found in adventure.yaml");
  lines.splice(slugIdx + 1, 0, `${field}: ${value}`);
  return lines.join("\n");
}
