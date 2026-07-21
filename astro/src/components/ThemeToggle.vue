<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Sun, Moon } from "lucide-vue-next";
import { $theme, type Theme } from "@/stores/theme";

// Hydration-safe: render the server-default ("dark") on first client render to
// match SSR, then correct from the <html> class (set pre-hydration by the inline
// script in Layout.astro) in onMounted. $theme persists the choice to
// localStorage (key "theme"), which the inline + after-swap scripts read.
const theme = ref<Theme>("dark");

onMounted(() => {
  theme.value = document.documentElement.classList.contains("light") ? "light" : "dark";
});

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
    class="focus-ring rounded-sm p-2 text-dim hover:text-foreground"
    :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <Sun v-if="theme === 'dark'" :size="18" aria-hidden="true" />
    <Moon v-else :size="18" aria-hidden="true" />
  </button>
</template>
