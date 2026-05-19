import { useState, useEffect } from "react";
import type { ToolboxItem, WalkthroughStep, VerificationInfo } from "@/data/adventures";

/** Shape of the extended data stored in per-level JSON files. */
type LevelJsonData = {
  intro?: string[];
  backstory?: string[];
  architecture?: string[];
  objective?: string[];
  toolbox?: ToolboxItem[];
  howToPlay?: string[];
  verification?: VerificationInfo;
};

/** Normalized extended data returned by the hook, ready for ChallengeDetail. */
export type ExtendedLevelData = {
  intro?: string[];
  backstory?: string[];
  architecture?: string[];
  objective?: string[];
  toolbox?: ToolboxItem[];
  howToPlay?: WalkthroughStep[];
  verification?: VerificationInfo;
};

export type LevelDataLoader = (adventureId: string, levelId: string) => Promise<LevelJsonData>;

const defaultLoader: LevelDataLoader = async (adventureId, levelId) => {
  const modules = import.meta.glob("@/data/adventures/**/*.json");
  const key = `/src/data/adventures/${adventureId}/${levelId}.json`;
  const loader = modules[key];
  if (!loader) return {};
  const mod = await loader() as { default: LevelJsonData };
  return mod.default;
};

/**
 * Loads extended level data (intro, backstory, architecture, objective, toolbox,
 * howToPlay, verification) from the per-level JSON file.
 * Converts howToPlay strings into WalkthroughStep objects (title-less).
 */
export function useLevelData(
  adventureId: string,
  levelId: string,
  loader: LevelDataLoader = defaultLoader,
): ExtendedLevelData {
  const [data, setData] = useState<ExtendedLevelData>({});

  useEffect(() => {
    if (!adventureId || !levelId) return;
    let cancelled = false;
    loader(adventureId, levelId)
      .then((json) => {
        if (cancelled) return;
        const result: ExtendedLevelData = {};
        if (json.intro?.length) result.intro = json.intro;
        if (json.backstory?.length) result.backstory = json.backstory;
        if (json.architecture?.length) result.architecture = json.architecture;
        if (json.objective?.length) result.objective = json.objective;
        if (json.toolbox?.length) result.toolbox = json.toolbox;
        if (json.howToPlay?.length) {
          result.howToPlay = json.howToPlay.map((s) => ({ title: "", body: s }));
        }
        if (json.verification) result.verification = json.verification;
        setData(result);
      })
      .catch(() => {
        if (!cancelled) setData({});
      });
    return () => { cancelled = true; };
  }, [adventureId, levelId, loader]);

  return data;
}
