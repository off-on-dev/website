<script setup lang="ts">
import { ref, onMounted } from "vue";
import IconX from '~icons/lucide/x';

// Dismissable "new here?" nudge. The starter adventure/level is resolved at
// build time and passed as props. localStorage reads and the delayed reveal run
// in onMounted so SSR renders nothing (hydration-safe).
const props = defineProps<{
  adventureId: string;
  adventureTitle: string;
  tag: string;
  levelId: string;
  base: string;
}>();

const STARTER_NUDGE_KEY = "starter_nudge_dismissed";
const show = ref(false);

onMounted(() => {
  let dismissed: boolean;
  try {
    dismissed = !!localStorage.getItem(STARTER_NUDGE_KEY);
  } catch {
    return;
  }
  if (!dismissed) show.value = true;
});

function dismiss(): void {
  try {
    localStorage.setItem(STARTER_NUDGE_KEY, "1");
  } catch {
    /* storage unavailable; nudge reappears next visit */
  }
  show.value = false;
}
</script>

<template>
  <div aria-live="polite" aria-atomic="true">
    <div
      v-if="show"
      class="-mt-2 mb-8 flex items-center justify-between gap-3 rounded-lg bg-primary px-4 py-3 text-sm"
    >
      <p class="text-primary-foreground">
        Each adventure focuses on one open source technology, with challenges at different difficulty levels.
        <span class="block mt-1">
          New here?
          <a
            :href="`${props.base}adventures/${props.adventureId}/levels/${props.levelId}/`"
            class="font-semibold underline decoration-2 underline-offset-2 hover:underline-offset-4 transition-all text-primary-foreground focus-ring rounded-sm"
          >
            Start with {{ props.adventureTitle }}, a {{ props.tag }} adventure
          </a>
        </span>
      </p>
      <button
        type="button"
        aria-label="Dismiss suggestion"
        class="shrink-0 inline-flex min-h-8 min-w-8 items-center justify-center text-primary-foreground/60 hover:text-primary-foreground transition-colors focus-ring rounded-sm"
        @click="dismiss"
      >
        <IconX width="14" height="14" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
