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

/**
 * Formats an ISO 8601 deadline string for human display.
 * Preserves the stored UTC offset rather than converting to the viewer's local timezone.
 * "+01:00" displays as CET, "+02:00" displays as CEST.
 */
export function formatDeadline(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):\d{2}([+-]\d{2}:\d{2})$/);
  if (!match) return iso;
  const [, year, month, day, hours, minutes, offset] = match;
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const tzLabel = offset === "+01:00" ? "CET" : offset === "+02:00" ? "CEST" : `UTC${offset}`;
  return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year} at ${hours}:${minutes} ${tzLabel}`;
}
