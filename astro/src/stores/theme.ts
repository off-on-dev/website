import { persistentAtom } from "@nanostores/persistent";

export type Theme = "dark" | "light";

// localStorage-backed, key "theme" (must match the inline pre-hydration script
// in Layout.astro). SSR renders the default "dark"; the client rehydrates.
export const $theme = persistentAtom<Theme>("theme", "dark", {
  encode: String,
  decode: (value) => (value === "light" ? "light" : "dark"),
});
