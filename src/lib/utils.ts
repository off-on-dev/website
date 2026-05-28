import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind CSS class names, resolving conflicts with tailwind-merge. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Returns true if the deadline string represents a date in the past.
 * Handles the format "10 December 2025 at 09:00 CET" by extracting the date portion.
 */
export function isDeadlinePast(deadline: string | undefined): boolean {
  if (!deadline) return false;
  const date = new Date(deadline.split(" at ")[0].trim());
  return !isNaN(date.getTime()) && date < new Date();
}
