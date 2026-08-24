<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useStore } from "@nanostores/vue";
import IconCookie from '~icons/lucide/cookie';
import { $consent, grant, deny, reset, initConsent, firePageView, trackClicks, stopTrackClicks } from "@/stores/consent";

const consent = useStore($consent);
const mounted = ref(false);
const privacyUrl = import.meta.env.BASE_URL + "privacy/";

const cookieBtn = ref<HTMLButtonElement | null>(null);
const declineBtn = ref<HTMLButtonElement | null>(null);

// Focus must move only in response to a genuine user choice. initConsent()
// restores a stored value during onMounted, which registers on the store as a
// null -> granted/denied transition but is NOT a user action: focusing there
// would steal focus from the skip-nav link on every page load for every
// returning visitor. The React ConsentBanner guarded the same case explicitly
// ("Skips the initial page-load case so the banner never steals focus from the
// skip nav link"). Released one tick after mount, so the watcher job queued by
// the restore has already been flushed and skipped.
let hydrating = true;

// Move focus after consent transitions so keyboard/AT users are not stranded.
// Uses the Vue ref from useStore (not the raw atom) so Vue's watch fires correctly.
watch(consent, async (v, prev) => {
  if (hydrating) return;
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
  // nextTick() resolves after the scheduler flush that runs the pre-flush watcher
  // job queued by initConsent()'s restore, so that transition is always skipped.
  void nextTick().then(() => {
    hydrating = false;
  });
  document.addEventListener("astro:page-load", firePageView);
  trackClicks();
});

onUnmounted(() => {
  document.removeEventListener("astro:page-load", firePageView);
  stopTrackClicks();
});
</script>

<template>
  <!-- aria-live so screen readers announce the banner when it appears post-hydration.
       aria-atomic so the whole region is re-read on every transition (banner ->
       cookie button and back), not just the changed subtree. -->
  <div aria-live="polite" aria-atomic="true">
    <div
      v-if="consent === null && mounted"
      role="region"
      aria-labelledby="consent-banner-title"
      class="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 shadow-lg backdrop-blur"
    >
      <!-- max-h-[80vh] + overflow-y-auto keep the actions reachable at 400% zoom
           and on short landscape viewports (WCAG 1.4.10). The safe-area padding
           keeps them clear of the iOS home indicator. -->
      <div
        class="mx-auto flex max-h-[80vh] max-w-7xl flex-col gap-4 overflow-y-auto px-4 py-5 sm:flex-row sm:items-start sm:gap-8 sm:px-6"
        style="padding-bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px))"
      >
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
        <!-- Right: action buttons. Decline comes first in DOM and tab order, and
             uses .btn-secondary (solid, same geometry as .btn-primary) so
             declining is no harder or less obvious than accepting. -->
        <div class="flex shrink-0 gap-2">
          <button
            ref="declineBtn"
            type="button"
            class="btn-secondary"
            aria-label="Decline analytics cookies"
            @click="deny"
          >
            Decline
          </button>
          <button
            type="button"
            class="btn-primary"
            aria-label="Accept analytics cookies"
            @click="grant"
          >
            Accept Analytics
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
