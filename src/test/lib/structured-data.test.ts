// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Shape contract for the page-level JSON-LD. Google indexes these field names
// and their nesting for rich results, so they are a compatibility surface
// rather than an implementation detail.

import { describe, it, expect } from "vitest";
import { courseSchema, learningResourceSchema, SCHEMA_PROVIDER } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/site";

describe("SCHEMA_PROVIDER", () => {
  it("is an @id reference to the canonical organization", () => {
    expect(SCHEMA_PROVIDER).toEqual({ "@id": `${SITE_URL}/#organization` });
  });
});

describe("courseSchema", () => {
  const course = courseSchema({
    title: "Echoes Lost in Orbit",
    description: "A hands-on adventure.",
    slug: "echoes-lost-in-orbit",
    tags: ["Argo CD", "Prometheus"],
  });

  it("emits a Course with the canonical adventure URL and a stable @id", () => {
    expect(course["@type"]).toBe("Course");
    expect(course["@id"]).toBe(`${SITE_URL}/adventures/echoes-lost-in-orbit/`);
    expect(course.url).toBe(`${SITE_URL}/adventures/echoes-lost-in-orbit/`);
  });

  it("joins tags into a comma-separated keywords string", () => {
    expect(course.keywords).toBe("Argo CD, Prometheus");
  });

  it("omits keywords entirely when the adventure has no tags", () => {
    const noTags = courseSchema({ title: "T", description: "D", slug: "s", tags: [] });
    expect(noTags.keywords).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(noTags, "keywords")).toBe(false);
  });

  it("carries name, description and provider", () => {
    expect(course.name).toBe("Echoes Lost in Orbit");
    expect(course.description).toBe("A hands-on adventure.");
    expect(course.provider).toEqual(SCHEMA_PROVIDER);
  });

  it("strips HTML from description", () => {
    const html = courseSchema({
      title: "T",
      description: "Learn <code>kubectl</code> basics",
      slug: "s",
      tags: [],
    });
    expect(html.description).toBe("Learn kubectl basics");
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

  it("emits a LearningResource with the canonical level URL and a stable @id", () => {
    expect(lr["@type"]).toBe("LearningResource");
    expect(lr["@id"]).toBe(`${SITE_URL}/adventures/echoes-lost-in-orbit/levels/beginner/`);
    expect(lr.url).toBe(`${SITE_URL}/adventures/echoes-lost-in-orbit/levels/beginner/`);
  });

  it("maps difficulty to educationalLevel and learnings to teaches", () => {
    expect(lr.educationalLevel).toBe("Beginner");
    expect(lr.teaches).toEqual(["Reading spans", "Tail sampling"]);
    expect(lr.learningResourceType).toBe("Challenge");
  });

  it("strips HTML tags and decodes entities from learnings before emitting teaches", () => {
    const lr2 = learningResourceSchema({
      levelName: "Signal Lost",
      description: "Find the missing traces.",
      slug: "echoes-lost-in-orbit",
      levelId: "beginner",
      difficulty: "Beginner",
      learnings: [
        'How <a href="https://example.com" target="_blank">software templates</a> work',
        "Using <code>fetch:template</code> actions",
      ],
      adventureTitle: "Echoes Lost in Orbit",
    });
    expect(lr2.teaches).toEqual([
      "How software templates work",
      "Using fetch:template actions",
    ]);
  });

  it("strips HTML from description", () => {
    const lr2 = learningResourceSchema({
      levelName: "T",
      description: "Use <code>helm</code> to deploy",
      slug: "s",
      levelId: "beginner",
      difficulty: "Beginner",
      learnings: [],
      adventureTitle: "A",
    });
    expect(lr2.description).toBe("Use helm to deploy");
  });

  it("nests the parent adventure as a Course with @id under isPartOf", () => {
    expect(lr.isPartOf).toEqual({
      "@type": "Course",
      "@id": `${SITE_URL}/adventures/echoes-lost-in-orbit/`,
      name: "Echoes Lost in Orbit",
      url: `${SITE_URL}/adventures/echoes-lost-in-orbit/`,
    });
  });

  it("carries the shared provider reference", () => {
    expect(lr.provider).toEqual(SCHEMA_PROVIDER);
  });
});
