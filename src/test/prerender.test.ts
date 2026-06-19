// This test requires a production build to exist in dist/client/.
// Run `npm run build` before running these tests.

import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { SOLUTIONS } from "@/data/solutions";

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
    check: { type: "exact", value: "OffOn - Vendor-Neutral. Open Source. Community-Driven" },
  },
  {
    file: "about/index.html",
    check: { type: "exact", value: "About OffOn - Building the contributors and maintainers of tomorrow" },
  },
  {
    file: "adventures/index.html",
    check: { type: "exact", value: "Adventures - Open Source Learning Paths | OffOn" },
  },
  {
    file: "privacy/index.html",
    check: { type: "exact", value: "Privacy Policy - OffOn" },
  },
  {
    file: "accessibility/index.html",
    check: { type: "exact", value: "Accessibility Statement - OffOn" },
  },
  {
    file: "brand/index.html",
    check: { type: "exact", value: "Brand Guidelines - OffOn" },
  },
  {
    file: "presentation-templates/index.html",
    check: { type: "exact", value: "Presentation Templates - OffOn" },
  },
  {
    file: "contribute/index.html",
    check: { type: "exact", value: "How to Contribute - OffOn" },
  },
  {
    file: "sponsors/index.html",
    check: { type: "exact", value: "Sponsorship and Independence - OffOn" },
  },
  {
    file: "handbook/index.html",
    check: { type: "exact", value: "Handbook - OffOn" },
  },
  // GENERATED:adventures
  {
    file: "adventures/lex-imperfecta/index.html",
    check: { type: "contains", value: "Lex Imperfecta" },
  },
  {
    file: "adventures/lex-imperfecta/levels/beginner/index.html",
    check: { type: "contains", value: "The Twelve Tables" },
  },
  {
    file: "adventures/lex-imperfecta/levels/intermediate/index.html",
    check: { type: "contains", value: "Governing the Provinces" },
  },
  {
    file: "adventures/lex-imperfecta/levels/expert/index.html",
    check: { type: "contains", value: "Quis Custodiet" },
  },
  {
    file: "adventures/blind-by-design/index.html",
    check: { type: "contains", value: "Blind by Design" },
  },
  {
    file: "adventures/blind-by-design/levels/beginner/index.html",
    check: { type: "contains", value: "Stand up the Lab" },
  },
  {
    file: "adventures/blind-by-design/levels/intermediate/index.html",
    check: { type: "contains", value: "Outcome by Cohort" },
  },
  {
    file: "adventures/blind-by-design/levels/expert/index.html",
    check: { type: "contains", value: "Read the Chart" },
  },
  {
    file: "adventures/the-ai-observatory/index.html",
    check: { type: "contains", value: "The AI Observatory" },
  },
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
  {
    file: "adventures/building-cloudhaven/index.html",
    check: { type: "contains", value: "Building CloudHaven" },
  },
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
  {
    file: "adventures/echoes-lost-in-orbit/index.html",
    check: { type: "contains", value: "Echoes Lost in Orbit" },
  },
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
    check: { type: "contains", value: "Hyperspace Operations &amp; Transport" },
  },
  // /GENERATED:adventures
  // GENERATED:solutions
  {
    file: "adventures/echoes-lost-in-orbit/levels/beginner/solution/index.html",
    check: { type: "contains", value: "Solution" },
  },
  {
    file: "adventures/echoes-lost-in-orbit/levels/expert/solution/index.html",
    check: { type: "contains", value: "Solution" },
  },
  {
    file: "adventures/echoes-lost-in-orbit/levels/intermediate/solution/index.html",
    check: { type: "contains", value: "Solution" },
  },
  // /GENERATED:solutions
  {
    file: "challenges/index.html",
    check: { type: "exact", value: "Open Source Challenges | OffOn" },
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

describe("prerendered solution page content", () => {
  const solutionFile = "adventures/echoes-lost-in-orbit/levels/beginner/solution/index.html";
  const solutionData = SOLUTIONS.find(
    (s) => s.adventureId === "echoes-lost-in-orbit" && s.levelId === "beginner"
  )!;
  let html: string;

  beforeAll(() => {
    const fullPath = path.join(DIST_ROOT, solutionFile);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`dist/client/${solutionFile} not found. Run npm run build first.`);
    }
    html = fs.readFileSync(fullPath, "utf-8");
  });

  it("contains the contributor name", () => {
    expect(html).toContain(solutionData.contributor!.name);
  });

  it("contains the outro heading", () => {
    expect(html).toContain(solutionData.outro!.heading);
  });

  it("contains the discussion link text", () => {
    expect(html).toContain("Browse the discussion");
  });
});

describe("prerendered challenge pages include all content sections", () => {
  const challengePage = "adventures/echoes-lost-in-orbit/levels/beginner/index.html";
  const requiredSections = ["objective", "backstory", "toolbox", "learnings", "walkthrough", "completion"];

  it(`dist/client/${challengePage} contains all section IDs`, () => {
    const fullPath = path.join(DIST_ROOT, challengePage);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`dist/client/${challengePage} not found. Run npm run build first.`);
    }

    const html = fs.readFileSync(fullPath, "utf-8");

    for (const section of requiredSections) {
      expect(html, `Missing section id="${section}" in prerendered HTML`).toContain(`id="${section}"`);
    }
  });
});
