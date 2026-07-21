// Pure prose helpers ported from src/lib/markdown.ts (the lucide section-icon
// helpers are omitted; icons are handled by astro-icon in components).

/** Converts a string to a lowercase, hyphen-separated URL slug. */
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

/** Makes pre-rendered prose safe to embed inside an interactive element (a link
 *  card or button) by removing nested `<a>` tags, the sr-only new-tab spans, and
 *  the abbr tabindex/aria-describedby that would create invalid interactive nesting. */
export const stripLinks = (html: string): string =>
  html
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "$1")
    .replace(/<span\s+class="sr-only">[\s\S]*?<\/span>/gi, "")
    .replace(/\s+tabindex="[^"]*"/gi, "")
    .replace(/\s+aria-describedby="[^"]*"/gi, "");

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  nbsp: " ", mdash: "—", ndash: "–", hellip: "…",
  ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’",
};

/** Strips all HTML tags and decodes HTML entities in a single pass. Use when
 *  placing author-prose HTML into a plain-text context (e.g. a meta attribute). */
export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&(?:#(\d+)|#[xX]([\da-fA-F]+)|([a-zA-Z]+));/g, (match, dec, hex, name): string => {
      if (dec) {
        const cp = Number(dec);
        return cp <= 0x10ffff ? String.fromCodePoint(cp) : match;
      }
      if (hex) {
        const cp = parseInt(hex, 16);
        return cp <= 0x10ffff ? String.fromCodePoint(cp) : match;
      }
      return NAMED_ENTITIES[name] ?? match;
    });
