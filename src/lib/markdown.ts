import type { LucideIcon } from "lucide-react";
import { Layers, Wrench, ListChecks } from "lucide-react";

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

export const getSectionIcon = (slug: string): LucideIcon | undefined =>
  sectionIcons[slug];

// Strip <a> tags from pre-rendered HTML while preserving the link text.
// Also removes the external-link SVG icon and sr-only span the generator
// injects inside every external link. Use this when rendering HTML inside
// an interactive element (e.g. <Link>, <button>) where nested <a> tags
// would produce invalid HTML.
export const stripLinks = (html: string): string =>
  html
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "$1")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, "")
    .replace(/<span\s+class="sr-only">[\s\S]*?<\/span>/gi, "");
