<template>
  <div class="slidev-layout cover-layout">
    <slot />
  </div>
</template>

<style scoped>
.cover-layout {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 3em 3.2em !important;
}

.cover-layout :deep(.cobrand) {
  gap: 0.8em;
  margin-bottom: 1em;
}
.cover-layout :deep(.cobrand img) { height: 126px; }
.cover-layout :deep(.cobrand .xsep) { font-size: 2em; }
.cover-layout :deep(.cobrand .partner) { font-size: 1.5em; }
</style>
