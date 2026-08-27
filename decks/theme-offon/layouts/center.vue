<template>
  <div class="slidev-layout center-layout">
    <slot />
  </div>
</template>

<style scoped>
.center-layout {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.center-layout :deep(.cobrand) { justify-content: center; margin-bottom: 0.6em; }
.center-layout :deep(.cobrand img) { height: 54px; }
.center-layout :deep(.cobrand .partner) { font-size: 0.72em; }
.center-layout :deep(.cobrand .xsep) { font-size: 0.85em; }
.center-layout :deep(h2) { font-size: 1.4em; margin-bottom: 0.3em; color: var(--amber); }
.center-layout :deep(.label) {
  display: block;
  font-size: 0.46em;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--amber);
  margin-bottom: 0.5em;
}
</style>
