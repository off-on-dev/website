import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AdventureCard } from "@/components/AdventureCard";
import type { AdventureCardSummary } from "@/data/adventures";

const summary: AdventureCardSummary = {
  id: "test-adventure",
  title: "Test Adventure",
  month: "JAN 2026",
  story: "join the guild and use [tooling](https://example.com) to **win**",
  tags: ["a", "b"],
  contributor: { name: "Test Contributor" },
  levels: [
    { id: "beginner", name: "Beginner", difficulty: "beginner", topics: [], learnings: [] },
  ],
};

describe("AdventureCard", () => {
  it("aria-label combines title, difficulties, and tags for AT link navigation", () => {
    const { container } = render(
      <MemoryRouter>
        <AdventureCard adventure={summary} />
      </MemoryRouter>
    );
    const link = container.querySelector("a[href='/adventures/test-adventure/']");
    expect(link?.getAttribute("aria-label")).toBe("Test Adventure — beginner — a, b");
  });

  it("aria-label omits tags section when adventure has no tags", () => {
    const noTags = { ...summary, tags: [] };
    const { container } = render(
      <MemoryRouter>
        <AdventureCard adventure={noTags} />
      </MemoryRouter>
    );
    const link = container.querySelector("a[href='/adventures/test-adventure/']");
    expect(link?.getAttribute("aria-label")).toBe("Test Adventure — beginner");
  });

  it("never renders a nested <a> inside the outer card link, even when story contains a markdown link", () => {
    const { container } = render(
      <MemoryRouter>
        <AdventureCard adventure={summary} />
      </MemoryRouter>
    );
    const outerLink = container.querySelector("a[href='/adventures/test-adventure/']");
    expect(outerLink).not.toBeNull();
    expect(outerLink?.querySelectorAll("a")).toHaveLength(0);
  });

  it("renders the story as plain text without processing markdown syntax", () => {
    const { container } = render(
      <MemoryRouter>
        <AdventureCard adventure={summary} />
      </MemoryRouter>
    );
    // Raw markdown syntax must appear as-is. AdventureCard does not load react-markdown.
    // The generator warns at build time if a story contains markdown, so this tests the
    // fallback rendering path for any story that slips through with syntax characters.
    expect(container.querySelector("p.line-clamp-2")?.textContent).toContain(
      "join the guild and use [tooling](https://example.com) to **win**"
    );
  });

  it("does not render markdown elements (no <strong>, no nested <a>) in the story", () => {
    const { container } = render(
      <MemoryRouter>
        <AdventureCard adventure={summary} />
      </MemoryRouter>
    );
    expect(container.querySelector("p.line-clamp-2 strong")).toBeNull();
    expect(container.querySelector("p.line-clamp-2 a")).toBeNull();
  });
});
