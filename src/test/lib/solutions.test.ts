// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

import { describe, it, expect } from "vitest";
import { getSolutions, type SolutionModule } from "@/lib/solutions";
import type { Solution } from "@/data/solutions/types";

const MINIMAL_SOLUTION: Solution = {
  adventureId: "test-adventure",
  levelId: "beginner",
  title: "Beginner Solution",
  steps: [],
};

function makeModules(
  entries: Array<{ path: string; mod: SolutionModule }>,
): Record<string, SolutionModule> {
  return Object.fromEntries(entries.map(({ path, mod }) => [path, mod]));
}

describe("getSolutions", () => {
  it("returns an empty array when the glob is empty", () => {
    expect(getSolutions({})).toEqual([]);
  });

  it("parses adventureId and levelId from a well-formed path", () => {
    const modules = makeModules([
      {
        path: "../data/solutions/my-adventure/beginner.ts",
        mod: { solution: { ...MINIMAL_SOLUTION, adventureId: "my-adventure", levelId: "beginner" } },
      },
    ]);
    const [entry] = getSolutions(modules);
    expect(entry.adventureId).toBe("my-adventure");
    expect(entry.levelId).toBe("beginner");
    expect(entry.solution.title).toBe("Beginner Solution");
  });

  it("parses multiple entries and returns them all", () => {
    const modules = makeModules([
      {
        path: "../data/solutions/adventure-a/beginner.ts",
        mod: { solution: { ...MINIMAL_SOLUTION, adventureId: "adventure-a", levelId: "beginner" } },
      },
      {
        path: "../data/solutions/adventure-b/expert.ts",
        mod: { solution: { ...MINIMAL_SOLUTION, adventureId: "adventure-b", levelId: "expert" } },
      },
    ]);
    expect(getSolutions(modules)).toHaveLength(2);
  });

  it("throws when a module path does not match the expected pattern", () => {
    const modules = makeModules([
      {
        path: "../data/solutions/flat-wrong.ts",
        mod: { solution: MINIMAL_SOLUTION },
      },
    ]);
    expect(() => getSolutions(modules)).toThrow("did not match expected pattern");
  });

  it("throws when a module is missing the named solution export", () => {
    const modules = makeModules([
      {
        path: "../data/solutions/my-adventure/beginner.ts",
        mod: {} as SolutionModule,
      },
    ]);
    expect(() => getSolutions(modules)).toThrow("must export a named 'solution' constant");
  });
});
