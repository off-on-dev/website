import { ECHOES_LOST_IN_ORBIT } from "./echoes-lost-in-orbit";
import { BUILDING_CLOUDHAVEN } from "./building-cloudhaven";
import { THE_AI_OBSERVATORY } from "./the-ai-observatory";
import { BLIND_BY_DESIGN } from "./blind-by-design";
import type { Adventure, AdventureContributor, RelatedLevel } from "./types";

export type { Adventure, AdventureLevel, AdventureContributor, RelatedLevel, ToolboxItem, WalkthroughStep, VerificationInfo, TopPlayer, UpcomingLevel } from "./types";
export { KATHARINA_SICK } from "./contributors";

export const ADVENTURES: Adventure[] = [
  ECHOES_LOST_IN_ORBIT,
  BUILDING_CLOUDHAVEN,
  THE_AI_OBSERVATORY,
  BLIND_BY_DESIGN,
];

/** All unique technology tags across all adventures, sorted alphabetically. Shared with filter components; do not re-derive in component files. */
export const ALL_TAGS: string[] = Array.from(
  new Set(ADVENTURES.flatMap((a) => a.tags))
).sort();

/** Community members who contributed an adventure, grouped by person. Derived from ADVENTURES; do not re-derive in components. */
export const ADVENTURE_CONTRIBUTORS: AdventureContributor[] = Object.values(
  ADVENTURES
    .filter((a): a is Adventure & { contributor: NonNullable<Adventure["contributor"]> } => a.contributor !== undefined)
    .reduce<Record<string, AdventureContributor>>((acc, a) => {
      const key = a.contributor.name;
      if (!acc[key]) {
        acc[key] = { name: a.contributor.name, url: a.contributor.url, about: a.contributor.about, adventures: [] };
      }
      acc[key].adventures.push({ id: a.id, title: a.title });
      return acc;
    }, {})
);

/** Returns all levels across all adventures that include the given technology tag. */
export const getLevelsByTag = (tag: string): RelatedLevel[] =>
  ADVENTURES.filter((adventure) => adventure.tags.includes(tag)).flatMap((adventure) =>
    adventure.levels.map((level) => ({
      level,
      adventureId: adventure.id,
      adventureTitle: adventure.title,
    }))
  );
