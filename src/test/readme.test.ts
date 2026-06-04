// Regression test: README.md routes table must stay in sync with src/routes.ts.
//
// Strategy: parse src/routes.ts dynamically so the test stays accurate as routes
// change, rather than hard-coding an expected list that could itself drift. We
// assert the key facts:
//   1. Every route path defined in routes.ts appears in the README table.
//   2. Routes backed by a file under pages/redirects/ are described as
//      "redirect" in the README.
//   3. Routes NOT backed by a redirect file are NOT described as "redirect".
//
// Why not exact matching: the README represents /challenges/:tag? as two rows
// (/challenges and /challenges/:tag) while routes.ts has a single optional-param
// entry. A brittle exact match would break whenever the README adds helpful
// prose. We check presence of the normalised path and the redirect classification
// instead, which is what actually prevents drift.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const ROOT = resolve(__dirname, "../..");
const routesSource = readFileSync(resolve(ROOT, "src/routes.ts"), "utf-8");
const readmeSource = readFileSync(resolve(ROOT, "README.md"), "utf-8");

// ---------------------------------------------------------------------------
// Parse routes from src/routes.ts
// Matches: route("path", "file") or route("path", "file", { ... })
// ---------------------------------------------------------------------------

type ParsedRoute = {
  path: string;
  file: string;
  isRedirect: boolean;
};

function parseRoutes(): ParsedRoute[] {
  const pattern = /route\(\s*"([^"]+)"\s*,\s*"([^"]+)"/g;
  const routes: ParsedRoute[] = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(routesSource)) !== null) {
    routes.push({
      path: m[1],
      file: m[2],
      isRedirect: m[2].includes("redirects/"),
    });
  }
  return routes;
}

// ---------------------------------------------------------------------------
// Normalise a routes.ts path to a README table path
// "adventures/:id"   -> "/adventures/:id"
// "challenges/:tag?" -> "/challenges/:tag"  (strip optional marker)
// "*"                -> "*"                 (catch-all stays literal)
// ---------------------------------------------------------------------------

function toReadmePath(routePath: string): string {
  const clean = routePath.replace(/\?/g, "");
  if (clean === "*") return "*";
  return `/${clean}`;
}

// ---------------------------------------------------------------------------
// README table lookup helpers
// ---------------------------------------------------------------------------

function readmeContainsPath(path: string): boolean {
  // Look for the path wrapped in backticks (table cell format)
  return readmeSource.includes(`\`${path}\``);
}

// Find the README table row(s) that contain a given path and check for "redirect"
function readmeRowForPath(path: string): string | null {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = readmeSource.match(new RegExp(`\\|[^\\n]*\`${escaped}\`[^\\n]*`));
  return match ? match[0] : null;
}

function readmeDescribesAsRedirect(path: string): boolean {
  const row = readmeRowForPath(path);
  return row !== null && row.toLowerCase().includes("redirect");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("README routes table", () => {
  const routes = parseRoutes();

  it("README.md contains a routes table header", () => {
    expect(readmeSource).toContain("## Routes");
    expect(readmeSource).toContain("| Path |");
  });

  it("src/routes.ts defines at least one non-redirect route", () => {
    expect(routes.some((r) => !r.isRedirect)).toBe(true);
  });

  it("src/routes.ts defines redirect routes for /docs and /community-guide", () => {
    const redirectPaths = routes.filter((r) => r.isRedirect).map((r) => r.path);
    expect(redirectPaths).toContain("docs");
    expect(redirectPaths).toContain("community-guide");
  });

  for (const { path, file, isRedirect } of routes) {
    const readmePath = toReadmePath(path);

    it(`README table includes ${readmePath} (${file})`, () => {
      // For optional-param routes (e.g. challenges/:tag?), the README may list
      // the base path (/challenges) and the parameterised path (/challenges/:tag)
      // as separate rows. Accept either the normalised form or the base form.
      const basePath =
        path.includes("?") ? `/${path.replace(/\/:[^/]+\?$/, "")}` : null;

      const found =
        readmeContainsPath(readmePath) ||
        (basePath !== null && readmeContainsPath(basePath));

      expect(
        found,
        `Route "${path}" (${file}) is missing from the README routes table. ` +
          `Expected to find \`${readmePath}\` in README.md.`,
      ).toBe(true);
    });

    if (isRedirect) {
      it(`README describes ${readmePath} as a redirect`, () => {
        const basePath =
          path.includes("?") ? `/${path.replace(/\/:[^/]+\?$/, "")}` : null;

        const found =
          readmeDescribesAsRedirect(readmePath) ||
          (basePath !== null && readmeDescribesAsRedirect(basePath));

        expect(
          found,
          `Route "${path}" uses redirect file (${file}) but README does not ` +
            `describe \`${readmePath}\` as a redirect.`,
        ).toBe(true);
      });
    }

    if (!isRedirect && path !== "*") {
      it(`README does not describe ${readmePath} as a redirect`, () => {
        if (!readmeContainsPath(readmePath)) return; // path not in table; covered above
        const row = readmeRowForPath(readmePath);
        expect(
          row === null || !row.toLowerCase().includes("redirect"),
          `Route "${path}" (${file}) is a page but README row for ` +
            `\`${readmePath}\` mentions "redirect": ${row}`,
        ).toBe(true);
      });
    }
  }
});
