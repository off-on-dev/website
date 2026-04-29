// This test requires a production build to exist in dist/client/.
// Run `npm run build` before running these tests.

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const DIST_ROOT = path.resolve(__dirname, "../../dist/client");

type TitleCheck =
  | { type: "exact"; value: string }
  | { type: "contains"; value: string };

type PageSpec = {
  file: string;
  check: TitleCheck;
};

const pages: PageSpec[] = [
  {
    file: "index.html",
    check: { type: "exact", value: "OffOn - Vendor-neutral. Open Source. Community Driven." },
  },
  {
    file: "about/index.html",
    check: { type: "exact", value: "About OffOn - Building the contributors and maintainers of tomorrow" },
  },
  {
    file: "adventures/index.html",
    check: { type: "exact", value: "Adventures - Hands-on open source challenges | OffOn" },
  },
  {
    file: "privacy/index.html",
    check: { type: "exact", value: "Privacy Policy - OffOn" },
  },
  {
    file: "sponsors/index.html",
    check: { type: "exact", value: "Sponsorship and Independence - OffOn" },
  },
  {
    file: "handbook/index.html",
    check: { type: "exact", value: "Handbook - OffOn" },
  },
  {
    file: "adventures/echoes-lost-in-orbit/index.html",
    check: { type: "contains", value: "Echoes Lost in Orbit" },
  },
  {
    file: "adventures/building-cloudhaven/index.html",
    check: { type: "contains", value: "Building CloudHaven" },
  },
  {
    file: "adventures/the-ai-observatory/index.html",
    check: { type: "contains", value: "The AI Observatory" },
  },
  // Adventure levels: echoes-lost-in-orbit
  {
    file: "adventures/echoes-lost-in-orbit/levels/beginner/index.html",
    check: { type: "contains", value: "Broken Echoes" },
  },
  {
    file: "adventures/echoes-lost-in-orbit/levels/intermediate/index.html",
    check: { type: "contains", value: "The Silent Canary" },
  },
  {
    file: "adventures/echoes-lost-in-orbit/levels/expert/index.html",
    check: { type: "contains", value: "Hyperspace Operations" },
  },
  // Adventure levels: building-cloudhaven
  {
    file: "adventures/building-cloudhaven/levels/beginner/index.html",
    check: { type: "contains", value: "The Foundation Stones" },
  },
  {
    file: "adventures/building-cloudhaven/levels/intermediate/index.html",
    check: { type: "contains", value: "The Modular Metropolis" },
  },
  {
    file: "adventures/building-cloudhaven/levels/expert/index.html",
    check: { type: "contains", value: "The Guardian Protocols" },
  },
  // Adventure levels: the-ai-observatory
  {
    file: "adventures/the-ai-observatory/levels/beginner/index.html",
    check: { type: "contains", value: "Calibrating the Lens" },
  },
  {
    file: "adventures/the-ai-observatory/levels/intermediate/index.html",
    check: { type: "contains", value: "The Distracted Pilot" },
  },
  {
    file: "adventures/the-ai-observatory/levels/expert/index.html",
    check: { type: "contains", value: "The Noise Filter" },
  },
];

function extractTitles(html: string): string[] {
  return [...html.matchAll(/<title[^>]*>([^<]*)<\/title>/g)].map((m) => m[1]);
}

describe("prerendered HTML layout shell", () => {
  // Guards against Layout.tsx losing its default export, which causes RR7 to
  // silently skip the layout so providers, skip nav, and consent banner never mount.
  it("dist/client/index.html contains the skip-nav link", () => {
    const html = fs.readFileSync(path.join(DIST_ROOT, "index.html"), "utf-8");
    expect(html).toContain("Skip to main content");
  });

  it("dist/client/index.html does not contain the consent banner (mount guard keeps it out of prerendered HTML)", () => {
    const html = fs.readFileSync(path.join(DIST_ROOT, "index.html"), "utf-8");
    expect(html).not.toContain('aria-label="Cookie consent"');
    expect(html).not.toContain("Accept analytics");
  });

  // Guards against entry.server.tsx reverting to renderToString, which emits
  // <!--$!--> (failed Suspense fallback) markers that break hydrateRoot and
  // leave all event handlers unattached (buttons and theme toggle stop working).
  it("dist/client/index.html contains no failed Suspense markers", () => {
    const html = fs.readFileSync(path.join(DIST_ROOT, "index.html"), "utf-8");
    expect(html).not.toContain("<!--$!-->");
  });
});

describe("prerendered HTML title tags", () => {
  for (const { file, check } of pages) {
    it(`dist/client/${file} has correct <title>`, () => {
      const fullPath = path.join(DIST_ROOT, file);

      if (!fs.existsSync(fullPath)) {
        throw new Error(`dist/client/${file} not found. Run npm run build first.`);
      }

      const html = fs.readFileSync(fullPath, "utf-8");
      const titles = extractTitles(html);

      expect(
        titles.length,
        `Expected exactly one <title> tag in dist/client/${file}, found ${titles.length}`
      ).toBe(1);

      const title = titles[0];

      if (check.type === "exact") {
        expect(title).toBe(check.value);
      } else {
        expect(title).toContain(check.value);
      }
    });
  }
});
