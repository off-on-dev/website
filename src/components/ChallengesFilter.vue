<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, type Component, type CSSProperties } from "vue";
import IconClock from '~icons/lucide/clock';
import IconChevronDown from '~icons/lucide/chevron-down';
import IconCheck from '~icons/lucide/check';
import IconX from '~icons/lucide/x';
import IconArrowRight from '~icons/lucide/arrow-right';
import IconBuilding2 from '~icons/lucide/building-2';
import IconCompass from '~icons/lucide/compass';
import IconCloud from '~icons/lucide/cloud';
import IconFlaskConical from '~icons/lucide/flask-conical';
import IconSatellite from '~icons/lucide/satellite';
import IconScale from '~icons/lucide/scale';
import IconTelescope from '~icons/lucide/telescope';
import { tagToSlug, DIFFICULTIES, type ChallengeEntry } from "@/lib/challenges";
import { difficultyStyle, DIFFICULTY_VAR } from "@/lib/difficulty";
import { stripLinks } from "@/lib/markdown";

// Adventure category icon map for the filter UI.
const ADVENTURE_ICONS: Record<string, Component> = {
  Building2: IconBuilding2, Compass: IconCompass, Cloud: IconCloud, FlaskConical: IconFlaskConical, Satellite: IconSatellite, Scale: IconScale, Telescope: IconTelescope,
};

const props = defineProps<{
  entries: ChallengeEntry[];
  tags: string[];
  base: string;
  initialTag: string | null;
  adventureCount: number;
  // Home ("embedded") context: the page already has a visible section heading,
  // so suppress the island's sr-only result headings to avoid a duplicate outline.
  embedded?: boolean;
  // When set and unfiltered, render a "See all adventures" link below the grid
  // (used on the home page when adventures exceed the previewed count).
  seeAllHref?: string;
}>();

// SSR-safe initial state: seed from the route tag (same on server and first
// client render). URL params (?topics/?difficulty) are restored after mount.
const activeTags = ref<string[]>(props.initialTag ? [props.initialTag] : []);
const activeDifficulty = ref<string | null>(null);
const hasFiltered = ref(false);

// Dropdown (mobile/tablet) open state + refs for click-outside / focus return.
const difficultyOpen = ref(false);
const tagsOpen = ref(false);
const difficultyRef = ref<HTMLElement | null>(null);
const tagsRef = ref<HTMLElement | null>(null);
const difficultyTrigger = ref<HTMLButtonElement | null>(null);
const tagsTrigger = ref<HTMLButtonElement | null>(null);

function handleClickOutside(e: MouseEvent): void {
  const t = e.target as Node;
  if (difficultyRef.value && !difficultyRef.value.contains(t)) difficultyOpen.value = false;
  if (tagsRef.value && !tagsRef.value.contains(t)) tagsOpen.value = false;
}
function handleEscape(e: KeyboardEvent): void {
  if (e.key !== "Escape") return;
  if (difficultyOpen.value) {
    difficultyOpen.value = false;
    difficultyTrigger.value?.focus();
  } else if (tagsOpen.value) {
    tagsOpen.value = false;
    tagsTrigger.value?.focus();
  }
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const topics = params.get("topics");
  if (topics !== null) {
    const slugs = topics.split(",").filter(Boolean);
    activeTags.value = props.tags.filter((t) => slugs.includes(tagToSlug(t)));
  }
  const diff = params.get("difficulty");
  if (diff && DIFFICULTIES.includes(diff as (typeof DIFFICULTIES)[number])) activeDifficulty.value = diff;
  if (activeTags.value.length > 0 || activeDifficulty.value !== null) hasFiltered.value = true;
  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleEscape);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  document.removeEventListener("keydown", handleEscape);
});

