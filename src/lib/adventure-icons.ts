// Canonical adventure icon registry.
// Icon names are Lucide PascalCase; this file is the single source of truth
// for the emoji→icon and PascalCase→kebab mappings used across the codebase.

export type AdventureIconName =
  | "Building2"
  | "Cloud"
  | "Compass"
  | "FlaskConical"
  | "Satellite"
  | "Scale"
  | "Telescope";

/** Maps legacy adventure emoji fields to their Lucide icon names. */
export const EMOJI_TO_ICON = {
  "🧪": "FlaskConical",
  "🔭": "Telescope",
  "☁️": "Cloud",
  "🛰️": "Satellite",
  "⚖️": "Scale",
  "🧭": "Compass",
} satisfies Record<string, AdventureIconName>;

/** Maps Lucide PascalCase icon names to their kebab-case keys in LUCIDE_ICONS. */
export const ICON_TO_KEBAB: Record<AdventureIconName, string> = {
  Building2: "building-2",
  Cloud: "cloud",
  Compass: "compass",
  FlaskConical: "flask-conical",
  Satellite: "satellite",
  Scale: "scale",
  Telescope: "telescope",
};
