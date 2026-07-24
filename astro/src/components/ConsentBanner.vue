<script setup lang="ts">
import { onMounted } from "vue";
import { useStore } from "@nanostores/vue";
import { Cookie } from "lucide-vue-next";
import { $consent, grant, deny, reset, initConsent, firePageView } from "@/stores/consent";

const consent = useStore($consent);

// Hydration-safe: SSR + first client render show the banner (consent === null,
// matching the store default). initConsent() restores the stored decision / GPC
// state after mount. The island is transition:persist, so this runs once and the
// astro:page-load listener persists across client navigations.
onMounted(() => {
  initConsent();
  document.addEventListener("astro:page-load", firePageView);
});
</script>

<template>
  <!-- aria-live so screen readers announce the banner when it appears post-hydration. -->
  <div aria-live="polite">
    <div
      v-if="consent === null"
      class="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 backdrop-blur"
    >
      <div class="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-dim">
          We use privacy-friendly analytics with your consent. Nothing is sent until you accept.
        </p>
        <div class="flex gap-2">
          <button type="button" class="btn-primary" @click="grant">Accept</button>
          <button type="button" class="btn-ghost" @click="deny">Decline</button>
        </div>
      </div>
    </div>

    <button
      v-else
      type="button"
      class="focus-ring fixed bottom-4 right-4 z-40 rounded-full border border-border bg-background p-3 text-dim hover:text-foreground"
      aria-label="Cookie preferences"
      @click="reset"
    >
      <Cookie :size="18" aria-hidden="true" />
    </button>
  </div>
</template>
