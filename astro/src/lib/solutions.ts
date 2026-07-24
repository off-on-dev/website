// Loads the pre-built solution walkthroughs from src/data/solutions/<adventureId>/<levelId>.ts.
// The glob matches only files one directory deep, so the top-level types.ts is
// excluded automatically. The `@/data/solutions/types` and `@/data/adventures/contributors`
// specifiers those modules use resolve via the app's `@/` -> src alias.
import type { Solution } from "../data/solutions/types";

export type { Solution, SolutionBlock, SolutionStep } from "../data/solutions/types";

type SolutionModule = { solution: Solution };

const modules = import.meta.glob<SolutionModule>("../data/solutions/*/*.ts", {
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
