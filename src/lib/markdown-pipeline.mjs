// Build-time markdown-to-HTML pipeline for adventure prose fields. This is the
// single source of truth for prose HTML (the old React generator was removed at
// cutover). Renders sanitised HTML with abbreviation-tooltip triggers, external-
// link annotation, and code-block header markup - all at build time so pages
// ship finished HTML (no client DOM restructuring / layout shift).

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { createHighlighter, bundledLanguages } from "shiki";

// Lazy singleton: initialised on the first code block that needs highlighting.
// Shiki is bundled with Astro so no extra dependency is needed.
let _highlighter = null;
const _loadedLangs = new Set();

async function getHighlighter() {
  if (!_highlighter) {
    _highlighter = await createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [],
    });
  }
  return _highlighter;
}

async function highlightCode(rawCode, lang) {
  if (!bundledLanguages[lang]) return null;
  const h = await getHighlighter();
  if (!_loadedLangs.has(lang)) {
    try {
      await h.loadLanguage(lang);
      _loadedLangs.add(lang);
    } catch {
      return null;
    }
  }
  try {
    const fullHtml = h.codeToHtml(rawCode, {
      lang,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    });
    // Extract the inner <code> content (highlighted token spans).
    const match = fullHtml.match(/<code[^>]*>([\s\S]*)<\/code>/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Preserve all default <a> attrs (including ARIA) and add target/rel for external links.
    // Restrict target to "_blank" only — prevents authored HTML from setting
    // target="_top"/_parent which would escape the browsing context.
    a: [...(defaultSchema.attributes?.a ?? []), ["target", "_blank"], "rel"],
    code: ["className"],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), "pre", "code", "abbr"],
  // Drop <style> tag content; rehypeSanitize strips the element but passes
  // its text children through by default (only <script> is in strip[]).
  strip: [...(defaultSchema.strip ?? []), "style"],
};

// Abbreviation IDs must be unique in the rendered DOCUMENT, but this pipeline
// runs per adventure entry at content-load time and has no page context. Two
// mechanisms combine to guarantee it:
//
//   1. a scope prefix (the adventure id), set by the loader before each entry,
//      which keeps ids from different adventures apart on pages that mix them
//      (the home and /challenges/ grids render learnings from every adventure);
//   2. a per-scope occurrence counter, which disambiguates the same
//      abbreviation used twice inside one adventure.
//
// Both are derived only from that adventure's own content, so ids stay stable
// under the loader's digest cache: an unchanged entry re-serves identical HTML.
//
// Before this, ids were purely content-derived and collided, e.g. two "OTel"
// abbreviations produced two id="abbr-opentelemetry" on /, which is invalid
// HTML. The React generator avoided it with a global `abbr-exp-N` counter.
let abbrScopePrefix = "";
let abbrIdCounts = new Map();

/** Starts a new abbreviation ID scope. Call once per content entry before
 *  rendering its markdown fields. Omit `scope` to keep ids unprefixed. */
export function beginAbbrScope(scope) {
  abbrScopePrefix = scope ? `${scope}-` : "";
  abbrIdCounts = new Map();
}

/** Derives a document-unique ID from an abbreviation's title text. */
function makeAbbrId(text) {
  const slug = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, '-').slice(0, 30);
  const base = `abbr-${abbrScopePrefix}${slug}`;
  const seen = (abbrIdCounts.get(base) ?? 0) + 1;
  abbrIdCounts.set(base, seen);
  return seen === 1 ? base : `${base}-${seen}`;
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
          const id = makeAbbrId(text);
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
  // Match any <a> tag regardless of attribute order, then extract href.
  return html.replace(
    /<a\b([^>]*)>([\s\S]*?)<\/a>/gi,
    (_, attrs, content) => {
      const hrefMatch = attrs.match(/\bhref="(https?:\/\/[^"]+)"/i);
      if (!hrefMatch) return `<a${attrs}>${content}</a>`;
      const href = hrefMatch[1];
      if (isNonPublicUrl(href)) {
        console.warn(`[markdown-pipeline] Stripped non-public href: "${href}", link text preserved.`);
        return content;
      }
      let newAttrs = attrs;
      if (!attrs.includes("target=")) newAttrs += ' target="_blank"';
      if (!attrs.includes("rel=")) newAttrs += ' rel="noopener noreferrer"';
      if (!attrs.includes("aria-describedby=")) newAttrs += ' aria-describedby="new-tab-hint"';
      return `<a${newAttrs}>${content}</a>`;
    }
  );
}

// Copy-icon markup shared by the build-time code-block header and (as the
// "copied" swap) the Layout click-wirer. Inlined so no runtime icon lib is needed.
const CODE_COPY_ICON =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

/** Build-time code-block chrome: wrap each `<pre><code>` in the header (language
 *  label + Copy button) + flush body structure, so it renders server-side with
 *  no layout shift and works without JS. Layout.astro only wires the Copy click.
 *  When the language is recognised by Shiki, the code tokens are syntax-coloured
 *  using CSS custom properties (--shiki-light / --shiki-dark) for dual-theme. */
async function renderCodeBlockChrome(html) {
  const regex =
    /<pre tabindex="0" aria-label="Code block"><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g;

  // Split around code block matches so we can process them asynchronously.
  const segments = [];
  let lastIndex = 0;
  let m;
  while ((m = regex.exec(html)) !== null) {
    if (m.index > lastIndex) segments.push({ type: "text", value: html.slice(lastIndex, m.index) });
    const langMatch = m[1].match(/language-([\w-]+)/);
    segments.push({ type: "code", codeAttrs: m[1], rawContent: m[2], lang: langMatch?.[1] ?? null });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < html.length) segments.push({ type: "text", value: html.slice(lastIndex) });

  const parts = await Promise.all(segments.map(async (seg) => {
    if (seg.type === "text") return seg.value;

    const { lang, rawContent } = seg;
    const displayLang = lang ?? "code";

    // Decode HTML entities that rehype-sanitize encoded in the code text.
    const rawCode = rawContent
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"');

    // Try Shiki - falls back to the sanitized plain content on unknown lang or error.
    const highlighted = lang ? await highlightCode(rawCode, lang) : null;
    const innerContent = highlighted ?? rawContent;

    return (
      '<div class="code-block-body" data-code-block>' +
      '<div class="code-block-header">' +
      `<span class="code-lang-label" aria-hidden="true">${displayLang}</span>` +
      '<button type="button" class="code-header-btn" aria-label="Copy code" data-copy-code>' +
      `${CODE_COPY_ICON}<span>Copy</span></button>` +
      "</div>" +
      `<div class="md-pre-group"><pre tabindex="0" aria-label="Code block"><code>${innerContent}</code></pre></div>` +
      "</div>"
    );
  }));

  return parts.join("");
}

/** Convert markdown to full block HTML (preserves <p>, <ul>, <pre>, headings). */
export async function mdToBlock(str) {
  if (!str) return "";
  const result = await mdProcessor.process(str);
  let html = String(result).trim();
  html = html.replace(/<pre>/g, '<pre tabindex="0" aria-label="Code block">');
  html = await renderCodeBlockChrome(html);
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
