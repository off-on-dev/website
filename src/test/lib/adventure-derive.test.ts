import { describe, it, expect } from "vitest";
import {
  stripMarkdown,
  truncate,
  buildLevelMetaDescription,
  buildAdventureMetaDescription,
  buildServicesStepBody,
} from "@/lib/adventure-derive.mjs";

// ---------------------------------------------------------------------------
// stripMarkdown
// ---------------------------------------------------------------------------
describe("stripMarkdown", () => {
  it("returns empty string for falsy input", () => {
    expect(stripMarkdown("")).toBe("");
    expect(stripMarkdown(null)).toBe("");
    expect(stripMarkdown(undefined)).toBe("");
  });

  it("strips inline links, preserving link text", () => {
    expect(stripMarkdown("[click here](https://example.com)")).toBe("click here");
  });

  it("strips bold markers", () => {
    expect(stripMarkdown("**bold text** here")).toBe("bold text here");
  });

  it("strips italic markers", () => {
    expect(stripMarkdown("*italic text* here")).toBe("italic text here");
  });

  it("strips inline code", () => {
    expect(stripMarkdown("`code` snippet")).toBe("code snippet");
  });

  it("strips multiple patterns in one string", () => {
    expect(stripMarkdown("**Bold** and [link](url) and `code`")).toBe(
      "Bold and link and code"
    );
  });

  it("trims surrounding whitespace", () => {
    expect(stripMarkdown("  hello world  ")).toBe("hello world");
  });
});

// ---------------------------------------------------------------------------
// truncate
// ---------------------------------------------------------------------------
describe("truncate", () => {
  it("returns the string unchanged when it fits within max", () => {
    expect(truncate("short", 10)).toBe("short");
    expect(truncate("exactly10!", 10)).toBe("exactly10!");
  });

  it("truncates at a word boundary and appends ellipsis", () => {
    // lastIndexOf(" ", max-3=17) = 13 (space before "four"), which is > max/2=10,
    // so the word-boundary path fires: slice(0,13) + "..." = "one two three..."
    const result = truncate("one two three four five six seven", 20);
    expect(result).toBe("one two three...");
    expect(result.length).toBeLessThanOrEqual(20 + 3);
  });

  it("falls back to hard truncation when no suitable word boundary exists", () => {
    // Single long word — no space before max/2
    const long = "abcdefghijklmnopqrstuvwxyz";
    const result = truncate(long, 10);
    expect(result).toBe("abcdefghij");
    expect(result.length).toBe(10);
  });

  it("returns strings shorter than max unchanged", () => {
    expect(truncate("hi", 160)).toBe("hi");
  });
});

// ---------------------------------------------------------------------------
// buildLevelMetaDescription
// ---------------------------------------------------------------------------
describe("buildLevelMetaDescription", () => {
  const baseLevel = {
    name: "Broken Echoes",
    difficulty: "Beginner",
    intro: ["Fix the monitoring pipeline that lost its signals."],
    topics: ["OpenTelemetry", "Grafana"],
  };

  it("produces a description within 160 chars", () => {
    const desc = buildLevelMetaDescription(baseLevel);
    expect(desc.length).toBeLessThanOrEqual(160);
  });

  it("includes the level name", () => {
    expect(buildLevelMetaDescription(baseLevel)).toContain("Broken Echoes");
  });

  it("includes the difficulty in the suffix", () => {
    expect(buildLevelMetaDescription(baseLevel)).toContain("beginner");
  });

  it("uses LEVEL_DIFFICULTY_BY_EMOJI as a fallback when difficulty is absent", () => {
    const level = { ...baseLevel, difficulty: undefined, emoji: "🟢" };
    const desc = buildLevelMetaDescription(level);
    // Must not crash and must be a non-empty string
    expect(typeof desc).toBe("string");
    expect(desc.length).toBeGreaterThan(0);
  });

  it("does not crash when both difficulty and emoji are absent", () => {
    const level = { name: "No Difficulty", intro: ["Intro text."], topics: [] };
    expect(() => buildLevelMetaDescription(level)).not.toThrow();
    const desc = buildLevelMetaDescription(level);
    expect(typeof desc).toBe("string");
  });

  it("uses summary as intro fallback when intro is absent", () => {
    const level = { ...baseLevel, intro: undefined, summary: "Summary text." };
    const desc = buildLevelMetaDescription(level);
    expect(desc).toContain("Summary text");
  });

  it("truncates long descriptions to 160 characters", () => {
    const level = {
      ...baseLevel,
      intro: ["This is a very long introduction that goes on and on well beyond the one hundred and sixty character limit that we impose on all meta descriptions for SEO compliance."],
    };
    const desc = buildLevelMetaDescription(level);
    expect(desc.length).toBeLessThanOrEqual(160);
  });
});

