import { describe, it, expect } from "vitest";
import { Layers, Wrench, ListChecks } from "lucide-react";
import { slugify, getSectionIcon } from "@/lib/markdown";

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
