import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MarkdownInline } from "@/components/MarkdownInline";

describe("MarkdownInline", () => {
  it("renders inline code from backticks", () => {
    const { container } = render(<MarkdownInline source="familiarity with `kubectl` helps" />);
    const code = container.querySelector("code");
    expect(code).not.toBeNull();
    expect(code?.textContent).toBe("kubectl");
  });

  it("renders bold from **markdown**", () => {
    const { container } = render(<MarkdownInline source="**important** stuff" />);
    expect(container.querySelector("strong")?.textContent).toBe("important");
  });

  it("renders inline links with external target", () => {
    const { container } = render(<MarkdownInline source="see [docs](https://example.com)" />);
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("https://example.com");
    expect(link?.getAttribute("target")).toBe("_blank");
    expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("passes plain text through unchanged", () => {
    const { container } = render(<MarkdownInline source="just plain text" />);
    expect(container.textContent).toBe("just plain text");
    expect(container.querySelector("code")).toBeNull();
    expect(container.querySelector("strong")).toBeNull();
  });

  it("does not wrap output in a <p> tag", () => {
    const { container } = render(<MarkdownInline source="hello" />);
    expect(container.querySelector("p")).toBeNull();
  });

  it("strips disallowed block elements (headings, lists)", () => {
    const { container } = render(<MarkdownInline source={"# heading\n\n- item"} />);
    expect(container.querySelector("h1")).toBeNull();
    expect(container.querySelector("ul")).toBeNull();
    expect(container.querySelector("li")).toBeNull();
  });

  it("blocks dangerous javascript: URLs", () => {
    const { container } = render(<MarkdownInline source="[click](javascript:alert(1))" />);
    // react-markdown sanitizes javascript: hrefs to undefined and the custom
    // renderer also has a defensive check. Either way, no executable href ships.
    const link = container.querySelector("a");
    const href = link?.getAttribute("href") ?? "";
    expect(href.toLowerCase()).not.toContain("javascript:");
  });

  describe("noLinks", () => {
    it("renders link text as plain text and omits the <a> element", () => {
      const { container } = render(
        <MarkdownInline source="see [docs](https://example.com) for more" noLinks />
      );
      expect(container.querySelector("a")).toBeNull();
      expect(container.textContent).toBe("see docs for more");
    });

    it("still renders inline formatting (bold, code) when links are stripped", () => {
      const { container } = render(
        <MarkdownInline source="**bold** and `code` and [link](https://example.com)" noLinks />
      );
      expect(container.querySelector("strong")?.textContent).toBe("bold");
      expect(container.querySelector("code")?.textContent).toBe("code");
      expect(container.querySelector("a")).toBeNull();
    });
  });
});
