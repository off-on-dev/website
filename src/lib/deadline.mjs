// Converts "D Month YYYY at HH:MM TZ" (challenges repo format) to ISO 8601; pass-throughs for ISO, TODO, null, undefined.

/** Sentinel returned when a timezone abbreviation is unrecognised. Keeps the solution hidden. */
export const UNRESOLVABLE_DEADLINE = "9999-12-31T23:59:59Z";

const MONTH_INDEX = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

// Offset strings for common timezone abbreviations used in adventure deadlines.
const TZ_OFFSETS = {
  CET:  "+01:00",
  CEST: "+02:00",
  UTC:  "+00:00",
  GMT:  "+00:00",
};

/**
 * @param {string|null|undefined} value
 * @param {{ onUnknownTimezone?: "sentinel" | "preserve" }} [options]
 *   How to handle a timezone abbreviation that is not in TZ_OFFSETS.
 *   - "sentinel" (default): return UNRESOLVABLE_DEADLINE, so anything gated on
 *     the deadline stays gated. Correct for rendering, where guessing an offset
 *     could reveal a solution early.
 *   - "preserve": return the original string. Correct for the sync script, which
 *     writes its result back into adventure.yaml: replacing an author's
 *     human-readable deadline with the sentinel would destroy the source text
 *     and hide the mistake. Rendering still gates it, because the build parses
 *     the preserved string with the default.
 */
export function parseDeadline(value, options = {}) {
  const { onUnknownTimezone = "sentinel" } = options;
  if (value === null || value === undefined) return value;
  if (typeof value !== "string") {
    throw new Error(
      `[deadline] Expected a string but got ${typeof value} (${String(value)}). ` +
      "The YAML parser may have auto-cast a timestamp - quote deadline values in YAML to prevent this."
    );
  }
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) return trimmed;
  if (trimmed === "TODO") return trimmed;

  // Expected: "[Weekday, ]D Month YYYY at HH:MM TZ", anchored so partial matches don't slip through.
  const match = trimmed.match(
    /^(?:[A-Za-z]+,\s+)?(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s+at\s+(\d{2}):(\d{2})\s+([A-Z]+)$/
  );
  if (!match) {
    console.warn(`  [deadline] Unrecognised format, leaving as-is: "${value}"`);
    return value;
  }

  const [, dayStr, monthName, year, hours, minutes, tzAbbr] = match;
  const month = MONTH_INDEX[monthName];
  const offset = TZ_OFFSETS[tzAbbr];

  if (!month) {
    console.warn(`  [deadline] Unknown month "${monthName}" in "${value}", leaving as-is`);
    return value;
  }
  if (!offset) {
    if (onUnknownTimezone === "preserve") {
      console.warn(`  [deadline] Unrecognised timezone "${tzAbbr}" in "${value}", leaving as-is`);
      return value;
    }
    console.error(`[deadline] Unrecognized timezone abbreviation '${tzAbbr}' in: ${value} - treating deadline as not yet passed (solution will stay hidden)`);
    return UNRESOLVABLE_DEADLINE;
  }

  const dd = dayStr.padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `${year}-${mm}-${dd}T${hours}:${minutes}:00${offset}`;
}
