import { SITE_URL, BRAND_NAME, canonicalUrl } from "@/lib/site";
import { stripHtml } from "@/lib/markdown";

// schema.org objects for adventure, level and solution pages. These field names
// and their nesting are a compatibility surface: Google indexes them for rich
// results, so treat a rename as a breaking change.
//
// The BreadcrumbList is NOT built here. It is derived in StructuredData.astro
// from the same crumb array that renders the visual <Breadcrumb>, so the two
// cannot drift apart.

const ORG_ID = `${SITE_URL}/#organization`;

/**
 * Reference to the canonical OffOn Organization entity. The full definition
 * (name, logo, sameAs) lives in Layout.astro with the same @id, so processors
 * can merge both into one rich graph node.
 */
export const SCHEMA_PROVIDER = {
  "@id": ORG_ID,
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
  const courseUrl = canonicalUrl(`/adventures/${slug}/`);
  return {
    "@type": "Course",
    "@id": courseUrl,
    name: title,
    description: stripHtml(description),
    url: courseUrl,
    ...(tags.length > 0 ? { keywords: tags.join(", ") } : {}),
    provider: SCHEMA_PROVIDER,
  };
}

export type LearningResourceInput = {
  levelName: string;
  description: string;
  slug: string;
  levelId: string;
  difficulty: string;
  /** Level learnings, as pre-rendered HTML. Stripped to plain text for schema. */
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
  const levelUrl = canonicalUrl(`/adventures/${slug}/levels/${levelId}/`);
  const courseUrl = canonicalUrl(`/adventures/${slug}/`);
  return {
    "@type": "LearningResource",
    "@id": levelUrl,
    name: levelName,
    description: stripHtml(description),
    url: levelUrl,
    educationalLevel: difficulty,
    teaches: learnings.map(stripHtml),
    learningResourceType: "Challenge",
    isPartOf: {
      "@type": "Course",
      "@id": courseUrl,
      name: adventureTitle,
      url: courseUrl,
    },
    provider: SCHEMA_PROVIDER,
  };
}
