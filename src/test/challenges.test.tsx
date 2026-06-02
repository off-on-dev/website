import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import Challenges from "@/pages/Challenges";
import { ADVENTURES } from "@/data/adventures";
import { ADVENTURE_SUMMARIES } from "@/data/adventures/summaries";

const allTags = Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort();
const firstTag = allTags[0];
const totalChallenges = ADVENTURES.flatMap((a) => a.levels).length;

function renderChallenges(initialPath = "/challenges"): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenges/:tag" element={<Challenges />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Challenges - default (All) state", () => {
  it("renders an adventure card for every adventure", () => {
    renderChallenges();
    ADVENTURE_SUMMARIES.forEach((adventure) => {
      expect(
        screen.getAllByRole("link").some((l) => l.getAttribute("href") === `/adventures/${adventure.id}`)
      ).toBe(true);
    });
  });

  it("does not render individual level cards in the All view", () => {
    renderChallenges();
    const levelLinks = screen.queryAllByRole("link").filter(
      (l) => l.getAttribute("href")?.includes("/levels/")
    );
    expect(levelLinks.length).toBe(0);
  });

  it("heading reads 'All Adventures'", () => {
    renderChallenges();
    expect(screen.getByRole("heading", { name: /All Adventures/i })).toBeTruthy();
  });

  it("heading includes the adventure count", () => {
    renderChallenges();
    const heading = screen.getByRole("heading", { name: /All Adventures/i });
    expect(heading.textContent).toContain(String(ADVENTURE_SUMMARIES.length));
    expect(heading.textContent).toContain("adventure");
  });

  it("heading includes the total challenge count", () => {
    renderChallenges();
    const heading = screen.getByRole("heading", { name: /All Adventures/i });
    expect(heading.textContent).toContain(String(totalChallenges));
    expect(heading.textContent).toContain("challenge");
  });

  it("renders a filter button for every unique tag", () => {
    renderChallenges();
    allTags.forEach((tag) => {
      expect(screen.getByRole("button", { name: tag })).toBeTruthy();
    });
  });

  it("wraps filter buttons in a group with aria-label", () => {
    const { container } = renderChallenges();
    const group = container.querySelector('[role="group"][aria-label="Filter by technology"]');
    expect(group).toBeTruthy();
  });

  it("live region is empty before any interaction", () => {
    const { container } = renderChallenges();
    const region = container.querySelector("[aria-live]");
    expect(region).toBeTruthy();
    expect(region!.textContent).toBe("");
  });
});

describe("Challenges - tag filter", () => {
  it("replaces adventure cards with level cards on tag selection", () => {
    renderChallenges();
    fireEvent.click(screen.getByRole("button", { name: firstTag }));
    ADVENTURE_SUMMARIES.forEach((adventure) => {
      expect(
        screen.queryAllByRole("link").some((l) => l.getAttribute("href") === `/adventures/${adventure.id}`)
      ).toBe(false);
    });
  });

  it("shows level cards linking to /adventures/:id/levels/:levelId when a tag is selected", () => {
    renderChallenges();
    fireEvent.click(screen.getByRole("button", { name: firstTag }));
    const levelLinks = screen.getAllByRole("link").filter(
      (l) => l.getAttribute("href")?.includes("/levels/")
    );
    expect(levelLinks.length).toBeGreaterThan(0);
  });

  it("marks the active tag button as aria-pressed='true'", () => {
    renderChallenges();
    const btn = screen.getByRole("button", { name: firstTag });
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
  });

  it("announces the challenge count and active tag when a tag is active", () => {
    const { container } = renderChallenges();
    fireEvent.click(screen.getByRole("button", { name: firstTag }));
    const region = container.querySelector("[aria-live]");
    expect(region!.textContent).toContain("challenge");
    expect(region!.textContent).toContain(firstTag);
  });
});

describe("Challenges - deselecting a tag", () => {
  it("restores adventure cards when the active tag is clicked again", () => {
    renderChallenges();
    const btn = screen.getByRole("button", { name: firstTag });
    fireEvent.click(btn);
    fireEvent.click(btn);
    ADVENTURE_SUMMARIES.forEach((adventure) => {
      expect(
        screen.getAllByRole("link").some((l) => l.getAttribute("href") === `/adventures/${adventure.id}`)
      ).toBe(true);
    });
  });

  it("resets aria-pressed to 'false' after deselecting", () => {
    renderChallenges();
    const btn = screen.getByRole("button", { name: firstTag });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-pressed")).toBe("false");
  });

  it("announces adventure count when filters are cleared", () => {
    const { container } = renderChallenges();
    const btn = screen.getByRole("button", { name: firstTag });
    fireEvent.click(btn);
    fireEvent.click(btn);
    const region = container.querySelector("[aria-live]");
    expect(region!.textContent).toContain("adventures");
  });
});
