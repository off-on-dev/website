// Loads the pre-built solution walkthroughs from src/data/solutions/<adventureId>/<levelId>.ts.
// The glob matches only files one directory deep, so the top-level types.ts is
// excluded automatically. The `@/data/solutions/types` and `@/data/adventures/contributors`
// specifiers those modules use resolve via the app's `@/` -> src alias.
import type { Solution } from "@/data/solutions/types";

export type { Solution, SolutionBlock } from "@/data/solutions/types";

export type SolutionModule = { solution: Solution };

export type SolutionEntry = {
  adventureId: string;
  levelId: string;
  solution: Solution;
};

const PATH_RE = /solutions\/([^/]+)\/([^/]+)\.ts$/;

export function getSolutions(
  modules: Record<string, SolutionModule> = import.meta.glob<SolutionModule>(
    "../data/solutions/*/*.ts",
    { eager: true },
  ),
): SolutionEntry[] {
  return Object.entries(modules).map(([path, mod]) => {
    const match = path.match(PATH_RE);
    if (!match) {
      throw new Error(`Solution module path did not match expected pattern: ${path}`);
    }
    if (!mod.solution) {
      throw new Error(
        `Solution module at "${path}" must export a named 'solution' constant: found none.`,
      );
    }
    return { adventureId: match[1], levelId: match[2], solution: mod.solution };
  });
}
