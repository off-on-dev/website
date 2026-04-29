// Requires a production build in dist/client/. Run `npm run build` before `npm test`.

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const DIST_ROOT = path.resolve(__dirname, "../../dist/client");
const SITE_URL = "https://offon.dev";

const ROUTES = [
  "/",
  "/adventures",
  "/404",
  "/sponsors",
  "/about",
  "/handbook",
  "/privacy",
  "/adventures/echoes-lost-in-orbit",
  "/adventures/building-cloudhaven",
  "/adventures/the-ai-observatory",
  "/adventures/echoes-lost-in-orbit/levels/beginner",
  "/adventures/echoes-lost-in-orbit/levels/intermediate",
  "/adventures/echoes-lost-in-orbit/levels/expert",
  "/adventures/building-cloudhaven/levels/beginner",
  "/adventures/building-cloudhaven/levels/intermediate",
  "/adventures/building-cloudhaven/levels/expert",
  "/adventures/the-ai-observatory/levels/beginner",
  "/adventures/the-ai-observatory/levels/intermediate",
  "/adventures/the-ai-observatory/levels/expert",
];

function routeToFile(route: string): string {
  return route === "/" ? "index.html" : `${route.slice(1)}/index.html`;
}

function readHtml(route: string): string {
  const file = routeToFile(route);
  const fullPath = path.join(DIST_ROOT, file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`dist/client/${file} not found. Run npm run build first.`);
  }
  return fs.readFileSync(fullPath, "utf-8");
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function metaContent(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta\\b[^>]*\\bname="${escapeRe(name)}"[^>]*\\bcontent="([^"]*)"` +
      `|<meta\\b[^>]*\\bcontent="([^"]*)"[^>]*\\bname="${escapeRe(name)}"`,
  );
  const m = html.match(re);
  return m ? (m[1] ?? m[2]) : null;
}

function propContent(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta\\b[^>]*\\bproperty="${escapeRe(property)}"[^>]*\\bcontent="([^"]*)"` +
      `|<meta\\b[^>]*\\bcontent="([^"]*)"[^>]*\\bproperty="${escapeRe(property)}"`,
  );
  const m = html.match(re);
  return m ? (m[1] ?? m[2]) : null;
}

function canonicalHref(html: string): string | null {
  const m = html.match(/<link\b[^>]*\brel="canonical"[^>]*\bhref="([^"]*)"/);
  return m ? m[1] : null;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

for (const route of ROUTES) {
  describe(`SEO: ${route}`, () => {
    it("description is present and within 160 chars", () => {
      const html = readHtml(route);
      const description = metaContent(html, "description");
      expect(description, 'missing <meta name="description">').not.toBeNull();
      const decoded = decodeEntities(description!);
      expect(
        decoded.length,
        `description is ${decoded.length} chars (max 160): "${decoded}"`,
      ).toBeLessThanOrEqual(160);
    });

    it("open graph tags are present and correct", () => {
      const html = readHtml(route);

      expect.soft(propContent(html, "og:title"), "missing og:title").not.toBeNull();
      expect.soft(propContent(html, "og:title"), "og:title is empty").not.toBe("");

      expect.soft(propContent(html, "og:description"), "missing og:description").not.toBeNull();
      expect.soft(propContent(html, "og:description"), "og:description is empty").not.toBe("");

      expect.soft(propContent(html, "og:type"), "missing og:type").not.toBeNull();

      const ogUrl = propContent(html, "og:url");
      expect.soft(ogUrl, "missing og:url").not.toBeNull();
      if (ogUrl) {
        expect
          .soft(ogUrl, "og:url must start with https://offon.dev")
          .toMatch(/^https:\/\/offon\.dev/);
      }

      expect
        .soft(propContent(html, "og:image"), 'og:image must be "https://offon.dev/og.png"')
        .toBe(`${SITE_URL}/og.png`);
      expect
        .soft(propContent(html, "og:image:width"), "og:image:width must be 1200")
        .toBe("1200");
      expect
        .soft(propContent(html, "og:image:height"), "og:image:height must be 630")
        .toBe("630");

      expect.soft(propContent(html, "og:image:alt"), "missing og:image:alt").not.toBeNull();
      expect.soft(propContent(html, "og:image:alt"), "og:image:alt is empty").not.toBe("");

      expect
        .soft(propContent(html, "og:site_name"), 'og:site_name must be "OffOn"')
        .toBe("OffOn");
      expect
        .soft(propContent(html, "og:locale"), 'og:locale must be "en_GB"')
        .toBe("en_GB");
    });

    it("twitter card tags are present and correct", () => {
      const html = readHtml(route);

      expect
        .soft(
          metaContent(html, "twitter:card"),
          'twitter:card must be "summary_large_image"',
        )
        .toBe("summary_large_image");

      expect.soft(metaContent(html, "twitter:title"), "missing twitter:title").not.toBeNull();
      expect.soft(metaContent(html, "twitter:title"), "twitter:title is empty").not.toBe("");

      expect
        .soft(metaContent(html, "twitter:description"), "missing twitter:description")
        .not.toBeNull();
      expect
        .soft(metaContent(html, "twitter:description"), "twitter:description is empty")
        .not.toBe("");

      expect
        .soft(
          metaContent(html, "twitter:image"),
          'twitter:image must be "https://offon.dev/og.png"',
        )
        .toBe(`${SITE_URL}/og.png`);

      expect
        .soft(metaContent(html, "twitter:image:alt"), "missing twitter:image:alt")
        .not.toBeNull();
      expect
        .soft(metaContent(html, "twitter:image:alt"), "twitter:image:alt is empty")
        .not.toBe("");
    });

    it("canonical URL is present and correct", () => {
      const html = readHtml(route);
      const canonical = canonicalHref(html);
      expect(canonical, 'missing <link rel="canonical">').not.toBeNull();
      expect(canonical, `canonical must be "${SITE_URL}${route}"`).toBe(`${SITE_URL}${route}`);
    });
  });
}
