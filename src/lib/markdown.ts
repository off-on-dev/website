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

// Named entities decoded by stripHtml. Covers the subset rehype-sanitize can emit
// plus common typographic entities authors may use in YAML prose fields.
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  nbsp: " ", mdash: "—", ndash: "–", hellip: "…",
  ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’",
};

/** Strips all HTML tags and decodes HTML entities in a single pass.
 *  Contract: `html` must be rehype-sanitize output — `>` inside attribute values
 *  is always escaped to `&gt;`, so `<[^>]+>` safely matches only real tags.
 *  Single-pass decoding prevents double-decode of mixed entities (e.g. `&amp;lt;` → `&lt;`, not `<`).
 *  Use when placing author-prose HTML into a plain-text context such as a `<meta content="">` attribute. */
export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&(?:#(\d+)|#[xX]([\da-fA-F]+)|([a-zA-Z]+));/g, (match, dec, hex, name): string => {
      if (dec) return String.fromCodePoint(Number(dec));
      if (hex) return String.fromCodePoint(parseInt(hex, 16));
      return NAMED_ENTITIES[name] ?? match;
    });
