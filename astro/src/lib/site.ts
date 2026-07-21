// Site-level constants. Mirror of the relevant entries in src/data/constants.ts;
// at cutover, pages import from the real constants module.
export const SITE_URL = "https://offon.dev";
export const SITE_NAME = "offon.dev";
export const BRAND_NAME = "OffOn";
export const OG_IMAGE_ALT =
  "OffOn logo and tagline: always On. always Open. with Nyx, the firefly mascot";

export const COMMUNITY_URL = "https://community.offon.dev";
export const COMMUNITY_DISPLAY_NAME = "community.offon.dev";
export const CODE_OF_CONDUCT_URL = `${COMMUNITY_URL}/t/code-of-conduct/31`;
export const CONTACT_EMAIL = "offondev@gmail.com";
export const LINKEDIN_URL = "https://www.linkedin.com/company/offondev";
export const BLUESKY_URL = "https://bsky.app/profile/off-on-dev.bsky.social";
export const X_URL = "https://x.com/OffonDev";
export const CURRENT_YEAR = 2026;
export const BRAND_SHORT_DESCRIPTION =
  "A welcoming open source community to learn through hands-on challenges, share knowledge, and build together.";

/** Canonical URL for a path: SITE_URL + path, normalized to a trailing slash
 *  (GitHub Pages 301-redirects directory routes to the trailing-slash form). */
export function canonicalUrl(path: string): string {
  const withSlash = path.endsWith("/") ? path : `${path}/`;
  return `${SITE_URL}${withSlash}`;
}
