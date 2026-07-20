import { describe, it, expect } from "vitest";
import { Layers, Wrench, ListChecks } from "lucide-react";
import { slugify, getSectionIcon, stripHtml } from "@/lib/markdown";

describe("slugify", () => {
  it("lowercases text", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("how to play")).toBe("how-to-play");
  });

  it("collapses multiple spaces into a single hyphen", () => {
    expect(slugify("a  b   c")).toBe("a-b-c");
  });

  it("strips non-alphanumeric characters except hyphens", () => {
    expect(slugify("C++ & Java!")).toBe("c-java");
  });

  it("preserves existing hyphens", () => {
    expect(slugify("step-by-step")).toBe("step-by-step");
  });

  it("trims leading and trailing whitespace", () => {
    expect(slugify("  trimmed  ")).toBe("trimmed");
  });

  it("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(slugify("   ")).toBe("");
  });
});

describe("getSectionIcon", () => {
  it("returns Layers for 'architecture'", () => {
    expect(getSectionIcon("architecture")).toBe(Layers);
  });

  it("returns Wrench for 'toolbox'", () => {
    expect(getSectionIcon("toolbox")).toBe(Wrench);
  });

  it("returns ListChecks for 'how-to-play'", () => {
    expect(getSectionIcon("how-to-play")).toBe(ListChecks);
  });

  it("returns undefined for unknown slugs", () => {
    expect(getSectionIcon("unknown-section")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(getSectionIcon("")).toBeUndefined();
  });
});

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<p>hello <strong>world</strong></p>")).toBe("hello world");
  });

  it("decodes named entities", () => {
    expect(stripHtml("foo &amp; bar &lt;baz&gt;")).toBe("foo & bar <baz>");
  });

  it("decodes decimal numeric entities", () => {
    expect(stripHtml("zero-width&#8203;space")).toBe("zero-width​space");
  });

  it("decodes hex numeric entities", () => {
    expect(stripHtml("em&#x2014;dash")).toBe("em—dash");
  });

  it("does not double-decode mixed entities", () => {
    // rehype-stringify encodes a literal & as &amp;; if the source text had &lt;
    // that would arrive as &amp;lt;, so single-pass should yield &lt;, not <.
    expect(stripHtml("&amp;lt;")).toBe("&lt;");
  });

  it("strips tags and decodes entities together", () => {
    expect(stripHtml("<p>React &amp; friends</p>")).toBe("React & friends");
  });

  it("decodes typographic named entities", () => {
    expect(stripHtml("left&ldquo;quote&rdquo;right")).toBe("left“quote”right");
  });

  it("returns plain text unchanged", () => {
    expect(stripHtml("hello world")).toBe("hello world");
  });

  it("handles empty string", () => {
    expect(stripHtml("")).toBe("");
  });

  it("leaves out-of-range numeric entities unchanged instead of throwing", () => {
    expect(stripHtml("&#2000000;")).toBe("&#2000000;");
    expect(stripHtml("&#x1FFFFF;")).toBe("&#x1FFFFF;");
  });
});
