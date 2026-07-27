import { persistentAtom } from "@nanostores/persistent";

export type Theme = "dark" | "light";

// localStorage-backed, key "theme" (must match the inline pre-hydration script
// in Layout.astro). SSR renders the default "dark"; the client rehydrates.
//
// HYDRATION INVARIANT: this is a persistentAtom, so it reads localStorage at
// import time — on the client it can already be "light" while SSR emitted the
// "dark" default. NEVER read $theme in an island render body (e.g. useStore in a
// template) or a hydration mismatch results for light-mode users. Islands must
// seed a local ref to the server default and read the real value in onMounted
// (see ThemeToggle.vue), then use $theme.listen/.set only for cross-instance
// sync. persistentAtom is intentional here: it also owns the localStorage write
// on .set(), so toggle() doesn't write storage itself (unlike the plain-atom
// $consent, which writes manually).
export const $theme = persistentAtom<Theme>("theme", "dark", {
  encode: String,
  decode: (value) => (value === "light" ? "light" : "dark"),
});
