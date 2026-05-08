import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

// Source-level regression tests for the inline <head> scripts in src/root.tsx.
// The inline script becomes part of every prerendered page, so a behaviour
// test cannot catch a regression here. We assert on the source text instead.
const source = readFileSync(resolve(__dirname, "../root.tsx"), "utf-8");

describe("root.tsx - gated-load Consent Mode v2 bootstrap", () => {
  it("declares the four GDPR signals denied in the consent default", () => {
    expect(source).toContain("analytics_storage:'denied'");
    expect(source).toContain("ad_storage:'denied'");
    expect(source).toContain("ad_user_data:'denied'");
    expect(source).toContain("ad_personalization:'denied'");
  });

  it("does not load gtag.js inline (gated load only happens on Accept)", () => {
    expect(source).not.toContain("googletagmanager.com/gtag/js");
    expect(source).not.toMatch(/<script[^>]*async[^>]*src=/);
  });

  it("does not include wait_for_update in the consent default", () => {
    // Scope to the bootstrap script content; comments elsewhere may mention
    // the term as documentation that we deliberately do not use it.
    const start = source.indexOf("const gtagBootstrap");
    const end = source.indexOf(";", start);
    const bootstrap = source.slice(start, end);
    expect(bootstrap).not.toContain("wait_for_update");
  });

  it("does not read localStorage in the inline bootstrap (rehydration is React's job)", () => {
    // The themeScript reads localStorage; the bootstrap script should not.
    // Locate the gtagBootstrap string and assert no localStorage reference
    // appears inside it.
    const start = source.indexOf("const gtagBootstrap");
    const end = source.indexOf(";", start);
    const bootstrap = source.slice(start, end);
    expect(bootstrap).not.toContain("localStorage");
    expect(bootstrap).not.toContain("CONSENT_STORAGE_KEY");
  });

  it("does not push gtag('js') or gtag('config') from the inline bootstrap", () => {
    const start = source.indexOf("const gtagBootstrap");
    const end = source.indexOf(";", start);
    const bootstrap = source.slice(start, end);
    expect(bootstrap).not.toContain("gtag('js'");
    expect(bootstrap).not.toContain("gtag('config'");
  });

  it("does not import GA_MEASUREMENT_ID, ANALYTICS_LINKER_DOMAINS, or any cookie-domain constant", () => {
    expect(source).not.toContain("GA_MEASUREMENT_ID");
    expect(source).not.toContain("ANALYTICS_LINKER_DOMAINS");
    expect(source).not.toContain("GA_COOKIE_DOMAIN");
  });

  it("keeps the JSON-LD blocks and font preloads (untouched by this refactor)", () => {
    expect(source).toContain("application/ld+json");
    expect(source).toContain("inter-latin-400-normal.woff2");
  });
});
