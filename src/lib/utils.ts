import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind CSS class names, resolving conflicts with tailwind-merge. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Returns true if the ISO 8601 deadline string represents a date in the past. */
export function isDeadlinePast(deadline: string | undefined): boolean {
  if (!deadline) return false;
  const date = new Date(deadline);
  return !isNaN(date.getTime()) && date < new Date();
}

/** Returns true when the solution for a challenge is unlocked: no deadline, or deadline has passed. */
export function isSolutionUnlocked(deadline: string | undefined): boolean {
  return !deadline || isDeadlinePast(deadline);
}

/**
 * Formats an ISO 8601 deadline string for human display.
 * Preserves the stored UTC offset rather than converting to the viewer's local timezone.
 * "+01:00" displays as CET, "+02:00" displays as CEST, "Z" displays as UTC.
 * All other offsets display as "UTC±HH:MM".
 * Optional fractional seconds (e.g. ".000") are accepted and ignored.
 * This covers current OffOn adventures (all European deadlines); extend the map if a future
 * adventure uses a different timezone.
 */
export function formatDeadline(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):\d{2}(?:\.\d+)?([+-]\d{2}:\d{2}|Z)$/);
  if (!match) return iso;
  const [, year, month, day, hours, minutes, offset] = match;
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const tzLabel =
    offset === "Z" ? "UTC" :
    offset === "+01:00" ? "CET" :
    offset === "+02:00" ? "CEST" :
    `UTC${offset}`;
  return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year} at ${hours}:${minutes} ${tzLabel}`;
}

/**
 * Resolves a raw discussionUrl field to an absolute URL.
 * Full URLs (starting with "http") pass through unchanged.
 * Relative paths are prepended with communityUrl.
 * Missing or empty values fall back to communityUrl.
 */
export function resolveDiscussionUrl(rawUrl: string | null | undefined, communityUrl: string): string {
  if (!rawUrl) return communityUrl;
  return rawUrl.startsWith("http") ? rawUrl : `${communityUrl}${rawUrl}`;
}
