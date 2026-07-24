import type { App } from "vue";

// Vue appEntrypoint: runs once per island before mount. Register app-wide Vue
// plugins / global components here (e.g. a nanostores binding or Reka UI global
// config). Kept minimal in the scaffold; islands import Reka primitives directly.
export default (_app: App): void => {
  // Intentionally empty for Phase 1. Global registrations land with the islands.
};
