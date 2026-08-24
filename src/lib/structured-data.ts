import { SITE_URL, BRAND_NAME, canonicalUrl } from "@/lib/site";

// schema.org objects for adventure, level and solution pages. These field names
// and their nesting are a compatibility surface: Google indexes them for rich
// results, so treat a rename as a breaking change.
//
// The BreadcrumbList is NOT built here. It is derived in StructuredData.astro
// from the same crumb array that renders the visual <Breadcrumb>, so the two
// cannot drift apart.

/** Every schema on this site is provided by the same organization. */
export const SCHEMA_PROVIDER = {
  "@type": "Organization",
  name: BRAND_NAME,
  url: SITE_URL,
} as const;

export type CourseInput = {
  title: string;
  description: string;
  /** Adventure slug, e.g. "echoes-lost-in-orbit". */
  slug: string;
  tags: string[];
};

/** Course schema for an adventure detail page. */
export function courseSchema({ title, description, slug, tags }: CourseInput): Record<string, unknown> {
  return {
    "@type": "Course",
    name: title,
    description,
    url: canonicalUrl(`/adventures/${slug}/`),
    keywords: tags.join(", "),
    provider: SCHEMA_PROVIDER,
  };
}

export type LearningResourceInput = {
  levelName: string;
  description: string;
  slug: string;
  levelId: string;
  difficulty: string;
  /** Level learnings, as authored. Becomes schema.org `teaches`. */
  learnings: string[];
  adventureTitle: string;
};

/** LearningResource schema for a level (challenge) page. */
export function learningResourceSchema({
  levelName,
  description,
  slug,
  levelId,
  difficulty,
  learnings,
  adventureTitle,
}: LearningResourceInput): Record<string, unknown> {
  return {
    "@type": "LearningResource",
    name: levelName,
    description,
    url: canonicalUrl(`/adventures/${slug}/levels/${levelId}/`),
    educationalLevel: difficulty,
    teaches: learnings,
    learningResourceType: "Challenge",
    isPartOf: {
      "@type": "Course",
      name: adventureTitle,
      url: canonicalUrl(`/adventures/${slug}/`),
    },
    provider: SCHEMA_PROVIDER,
  };
}
