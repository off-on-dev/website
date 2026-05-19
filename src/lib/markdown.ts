import type { LucideIcon } from "lucide-react";
import { Layers, Wrench, ListChecks } from "lucide-react";

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const sectionIcons: Record<string, LucideIcon> = {
  architecture: Layers,
  toolbox: Wrench,
  "how-to-play": ListChecks,
};

export const getSectionIcon = (slug: string): LucideIcon | undefined =>
  sectionIcons[slug];
