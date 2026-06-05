import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { InlineProse, BLOCK_ELEMENT_RE } from "@/components/InlineProse";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

// Every block element covered by BLOCK_ELEMENT_RE, with a representative HTML
// string that begins with that element's opening tag.
const BLOCK_CASES: { element: string; html: string }[] = [
  { element: "p", html: "<p>A paragraph.</p>" },
  { element: "ul", html: "<ul><li>item</li></ul>" },
  { element: "ol", html: "<ol><li>item</li></ol>" },
  { element: "blockquote", html: "<blockquote>quoted text</blockquote>" },
  { element: "h1", html: "<h1>Heading one</h1>" },
  { element: "h2", html: "<h2>Heading two</h2>" },
  { element: "h3", html: "<h3>Heading three</h3>" },
  { element: "h4", html: "<h4>Heading four</h4>" },
  { element: "h5", html: "<h5>Heading five</h5>" },
  { element: "h6", html: "<h6>Heading six</h6>" },
  { element: "pre", html: '<pre tabindex="0">code block</pre>' },
  { element: "table", html: "<table><tbody><tr><td>cell</td></tr></tbody></table>" },
  { element: "hr", html: "<hr>" },
  { element: "figure", html: "<figure><figcaption>caption</figcaption></figure>" },
  { element: "div", html: "<div>block content</div>" },
];

// Inline-only HTML that must never trigger the block path.
const INLINE_CASES: { label: string; html: string }[] = [
  { label: "plain text", html: "just plain text" },
  { label: "<em>", html: "<em>emphasis</em>" },
  { label: "<strong>", html: "<strong>bold text</strong>" },
  { label: "<a>", html: '<a href="https://example.com">a link</a>' },
  { label: "<code>", html: "<code>inline code</code>" },
  { label: "mixed inline", html: "text with <strong>bold</strong> and <em>em</em>" },
];

// ---------------------------------------------------------------------------
// Block HTML → <div className="md-content">
// ---------------------------------------------------------------------------

describe("InlineProse - block HTML renders div.md-content", () => {
  for (const { element, html } of BLOCK_CASES) {
    it(`<${element}> → div with md-content`, () => {
      const { container } = render(<InlineProse html={html} />);
      const el = container.firstElementChild!;
      expect(el.tagName.toLowerCase()).toBe("div");
      expect(el.className).toContain("md-content");
    });

    it(`<${element}> → does not render a <p>`, () => {
      const { container } = render(<InlineProse html={html} />);
      expect(container.firstElementChild!.tagName.toLowerCase()).not.toBe("p");
    });
  }
});

// ---------------------------------------------------------------------------
// Inline-only HTML → <p className="md-inline">
// ---------------------------------------------------------------------------

describe("InlineProse - inline-only HTML renders p.md-inline", () => {
  for (const { label, html } of INLINE_CASES) {
    it(`${label} → p with md-inline`, () => {
      const { container } = render(<InlineProse html={html} />);
      const el = container.firstElementChild!;
      expect(el.tagName.toLowerCase()).toBe("p");
      expect(el.className).toContain("md-inline");
    });

    it(`${label} → does not render a <div>`, () => {
      const { container } = render(<InlineProse html={html} />);
      expect(container.firstElementChild!.tagName.toLowerCase()).not.toBe("div");
    });
  }
});

// ---------------------------------------------------------------------------
// className: passed utilities come first, md-* class is appended last
// ---------------------------------------------------------------------------

describe("InlineProse - className ordering and preservation", () => {
  it("md-inline is the last class for inline content with className", () => {
    const { container } = render(
      <InlineProse html="plain text" className="text-sm text-secondary" />
    );
    const el = container.firstElementChild!;
    expect(el.className).toBe("text-sm text-secondary md-inline");
  });

  it("md-content is the last class for block content with className", () => {
    const { container } = render(
      <InlineProse html="<p>block</p>" className="text-sm text-secondary" />
    );
    const el = container.firstElementChild!;
    expect(el.className).toBe("text-sm text-secondary md-content");
  });

  it("class string starts with the passed className, not with md-*", () => {
    const { container } = render(
      <InlineProse html="plain text" className="leading-relaxed" />
    );
    const el = container.firstElementChild!;
    expect(el.className.startsWith("leading-relaxed")).toBe(true);
    expect(el.className.endsWith("md-inline")).toBe(true);
  });

  it("renders only md-inline when no className is passed (inline content)", () => {
    const { container } = render(<InlineProse html="plain text" />);
    expect(container.firstElementChild!.className).toBe("md-inline");
  });

  it("renders only md-content when no className is passed (block content)", () => {
    const { container } = render(<InlineProse html="<p>block</p>" />);
    expect(container.firstElementChild!.className).toBe("md-content");
  });

  it("does not add a leading space when no className is passed", () => {
    const { container } = render(<InlineProse html="plain text" />);
    expect(container.firstElementChild!.className).not.toMatch(/^\s/);
  });
});

// ---------------------------------------------------------------------------
// BLOCK_ELEMENT_RE export: direct regex contract
// ---------------------------------------------------------------------------

const ALL_BLOCK_TAGS = [
  "p", "ul", "ol", "blockquote",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "pre", "table", "hr", "figure", "div",
];
const ALL_INLINE_TAGS = ["em", "strong", "a", "span", "code", "abbr", "mark"];

describe("BLOCK_ELEMENT_RE - matches all block element opening tags", () => {
  for (const tag of ALL_BLOCK_TAGS) {
    it(`matches <${tag}>`, () => {
      expect(BLOCK_ELEMENT_RE.test(`<${tag}>`)).toBe(true);
    });

    it(`matches <${tag} with attributes`, () => {
      expect(BLOCK_ELEMENT_RE.test(`<${tag} class="foo">`)).toBe(true);
    });
  }
});

describe("BLOCK_ELEMENT_RE - does not match inline element tags", () => {
  for (const tag of ALL_INLINE_TAGS) {
    it(`does not match <${tag}>`, () => {
      expect(BLOCK_ELEMENT_RE.test(`<${tag}>`)).toBe(false);
    });
  }
});

describe("BLOCK_ELEMENT_RE - boundary conditions", () => {
  it("does not match empty string", () => {
    expect(BLOCK_ELEMENT_RE.test("")).toBe(false);
  });

  it("does not match plain text with no tags", () => {
    expect(BLOCK_ELEMENT_RE.test("just plain prose")).toBe(false);
  });

  it("matches when block tag appears anywhere in the string", () => {
    expect(BLOCK_ELEMENT_RE.test("text before <p>paragraph</p> text after")).toBe(true);
  });

  it("does not false-positive on a word starting with a block tag name (e.g. 'preview')", () => {
    // 'pre' in 'preview' — \b prevents the match
    expect(BLOCK_ELEMENT_RE.test("<preview>")).toBe(false);
  });

  it("does not false-positive on 'divide' starting with 'div'", () => {
    expect(BLOCK_ELEMENT_RE.test("<divide>")).toBe(false);
  });

  it("does not false-positive on 'paragraph' starting with 'p'", () => {
    expect(BLOCK_ELEMENT_RE.test("<paragraph>")).toBe(false);
  });
});
