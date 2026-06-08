import type { LucideIcon } from "lucide-react";
import { Layers, Wrench, ListChecks } from "lucide-react";

/** Converts a string to a lowercase, hyphen-separated URL slug. */
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const sectionIcons: Record<string, LucideIcon> = {
  architecture: Layers,
  toolbox: Wrench,
  "how-to-play": ListChecks,
};

/** Returns the lucide icon for a known section slug, or undefined if no icon is mapped. */
export const getSectionIcon = (slug: string): LucideIcon | undefined =>
  sectionIcons[slug];

/** Strips `<a>` tags from pre-rendered HTML, preserving text. Removes sr-only new-tab
 *  spans injected by the generator. Use inside interactive elements where nested `<a>`
 *  tags are invalid (e.g. a <Link> card or <button>). */
export const stripLinks = (html: string): string =>
  html
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "$1")
    .replace(/<span\s+class="sr-only">[\s\S]*?<\/span>/gi, "");
