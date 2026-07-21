import { readdirSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineCollection } from "astro:content";
import type { Loader } from "astro/loaders";
import { z } from "astro/zod";
import { parse as parseYaml } from "yaml";
import {
  mdToInline,
  mdToBlock,
  mdToInlineArray,
  mdToBlockArray,
} from "./lib/markdown-pipeline.mjs";
import { LEVEL_DIFFICULTY_BY_EMOJI } from "./lib/level-constants.mjs";
import { parseDeadline } from "./lib/deadline.mjs";
import {
  buildLevelMetaDescription,
  buildAdventureMetaDescription,
  buildServicesStepBody,
} from "./lib/adventure-derive.mjs";

// Read the real app's adventure YAML. Resolved from this file's location:
// astro/src/content.config.ts -> ../../src/data/adventures.
const ADVENTURES_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../src/data/adventures",
);

// Constants duplicated from src/data/constants.ts (the collection loader runs
// outside the app's module graph). At cutover these import from the real
// constants module.
const CODESPACES_BASE = "https://codespaces.new/off-on-dev/open-source-challenges";
const COMMUNITY_URL = "https://community.offon.dev";

const EMOJI_ICON_MAP: Record<string, string> = {
  "🧪": "FlaskConical",
  "🔭": "Telescope",
  "☁️": "Cloud",
  "🛰️": "Satellite",
  "⚖️": "Scale",
  "🧭": "Compass",
};

const DEFAULT_REWARDS_ELIGIBILITY =
  "Complete all levels and post your solution in the community before the deadline to be eligible.";
const DEFAULT_REWARDS_RANKING_NOTE =
  "Ranking is determined by total points across all three levels. Points per level are awarded" +
  " by submission order within the active week (100 for the first valid solution, 95 for the" +
  " second, and so on; late submissions still earn 60).";
const DEFAULT_REWARDS_RANKING_RULES_PATH = "/t/about-the-challenges-category/16";

const DIFFICULTY = z.enum(["Beginner", "Intermediate", "Expert"]);

// --- Zod schema (translated from schemas/adventure.schema.json) ---
// .strict() mirrors additionalProperties:false and preserves the ajv validation
// gate: unknown fields fail the build (via `astro sync` / `astro build`).

const contributorSchema = z
  .object({ name: z.string(), url: z.string().url().optional(), about: z.string().optional() })
  .strict();

const rewardsSchema = z
  .object({
    deadline: z.string(),
    eligibility: z.string().optional(),
    tiers: z.array(z.object({ label: z.string(), description: z.string() }).strict()),
    ranking_note: z.string().optional(),
    ranking_rules_url: z.string().optional(),
  })
  .strict();

const upcomingLevelSchema = z
  .object({ level: z.string().optional(), name: z.string(), difficulty: DIFFICULTY })
  .strict();

const toolboxItemSchema = z
  .object({ name: z.string(), description: z.string(), url: z.string().url().optional() })
  .strict();

const serviceSchema = z
  .object({
    name: z.string(),
    port: z.union([z.string(), z.number()]).optional(),
    credentials: z.string().optional(),
    description: z.string(),
    internal: z.boolean().optional(),
  })
  .strict();

const howToPlayStepSchema = z
  .object({ id: z.string().optional(), title: z.string(), content: z.string() })
  .strict();

const verificationSchema = z.object({ command: z.string(), description: z.string() }).strict();

const helpfulLinkSchema = z
  .object({ title: z.string(), url: z.string().url(), description: z.string().optional() })
  .strict();

const levelSchema = z
  .object({
    level: z.string(),
    name: z.string().optional(),
    title: z.string().optional(),
    emoji: z.string().optional(),
    difficulty: DIFFICULTY.optional(),
    topics: z.array(z.string()),
    learnings: z.array(z.string()).min(1).optional(),
    what_you_learn: z.array(z.string()).min(1).optional(),
    devcontainer: z.string(),
    codespaces_machine: z.enum(["4core"]).optional(),
    discussion_url: z.string().optional(),
    community_url: z.string().optional(),
    deadline: z.string().optional(),
    hook: z.string().optional(),
    summary: z.string().optional(),
    intro: z.array(z.string()).optional(),
    backstory: z.array(z.string()).optional(),
    objective: z.array(z.string()),
    audience: z.string().optional(),
    estimated_time: z.string().optional(),
    scenario: z.string().optional(),
    architecture: z.array(z.string()).optional(),
    architecture_diagram: z.string().optional(),
    diagram_alt: z.string().optional(),
    architecture_ascii: z.string().optional(),
    toolbox: z.array(toolboxItemSchema),
    services: z.array(serviceSchema).optional(),
    how_to_play: z.array(howToPlayStepSchema),
    verification: verificationSchema,
    helpful_links: z.array(helpfulLinkSchema).optional(),
    meta_description: z.string().max(160).optional(),
    solved_count: z.number().int().optional(),
    top_players: z
      .array(z.object({ username: z.string(), count: z.number().int() }).strict())
      .optional(),
  })
  .strict()
  .refine((l) => l.name || l.title, { message: "level needs name or title" })
  .refine((l) => l.difficulty || (l.emoji && LEVEL_DIFFICULTY_BY_EMOJI[l.emoji]), {
    message: "level needs difficulty or a 🟢/🟡/🔴 emoji",
  })
  .refine((l) => l.learnings || l.what_you_learn, {
    message: "level needs learnings or what_you_learn",
  });

