// Ported from src/lib/utils.ts (the subset the Astro pages need).

/** Formats an ISO 8601 deadline for display, preserving the stored UTC offset. */
export function formatDeadline(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):\d{2}(?:\.\d+)?([+-]\d{2}:\d{2}|Z)$/);
  if (!match) return iso;
  const [, year, month, day, hours, minutes, offset] = match;
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const tzLabel =
    offset === "Z" ? "UTC" : offset === "+01:00" ? "CET" : offset === "+02:00" ? "CEST" : `UTC${offset}`;
  return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year} at ${hours}:${minutes} ${tzLabel}`;
}

/** True when a deadline is in the past. Build-time evaluation (may be stale). */
export function isDeadlinePast(deadline?: string): boolean {
  if (!deadline) return false;
  const d = new Date(deadline);
  return !isNaN(d.getTime()) && d < new Date();
}

/** Escapes a string for safe interpolation into an HTML attribute value. */
export function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
