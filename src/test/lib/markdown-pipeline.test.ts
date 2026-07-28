import { describe, it, expect, vi } from "vitest";
import {
  mdToBlock,
  mdToInline,
  mdToInlineArray,
  mdToBlockArray,
} from "@/lib/markdown-pipeline.mjs";

// ---------------------------------------------------------------------------
// mdToInline
// ---------------------------------------------------------------------------
describe("mdToInline", () => {
  describe("empty and falsy input", () => {
    it("returns empty string for empty string input", async () => {
      expect(await mdToInline("")).toBe("");
    });

    it("returns empty string for null-ish input", async () => {
      // The function guards with `if (!str) return ""`
       
      expect(await mdToInline(null as any)).toBe("");
    });
  });

  describe("inline markdown formatting", () => {
    it("renders **bold** as <strong>", async () => {
      expect(await mdToInline("**bold**")).toBe("<strong>bold</strong>");
    });

    it("renders _italic_ as <em>", async () => {
      expect(await mdToInline("_italic_")).toBe("<em>italic</em>");
    });

    it("renders `code` as <code>", async () => {
      expect(await mdToInline("`code`")).toBe("<code>code</code>");
    });

    it("renders combined bold and italic", async () => {
      const result = await mdToInline("**bold** and _italic_");
      expect(result).toContain("<strong>bold</strong>");
      expect(result).toContain("<em>italic</em>");
    });
  });

  describe("single-paragraph stripping", () => {
    it("strips the outer <p> wrapper when the output is a single paragraph", async () => {
      const result = await mdToInline("simple text");
      expect(result).toBe("simple text");
      expect(result).not.toContain("<p>");
    });

    it("does NOT strip <p> wrappers when there are multiple paragraphs", async () => {
      const result = await mdToInline("para 1\n\npara 2");
      expect(result).toContain("<p>para 1</p>");
      expect(result).toContain("<p>para 2</p>");
    });
  });

  describe("external link annotation", () => {
    it("adds target and rel attributes to external http links", async () => {
      const result = await mdToInline("[example](https://example.com)");
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
      expect(result).toContain('href="https://example.com"');
    });

    it("adds aria-describedby pointing to the new-tab hint", async () => {
      const result = await mdToInline("[link](https://example.com)");
      expect(result).toContain('aria-describedby="new-tab-hint"');
    });

    it("does not add external attributes to relative links", async () => {
      const result = await mdToInline("[page](/about/)");
      expect(result).not.toContain('target="_blank"');
      expect(result).toContain('href="/about/"');
    });

    it("strips non-public localhost URLs and preserves the link text", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = await mdToInline("[local](http://localhost:3000)");
      expect(result).not.toContain("<a");
      expect(result).toContain("local");
      warnSpy.mockRestore();
    });

    it("strips private-network IP URLs (192.168.x.x)", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = await mdToInline(
        "[internal](http://192.168.1.1/dashboard)"
      );
      expect(result).not.toContain("<a");
      expect(result).toContain("internal");
      warnSpy.mockRestore();
    });
  });

  describe("abbreviation expansion", () => {
    it("replaces <abbr title> with data-title and removes the title attribute", async () => {
      const result = await mdToInline(
        '<abbr title="Continuous Integration">CI</abbr>'
      );
      expect(result).toContain('data-title="Continuous Integration"');
      // The original `title` attr (preceded by a space) must be gone;
      // `data-title` is fine (preceded by `data-`, not a space).
      expect(result).not.toMatch(/ title=/);
    });

    it("makes the abbr focusable with tabindex", async () => {
      const result = await mdToInline(
        '<abbr title="Continuous Integration">CI</abbr>'
      );
      expect(result).toContain("tabindex=");
    });

    it("adds aria-describedby pointing to a stable ID", async () => {
      const result = await mdToInline(
        '<abbr title="Continuous Integration">CI</abbr>'
      );
      expect(result).toContain(
        'aria-describedby="abbr-continuous-integration"'
      );
    });

    it("inserts an sr-only span with the expansion text", async () => {
      const result = await mdToInline(
        '<abbr title="Continuous Integration">CI</abbr>'
      );
      expect(result).toContain('class="sr-only"');
      expect(result).toContain("Continuous Integration");
    });

    it("generates a stable ID: same title always yields the same aria-describedby", async () => {
      const r1 = await mdToInline('<abbr title="Pull Request">PR</abbr>');
      const r2 = await mdToInline('<abbr title="Pull Request">PR</abbr>');
      const idMatch1 = r1.match(/aria-describedby="([^"]+)"/)?.[1];
      const idMatch2 = r2.match(/aria-describedby="([^"]+)"/)?.[1];
      expect(idMatch1).toBeDefined();
      expect(idMatch1).toBe(idMatch2);
    });

    it("derives the abbr ID correctly (makeAbbrId: lowercase, strip non-alnum, join with hyphens)", async () => {
      // "Pull Request" -> abbr-pull-request
      const result = await mdToInline('<abbr title="Pull Request">PR</abbr>');
      expect(result).toContain('aria-describedby="abbr-pull-request"');
    });

    it("strips non-alphanumeric characters from the abbr ID", async () => {
      // "CI/CD" -> "cicd" (slash removed) -> abbr-cicd
      const result = await mdToInline('<abbr title="CI/CD">CI/CD</abbr>');
      expect(result).toContain('aria-describedby="abbr-cicd"');
    });

    it("truncates abbr IDs derived from very long titles to 30 chars", async () => {
      const longTitle = "A Very Long Title That Exceeds Thirty Characters";
      const result = await mdToInline(`<abbr title="${longTitle}">X</abbr>`);
      const idMatch = result.match(/aria-describedby="([^"]+)"/)?.[1];
      expect(idMatch).toBeDefined();
      // The part after "abbr-" must be at most 30 characters
      const idBody = idMatch!.replace(/^abbr-/, "");
      expect(idBody.length).toBeLessThanOrEqual(30);
    });
  });

  describe("HTML sanitization", () => {
    it("strips <script> tags and their content", async () => {
      const result = await mdToInline('<script>alert("xss")</script>');
      expect(result).not.toContain("<script");
      expect(result).not.toContain("alert");
    });

    it("strips <style> tags and their content", async () => {
      const result = await mdToInline(
        "<style>body { color: red }</style>"
      );
      expect(result).not.toContain("<style");
      expect(result).not.toContain("color: red");
    });
  });
});

