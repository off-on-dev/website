// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

import { describe, it, expect } from "vitest";
import {
  builderOfLevel,
  levelBuildersOf,
  adventurePillCredit,
  sortDifficulties,
  levelPillCredit,
  buildContributorIndex,
  creditIntegrityError,
  challengeCounts,
  designerCounts,
  displayNameByHandle,
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

describe("adventurePillCredit", () => {
  // The pill carries exactly one person, the designer. Builder credit is
  // per level, so it lives on the level pages and the adventure aside.
  it("designer who built every challenge: Adventure Builder", () => {
    expect(adventurePillCredit(adventure("a", KAT))).toEqual({
      label: "Adventure Builder",
      person: KAT,
    });
  });

  it("one guest builder: designer only", () => {
    expect(adventurePillCredit(adventure("a", KAT, [undefined, SIMON, undefined]))).toEqual({
      label: "Adventure Designer",
      person: KAT,
    });
  });

  it("guest built every level: still designer only, and never the guest", () => {
    const credit = adventurePillCredit(adventure("a", KAT, [SIMON, SIMON, SIMON]));
    expect(credit).toEqual({ label: "Adventure Designer", person: KAT });
  });

  it("two guest builders: designer only", () => {
    const third: CreditPerson = { name: "Ada" };
    expect(adventurePillCredit(adventure("a", KAT, [SIMON, third, undefined]))).toEqual({
      label: "Adventure Designer",
      person: KAT,
    });
  });

  // The label tracks the designer's own scope only. One guest anywhere means
  // the designer did not build the whole thing, so it drops to Designer.
  it("one guest anywhere drops the label to Adventure Designer", () => {
    for (const builders of [
      [SIMON, undefined, undefined],
      [undefined, SIMON, undefined],
      [undefined, undefined, SIMON],
    ]) {
      expect(adventurePillCredit(adventure("a", KAT, builders))!.label).toBe("Adventure Designer");
    }
  });

  it("never names the guest, whoever built what", () => {
    const third: CreditPerson = { name: "Ada" };
    for (const builders of [[SIMON, SIMON, SIMON], [SIMON, third, undefined]]) {
      expect(adventurePillCredit(adventure("a", KAT, builders))!.person).toBe(KAT);
    }
  });

  it("a level naming the designer still counts as designer-built", () => {
    const katCopy: CreditPerson = { name: "Katharina", url: "https://other.example" };
    expect(adventurePillCredit(adventure("a", KAT, [katCopy, undefined, undefined]))!.label).toBe(
      "Adventure Builder",
    );
  });

  // An adventure with no designer has no level builders either, because the
  // schema rejects that (see creditIntegrityError), so no pill renders. This is
  // the freshly-synced, pre-review state.
  it("no designer: null, so no pill renders", () => {
    expect(adventurePillCredit(adventure("a", undefined))).toBeNull();
  });

  // No levels means they have not built every challenge, so Designer, not
  // Builder. Guards a vacuous-truth bug in the `every` call.
  it("no levels at all: Adventure Designer, not Builder", () => {
    expect(adventurePillCredit({ contributor: KAT, levels: [] })).toEqual({
      label: "Adventure Designer",
      person: KAT,
    });
  });
});

describe("levelPillCredit", () => {
  // The page is about one challenge, so the label answers "who built this" the
  // same way regardless of whether that person also designed the adventure.
  it("no level contributor: the designer falls through, still Challenge Builder", () => {
    expect(levelPillCredit(KAT, undefined)).toEqual({ label: "Challenge Builder", person: KAT });
  });

  it("guest level contributor: Challenge Builder", () => {
    expect(levelPillCredit(KAT, SIMON)).toEqual({ label: "Challenge Builder", person: SIMON });
  });

  it("names the level contributor over the designer", () => {
    const katCopy: CreditPerson = { name: "Katharina", url: "https://other.example" };
    expect(levelPillCredit(KAT, katCopy)).toEqual({ label: "Challenge Builder", person: katCopy });
  });

  it("no designer and no level contributor: null", () => {
    expect(levelPillCredit(undefined, undefined)).toBeNull();
  });

  it("guest builder with no designer: still credited", () => {
    expect(levelPillCredit(undefined, SIMON)).toEqual({ label: "Challenge Builder", person: SIMON });
  });
});

describe("sortDifficulties", () => {
  it("is empty for an empty input", () => {
    expect(sortDifficulties([])).toEqual([]);
  });

  it("orders easiest first, whatever order the levels were authored in", () => {
    expect(sortDifficulties(["Expert", "Beginner"])).toEqual(["Beginner", "Expert"]);
    expect(sortDifficulties(["Expert", "Intermediate", "Beginner"])).toEqual([
      "Beginner",
      "Intermediate",
      "Expert",
    ]);
  });

  it("leaves an already-sorted list alone", () => {
    expect(sortDifficulties(["Beginner", "Intermediate", "Expert"])).toEqual([
      "Beginner",
      "Intermediate",
      "Expert",
    ]);
  });

  // Two people on the same adventure must not show their levels in
  // different orders, so this may not sort in place.
  it("does not mutate the array it is given", () => {
    const input: Difficulty[] = ["Expert", "Beginner"];
    sortDifficulties(input);
    expect(input).toEqual(["Expert", "Beginner"]);
  });
});

describe("displayNameByHandle", () => {
  it("is empty when nobody has a Discourse handle", () => {
    const noHandle: CreditPerson = { name: "Ada" };
    expect(displayNameByHandle([adventure("a", noHandle)]).size).toBe(0);
  });

  it("maps a designer's handle to their real name", () => {
    const map = displayNameByHandle([adventure("a", KAT)]);
    expect(map.get("kat")).toBe("Katharina");
  });

  it("maps level contributors too, not just designers", () => {
    const map = displayNameByHandle([adventure("a", KAT, [SIMON, undefined, undefined])]);
    expect(map.get("simon")).toBe("Simon");
    expect(map.get("kat")).toBe("Katharina");
  });

  // Discourse rows arrive with whatever casing the forum uses, so the lookup
  // key has to be case-insensitive or the mapping silently misses.
  it("keys on the lowercased handle", () => {
    const mixed: CreditPerson = { name: "Mixed Case", discourseUsername: "MiXeDCaSe" };
    const map = displayNameByHandle([adventure("a", mixed)]);
    expect(map.get("mixedcase")).toBe("Mixed Case");
    expect(map.get("MiXeDCaSe")).toBeUndefined();
  });

  it("keeps the first name seen when one handle appears twice", () => {
    const map = displayNameByHandle([adventure("a", KAT), adventure("b", KAT)]);
    expect(map.get("kat")).toBe("Katharina");
    expect(map.size).toBe(1);
  });

  it("skips people with no handle rather than keying on their name", () => {
    const noHandle: CreditPerson = { name: "Ada" };
    const map = displayNameByHandle([adventure("a", KAT, [noHandle, undefined, undefined])]);
    expect(map.size).toBe(1);
    expect([...map.values()]).toEqual(["Katharina"]);
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

describe("buildContributorIndex", () => {
  it("partial coverage credits both people on the same adventure", () => {
    const index = buildContributorIndex([adventure("orbit", KAT, [undefined, SIMON, undefined])]);
    expect(index.map((e) => e.name).sort()).toEqual(["Katharina", "Simon"]);
  });

  it("a designer who built nothing is still credited for the adventure", () => {
    const index = buildContributorIndex([adventure("orbit", KAT, [SIMON, SIMON, SIMON])]);
    expect(index.map((e) => e.name).sort()).toEqual(["Katharina", "Simon"]);
  });

  it("lists each adventure once for someone who both designed and built it", () => {
    // The person is reached twice, as designer and as level builder, and must
    // not produce two rows for the same adventure.
    const entry = buildContributorIndex([adventure("orbit", KAT)])[0];
    expect(entry.contributions).toEqual([{ slug: "orbit", title: "orbit" }]);
  });

  it("carries only slug and title: roles are deliberately not shown", () => {
    const entry = buildContributorIndex([adventure("orbit", KAT, [SIMON, undefined, undefined])])[0];
    expect(Object.keys(entry.contributions[0]).sort()).toEqual(["slug", "title"]);
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

// ChallengeBuildersSection and CommunityLeaders used to derive credit
// independently and disagreed under partial coverage. One rule, one answer.
describe("section body and leaderboard agree", () => {
  const data = [
    adventure("orbit", KAT, [undefined, SIMON, undefined]),
    adventure("cloudhaven", KAT),
  ];

  it("everyone with a leaderboard count appears in the contributor index", () => {
    const index = new Set(buildContributorIndex(data).map((e) => e.name));
    for (const { name } of challengeCounts(data)) {
      expect(index.has(name), `${name} is counted but not listed`).toBe(true);
    }
  });

  it("specifically: the designer keeps credit for two of three levels", () => {
    expect(challengeCounts(data).find((c) => c.name === "Katharina")!.count).toBe(5);
    const kat = buildContributorIndex(data).find((e) => e.name === "Katharina")!;
    expect(kat.contributions.map((c) => c.slug).sort()).toEqual(["cloudhaven", "orbit"]);
  });
});
