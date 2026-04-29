import { BRAND_NAME, SITE_URL } from "@/data/constants";

type MetaDescriptor = Record<string, string>;

type PageMetaOptions = {
  title: string;
  description: string;
  url: string;
  ogType?: string;
  extra?: MetaDescriptor[];
};

export const buildPageMeta = ({
  title,
  description,
  url,
  ogType = "website",
  extra = [],
}: PageMetaOptions): MetaDescriptor[] => [
  { title },
  { tagName: "link", rel: "canonical", href: url },
  { name: "description", content: description },
  { property: "og:title", content: title },
  { property: "og:description", content: description },
  { property: "og:type", content: ogType },
  { property: "og:url", content: url },
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
