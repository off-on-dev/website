// Pure, framework-agnostic derivations ported from scripts/generate-adventures.mjs.
// Shared by the content loader (content.config.ts) and the verification gate so
// the gate exercises the real code, not a copy.

import { LEVEL_DIFFICULTY_BY_EMOJI } from "./level-constants.mjs";

const BRAND_NAME = "OffOn";

/** Strip common markdown syntax so strings are safe for plain-text meta descriptions. */
export function stripMarkdown(str) {
  if (!str) return "";
  return str
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

/** Truncate at the last word boundary before `max` chars and append "...". */
export function truncate(str, max) {
  if (str.length <= max) return str;
  const cut = str.lastIndexOf(" ", max - 3);
  return cut > max / 2 ? str.slice(0, cut) + "..." : str.slice(0, max);
}

/** Synthesize a level meta description from YAML fields. */
export function buildLevelMetaDescription(level) {
  const name = level.name ?? level.title;
  const difficulty = level.difficulty ?? LEVEL_DIFFICULTY_BY_EMOJI[level.emoji];
  const rawIntro = Array.isArray(level.intro) ? level.intro[0] : level.summary || "";
  const intro = stripMarkdown(rawIntro);
  const topics = (level.topics || []).join(", ");
  const base = `${name}: ${intro}`;
  const suffix = ` A ${difficulty.toLowerCase()} ${topics} challenge on ${BRAND_NAME}.`;
  if (base.length + suffix.length <= 160) return base + suffix;
  return truncate(base, 160);
}

/** Synthesize an adventure meta description from YAML fields. */
export function buildAdventureMetaDescription(data) {
  const title = data.title ?? data.name;
  if (data.overview && data.overview.length > 0) {
    return truncate(stripMarkdown(data.overview[0]), 160);
  }
  const tags = (data.tags || []).slice(0, 3).join(", ");
  return truncate(`${title}: a hands-on ${tags} adventure on ${BRAND_NAME}.`, 160);
}

/** Build the markdown body of the injected "Explore the UIs" how_to_play step,
 *  or null when there are no externally accessible services. */
export function buildServicesStepBody(services) {
  if (!services || services.length === 0) return null;
  const accessible = services.filter((s) => !s.internal);
  const internal = services.filter((s) => s.internal);
  if (accessible.length === 0) return null;
  let body = "Open the **Ports** tab and navigate to each service:\n\n";
  for (const svc of accessible) {
    const creds = svc.credentials ? ` (${svc.credentials})` : "";
    body += `- **Port ${String(svc.port)}:** ${svc.name}${creds}. ${svc.description}\n`;
  }
  if (internal.length > 0) {
    body += "\n";
    for (const svc of internal) {
      body += `${svc.name} runs on the docker-internal network only. No port forwarding needed.\n`;
    }
  }
  return body.trim();
}
