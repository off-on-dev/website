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
  it("never renders a nested <a> inside the outer card link, even when story contains a markdown link", () => {
    const { container } = render(
      <MemoryRouter>
        <AdventureCard adventure={summary} />
      </MemoryRouter>
    );
    const outerLink = container.querySelector("a[href='/adventures/test-adventure']");
    expect(outerLink).not.toBeNull();
    expect(outerLink?.querySelectorAll("a")).toHaveLength(0);
  });

  it("renders the link text from markdown as plain text inside the card", () => {
    const { container } = render(
      <MemoryRouter>
        <AdventureCard adventure={summary} />
      </MemoryRouter>
    );
    expect(container.textContent).toContain("join the guild and use tooling to win");
  });

  it("still renders bold formatting from markdown in the story", () => {
    const { container } = render(
      <MemoryRouter>
        <AdventureCard adventure={summary} />
      </MemoryRouter>
    );
    expect(container.querySelector("p.line-clamp-2 strong")?.textContent).toBe("win");
  });
});