function syncUrl(): void {
  const params = new URLSearchParams(window.location.search);
  if (activeTags.value.length) params.set("topics", activeTags.value.map(tagToSlug).join(","));
  else params.delete("topics");
  if (activeDifficulty.value) params.set("difficulty", activeDifficulty.value);
  else params.delete("difficulty");
  const qs = params.toString();
  // On a /challenges/:tag/ route, clearing all tags must drop the path segment,
  // otherwise the tag re-seeds the filter on reload/share/back (parity with the
  // React handleTopicsChange navigation). replaceState preserves scroll position.
  const targetPath =
    props.initialTag !== null && activeTags.value.length === 0
      ? `${props.base}challenges/`
      : window.location.pathname;
  window.history.replaceState(null, "", targetPath + (qs ? `?${qs}` : ""));
}

function setDifficulty(d: string | null): void {
  hasFiltered.value = true;
  activeDifficulty.value = activeDifficulty.value === d ? null : d;
  syncUrl();
}
function setDifficultyExact(d: string | null): void {
  hasFiltered.value = true;
  activeDifficulty.value = d;
  syncUrl();
}
function toggleTag(tag: string): void {
  hasFiltered.value = true;
  activeTags.value = activeTags.value.includes(tag)
    ? activeTags.value.filter((t) => t !== tag)
    : [...activeTags.value, tag];
  syncUrl();
}
function setAllTools(): void {
  hasFiltered.value = true;
  activeTags.value = [];
  syncUrl();
}

const filtered = computed(() =>
  props.entries.filter(
    (e) =>
      (activeTags.value.length === 0 || activeTags.value.some((t) => e.adventureTags.includes(t))) &&
      (!activeDifficulty.value || e.difficulty === activeDifficulty.value),
  ),
);
const hasFilters = computed(() => activeTags.value.length > 0 || activeDifficulty.value !== null);
const challengeCount = computed(() => props.entries.length);

const filteredCountText = computed(() => {
  let s = `${filtered.value.length} ${filtered.value.length === 1 ? "challenge" : "challenges"}`;
  if (activeDifficulty.value) s += ` · ${activeDifficulty.value}`;
  if (activeTags.value.length) s += ` · ${activeTags.value.join(", ")}`;
  return s;
});
const liveMsg = computed(() => {
  if (!hasFiltered.value) return "";
  if (hasFilters.value) return `Showing ${filteredCountText.value}`;
  return `Filters cleared, showing ${props.adventureCount} ${props.adventureCount === 1 ? "adventure" : "adventures"} · ${challengeCount.value} ${challengeCount.value === 1 ? "challenge" : "challenges"}`;
});

// Pill styles (ported from the React ChallengeFilters). border-style must be
// inline because the `filter-pill` border class is what makes borders render.
function difficultyPillStyle(diff: string, isActive: boolean): CSSProperties {
  const v = DIFFICULTY_VAR[diff];
  return {
    color: "hsl(var(--difficulty-text))",
    backgroundColor: `hsl(var(--difficulty-${v}-bg))`,
    borderStyle: "solid",
    borderWidth: "2px",
    borderColor: isActive ? `hsl(var(--difficulty-${v}))` : `hsl(var(--difficulty-${v}-border))`,
  };
}
function allLevelsPillStyle(isActive: boolean): CSSProperties {
  return {
    borderStyle: "solid",
    borderWidth: "2px",
    backgroundColor: isActive ? "hsl(var(--foreground))" : "transparent",
    borderColor: isActive ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.6)",
    color: isActive ? "hsl(var(--background))" : "hsl(var(--foreground))",
  };
}
function allToolsPillStyle(isActive: boolean): CSSProperties {
  return {
    borderStyle: "solid",
    borderWidth: "2px",
    backgroundColor: "transparent",
    borderColor: isActive ? "hsl(var(--foreground))" : "hsl(var(--border))",
    color: isActive ? "hsl(var(--foreground))" : "hsl(var(--text-secondary))",
  };
}
function swatchStyle(diff: string): CSSProperties {
  const v = DIFFICULTY_VAR[diff];
  return { backgroundColor: `hsl(var(--difficulty-${v}-bg))`, border: `1px solid hsl(var(--difficulty-${v}-border))` };
}
function dropdownItemClass(isActive: boolean): string {
  return [
    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors focus-ring",
    isActive ? "text-primary bg-primary/10" : "text-dim hover:bg-primary/5 hover:text-foreground dark:hover:text-primary",
  ].join(" ");
}

