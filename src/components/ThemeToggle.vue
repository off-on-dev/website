<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { Sun, Moon } from "lucide-vue-next";
import { $theme, type Theme } from "@/stores/theme";

// Hydration-safe: render the server-default ("dark") on first client render to
// match SSR, then correct from the <html> class (set pre-hydration by the inline
// script in Layout.astro) in onMounted. $theme persists the choice to
// localStorage (key "theme"), which the inline + after-swap scripts read.
const props = withDefaults(defineProps<{ variant?: "desktop" | "mobile" }>(), {
  variant: "mobile",
});

const theme = ref<Theme>("dark");

// Bordered 44x44 control matching the React NavThemeToggle. The desktop variant
// adds a primary-tinted border on hover.
const buttonClass = computed(() =>
  [
    "flex h-11 w-11 items-center justify-center rounded-md border border-border bg-[hsl(var(--surface))] text-foreground/70 hover:text-foreground transition-all focus-ring",
    props.variant === "desktop" ? "hover:border-primary/30" : "",
  ]
    .filter(Boolean)
    .join(" "),
);

let unsubscribe: (() => void) | undefined;

onMounted(() => {
  theme.value = document.documentElement.classList.contains("light") ? "light" : "dark";
  // Keep the desktop + mobile toggle instances in sync: subscribe to the store
  // post-mount so a toggle on one updates the other (they hold independent local
  // refs). Never read $theme at render — it is a persistentAtom that reads
  // localStorage at import time and would mismatch SSR.
  unsubscribe = $theme.listen((value) => {
    theme.value = value;
  });
});

onUnmounted(() => unsubscribe?.());

function toggle(): void {
  const next: Theme = theme.value === "dark" ? "light" : "dark";
  theme.value = next;
  $theme.set(next);
  const c = document.documentElement.classList;
  if (next === "light") {
    c.remove("dark");
    c.add("light");
  } else {
    c.remove("light");
    c.add("dark");
  }
}
</script>

<template>
  <button
    type="button"
    :class="buttonClass"
    :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <Sun v-if="theme === 'dark'" :size="18" aria-hidden="true" />
    <Moon v-else :size="18" aria-hidden="true" />
  </button>
</template>
