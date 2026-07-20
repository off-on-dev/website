import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { ADVENTURES } from "@/data/adventures";

const CODESPACES_BASE = "https://codespaces.new/off-on-dev/open-source-challenges";

const allLevels = ADVENTURES.flatMap((adventure) =>
  adventure.levels.map((level) => ({
    label: `${adventure.id} / ${level.id}`,
    url: level.codespacesUrl,
  }))
);

// ---------------------------------------------------------------------------
// Codespace URL structure
// ---------------------------------------------------------------------------

describe("ADVENTURES - codespacesUrl", () => {
  it.each(allLevels)("$label: is a non-empty string", ({ url }) => {
    expect(typeof url).toBe("string");
    expect(url.length).toBeGreaterThan(0);
  });

  it.each(allLevels)("$label: starts with the correct CODESPACES_BASE", ({ url }) => {
    expect(url.startsWith(CODESPACES_BASE)).toBe(true);
  });

  it.each(allLevels)("$label: includes devcontainer_path (not quickstart=1 alone)", ({ url }) => {
    const parsed = new URL(url);
    expect(parsed.searchParams.has("devcontainer_path")).toBe(true);
  });

  it.each(allLevels)("$label: devcontainer_path ends with devcontainer.json", ({ url }) => {
    const parsed = new URL(url);
    const path = parsed.searchParams.get("devcontainer_path") ?? "";
    expect(path.endsWith("devcontainer.json")).toBe(true);
  });

  it.each(allLevels)("$label: includes quickstart=1", ({ url }) => {
    const parsed = new URL(url);
    expect(parsed.searchParams.get("quickstart")).toBe("1");
  });

  it("every level has a unique codespacesUrl (no copy-paste duplicates)", () => {
    const urls = allLevels.map(({ url }) => url);
    const unique = new Set(urls);
    expect(unique.size).toBe(urls.length);
  });

  it("every level has a unique devcontainer_path (no copy-paste duplicates)", () => {
    const paths = allLevels.map(({ url }) => new URL(url).searchParams.get("devcontainer_path"));
    const unique = new Set(paths);
    expect(unique.size).toBe(paths.length);
  });
});

// ---------------------------------------------------------------------------
// Generated prose: non-public URLs must not be links
// ---------------------------------------------------------------------------

describe("generated adventure prose - non-public URLs", () => {
  const dir = resolve(__dirname, "../data/adventures");
  const files = readdirSync(dir).filter(
    (f) => f.endsWith(".generated.ts") || f === "summaries.ts"
  );
  // <a href="<loopback or single-label host>"> must never survive: remark-gfm
  // autolinks bare URLs, and annotateExternalLinks unwraps non-public ones.
  const loopbackLink = /href=\\?"https?:\/\/(localhost|127\.\d|0\.0\.0\.0|\[?::1)/i;

  it.each(files)("%s links no loopback/localhost URL", (file) => {
    const source = readFileSync(resolve(dir, file), "utf-8");
    expect(loopbackLink.test(source)).toBe(false);
  });

  it("localhost URLs are still present as plain text somewhere", () => {
    const source = readFileSync(resolve(dir, "blind-by-design.generated.ts"), "utf-8");
    expect(source).toContain("http://localhost:8080/");
    expect(source).not.toMatch(/href=\\?"http:\/\/localhost/i);
  });
});
