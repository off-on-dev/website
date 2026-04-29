import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { FilteredLevelCard } from "@/components/FilteredLevelCard";
import type { AdventureLevel } from "@/data/adventures";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const LEVEL: AdventureLevel = {
  id: "beginner",
  name: "Beginner Challenge",
  difficulty: "Beginner",
  learnings: ["Deploy a service", "Configure observability", "Write a test"],
  codespacesUrl: "https://codespaces.example.com/level/1",
  discussionUrl: "https://community.example.com/t/topic/42/1",
};

const LEVEL_MANY_LEARNINGS: AdventureLevel = {
  ...LEVEL,
  learnings: ["Step one", "Step two", "Step three", "Step four", "Step five"],
};

function renderCard(
  level = LEVEL,
  adventureId = "adventure-01",
  adventureTitle = "My Adventure",
): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <FilteredLevelCard
        level={level}
        adventureId={adventureId}
        adventureTitle={adventureTitle}
      />
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Link and routing
// ---------------------------------------------------------------------------

describe("FilteredLevelCard - link", () => {
  it("wraps the card in a link to the correct level URL", () => {
    renderCard();
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/adventures/adventure-01/levels/beginner");
  });

  it("uses adventureId and level.id to build the href", () => {
    renderCard(LEVEL, "my-adventure", "My Adventure");
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/adventures/my-adventure/levels/beginner");
  });
});

// ---------------------------------------------------------------------------
// Level name
// ---------------------------------------------------------------------------

describe("FilteredLevelCard - level name", () => {
  it("renders the level name as a heading", () => {
    renderCard();
    expect(screen.getByRole("heading", { name: /Beginner Challenge/i })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Difficulty badge
// ---------------------------------------------------------------------------

describe("FilteredLevelCard - difficulty badge", () => {
  it("renders the difficulty badge text", () => {
    renderCard();
    expect(screen.getByText("Beginner")).toBeTruthy();
  });

  it("renders Intermediate difficulty", () => {
    renderCard({ ...LEVEL, difficulty: "Intermediate", name: "Intermediate Level" });
    expect(screen.getByText("Intermediate")).toBeTruthy();
  });

  it("renders Expert difficulty", () => {
    renderCard({ ...LEVEL, difficulty: "Expert", name: "Expert Level" });
    expect(screen.getByText("Expert")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Learnings
// ---------------------------------------------------------------------------

describe("FilteredLevelCard - learnings", () => {
  it("renders all learnings when there are three or fewer", () => {
    renderCard();
    expect(screen.getByText("Deploy a service")).toBeTruthy();
    expect(screen.getByText("Configure observability")).toBeTruthy();
    expect(screen.getByText("Write a test")).toBeTruthy();
  });

  it("renders at most three learnings when there are more than three", () => {
    renderCard(LEVEL_MANY_LEARNINGS);
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBe(3);
    expect(screen.getByText("Step one")).toBeTruthy();
    expect(screen.getByText("Step two")).toBeTruthy();
    expect(screen.getByText("Step three")).toBeTruthy();
    expect(screen.queryByText("Step four")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Adventure title
// ---------------------------------------------------------------------------

describe("FilteredLevelCard - adventure title", () => {
  it("renders the adventure title", () => {
    renderCard(LEVEL, "adventure-01", "Kubernetes 101");
    expect(screen.getByText("Kubernetes 101")).toBeTruthy();
  });
});
