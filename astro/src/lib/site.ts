// Site-level constants. Mirror of the relevant entries in src/data/constants.ts;
// at cutover, pages import from the real constants module.
export const SITE_URL = "https://offon.dev";
export const SITE_NAME = "offon.dev";
export const BRAND_NAME = "OffOn";
export const OG_IMAGE_ALT =
  "OffOn logo and tagline: always On. always Open. with Nyx, the firefly mascot";

/** Canonical URL for a path: SITE_URL + path, normalized to a trailing slash
 *  (GitHub Pages 301-redirects directory routes to the trailing-slash form). */
export function canonicalUrl(path: string): string {
  const withSlash = path.endsWith("/") ? path : `${path}/`;
  return `${SITE_URL}${withSlash}`;
}
