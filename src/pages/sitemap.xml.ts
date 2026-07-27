import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getChallengeData, tagToSlug } from "@/lib/challenges";
import { getSolutions } from "@/lib/solutions";
import { isDeadlinePast } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";

// Generated at build time from the content collection + static routes. Replaces
// the hand-maintained public/sitemap.xml. `/privacy/` and `/presentation-templates/`
// are noindex and excluded; `/404/` is excluded.
export const GET: APIRoute = async () => {
  const adventures = (await getCollection("adventures")).map((a) => a.data);
  const { tags } = getChallengeData(adventures);
  // No <lastmod>: every build runs at a fresh timestamp, so a build-time date
  // would falsely mark every URL as changed on every deploy, training crawlers
  // to distrust the signal. Omitting it is more honest than a per-build "now".

  const staticPaths = [
    "/",
    "/adventures/",
    "/challenges/",
    "/about/",
    "/accessibility/",
    "/brand/",
    "/contribute/",
    "/handbook/",
    "/sponsors/",
  ];
  const adventurePaths = adventures.flatMap((a) => [
    `/adventures/${a.slug}/`,
    ...a.levels.map((l) => `/adventures/${a.slug}/levels/${l.id}/`),
  ]);
  const solutionPaths = getSolutions()
    .filter((s) => {
      const adventure = adventures.find((a) => a.slug === s.adventureId);
      const level = adventure?.levels.find((l) => l.id === s.levelId);
      const deadline = level?.deadline ?? adventure?.rewards?.deadline;
      return !deadline || isDeadlinePast(deadline);
    })
    .map((s) => `/adventures/${s.adventureId}/levels/${s.levelId}/solution/`);
  const tagPaths = tags.map((t) => `/challenges/${tagToSlug(t)}/`);

  const paths = [...staticPaths, ...adventurePaths, ...solutionPaths, ...tagPaths];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join("\n") +
    `\n</urlset>\n`;

  return new Response(body, { headers: { "Content-Type": "application/xml" } });
};