// ---------------------------------------------------------------------------
// buildAdventureMetaDescription
// ---------------------------------------------------------------------------
describe("buildAdventureMetaDescription", () => {
  it("uses the first overview paragraph when present", () => {
    const data = {
      title: "Echoes Lost in Orbit",
      overview: ["An adventure about broken observability in space."],
      tags: ["OpenTelemetry"],
    };
    const desc = buildAdventureMetaDescription(data);
    expect(desc).toContain("broken observability");
  });

  it("falls back to title + tags when overview is absent", () => {
    const data = {
      title: "Echoes Lost in Orbit",
      tags: ["OpenTelemetry", "Grafana", "Prometheus"],
    };
    const desc = buildAdventureMetaDescription(data);
    expect(desc).toContain("Echoes Lost in Orbit");
    expect(desc).toContain("OpenTelemetry");
  });

  it("produces a description within 160 chars", () => {
    const data = {
      title: "A very long adventure title that goes on forever",
      tags: ["tag1", "tag2", "tag3"],
    };
    expect(buildAdventureMetaDescription(data).length).toBeLessThanOrEqual(160);
  });

  it("uses name as title fallback", () => {
    const data = { name: "Dead Reckoning", tags: ["Git"] };
    expect(buildAdventureMetaDescription(data)).toContain("Dead Reckoning");
  });
});

// ---------------------------------------------------------------------------
// buildServicesStepBody
// ---------------------------------------------------------------------------
describe("buildServicesStepBody", () => {
  it("returns null for null or empty input", () => {
    expect(buildServicesStepBody(null)).toBeNull();
    expect(buildServicesStepBody(undefined)).toBeNull();
    expect(buildServicesStepBody([])).toBeNull();
  });

  it("returns null when all services are internal", () => {
    const services = [{ internal: true, name: "DB", description: "Postgres" }];
    expect(buildServicesStepBody(services)).toBeNull();
  });

  it("returns null when external services have no port", () => {
    const services = [{ internal: false, name: "Web", description: "App server" }];
    expect(buildServicesStepBody(services)).toBeNull();
  });

  it("includes accessible service port and name in the body", () => {
    const services = [
      { internal: false, port: 3000, name: "Grafana", description: "Metrics UI" },
    ];
    const body = buildServicesStepBody(services);
    expect(body).not.toBeNull();
    expect(body).toContain("Port 3000");
    expect(body).toContain("Grafana");
  });

  it("includes credentials when present", () => {
    const services = [
      {
        internal: false,
        port: 8080,
        name: "Prometheus",
        description: "Metrics store",
        credentials: "admin/admin",
      },
    ];
    const body = buildServicesStepBody(services);
    expect(body).toContain("admin/admin");
  });

  it("lists multiple accessible services", () => {
    const services = [
      { internal: false, port: 3000, name: "Grafana", description: "Metrics UI" },
      { internal: false, port: 9090, name: "Prometheus", description: "Metrics store" },
    ];
    const body = buildServicesStepBody(services);
    expect(body).toContain("Port 3000");
    expect(body).toContain("Port 9090");
  });

  it("includes internal-only services in a separate paragraph", () => {
    const services = [
      { internal: false, port: 3000, name: "Grafana", description: "Metrics UI" },
      { internal: true, name: "Postgres", description: "Database" },
    ];
    const body = buildServicesStepBody(services);
    expect(body).toContain("Postgres");
    expect(body).toContain("docker-internal");
  });
});
