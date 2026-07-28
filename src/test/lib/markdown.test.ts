import { describe, it, expect } from "vitest";
import { stripLinks, stripHtml } from "@/lib/markdown";

describe("stripLinks", () => {
  describe("anchor tag removal", () => {
    it("removes an <a> tag and keeps its text content", () => {
      expect(stripLinks('<a href="/foo">hello</a>')).toBe("hello");
    });

    it("removes multiple <a> tags and keeps each text", () => {
      expect(stripLinks('<a href="/a">one</a> and <a href="/b">two</a>')).toBe(
        "one and two"
      );
    });

    it("handles multiline link content", () => {
      expect(stripLinks("<a href=\"/x\">line 1\nline 2</a>")).toBe(
        "line 1\nline 2"
      );
    });

    it("handles <a> with additional attributes (target, class, rel)", () => {
      expect(
        stripLinks(
          '<a href="/x" class="foo" target="_blank" rel="noopener">label</a>'
        )
      ).toBe("label");
    });

    it("handles nested inline elements inside <a>", () => {
      expect(stripLinks('<a href="/x"><strong>bold</strong></a>')).toBe(
        "<strong>bold</strong>"
      );
    });

    it("leaves non-anchor HTML untouched", () => {
      expect(stripLinks("<p>plain text</p>")).toBe("<p>plain text</p>");
    });
  });

  describe("sr-only span removal", () => {
    it('removes <span class="sr-only"> and its content', () => {
      expect(stripLinks('text<span class="sr-only">opens in new tab</span>')).toBe(
        "text"
      );
    });

    it("removes sr-only span that appears after a link", () => {
      const input =
        '<a href="https://example.com">link</a><span class="sr-only">opens in a new tab</span>';
      expect(stripLinks(input)).toBe("link");
    });
  });

  describe("tabindex attribute removal", () => {
    it("removes tabindex attribute from an element", () => {
      expect(stripLinks('<abbr tabindex="0">CI</abbr>')).toBe(
        "<abbr>CI</abbr>"
      );
    });

    it("removes tabindex with other attributes present", () => {
      const result = stripLinks(
        '<abbr data-title="foo" tabindex="0">CI</abbr>'
      );
      expect(result).not.toContain("tabindex");
      expect(result).toContain("CI");
    });
  });

  describe("aria-describedby attribute removal", () => {
    it("removes aria-describedby attribute from an element", () => {
      expect(stripLinks('<abbr aria-describedby="abbr-foo">CI</abbr>')).toBe(
        "<abbr>CI</abbr>"
      );
    });

    it("removes both tabindex and aria-describedby when both are present", () => {
      const input =
        '<abbr data-title="CI" tabindex="0" aria-describedby="abbr-ci">CI</abbr>';
      const result = stripLinks(input);
      expect(result).not.toContain("tabindex");
      expect(result).not.toContain("aria-describedby");
      expect(result).toContain("CI");
    });
  });

  describe("edge cases", () => {
    it("returns an empty string for empty input", () => {
      expect(stripLinks("")).toBe("");
    });

    it("returns plain text unchanged", () => {
      expect(stripLinks("just plain text")).toBe("just plain text");
    });
  });
});

describe("stripHtml", () => {
  describe("tag removal", () => {
    it("removes a single tag pair and keeps text", () => {
      expect(stripHtml("<p>hello world</p>")).toBe("hello world");
    });

    it("removes nested tags", () => {
      expect(
        stripHtml("<div><p><strong>nested</strong></p></div>")
      ).toBe("nested");
    });

    it("removes self-closing tags", () => {
      expect(stripHtml("line 1<br/>line 2")).toBe("line 1line 2");
    });

    it("removes tags with attributes", () => {
      expect(
        stripHtml('<a href="/foo" class="bar">link text</a>')
      ).toBe("link text");
    });

    it("removes mixed inline tags", () => {
      expect(stripHtml("<p>hello <strong>world</strong></p>")).toBe(
        "hello world"
      );
    });
  });

  describe("named entity decoding", () => {
    it("decodes &amp; to &", () => {
      expect(stripHtml("a &amp; b")).toBe("a & b");
    });

    it("decodes &lt; to <", () => {
      expect(stripHtml("&lt;tag&gt;")).toBe("<tag>");
    });

    it("decodes &gt; to >", () => {
      expect(stripHtml("&gt;")).toBe(">");
    });

    it('decodes &quot; to "', () => {
      expect(stripHtml('say &quot;hi&quot;')).toBe('say "hi"');
    });

    it("decodes &apos; to '", () => {
      expect(stripHtml("it&apos;s")).toBe("it's");
    });

    it("decodes &nbsp; to a regular space", () => {
      expect(stripHtml("a&nbsp;b")).toBe("a b");
    });

    it("decodes &mdash; to em dash", () => {
      expect(stripHtml("one&mdash;two")).toBe("one—two");
    });

    it("decodes &ndash; to en dash", () => {
      expect(stripHtml("one&ndash;two")).toBe("one–two");
    });

    it("decodes &hellip; to ellipsis", () => {
      expect(stripHtml("wait&hellip;")).toBe("wait…");
    });

    it("decodes &ldquo; and &rdquo; to curly double quotes", () => {
      expect(stripHtml("&ldquo;hello&rdquo;")).toBe("“hello”");
    });

    it("decodes &lsquo; and &rsquo; to curly single quotes", () => {
      expect(stripHtml("&lsquo;hello&rsquo;")).toBe("‘hello’");
    });
  });

  describe("numeric entity decoding", () => {
    it("decodes decimal numeric entity &#65; to A", () => {
      expect(stripHtml("&#65;")).toBe("A");
    });

    it("decodes hex numeric entity &#x41; to A", () => {
      expect(stripHtml("&#x41;")).toBe("A");
    });

    it("decodes uppercase hex numeric entity &#X41; to A", () => {
      expect(stripHtml("&#X41;")).toBe("A");
    });

    it("decodes &#9; (tab character)", () => {
      expect(stripHtml("&#9;")).toBe("\t");
    });

    it("decodes &#x1F600; (emoji code point)", () => {
      expect(stripHtml("&#x1F600;")).toBe("😀");
    });
  });

  describe("unrecognized and out-of-range entities", () => {
    it("leaves an unrecognized named entity unchanged", () => {
      expect(stripHtml("&unknownentity;")).toBe("&unknownentity;");
    });

    it("leaves a code point above 0x10FFFF unchanged", () => {
      // 0x110000 is one above the max Unicode code point
      expect(stripHtml("&#1114112;")).toBe("&#1114112;");
    });
  });

  describe("combined stripping and decoding", () => {
    it("strips tags and decodes entities in one expression", () => {
      expect(stripHtml("<em>AT&amp;T</em>")).toBe("AT&T");
    });

    it("handles input with only entities and no tags", () => {
      expect(stripHtml("&lt;not a tag&gt;")).toBe("<not a tag>");
    });
  });

  describe("edge cases", () => {
    it("returns an empty string for empty input", () => {
      expect(stripHtml("")).toBe("");
    });

    it("returns plain text unchanged", () => {
      expect(stripHtml("just text")).toBe("just text");
    });
  });
});