// --- Resolvers (ported from the generator) ---

function resolveCodespacesUrl(devcontainer: string, machine?: string): string {
  const path = `.devcontainer/${devcontainer}/devcontainer.json`;
  const encoded = encodeURIComponent(path);
  const machineParam = machine === "4core" ? "&machine=standardLinux32gb" : "";
  return `${CODESPACES_BASE}?devcontainer_path=${encoded}&quickstart=1${machineParam}`;
}

function resolveDiscussionUrl(raw?: string): string {
  const value = raw ?? "";
  if (!value) return "";
  if (value.startsWith("http")) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${COMMUNITY_URL}${path}`;
}

function resolveCommunityPath(url: string): string {
  if (url.startsWith("http")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${COMMUNITY_URL}${path}`;
}

async function renderLevel(level: z.infer<typeof levelSchema>): Promise<Record<string, unknown>> {
  const difficulty = level.difficulty ?? LEVEL_DIFFICULTY_BY_EMOJI[level.emoji as string];
  const learnings = level.learnings ?? level.what_you_learn ?? [];
  const intro = level.intro ?? (level.summary ? [level.summary] : undefined);

  // Inject an "Explore the UIs" step from services (ported from the generator).
  const steps: { title: string; content: string }[] = [...level.how_to_play];
  const servicesBody = buildServicesStepBody(level.services);
  if (servicesBody) steps.splice(1, 0, { title: "Explore the UIs", content: servicesBody });

  const [
    learningsHtml,
    audienceHtml,
    objectiveHtml,
    hookHtml,
    introHtml,
    backstoryHtml,
    scenarioHtml,
    architectureHtml,
    toolbox,
    howToPlay,
  ] = await Promise.all([
    mdToInlineArray(learnings),
    level.audience ? mdToInline(level.audience) : Promise.resolve(null),
    mdToInlineArray(level.objective),
    level.hook ? mdToBlock(level.hook) : Promise.resolve(null),
    intro ? mdToInlineArray(intro) : Promise.resolve(null),
    level.backstory ? mdToInlineArray(level.backstory) : Promise.resolve(null),
    level.scenario ? mdToBlock(level.scenario) : Promise.resolve(null),
    level.architecture ? mdToBlockArray(level.architecture) : Promise.resolve(null),
    Promise.all(
      level.toolbox.map(async (t) => ({ ...t, description: await mdToInline(t.description) })),
    ),
    Promise.all(
      steps.map(async (s) => ({
        title: await mdToInline(s.title),
        content: await mdToBlock(s.content),
      })),
    ),
  ]);

  return {
    id: level.level,
    name: (level.name ?? level.title) as string,
    difficulty,
    topics: level.topics,
    learnings: learningsHtml,
    codespacesUrl: resolveCodespacesUrl(level.devcontainer, level.codespaces_machine),
    discussionUrl: resolveDiscussionUrl(level.discussion_url ?? level.community_url),
    ...(level.deadline ? { deadline: parseDeadline(level.deadline) } : {}),
    ...(hookHtml ? { hook: hookHtml } : {}),
    ...(introHtml ? { intro: introHtml } : {}),
    ...(backstoryHtml ? { backstory: backstoryHtml } : {}),
    objective: objectiveHtml,
    ...(audienceHtml ? { audience: audienceHtml } : {}),
    ...(level.estimated_time ? { estimatedTime: level.estimated_time } : {}),
    ...(scenarioHtml ? { scenario: scenarioHtml } : {}),
    ...(architectureHtml ? { architecture: architectureHtml } : {}),
    // TODO(phase-2b): architectureDiagram needs asset wiring (SVG import). Filename for now.
    ...(level.architecture_diagram ? { architectureDiagram: level.architecture_diagram } : {}),
    ...(level.diagram_alt ? { diagramAlt: level.diagram_alt } : {}),
    ...(level.architecture_ascii ? { architectureAscii: level.architecture_ascii } : {}),
    toolbox,
    howToPlay,
    ...(level.helpful_links ? { helpfulLinks: level.helpful_links } : {}),
    verification: level.verification,
    metaDescription: level.meta_description || buildLevelMetaDescription(level),
  };
}

