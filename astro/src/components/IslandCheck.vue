<script setup lang="ts">
import { ref } from "vue";

// Scaffold smoke island: confirms @astrojs/vue + appEntrypoint wiring.
// Replaced by real islands (theme toggle, consent, filters) in Phase 4.
const clicks = ref(0);
</script>

<template>
  <button type="button" class="rounded border px-3 py-1" @click="clicks++">
    island ok: {{ clicks }}
  </button>
</template>
