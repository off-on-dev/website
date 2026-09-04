// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

import { describe, it, expect } from "vitest";
import {
  builderOfLevel,
  levelBuildersOf,
  guestBuildersOf,
  pillCreditOf,
  levelBuilderCredit,
  formatRoles,
  buildContributorIndex,
  creditIntegrityError,
  challengeCounts,
  designerCounts,
  type CreditAdventure,
  type CreditPerson,
} from "@/lib/adventure-credit";

const KAT: CreditPerson = { name: "Katharina", url: "https://k.example", discourseUsername: "Kat", aboutHtml: "<p>K</p>" };
const SIMON: CreditPerson = { name: "Simon", url: "https://s.example", discourseUsername: "simon", aboutHtml: "<p>S</p>" };

/** Three levels, one per difficulty. `builders` overrides the contributor per index. */
function adventure(
  slug: string,
  designer: CreditPerson | undefined,
  builders: (CreditPerson | undefined)[] = [],
): CreditAdventure {
  const difficulties = ["Beginner", "Intermediate", "Expert"] as const;
  return {
    slug,
    title: slug.replace(/-/g, " "),
    ...(designer ? { contributor: designer } : {}),
    levels: difficulties.map((difficulty, i) => ({
      difficulty,
      ...(builders[i] ? { contributor: builders[i] } : {}),
    })),
  };
}

describe("builderOfLevel", () => {
  it("prefers the level's own contributor", () => {
    expect(builderOfLevel({ difficulty: "Beginner", contributor: SIMON }, { contributor: KAT })).toBe(SIMON);
  });

  it("falls back to the adventure designer", () => {
    expect(builderOfLevel({ difficulty: "Beginner" }, { contributor: KAT })).toBe(KAT);
  });

  it("is undefined when neither is set", () => {
    expect(builderOfLevel({ difficulty: "Beginner" }, {})).toBeUndefined();
  });
});

describe("levelBuildersOf", () => {
  it("credits the designer for every level when no level names a builder", () => {
    expect(levelBuildersOf(adventure("a", KAT))).toEqual([
      expect.objectContaining({ name: "Katharina", difficulties: ["Beginner", "Intermediate", "Expert"], levelCount: 3 }),
    ]);
  });

  // The case the old all-or-nothing gate got wrong: one guest builder used to
  // wipe out the designer's credit for the levels they actually built.
  it("partial coverage: the designer keeps the levels the guest did not take", () => {
    const result = levelBuildersOf(adventure("a", KAT, [undefined, SIMON, undefined]));
    expect(result).toEqual([
      expect.objectContaining({ name: "Katharina", difficulties: ["Beginner", "Expert"], levelCount: 2 }),
      expect.objectContaining({ name: "Simon", difficulties: ["Intermediate"], levelCount: 1 }),
    ]);
  });

  it("orders builders by the first level they appear on", () => {
    const result = levelBuildersOf(adventure("a", KAT, [SIMON, undefined, undefined]));
    expect(result.map((b) => b.name)).toEqual(["Simon", "Katharina"]);
  });

  it("counts two levels of the same difficulty separately but lists the difficulty once", () => {
    const a: CreditAdventure = {
      slug: "a",
      title: "A",
      contributor: KAT,
      levels: [{ difficulty: "Beginner" }, { difficulty: "Beginner" }],
    };
    expect(levelBuildersOf(a)).toEqual([
      expect.objectContaining({ difficulties: ["Beginner"], levelCount: 2 }),
    ]);
  });

  it("credits nobody when there is no designer and no level contributor", () => {
    expect(levelBuildersOf(adventure("a", undefined))).toEqual([]);
  });
});

describe("guestBuildersOf", () => {
  it("excludes the designer", () => {
    expect(guestBuildersOf(adventure("a", KAT, [undefined, SIMON, undefined])).map((b) => b.name)).toEqual(["Simon"]);
  });

  it("is empty when the designer built everything", () => {
    expect(guestBuildersOf(adventure("a", KAT))).toEqual([]);
  });
});

