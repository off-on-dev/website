import { describe, it, expect } from "vitest";
import { stripHtml } from "@/utils/stripHtml";

describe("stripHtml", () => {
  it("returns plain text unchanged", () => {
    expect(stripHtml("hello world")).toBe("hello world");
  });

  it("strips a single HTML tag", () => {
    expect(stripHtml("<p>hello</p>")).toBe("hello");
  });

  it("strips nested HTML tags", () => {
    expect(stripHtml("<div><strong>bold</strong> and <em>italic</em></div>")).toBe("bold and italic");
  });

  it("returns empty string for empty input", () => {
    expect(stripHtml("")).toBe("");
  });
});