async function renderRewards(
  rewards: z.infer<typeof rewardsSchema>,
): Promise<Record<string, unknown>> {
  const eligibility = await mdToInline(rewards.eligibility ?? DEFAULT_REWARDS_ELIGIBILITY);
  const rankingNote = await mdToInline(rewards.ranking_note ?? DEFAULT_REWARDS_RANKING_NOTE);
  const tiers = await Promise.all(
    rewards.tiers.map(async (t) => ({ label: t.label, description: await mdToInline(t.description) })),
  );
  return {
    deadline: rewards.deadline === "TODO" ? "" : parseDeadline(rewards.deadline),
    eligibility,
    tiers,
    rankingNote,
    rankingRulesUrl: resolveCommunityPath(
      rewards.ranking_rules_url ?? DEFAULT_REWARDS_RANKING_RULES_PATH,
    ),
  };
}

// Custom loader: parses YAML with the `yaml` package (YAML 1.2 core), matching
// the generator. Astro's built-in glob() YAML parser auto-casts unquoted ISO
// timestamps to Date objects, corrupting deadline fields — this avoids that and
// gives digest-gated incremental rendering.
function adventuresLoader(): Loader {
  return {
    name: "adventures-loader",
    async load({ store, parseData, generateDigest, watcher }) {
      const seen = new Set<string>();
      for (const entry of readdirSync(ADVENTURES_DIR, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const yamlPath = resolve(ADVENTURES_DIR, entry.name, "adventure.yaml");
        if (!existsSync(yamlPath)) continue;
        seen.add(entry.name);
        const raw = readFileSync(yamlPath, "utf8");
        const digest = generateDigest(raw);
        if (store.get(entry.name)?.digest === digest) continue; // unchanged: skip re-render
        const data = await parseData({ id: entry.name, data: parseYaml(raw) });
        store.set({ id: entry.name, data, digest });
        watcher?.add(yamlPath);
      }
      // Drop entries whose YAML was deleted.
      for (const id of [...store.keys()]) if (!seen.has(id)) store.delete(id);
    },
  };
}

const adventures = defineCollection({
  loader: adventuresLoader(),
  schema: z
    .object({
      slug: z.string().regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/),
      title: z.string().optional(),
      name: z.string().optional(),
      emoji: z.string().optional(),
      icon: z.string().optional(),
      month: z.string().regex(/^[A-Z]{3} \d{4}$/),
      story: z.string().optional(),
      tags: z.array(z.string()).min(1),
      contributor: contributorSchema.optional(),
      community_category_id: z.number().int().optional(),
      meta_description: z.string().max(160).optional(),
      backstory: z.array(z.string()).optional(),
      overview: z.array(z.string()).optional(),
      rewards: rewardsSchema.optional(),
      upcoming_levels: z.array(upcomingLevelSchema).optional(),
      levels: z.array(levelSchema).min(1),
    })
    .strict()
    .refine((d) => d.title || d.name, { message: "adventure needs title or name" })
    .transform(async (data) => {
      const title = (data.title ?? data.name) as string;
      const story =
        data.story ?? (data.backstory && data.backstory.length > 0 ? data.backstory[0] : "");
      const icon = data.icon ?? (data.emoji ? EMOJI_ICON_MAP[data.emoji] : undefined);

      const [storyHtml, aboutHtml, backstoryHtml, levels, rewards] = await Promise.all([
        mdToInline(story),
        data.contributor?.about ? mdToInline(data.contributor.about) : Promise.resolve(null),
        data.backstory ? mdToInlineArray(data.backstory) : Promise.resolve(null),
        Promise.all(data.levels.map(renderLevel)),
        data.rewards ? renderRewards(data.rewards) : Promise.resolve(null),
      ]);

      return {
        slug: data.slug,
        title,
        month: data.month,
        story: storyHtml,
        metaDescription: data.meta_description || buildAdventureMetaDescription(data),
        tags: data.tags,
        ...(icon ? { icon } : {}),
        ...(data.contributor
          ? {
              contributor: {
                name: data.contributor.name,
                url: data.contributor.url,
                aboutHtml: aboutHtml ?? undefined,
              },
            }
          : {}),
        ...(backstoryHtml ? { backstory: backstoryHtml } : {}),
        ...(data.overview ? { overview: data.overview } : {}),
        ...(rewards ? { rewards } : {}),
        ...(data.upcoming_levels
          ? {
              upcomingLevels: data.upcoming_levels.map((u) => ({
                name: u.name,
                difficulty: u.difficulty,
              })),
            }
          : {}),
        levels,
      };
    }),
});

export const collections = { adventures };
