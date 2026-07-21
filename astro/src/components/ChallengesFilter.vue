<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { tagToSlug, DIFFICULTIES, type ChallengeEntry } from "@/lib/challenges";

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

    <ul class="mt-4 grid gap-4 sm:grid-cols-2">
      <li v-for="e in filtered" :key="`${e.adventureId}-${e.levelId}`" class="rounded-lg border border-border p-4">
        <a class="docs-ext-link text-base font-semibold text-foreground" :href="base + e.url.slice(1)">
          {{ e.name }}
        </a>
        <p class="mt-1 text-xs text-faint">{{ e.adventureTitle }} · {{ e.difficulty }}</p>
        <p v-if="e.topics.length" class="mt-2 text-xs text-dim">{{ e.topics.join(" · ") }}</p>
      </li>
    </ul>

    <p v-if="!filtered.length" class="mt-6 text-dim">No challenges match these filters.</p>
  </div>
</template>
