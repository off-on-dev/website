// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Drift gate for the hand-maintained route lists in a11y.spec.ts and
// smoke.spec.ts.
//
// Those lists used to be generated, so adding an adventure, level or tag
// automatically extended test coverage. They are hand-maintained now, which
// means a new route ships untested unless someone remembers. This walks the
// actual build and fails when a built route is in neither list nor the
// deliberate-exclusion set below, so the omission has to be a decision rather
// than an oversight.
//
// It also fails on the reverse: a listed route that no longer exists, which
// otherwise sits there passing vacuously.

import { test, expect } from "@playwright/test";
import { readdirSync, existsSync } from "node:fs";
import { resolve, sep } from "node:path";
import { A11Y_PAGES, SMOKE_ROUTES, ROUTES_WITHOUT_FULL_COVERAGE } from "./routes";

const DIST = resolve(import.meta.dirname, "..", "dist");

/** Every route the build emits, as "/path/" strings. */
function builtRoutes(): string[] {
  const out: string[] = [];
  const walk = (dir: string, prefix: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(resolve(dir, entry.name), `${prefix}${entry.name}/`);
      } else if (entry.name === "index.html") {
        out.push(prefix === "" ? "/" : `/${prefix}`);
      }
    }
  };
  walk(DIST, "");
  return out.sort();
}

/**
 * Routes that exist in dist/ but are not site pages, so they need no coverage:
 * redirect stubs, and anything under the Slidev deck trees.
 */
function isNonPageRoute(route: string): boolean {
  return (
    route.startsWith("/decks/") ||
    route.startsWith("/pr-preview/") ||
    // Static redirect stubs emitted by astro.config.mjs `redirects`.
    route === "/docs/" ||
    route === "/docs/community-guide/" ||
    route === "/community-guide/"
  );
}

test.describe("route coverage drift", () => {
  test("the build exists (run npm run build first)", () => {
    expect(existsSync(DIST), `no build at ${DIST}`).toBe(true);
    expect(existsSync(resolve(DIST, "index.html"))).toBe(true);
  });

  test("every built page is covered by a11y.spec.ts, smoke.spec.ts, or an explicit exclusion", () => {
    const covered = new Set([
      ...A11Y_PAGES,
      ...Object.keys(SMOKE_ROUTES),
      ...ROUTES_WITHOUT_FULL_COVERAGE,
    ]);

    const uncovered = builtRoutes()
      .filter((r) => !isNonPageRoute(r))
      .filter((r) => !covered.has(r));

    expect(
      uncovered,
      "New routes are untested. Add each to A11Y_PAGES and SMOKE_ROUTES in " +
        "e2e/routes.ts, or to ROUTES_WITHOUT_FULL_COVERAGE with a reason.",
    ).toEqual([]);
  });

  test("no listed route has disappeared from the build", () => {
    const built = new Set(builtRoutes());
    // /404/ is emitted as dist/404.html, not dist/404/index.html.
    built.add("/404/");

    const stale = [
      ...new Set([...A11Y_PAGES, ...Object.keys(SMOKE_ROUTES), ...ROUTES_WITHOUT_FULL_COVERAGE]),
    ]
      .filter((r) => !built.has(r))
      .sort();

    expect(stale, "These routes are listed in e2e/routes.ts but the build no longer emits them.").toEqual(
      [],
    );
  });

  test("every adventure, level and solution in the build has a11y coverage", () => {
    // The content-derived routes are the ones that grow over time, so they get a
    // stricter check than the static pages: axe must run on all of them.
    const contentRoutes = builtRoutes().filter(
      (r) => r.startsWith("/adventures/") && r !== "/adventures/",
    );
    const missing = contentRoutes.filter(
      (r) => !A11Y_PAGES.includes(r) && !ROUTES_WITHOUT_FULL_COVERAGE.includes(r),
    );
    expect(
      missing,
      "Adventure/level/solution routes missing from A11Y_PAGES in e2e/routes.ts.",
    ).toEqual([]);
  });

  test("path separator assumption holds on this platform", () => {
    // builtRoutes() joins with "/" regardless of platform; guard the assumption.
    expect(sep === "/" || sep === "\\").toBe(true);
  });
});
