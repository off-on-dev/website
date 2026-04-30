import { describe, it, expect } from "vitest";
import { buildPageMeta } from "@/lib/meta";
import { BRAND_NAME, SITE_URL } from "@/data/constants";

const BASE = {
  title: "Test Page - OffOn",
  description: "A short test description under 160 characters.",
  url: "https://offon.dev/test/",
};

describe("buildPageMeta", () => {
  describe("output shape", () => {
    it("returns exactly 18 descriptors when no extras are given", () => {
      expect(buildPageMeta(BASE)).toHaveLength(18);
    });

    it("appends extra descriptors after the standard set", () => {
      const extra = [{ name: "robots", content: "noindex" }];
      const result = buildPageMeta({ ...BASE, extra });
      expect(result).toHaveLength(19);
      expect(result[result.length - 1]).toEqual({ name: "robots", content: "noindex" });
    });

    it("returns an empty spread when extra is omitted", () => {
      const withoutExtra = buildPageMeta(BASE);
      const withEmptyExtra = buildPageMeta({ ...BASE, extra: [] });
      expect(withoutExtra).toHaveLength(withEmptyExtra.length);
    });
  });

  describe("title", () => {
    it("sets the title descriptor", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ title: BASE.title });
    });

    it("uses title for og:title", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ property: "og:title", content: BASE.title });
    });

    it("uses title for twitter:title", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ name: "twitter:title", content: BASE.title });
    });

    it("uses title for og:image:alt", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ property: "og:image:alt", content: BASE.title });
    });

    it("uses title for twitter:image:alt", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ name: "twitter:image:alt", content: BASE.title });
    });
  });

  describe("description", () => {
    it("sets the meta description", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ name: "description", content: BASE.description });
    });

    it("uses description for og:description", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ property: "og:description", content: BASE.description });
    });

    it("uses description for twitter:description", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ name: "twitter:description", content: BASE.description });
    });
  });

  describe("url", () => {
    it("sets a canonical link tag", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ tagName: "link", rel: "canonical", href: BASE.url });
    });

    it("uses url for og:url", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ property: "og:url", content: BASE.url });
    });

    it("appends trailing slash to url that lacks one", () => {
      const result = buildPageMeta({ ...BASE, url: "https://offon.dev/no-slash" });
      expect(result).toContainEqual({ tagName: "link", rel: "canonical", href: "https://offon.dev/no-slash/" });
      expect(result).toContainEqual({ property: "og:url", content: "https://offon.dev/no-slash/" });
    });

    it("does not double-slash a url that already ends with /", () => {
      const result = buildPageMeta({ ...BASE, url: "https://offon.dev/already/" });
      expect(result).toContainEqual({ tagName: "link", rel: "canonical", href: "https://offon.dev/already/" });
    });
  });

  describe("ogType", () => {
    it("defaults og:type to 'website' when ogType is omitted", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ property: "og:type", content: "website" });
    });

    it("uses the provided ogType when specified", () => {
      const result = buildPageMeta({ ...BASE, ogType: "article" });
      expect(result).toContainEqual({ property: "og:type", content: "article" });
    });
  });

  describe("OG image", () => {
    it("sets og:image to SITE_URL + /og.png", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ property: "og:image", content: `${SITE_URL}/og.png` });
    });

    it("sets og:image:width to '1200'", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ property: "og:image:width", content: "1200" });
    });

    it("sets og:image:height to '630'", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ property: "og:image:height", content: "630" });
    });

    it("sets twitter:image to SITE_URL + /og.png", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ name: "twitter:image", content: `${SITE_URL}/og.png` });
    });
  });

  describe("site identity", () => {
    it("sets og:site_name to BRAND_NAME", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ property: "og:site_name", content: BRAND_NAME });
    });

    it("sets og:locale to 'en_GB'", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ property: "og:locale", content: "en_GB" });
    });

    it("sets twitter:card to 'summary_large_image'", () => {
      const result = buildPageMeta(BASE);
      expect(result).toContainEqual({ name: "twitter:card", content: "summary_large_image" });
    });
  });
});