const DIFF_PILL_BASE =
  "filter-pill inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 min-h-[44px] text-sm font-medium leading-none transition-all duration-200 focus-ring cursor-pointer";

// Arrow-key navigation within the desktop radiogroup (difficulty pills).
function handleDifficultyKey(e: KeyboardEvent): void {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
  e.preventDefault();
  const radios = (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="radio"]');
  const current = Array.from(radios).findIndex(r => r === document.activeElement);
  if (current === -1) return;
  const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
  const next = (current + dir + radios.length) % radios.length;
  const nextEl = radios[next];
  nextEl.focus();
  // Also apply the selection (activating the next radio)
  nextEl.click();
}

// Arrow-key navigation within an open dropdown panel.
function navigatePanel(e: KeyboardEvent): void {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  e.preventDefault();
  const panel = (e.currentTarget as HTMLElement).closest<HTMLElement>('[role="group"]');
  if (!panel) return;
  const btns = Array.from(panel.querySelectorAll<HTMLButtonElement>("button"));
  const idx = btns.indexOf(e.currentTarget as HTMLButtonElement);
  if (idx === -1) return;
  btns[(e.key === "ArrowDown" ? idx + 1 : idx - 1 + btns.length) % btns.length].focus();
}
</script>

<template>
  <div>
    <div class="mb-8">
      <!-- Mobile / tablet: two dropdowns side by side -->
      <div class="flex items-center gap-2 lg:hidden">
        <div ref="difficultyRef" class="relative">
          <button
            ref="difficultyTrigger"
            type="button"
            class="filter-pill px-6 gap-2"
            :class="activeDifficulty !== null ? 'pill-active' : 'pill-inactive'"
            :style="activeDifficulty !== null && activeDifficulty in DIFFICULTY_VAR ? difficultyPillStyle(activeDifficulty, true) : allLevelsPillStyle(true)"
            :aria-label="`Filter by difficulty: ${activeDifficulty ?? 'All Levels'}`"
            :aria-expanded="difficultyOpen"
            aria-controls="difficulty-group"
            @click="difficultyOpen = !difficultyOpen; tagsOpen = false"
          >
            {{ activeDifficulty ?? "All Levels" }}
            <IconChevronDown width="14" height="14" aria-hidden="true" class="transition-transform duration-200" :class="difficultyOpen ? 'rotate-180' : ''" />
          </button>
          <div
            id="difficulty-group"
            role="group"
            aria-label="Filter by difficulty"
            :hidden="!difficultyOpen"
            class="absolute top-full left-0 z-20 mt-2 min-w-[160px] rounded-xl border border-border bg-[hsl(var(--surface))] p-1.5 shadow-lg"
          >
            <button
              type="button"
              :aria-pressed="activeDifficulty === null"
              :class="dropdownItemClass(activeDifficulty === null)"
              @click="setDifficultyExact(null); difficultyOpen = false; difficultyTrigger?.focus()"
              @keydown="navigatePanel"
            >
              <IconCheck v-if="activeDifficulty === null" width="13" height="13" aria-hidden="true" />
              <span v-else class="w-[13px] shrink-0" />
              All Levels
            </button>
            <button
              v-for="d in DIFFICULTIES"
              :key="d"
              type="button"
              :aria-pressed="activeDifficulty === d"
              :class="dropdownItemClass(activeDifficulty === d)"
              @click="setDifficultyExact(d); difficultyOpen = false; difficultyTrigger?.focus()"
              @keydown="navigatePanel"
            >
              <span class="w-[13px] inline-flex items-center justify-center shrink-0">
                <IconCheck v-if="activeDifficulty === d" width="13" height="13" aria-hidden="true" />
                <span v-else class="h-2.5 w-2.5 rounded-sm" aria-hidden="true" :style="swatchStyle(d)" />
              </span>
              {{ d }}
            </button>
          </div>
        </div>

        <div ref="tagsRef" class="relative">
          <button
            ref="tagsTrigger"
            type="button"
            class="filter-pill px-6 gap-2"
            :class="activeTags.length > 0 ? 'pill-active' : 'pill-inactive'"
            :style="activeTags.length === 0 ? allToolsPillStyle(true) : undefined"
            :aria-label="activeTags.length === 0 ? 'Filter by technology: All Tools' : `Filter by technology: ${activeTags.length} ${activeTags.length !== 1 ? 'tools' : 'tool'} selected`"
            :aria-expanded="tagsOpen"
            aria-controls="tags-group"
            @click="tagsOpen = !tagsOpen; difficultyOpen = false"
          >
            {{ activeTags.length === 0 ? "All Tools" : `${activeTags.length} tool${activeTags.length !== 1 ? "s" : ""} selected` }}
            <IconChevronDown width="14" height="14" aria-hidden="true" class="transition-transform duration-200" :class="tagsOpen ? 'rotate-180' : ''" />
          </button>
          <div
            id="tags-group"
            role="group"
            aria-label="Filter by technology"
            :hidden="!tagsOpen"
            class="absolute top-full left-0 z-20 mt-2 min-w-[200px] rounded-xl border border-border bg-[hsl(var(--surface))] p-1.5 shadow-lg"
          >
            <button
              type="button"
              :aria-pressed="activeTags.length === 0"
              :class="dropdownItemClass(activeTags.length === 0)"
              @click="setAllTools(); tagsOpen = false; tagsTrigger?.focus()"
              @keydown="navigatePanel"
            >
              <IconCheck v-if="activeTags.length === 0" width="13" height="13" aria-hidden="true" />
              <span v-else class="w-[13px] shrink-0" />
              All Tools
            </button>
            <button
              v-for="tag in tags"
              :key="tag"
              type="button"
              :aria-pressed="activeTags.includes(tag)"
              :class="dropdownItemClass(activeTags.includes(tag))"
              @click="toggleTag(tag)"
              @keydown="navigatePanel"
            >
              <IconCheck v-if="activeTags.includes(tag)" width="13" height="13" aria-hidden="true" />
              <span v-else class="w-[13px] shrink-0" />
              {{ tag }}
            </button>
            <div class="mt-1 border-t border-border pt-1">
              <button type="button" :class="dropdownItemClass(false)" @click="tagsOpen = false; tagsTrigger?.focus()" @keydown="navigatePanel">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop: two pill rows -->
      <div class="hidden lg:block space-y-3">
        <div role="radiogroup" aria-label="Filter by difficulty" class="flex flex-wrap items-center gap-2 pb-3 border-b border-border" @keydown="handleDifficultyKey">
          <button type="button" role="radio" :aria-checked="activeDifficulty === null" :tabindex="activeDifficulty === null ? 0 : -1" :class="DIFF_PILL_BASE" :style="allLevelsPillStyle(activeDifficulty === null)" @click="setDifficultyExact(null)">
            All Levels
          </button>
          <button
            v-for="d in DIFFICULTIES"
            :key="d"
            type="button"
            role="radio"
            :aria-checked="activeDifficulty === d"
            :tabindex="activeDifficulty === d ? 0 : -1"
            :class="DIFF_PILL_BASE"
            :style="difficultyPillStyle(d, activeDifficulty === d)"
            @click="setDifficulty(d)"
          >
            {{ d }}
            <IconX v-if="activeDifficulty === d" width="11" height="11" aria-hidden="true" />
          </button>
        </div>

        <div role="group" aria-label="Filter by technology" class="flex flex-wrap items-center gap-2">
          <button type="button" :aria-pressed="activeTags.length === 0" :class="DIFF_PILL_BASE" :style="allToolsPillStyle(activeTags.length === 0)" @click="setAllTools">
            All Tools
          </button>
          <button
            v-for="tag in tags"
            :key="tag"
            type="button"
            :aria-pressed="activeTags.includes(tag)"
            class="filter-pill"
            :class="activeTags.includes(tag) ? 'pill-active' : 'pill-inactive'"
            @click="toggleTag(tag)"
          >
            {{ tag }}
            <IconX v-if="activeTags.includes(tag)" width="11" height="11" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <span aria-live="polite" aria-atomic="true" class="sr-only">{{ liveMsg }}</span>

    <template v-if="hasFilters">
      <h2 v-if="!embedded" class="sr-only">Filtered Challenges</h2>
      <p class="animate-fade-up mb-6 font-sans text-sm font-medium tracking-wide text-muted-foreground">{{ filteredCountText }}</p>
    </template>
    <template v-else>
      <h2 v-if="!embedded" class="sr-only">All Challenges</h2>
      <p class="mb-6 font-sans text-sm font-medium tracking-wide text-muted-foreground">
        {{ props.adventureCount }} {{ props.adventureCount === 1 ? "adventure" : "adventures" }} · {{ challengeCount }} {{ challengeCount === 1 ? "challenge" : "challenges" }}
      </p>
    </template>

    <!-- Unfiltered: SSR adventure cards (AdventureCard is .astro; passed as a slot). -->
    <div v-show="!hasFilters" data-results="adventures" class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <slot name="adventures" />
    </div>
    <template v-if="seeAllHref">
      <div v-show="!hasFilters" class="mt-10 flex justify-center">
        <a :href="seeAllHref" class="btn-ghost inline-flex items-center gap-2">
          See all adventures
          <IconArrowRight width="16" height="16" aria-hidden="true" />
        </a>
      </div>
    </template>

    <!-- Filtered: level cards rendered from entries. -->
    <ul v-show="hasFilters" data-results="levels" class="animate-fade-up grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <li v-for="e in filtered" :key="`${e.adventureId}-${e.levelId}`" class="contents">
        <a
          :href="base + e.url.slice(1)"
          :aria-label="`${e.name}: ${e.difficulty}${e.isLive ? ', live' : ''}, ${e.adventureTitle}`"
          class="group card-glow flex flex-col rounded-xl border border-border bg-[hsl(var(--surface))] p-6 focus-ring"
        >
          <div class="mb-3 flex items-center justify-between">
            <span
              class="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
              :style="difficultyStyle(e.difficulty)"
              :data-difficulty="e.difficulty"
            >
              <span class="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
              {{ e.difficulty }}
            </span>
            <span
              v-if="e.isLive"
              class="inline-flex items-center gap-1.5 rounded-sm bg-primary px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-primary-foreground"
            >
              <span class="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
                <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-foreground" />
              </span>
              Live
            </span>
          </div>

          <h3 class="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
            {{ e.name }}
            <span v-if="e.adventureIcon && ADVENTURE_ICONS[e.adventureIcon]" class="ml-1 inline-flex items-center align-middle text-muted-foreground">
              <component :is="ADVENTURE_ICONS[e.adventureIcon]" :size="16" aria-hidden="true" />
            </span>
          </h3>

          <ul role="list" class="mt-3 space-y-1.5">
            <li v-for="l in e.learnings" :key="l" class="flex items-start gap-2 text-sm text-muted-foreground">
              <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span class="md-inline min-w-0" v-html="stripLinks(l)" />
            </li>
          </ul>

          <div class="mt-auto flex flex-wrap items-center justify-between gap-1.5 pt-4">
            <div class="flex items-center gap-1.5">
              <span class="font-mono text-xs text-muted-foreground">Challenge</span>
              <span v-if="e.estimatedTime" class="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 font-mono text-xs text-faint">
                <IconClock width="10" height="10" aria-hidden="true" />
                {{ e.estimatedTime }}
              </span>
            </div>
            <span class="rounded-sm border border-border px-2 py-0.5 text-xs text-faint">{{ e.adventureTitle }}</span>
          </div>
        </a>
      </li>
    </ul>

    <p v-if="hasFilters && !filtered.length" class="mt-6 text-dim">No challenges match these filters.</p>
  </div>
</template>
