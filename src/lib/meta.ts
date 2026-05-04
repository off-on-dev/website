import { BRAND_NAME, SITE_URL } from "@/data/constants";

type MetaDescriptor = Record<string, string>;

type PageMetaOptions = {
  title: string;
  description: string;
  url: string;
  ogType?: string;
  extra?: MetaDescriptor[];
};

/**
 * Generates standard title, canonical, Open Graph, and Twitter meta tags for a page.
 * Canonical URLs are normalized to end with `/` to match GitHub Pages' 301 redirects for directory routes.
 * @param options - Page meta options; `url` should be built from the `SITE_URL` constant.
 * @returns Array of MetaDescriptor objects for use in a route's `meta()` export.
 */
export const buildPageMeta = ({
  title,
  description,
  url,
  ogType = "website",
  extra = [],
}: PageMetaOptions): MetaDescriptor[] => {
  // GitHub Pages 301-redirects /path to /path/ for directory-based routes.
  // Normalize all canonical URLs to end with / to match the served URL.
  const canonicalUrl = url.endsWith("/") ? url : `${url}/`;
  return [
  { title },
  { tagName: "link", rel: "canonical", href: canonicalUrl },
  { name: "description", content: description },
  { property: "og:title", content: title },
  { property: "og:description", content: description },
  { property: "og:type", content: ogType },
  { property: "og:url", content: canonicalUrl },
  { property: "og:image", content: `${SITE_URL}/og.png` },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:image:alt", content: title },
  { property: "og:site_name", content: BRAND_NAME },
  { property: "og:locale", content: "en_GB" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: title },
  { name: "twitter:description", content: description },
  { name: "twitter:image", content: `${SITE_URL}/og.png` },
  { name: "twitter:image:alt", content: title },
  ...extra,
  ];
};
