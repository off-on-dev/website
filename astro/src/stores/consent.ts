import { persistentAtom } from "@nanostores/persistent";

export type Consent = "granted" | "denied" | null;

// localStorage-backed, key "analytics_consent". `null` (undecided) is stored as
// the empty string so absence is representable. Consumed by the consent island
// and the gtag injector in Phase 4.
export const $consent = persistentAtom<Consent>("analytics_consent", null, {
  encode: (value) => value ?? "",
  decode: (value) =>
    value === "granted" ? "granted" : value === "denied" ? "denied" : null,
});