// ---------------------------------------------------------------------------
// mdToBlock
// ---------------------------------------------------------------------------
describe("mdToBlock", () => {
  describe("empty and falsy input", () => {
    it("returns empty string for empty string input", async () => {
      expect(await mdToBlock("")).toBe("");
    });
  });

  describe("block-level markdown elements", () => {
    it("wraps a paragraph in <p> tags", async () => {
      const result = await mdToBlock("hello world");
      expect(result).toBe("<p>hello world</p>");
    });

    it("renders **bold** inside a paragraph", async () => {
      const result = await mdToBlock("**bold**");
      expect(result).toBe("<p><strong>bold</strong></p>");
    });

    it("renders an <h1> for # heading", async () => {
      const result = await mdToBlock("# Heading One");
      expect(result).toBe("<h1>Heading One</h1>");
    });

    it("renders an <h2> for ## heading", async () => {
      const result = await mdToBlock("## Heading Two");
      expect(result).toBe("<h2>Heading Two</h2>");
    });

    it("renders multiple paragraphs separately", async () => {
      const result = await mdToBlock("first\n\nsecond");
      expect(result).toContain("<p>first</p>");
      expect(result).toContain("<p>second</p>");
    });

    it("renders an unordered list", async () => {
      const result = await mdToBlock("- item 1\n- item 2");
      expect(result).toContain("<ul>");
      expect(result).toContain("<li>item 1</li>");
      expect(result).toContain("<li>item 2</li>");
    });
  });

  describe("code block chrome", () => {
    it("wraps a fenced code block in code-block-body structure", async () => {
      const result = await mdToBlock("```javascript\nconst x = 1;\n```");
      expect(result).toContain("code-block-body");
      expect(result).toContain("data-code-block");
    });

    it("shows the language label in the code block header", async () => {
      const result = await mdToBlock("```javascript\nconst x = 1;\n```");
      expect(result).toContain("javascript");
      expect(result).toContain("code-lang-label");
    });

    it("includes a Copy button in the code block header", async () => {
      const result = await mdToBlock("```bash\necho hello\n```");
      expect(result).toContain('aria-label="Copy code"');
      expect(result).toContain("data-copy-code");
    });

    it("preserves the code content inside the block", async () => {
      // rehype-stringify does not HTML-encode single quotes inside <code>
      const result = await mdToBlock("```python\nprint('hi')\n```");
      expect(result).toContain("print('hi')");
    });

    it("falls back to 'code' as the language label when no lang is specified", async () => {
      const result = await mdToBlock("```\ngeneric code\n```");
      // The lang label should contain "code" when no language is provided
      expect(result).toContain(">code<");
    });
  });

  describe("external link annotation", () => {
    it("adds target and rel attributes to external links in block output", async () => {
      const result = await mdToBlock(
        "See [docs](https://docs.example.com) for details."
      );
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });
  });
});

// ---------------------------------------------------------------------------
// mdToInlineArray
// ---------------------------------------------------------------------------
describe("mdToInlineArray", () => {
  it("returns an empty array for empty array input", async () => {
    expect(await mdToInlineArray([])).toEqual([]);
  });

  it("returns an empty array for null/undefined input", async () => {
     
    expect(await mdToInlineArray(null as any)).toEqual([]);
  });

  it("processes each string through mdToInline", async () => {
    const result = await mdToInlineArray(["**bold**", "_italic_"]);
    expect(result[0]).toBe("<strong>bold</strong>");
    expect(result[1]).toBe("<em>italic</em>");
  });

  it("preserves the order of results", async () => {
    const inputs = ["first", "second", "third"];
    const result = await mdToInlineArray(inputs);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe("first");
    expect(result[1]).toBe("second");
    expect(result[2]).toBe("third");
  });
});

// ---------------------------------------------------------------------------
// mdToBlockArray
// ---------------------------------------------------------------------------
describe("mdToBlockArray", () => {
  it("returns an empty array for empty array input", async () => {
    expect(await mdToBlockArray([])).toEqual([]);
  });

  it("returns an empty array for null/undefined input", async () => {
     
    expect(await mdToBlockArray(null as any)).toEqual([]);
  });

  it("processes each string through mdToBlock", async () => {
    const result = await mdToBlockArray(["**bold**", "# Heading"]);
    expect(result[0]).toBe("<p><strong>bold</strong></p>");
    expect(result[1]).toBe("<h1>Heading</h1>");
  });

  it("preserves the order of results", async () => {
    const inputs = ["a", "b", "c"];
    const result = await mdToBlockArray(inputs);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe("<p>a</p>");
    expect(result[1]).toBe("<p>b</p>");
    expect(result[2]).toBe("<p>c</p>");
  });
});
