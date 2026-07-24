import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getChallengeData, tagToSlug } from "@/lib/challenges";
import { getSolutions } from "@/lib/solutions";
import { SITE_URL } from "@/lib/site";

// Generated at build time from the content collection + static routes. Replaces
// the hand-maintained public/sitemap.xml. `/privacy/` and `/presentation-templates/`
// are noindex and excluded; `/404/` is excluded.
export const GET: APIRoute = async () => {
  const adventures = (await getCollection("adventures")).map((a) => a.data);
  const { tags } = getChallengeData(adventures);
  const lastmod = new Date().toISOString().slice(0, 10);

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
  const solutionPaths = getSolutions().map(
    (s) => `/adventures/${s.adventureId}/levels/${s.levelId}/solution/`,
  );
  const tagPaths = tags.map((t) => `/challenges/${tagToSlug(t)}/`);

  const paths = [...staticPaths, ...adventurePaths, ...solutionPaths, ...tagPaths];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths.map((p) => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`;

  return new Response(body, { headers: { "Content-Type": "application/xml" } });
};
