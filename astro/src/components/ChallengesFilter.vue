<script setup lang="ts">
import { ref, computed, onMounted, type Component } from "vue";
import { Clock, Building2, Compass, Cloud, FlaskConical, Satellite, Scale, Telescope } from "lucide-vue-next";
import { tagToSlug, DIFFICULTIES, type ChallengeEntry } from "@/lib/challenges";
import { difficultyStyle } from "@/lib/difficulty";
import { stripLinks } from "@/lib/markdown";

// AdventureIcon equivalent for Vue islands (astro-icon can't render here).
const ADVENTURE_ICONS: Record<string, Component> = {
  Building2,
  Compass,
  Cloud,
  FlaskConical,
  Satellite,
  Scale,
  Telescope,
};

const props = defineProps<{
  entries: ChallengeEntry[];
  tags: string[];
  base: string;
  initialTag: string | null;
}>();

// SSR-safe initial state: seed from the route tag (same on server and first
// client render). URL params (?topics/?difficulty) are restored after mount to
// avoid a hydration mismatch (they differ between prerender and the browser).
const activeTags = ref<string[]>(props.initialTag ? [props.initialTag] : []);
const activeDifficulty = ref<string | null>(null);

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const topics = params.get("topics");
  if (topics !== null) {
    const slugs = topics.split(",").filter(Boolean);
    activeTags.value = props.tags.filter((t) => slugs.includes(tagToSlug(t)));
  }
  const diff = params.get("difficulty");
  if (diff && DIFFICULTIES.includes(diff as (typeof DIFFICULTIES)[number])) {
    activeDifficulty.value = diff;
  }
});

function syncUrl(): void {
  const params = new URLSearchParams(window.location.search);
  if (activeTags.value.length) params.set("topics", activeTags.value.map(tagToSlug).join(","));
  else params.delete("topics");
  if (activeDifficulty.value) params.set("difficulty", activeDifficulty.value);
  else params.delete("difficulty");
  const qs = params.toString();
  // replaceState (not a navigation) preserves scroll position.
  window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
}

function toggleTag(tag: string): void {
  activeTags.value = activeTags.value.includes(tag)
    ? activeTags.value.filter((t) => t !== tag)
    : [...activeTags.value, tag];
  syncUrl();
}

function toggleDifficulty(d: string): void {
  activeDifficulty.value = activeDifficulty.value === d ? null : d;
  syncUrl();
}

function clearAll(): void {
  activeTags.value = [];
  activeDifficulty.value = null;
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
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by difficulty">
      <button
        v-for="d in DIFFICULTIES"
        :key="d"
        type="button"
        class="rounded-full border px-3 py-1 text-sm"
        :class="activeDifficulty === d ? 'border-primary text-foreground' : 'border-border text-dim'"
        :aria-pressed="activeDifficulty === d"
        @click="toggleDifficulty(d)"
      >
        {{ d }}
      </button>
    </div>

    <div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by technology">
      <button
        v-for="tag in tags"
        :key="tag"
        type="button"
        class="rounded-full border px-3 py-1 text-xs"
        :class="activeTags.includes(tag) ? 'border-primary text-foreground' : 'border-border text-dim'"
        :aria-pressed="activeTags.includes(tag)"
        @click="toggleTag(tag)"
      >
        {{ tag }}
      </button>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <p class="text-sm text-faint" role="status" aria-live="polite">
        {{ filtered.length }} {{ filtered.length === 1 ? "challenge" : "challenges" }}
      </p>
      <button v-if="hasFilters" type="button" class="text-sm text-dim underline" @click="clearAll">
        Clear filters
      </button>
    </div>

    <ul class="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <li v-for="e in filtered" :key="`${e.adventureId}-${e.levelId}`" class="contents">
        <a
          :href="base + e.url.slice(1)"
          :aria-label="`${e.name}: ${e.difficulty}, ${e.adventureTitle}`"
          class="group card-glow flex flex-col rounded-xl border border-border bg-[hsl(var(--surface))] p-6 focus-ring"
        >
          <div class="mb-3 flex items-center justify-between">
            <span
              class="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition-colors"
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
            <li v-for="l in e.learnings.slice(0, 3)" :key="l" class="flex items-start gap-2 text-sm text-muted-foreground">
              <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span class="md-inline min-w-0" v-html="stripLinks(l)" />
            </li>
          </ul>

          <div class="mt-auto flex flex-wrap items-center justify-between gap-1.5 pt-4">
            <div class="flex items-center gap-1.5">
              <span class="font-mono text-xs text-muted-foreground">Challenge</span>
              <span
                v-if="e.estimatedTime"
                class="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 font-mono text-xs text-faint"
              >
                <Clock :size="10" aria-hidden="true" />
                {{ e.estimatedTime }}
              </span>
            </div>
            <span class="rounded-sm border border-border px-2 py-0.5 text-xs text-faint">{{ e.adventureTitle }}</span>
          </div>
        </a>
      </li>
    </ul>

    <p v-if="!filtered.length" class="mt-6 text-dim">No challenges match these filters.</p>
  </div>
</template>
