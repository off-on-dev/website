/**
 * Application-wide constants
 */

export const BRAND_NAME = "OffOn";

export const COMMUNITY_URL = "https://community.open-ecosystem.com";
export const COMMUNITY_DISPLAY_NAME = "community.offon.dev";

export const CODESPACES_BASE = "https://codespaces.new/dynatrace-oss/open-ecosystem-challenges";

export const SITE_URL = "https://offon.dev";
export const SITE_NAME = "offon.dev";

export const GA_MEASUREMENT_ID = "G-YEYE9DFHWE";

export const LINKEDIN_URL = "https://www.linkedin.com/company/open-ecosystem/";
export const BLUESKY_URL = "https://bsky.app/profile/off-on-dev.bsky.social";
export const X_URL = "https://x.com/OffonDev";

export const CONSENT_STORAGE_KEY = "analytics_consent";
export const CONSENT_EXPIRY_MS = 1000 * 60 * 60 * 24 * 180;

export const THEME_STORAGE_KEY = "theme";

export const CURRENT_YEAR = 2026; // Update manually each year

export const CONTACT_EMAIL = "offondev@gmail.com";

export const BRAND_SLOGAN_PARTS = ["Vendor-Neutral", "Open Source", "Community-Driven"] as const;
export const BRAND_SLOGAN = BRAND_SLOGAN_PARTS.join(". ");

export const BRAND_SECONDARY_LINE_WORD = "always";
export const BRAND_SECONDARY_LINE_PARTS = [
	`${BRAND_SECONDARY_LINE_WORD} On.`,
	`${BRAND_SECONDARY_LINE_WORD} Open.`,
	`${BRAND_SECONDARY_LINE_WORD} Learning.`,
] as const;
export const BRAND_SECONDARY_LINE = `${BRAND_SECONDARY_LINE_PARTS[0]} ${BRAND_SECONDARY_LINE_PARTS[1]} ${BRAND_SECONDARY_LINE_PARTS[2]}`;

export const BRAND_SHORT_DESCRIPTION = "A vendor-neutral community for open source enthusiasts. Learn through hands-on challenges, share what you know, and connect with people who love open source.";
