// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Schema shape contract for the restored page-level JSON-LD (P1). The field
// names and nesting here are what Google already indexes from the React build,
// so they are a compatibility surface, not an implementation detail.

import { describe, it, expect } from "vitest";
import { courseSchema, learningResourceSchema, SCHEMA_PROVIDER } from "@/lib/structured-data";
import { SITE_URL, BRAND_NAME } from "@/lib/site";

describe("SCHEMA_PROVIDER", () => {
  it("is an Organization pointing at the canonical site", () => {
    expect(SCHEMA_PROVIDER).toEqual({ "@type": "Organization", name: BRAND_NAME, url: SITE_URL });
  });
});

describe("courseSchema", () => {
  const course = courseSchema({
    title: "Echoes Lost in Orbit",
    description: "A hands-on adventure.",
    slug: "echoes-lost-in-orbit",
    tags: ["Argo CD", "Prometheus"],
  });

  it("emits a Course with the canonical adventure URL", () => {
    expect(course["@type"]).toBe("Course");
    expect(course.url).toBe(`${SITE_URL}/adventures/echoes-lost-in-orbit/`);
  });

  it("joins tags into a comma-separated keywords string", () => {
    expect(course.keywords).toBe("Argo CD, Prometheus");
  });

  it("carries name, description and provider", () => {
    expect(course.name).toBe("Echoes Lost in Orbit");
    expect(course.description).toBe("A hands-on adventure.");
    expect(course.provider).toEqual(SCHEMA_PROVIDER);
  });

  it("emits empty keywords for an adventure with no tags", () => {
    expect(courseSchema({ title: "T", description: "D", slug: "s", tags: [] }).keywords).toBe("");
  });
});

describe("learningResourceSchema", () => {
  const lr = learningResourceSchema({
    levelName: "Signal Lost",
    description: "Find the missing traces.",
    slug: "echoes-lost-in-orbit",
    levelId: "beginner",
    difficulty: "Beginner",
    learnings: ["Reading spans", "Tail sampling"],
    adventureTitle: "Echoes Lost in Orbit",
  });

  it("emits a LearningResource with the canonical level URL", () => {
    expect(lr["@type"]).toBe("LearningResource");
    expect(lr.url).toBe(`${SITE_URL}/adventures/echoes-lost-in-orbit/levels/beginner/`);
  });

  it("maps difficulty to educationalLevel and learnings to teaches", () => {
    expect(lr.educationalLevel).toBe("Beginner");
    expect(lr.teaches).toEqual(["Reading spans", "Tail sampling"]);
    expect(lr.learningResourceType).toBe("Challenge");
  });

  it("nests the parent adventure as a Course under isPartOf", () => {
    expect(lr.isPartOf).toEqual({
      "@type": "Course",
      name: "Echoes Lost in Orbit",
      url: `${SITE_URL}/adventures/echoes-lost-in-orbit/`,
    });
  });

  it("carries the shared provider", () => {
    expect(lr.provider).toEqual(SCHEMA_PROVIDER);
  });
});
