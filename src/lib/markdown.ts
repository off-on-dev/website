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

/** Makes pre-rendered prose safe to embed inside an interactive element (a
 *  `<Link>` card or `<button>`) by removing everything that would create nested
 *  interactive content or a dangling reference:
 *   - `<a>` tags (text kept), invalid nested inside another `<a>`.
 *   - the sr-only new-tab spans the generator injects for those links.
 *   - `tabindex`, which would otherwise make a generated `<abbr>` a focusable tab
 *     stop inside the interactive ancestor (invalid interactive-in-interactive).
 *   - `aria-describedby`, whose sr-only target could be stripped here; removing it
 *     prevents a dangling reference. The `<abbr>` keeps `data-title`, so its hover
 *     tooltip still works and its expansion stays readable from the adjacent
 *     (id-first, so not matched above) sr-only span. */
export const stripLinks = (html: string): string =>
  html
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "$1")
    .replace(/<span\s+class="sr-only">[\s\S]*?<\/span>/gi, "")
    .replace(/\s+tabindex="[^"]*"/gi, "")
    .replace(/\s+aria-describedby="[^"]*"/gi, "");

// Named entities decoded by stripHtml. Covers the subset rehype-sanitize can emit
// plus common typographic entities authors may use in YAML prose fields.
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  nbsp: " ", mdash: "—", ndash: "–", hellip: "…",
  ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’",
};

/** Strips all HTML tags and decodes HTML entities in a single pass.
 *  Contract: `html` must be rehype-sanitize output; `>` inside attribute values
 *  is always escaped to `&gt;`, so `<[^>]+>` safely matches only real tags.
 *  Single-pass decoding prevents double-decode of mixed entities (e.g. `&amp;lt;` → `&lt;`, not `<`).
 *  Use when placing author-prose HTML into a plain-text context such as a `<meta content="">` attribute. */
export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&(?:#(\d+)|#[xX]([\da-fA-F]+)|([a-zA-Z]+));/g, (match, dec, hex, name): string => {
      if (dec) { const cp = Number(dec); return cp <= 0x10FFFF ? String.fromCodePoint(cp) : match; }
      if (hex) { const cp = parseInt(hex, 16); return cp <= 0x10FFFF ? String.fromCodePoint(cp) : match; }
      return NAMED_ENTITIES[name] ?? match;
    });
