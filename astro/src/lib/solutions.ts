// Loads the React app's pre-built solution walkthroughs from
// src/data/solutions/<adventureId>/<levelId>.ts (repo root). The glob matches
// only files one directory deep, so the top-level index.ts, manifest.ts, and
// types.ts are excluded automatically. The `@/` specifiers those modules use
// are bridged via the resolve.alias entries in astro.config.mjs.
import type { Solution } from "../../../src/data/solutions/types";

export type { Solution, SolutionBlock, SolutionStep } from "../../../src/data/solutions/types";

type SolutionModule = { solution: Solution };

const modules = import.meta.glob<SolutionModule>("../../../src/data/solutions/*/*.ts", {
  eager: true,
});

export type SolutionEntry = {
  adventureId: string;
  levelId: string;
  solution: Solution;
};

const PATH_RE = /solutions\/([^/]+)\/([^/]+)\.ts$/;

export function getSolutions(): SolutionEntry[] {
  return Object.entries(modules).map(([path, mod]) => {
    const match = path.match(PATH_RE);
    if (!match || !mod.solution) {
      throw new Error(`Unexpected solution module shape or path: ${path}`);
    }
    return { adventureId: match[1], levelId: match[2], solution: mod.solution };
  });
}
