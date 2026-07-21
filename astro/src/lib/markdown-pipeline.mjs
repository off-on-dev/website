// Build-time markdown-to-HTML pipeline for adventure prose fields.
//
// PORTED VERBATIM from scripts/generate-adventures.mjs (the current React app's
// generator) so the Astro content collection produces byte-identical HTML.
// Keep in sync until cutover, when the generator is removed and this becomes the
// single source of truth. Any divergence here is what the Phase 2 verification
// gate exists to catch.

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Preserve all default <a> attrs (including ARIA) and add target/rel for external links.
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel"],
    code: ["className"],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), "pre", "code", "abbr"],
  // Drop <style> tag content; rehypeSanitize strips the element but passes
  // its text children through by default (only <script> is in strip[]).
  strip: [...(defaultSchema.strip ?? []), "style"],
};

// Unique id counter for abbr expansion spans, shared across the whole render
// run. Given stable adventure/field iteration order, ids are deterministic.
let abbrExpansionCounter = 0;

/** Reset the abbr counter so a run produces deterministic ids independent of
 *  prior renders (e.g. across the verification gate vs. a fresh build). */
export function resetAbbrCounter() {
  abbrExpansionCounter = 0;
}

/** Post-sanitize: turn <abbr title> into a focusable tooltip trigger whose
 *  expansion is exposed to assistive tech via an adjacent sr-only span. */
function expandAbbr() {
  return function (tree) {
    function walk(node) {
      const children = node.children;
      if (!children) return;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type === "element" && child.tagName === "abbr" && child.properties?.title) {
          const text = String(child.properties.title);
          const id = `abbr-exp-${++abbrExpansionCounter}`;
          child.properties.dataTitle = text;
          child.properties.tabIndex = 0;
          child.properties.ariaDescribedBy = id;
          delete child.properties.title;
          children.splice(i + 1, 0, {
            type: "element",
            tagName: "span",
            properties: { id, className: ["sr-only"] },
            children: [{ type: "text", value: text }],
          });
          i++; // skip the span just inserted
        }
        walk(child);
      }
    }
    walk(tree);
  };
}

const mdProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, sanitizeSchema)
  .use(expandAbbr)
  .use(rehypeStringify);

/** A URL is not publicly navigable when its host is loopback, mDNS, or a
 *  single-label name (no public TLD). */
function isNonPublicUrl(href) {
  try {
    const host = new URL(href).hostname.replace(/^\[|\]$/g, "");
    if (host === "localhost" || host === "0.0.0.0" || host === "::1") return true;
    if (/^127\./.test(host)) return true;
    if (/^10\./.test(host)) return true;
    if (/^192\.168\./.test(host)) return true;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
    if (host.endsWith(".local")) return true;
    if (!host.includes(".")) return true;
    return false;
  } catch {
    return false;
  }
}

/** Add target/rel and the shared "opens in a new tab" hint to http/https <a> tags. */
function annotateExternalLinks(html) {
  return html.replace(
    /<a href="(https?:\/\/[^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi,
    (_, href, restAttrs, content) => {
      if (isNonPublicUrl(href)) return content;
      const attrs = restAttrs.includes("target=")
        ? restAttrs
        : ` target="_blank" rel="noopener noreferrer"${restAttrs}`;
      const described = restAttrs.includes("aria-describedby=")
        ? attrs
        : `${attrs} aria-describedby="new-tab-hint"`;
      return `<a href="${href}"${described}>${content}</a>`;
    }
  );
}

/** Convert markdown to full block HTML (preserves <p>, <ul>, <pre>, headings). */
export async function mdToBlock(str) {
  if (!str) return "";
  const result = await mdProcessor.process(str);
  let html = String(result).trim();
  html = html.replace(/<pre>/g, '<pre tabindex="0" aria-label="Code block">');
  html = annotateExternalLinks(html);
  return html;
}

/** Convert markdown to inline HTML, stripping the outer <p> wrapper when the
 *  output is a single paragraph. */
export async function mdToInline(str) {
  if (!str) return "";
  const result = await mdProcessor.process(str);
  let html = String(result).trim();
  const pCount = (html.match(/<p>/g) ?? []).length;
  if (pCount === 1 && html.startsWith("<p>") && html.endsWith("</p>")) {
    html = html.slice(3, -4);
  }
  html = annotateExternalLinks(html);
  return html;
}

/** Convert each item in a string array with mdToInline. */
export async function mdToInlineArray(arr) {
  if (!arr || arr.length === 0) return [];
  return Promise.all(arr.map(mdToInline));
}

/** Convert each item in a string array with mdToBlock. */
export async function mdToBlockArray(arr) {
  if (!arr || arr.length === 0) return [];
  return Promise.all(arr.map(mdToBlock));
}
