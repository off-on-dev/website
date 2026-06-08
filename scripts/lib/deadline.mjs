// Converts "D Month YYYY at HH:MM TZ" (challenges repo format) to ISO 8601; pass-throughs for ISO, TODO, null, undefined.

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

export function parseDeadline(value) {
  if (!value || typeof value !== "string") return value;
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
  if (value === "TODO") return value;

  // Expected: "[Weekday, ]D Month YYYY at HH:MM TZ"
  const match = value.match(
    /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s+at\s+(\d{2}):(\d{2})\s+([A-Z]+)/
  );
  if (!match) {
    console.warn(`  [deadline] Unrecognised format — leaving as-is: "${value}"`);
    return value;
  }

  const [, dayStr, monthName, year, hours, minutes, tzAbbr] = match;
  const month = MONTH_INDEX[monthName];
  const offset = TZ_OFFSETS[tzAbbr];

  if (!month) {
    console.warn(`  [deadline] Unknown month "${monthName}" in "${value}" — leaving as-is`);
    return value;
  }
  if (!offset) {
    console.warn(`  [deadline] Unknown timezone "${tzAbbr}" in "${value}" — leaving as-is`);
    return value;
  }

  const dd = String(parseInt(dayStr, 10)).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `${year}-${mm}-${dd}T${hours}:${minutes}:00${offset}`;
}
