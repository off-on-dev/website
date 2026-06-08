import { describe, expect, it } from "vitest";
import { ADVENTURE_CONTRIBUTORS, ADVENTURE_SUMMARIES } from "@/data/adventures/summaries";

describe("adventure summaries contributors", () => {
  it("derives unique contributors from summaries", () => {
    const summaryContributorNames = ADVENTURE_SUMMARIES
      .map((adventure) => adventure.contributor?.name)
      .filter((name): name is string => typeof name === "string");

    const uniqueSummaryNames = [...new Set(summaryContributorNames)].sort();
    const contributorNames = ADVENTURE_CONTRIBUTORS.map((contributor) => contributor.name).sort();

    expect(contributorNames).toEqual(uniqueSummaryNames);
  });

  it("keeps contributor aboutHtml in sync with summaries", () => {
    // Check every adventure individually so a stale aboutHtml on any occurrence
    // of a contributor (not just the last one) is caught.
    for (const adventure of ADVENTURE_SUMMARIES) {
      if (!adventure.contributor) continue;
      const contributor = ADVENTURE_CONTRIBUTORS.find((c) => c.name === adventure.contributor!.name);
      expect(
        contributor,
        `contributor "${adventure.contributor.name}" is missing from ADVENTURE_CONTRIBUTORS`
      ).toBeDefined();
      expect(
        contributor?.aboutHtml,
        `aboutHtml mismatch for "${adventure.contributor.name}" in adventure "${adventure.id}"`
      ).toBe(adventure.contributor.aboutHtml);
    }
  });

  it("does not expose the legacy contributor.about field", () => {
    for (const contributor of ADVENTURE_CONTRIBUTORS) {
      const raw = contributor as unknown as Record<string, unknown>;
      expect(raw.about).toBeUndefined();
    }
  });
});
