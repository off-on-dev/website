<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useStore } from "@nanostores/vue";
import IconCookie from '~icons/lucide/cookie';
import { $consent, grant, deny, reset, initConsent, firePageView, trackClicks } from "@/stores/consent";

const consent = useStore($consent);
const mounted = ref(false);
const privacyUrl = import.meta.env.BASE_URL + "privacy/";

const cookieBtn = ref<HTMLButtonElement | null>(null);
const declineBtn = ref<HTMLButtonElement | null>(null);

// Move focus after consent transitions so keyboard/AT users are not stranded.
// Uses the Vue ref from useStore (not the raw atom) so Vue's watch fires correctly.
watch(consent, async (v, prev) => {
  if (prev === null && v !== null) {
    // Banner dismissed (granted or denied): focus the cookie preferences button.
    await nextTick();
    cookieBtn.value?.focus();
  } else if (prev !== null && v === null) {
    // Preferences reset: banner re-appears; focus the Decline button.
    await nextTick();
    declineBtn.value?.focus();
  }
});

onMounted(() => {
  mounted.value = true;
  initConsent();
  document.addEventListener("astro:page-load", firePageView);
  trackClicks();
});

onUnmounted(() => {
  document.removeEventListener("astro:page-load", firePageView);
});
</script>

<template>
  <!-- aria-live so screen readers announce the banner when it appears post-hydration. -->
  <div aria-live="polite">
    <div
      v-if="consent === null && mounted"
      role="region"
      aria-labelledby="consent-banner-title"
      class="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 shadow-lg backdrop-blur"
    >
      <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-start sm:gap-8 sm:px-6">
        <!-- Left: title + description -->
        <div class="flex-1">
          <p id="consent-banner-title" class="text-sm font-semibold text-foreground">
            This site uses analytics cookies
          </p>
          <p class="mt-1 text-sm text-dim">
            We use Google Analytics to understand how visitors use offon.dev. No data is sent to
            Google until you accept. You can change your preference at any time. See our
            <a
              :href="privacyUrl"
              class="text-dim underline underline-offset-2 hover:text-foreground focus-ring rounded-sm"
            >Privacy Policy</a>
            for details.
          </p>
        </div>
        <!-- Right: action buttons -->
        <div class="flex shrink-0 gap-2">
          <button
            type="button"
            class="btn-primary"
            aria-label="Accept analytics cookies"
            @click="grant"
          >
            Accept Analytics
          </button>
          <button
            ref="declineBtn"
            type="button"
            class="btn-ghost"
            aria-label="Decline analytics cookies"
            @click="deny"
          >
            Decline
          </button>
        </div>
      </div>
    </div>

    <button
      v-else-if="mounted"
      ref="cookieBtn"
      type="button"
      class="focus-ring fixed right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-dim shadow-sm hover:text-foreground"
      :style="{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }"
      aria-label="Change cookie preferences"
      @click="reset"
    >
      <IconCookie width="18" height="18" aria-hidden="true" />
    </button>
  </div>
</template>