describe("pillCreditOf", () => {
  it("designer only: proposer, no builder, no hasBuilders", () => {
    expect(pillCreditOf(adventure("a", KAT))).toEqual({ proposer: KAT, builder: undefined, hasBuilders: false });
  });

  it("one guest builder: names both", () => {
    const credit = pillCreditOf(adventure("a", KAT, [undefined, SIMON, undefined]));
    expect(credit.proposer).toBe(KAT);
    expect(credit.builder?.name).toBe("Simon");
    expect(credit.hasBuilders).toBe(false);
  });

  it("two guest builders: names none, sets hasBuilders", () => {
    const third: CreditPerson = { name: "Ada" };
    const credit = pillCreditOf(adventure("a", KAT, [SIMON, third, undefined]));
    expect(credit.proposer).toBe(KAT);
    expect(credit.builder).toBeUndefined();
    expect(credit.hasBuilders).toBe(true);
  });

  // An adventure with no designer has no level builders either — the schema
  // rejects that (see creditIntegrityError) — so the pill stays empty rather
  // than promoting a builder. This is the freshly-synced, pre-review state.
  it("no designer: empty credit, so no pill renders", () => {
    expect(pillCreditOf(adventure("a", undefined))).toEqual({
      proposer: undefined,
      builder: undefined,
      hasBuilders: false,
    });
  });
});

describe("levelBuilderCredit", () => {
  it("no level contributor: designer is proposer and builder — 'Adventure Builder' label", () => {
    const { proposer, builder } = levelBuilderCredit(KAT, undefined);
    expect(proposer).toBe(KAT);
    expect(builder).toBe(KAT);
  });

  it("guest level contributor: proposer is undefined, builder is guest — 'Challenge Builder' label", () => {
    const { proposer, builder } = levelBuilderCredit(KAT, SIMON);
    expect(proposer).toBeUndefined();
    expect(builder).toBe(SIMON);
  });

  it("level contributor is the designer (same name): proposer is designer, 'Adventure Builder' label", () => {
    // Authoring a level contributor who is the same person as the designer must not
    // flip the label to "Challenge Builder" — identity is checked by name, not presence.
    const katCopy: CreditPerson = { name: "Katharina", url: "https://other.example" };
    const { proposer, builder } = levelBuilderCredit(KAT, katCopy);
    expect(proposer).toBe(KAT);
    expect(builder).toBe(katCopy);
  });

  it("no designer and no level contributor: both are undefined", () => {
    const { proposer, builder } = levelBuilderCredit(undefined, undefined);
    expect(proposer).toBeUndefined();
    expect(builder).toBeUndefined();
  });
});

describe("creditIntegrityError", () => {
  it("passes an adventure with a designer and no level builders", () => {
    expect(creditIntegrityError(adventure("a", KAT))).toBeNull();
  });

  it("passes an adventure with a designer and level builders", () => {
    expect(creditIntegrityError(adventure("a", KAT, [undefined, SIMON, undefined]))).toBeNull();
  });

  // The freshly-synced state: sync-adventure.mjs omits `contributor` and a
  // reviewer adds it later, so no-designer-and-no-builders must stay valid.
  it("passes an adventure with neither, which is what sync-adventure emits", () => {
    expect(creditIntegrityError(adventure("a", undefined))).toBeNull();
  });

  it("fires when levels name builders but the adventure names no designer", () => {
    const message = creditIntegrityError(adventure("dead-reckoning", undefined, [SIMON, undefined, SIMON]));
    expect(message).not.toBeNull();
    expect(message).toContain('"dead-reckoning"');
    expect(message).toContain("2 level(s)");
    expect(message).toContain("Add a `contributor:` block");
  });
});

describe("formatRoles", () => {
  const base = { slug: "a", title: "A", totalLevels: 3 };

  it("proposed only", () => {
    expect(formatRoles({ ...base, proposed: true, builtDifficulties: [], builtCount: 0 })).toBe("Proposed");
  });

  it("proposed and built everything", () => {
    expect(
      formatRoles({ ...base, proposed: true, builtDifficulties: ["Beginner", "Intermediate", "Expert"], builtCount: 3 }),
    ).toBe("Proposed & Built");
  });

  it("proposed and built some", () => {
    expect(formatRoles({ ...base, proposed: true, builtDifficulties: ["Beginner", "Expert"], builtCount: 2 })).toBe(
      "Proposed & Built · Beginner · Expert",
    );
  });

  it("built some without proposing", () => {
    expect(formatRoles({ ...base, proposed: false, builtDifficulties: ["Intermediate"], builtCount: 1 })).toBe(
      "Built · Intermediate",
    );
  });

  it("built everything without proposing collapses like the proposed case", () => {
    expect(
      formatRoles({ ...base, proposed: false, builtDifficulties: ["Beginner", "Intermediate", "Expert"], builtCount: 3 }),
    ).toBe("Built");
  });

  it("orders difficulties Beginner, Intermediate, Expert regardless of input order", () => {
    expect(formatRoles({ ...base, proposed: false, builtDifficulties: ["Expert", "Beginner"], builtCount: 2 })).toBe(
      "Built · Beginner · Expert",
    );
  });
});

describe("buildContributorIndex", () => {
  it("partial coverage credits both people on the same adventure", () => {
    const index = buildContributorIndex([adventure("orbit", KAT, [undefined, SIMON, undefined])]);
    expect(index.map((e) => e.name).sort()).toEqual(["Katharina", "Simon"]);
    const kat = index.find((e) => e.name === "Katharina")!;
    const simon = index.find((e) => e.name === "Simon")!;
    expect(kat.contributions[0].roleLabel).toBe("Proposed & Built · Beginner · Expert");
    expect(simon.contributions[0].roleLabel).toBe("Built · Intermediate");
  });

  it("a designer who built nothing is credited as Proposed only", () => {
    const index = buildContributorIndex([adventure("orbit", KAT, [SIMON, SIMON, SIMON])]);
    expect(index.find((e) => e.name === "Katharina")!.contributions[0].roleLabel).toBe("Proposed");
    expect(index.find((e) => e.name === "Simon")!.contributions[0].roleLabel).toBe("Built");
  });

  it("carries url and aboutHtml through, and links to the adventure by slug", () => {
    const [entry] = buildContributorIndex([adventure("dead-reckoning", KAT)]);
    expect(entry.url).toBe(KAT.url);
    expect(entry.aboutHtml).toBe(KAT.aboutHtml);
    expect(entry.contributions[0].slug).toBe("dead-reckoning");
  });

  it("sorts people by contribution breadth then name, and adventures by title", () => {
    const index = buildContributorIndex([
      adventure("zulu", KAT),
      adventure("alpha", KAT, [SIMON, undefined, undefined]),
    ]);
    expect(index.map((e) => e.name)).toEqual(["Katharina", "Simon"]);
    expect(index[0].contributions.map((c) => c.title)).toEqual(["alpha", "zulu"]);
  });

  it("skips adventures with no designer and no level contributors", () => {
    expect(buildContributorIndex([adventure("ghost", undefined)])).toEqual([]);
  });
});

describe("challengeCounts and designerCounts", () => {
  it("count levels built and adventures designed under partial coverage", () => {
    const data = [adventure("a", KAT, [undefined, SIMON, undefined]), adventure("b", KAT)];
    expect(challengeCounts(data)).toEqual([
      expect.objectContaining({ name: "Katharina", count: 5, discourseUsername: "Kat" }),
      expect.objectContaining({ name: "Simon", count: 1, discourseUsername: "simon" }),
    ]);
    expect(designerCounts(data)).toEqual([
      expect.objectContaining({ name: "Katharina", count: 2 }),
    ]);
  });

  it("breaks count ties by name so the order is stable across builds", () => {
    const ada: CreditPerson = { name: "Ada" };
    const counts = challengeCounts([adventure("a", ada, [ada, SIMON, SIMON])]);
    expect(counts.map((c) => `${c.name}:${c.count}`)).toEqual(["Simon:2", "Ada:1"]);
  });
});

// The A3 regression: ChallengeBuildersSection and CommunityLeaders used to derive
// this independently and disagreed under partial coverage. One rule, one answer.
describe("section body and leaderboard agree", () => {
  const data = [
    adventure("orbit", KAT, [undefined, SIMON, undefined]),
    adventure("cloudhaven", KAT),
  ];

  it("levels credited in the index match the leaderboard counts", () => {
    const index = buildContributorIndex(data);
    const counts = new Map(challengeCounts(data).map((c) => [c.name, c.count]));
    for (const entry of index) {
      const fromIndex = entry.contributions.reduce((n, c) => n + c.builtCount, 0);
      expect(fromIndex, `${entry.name} built-level count`).toBe(counts.get(entry.name) ?? 0);
    }
  });

  it("specifically: the designer keeps credit for two of three levels", () => {
    expect(challengeCounts(data).find((c) => c.name === "Katharina")!.count).toBe(5);
    const kat = buildContributorIndex(data).find((e) => e.name === "Katharina")!;
    expect(kat.contributions.find((c) => c.slug === "orbit")!.builtCount).toBe(2);
  });
});
