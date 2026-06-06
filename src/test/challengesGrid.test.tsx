import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ChallengesGrid } from "@/components/ChallengesGrid";
import { ADVENTURES } from "@/data/adventures";
import { ADVENTURE_SUMMARIES } from "@/data/adventures/summaries";
import { ALL_LEVEL_SUMMARIES, getLevelSummariesByFilters } from "@/data/adventures/filter-utils";

const allTags = Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort();
const firstTag = allTags[0];
const secondTag = allTags[1];
const adventuresWithFirstTag = ADVENTURES.filter((a) => a.tags.includes(firstTag));

const renderGrid = (): ReturnType<typeof render> =>
  render(
    <MemoryRouter>
      <ChallengesGrid />
    </MemoryRouter>
  );

describe("ChallengesGrid", () => {
  describe("initial state (no tag selected)", () => {
    it("renders an adventure card for every adventure", () => {
      renderGrid();
      ADVENTURES.forEach((adventure) => {
        expect(
          screen.getAllByRole("link").some((l) => l.getAttribute("href") === `/adventures/${adventure.id}/`)
        ).toBe(true);
      });
    });

    it("links each adventure card to /adventures/:id", () => {
      renderGrid();
      ADVENTURES.forEach((adventure) => {
        const link = screen.getAllByRole("link").find((l) => l.getAttribute("href") === `/adventures/${adventure.id}/`);
        expect(link).toBeTruthy();
      });
    });

    it("renders a filter button for every unique tag", () => {
      renderGrid();
      allTags.forEach((tag) => {
        expect(screen.getByRole("button", { name: tag })).toBeTruthy();
      });
    });

    it("all filter buttons start with aria-pressed='false'", () => {
      renderGrid();
      allTags.forEach((tag) => {
        expect(screen.getByRole("button", { name: tag }).getAttribute("aria-pressed")).toBe("false");
      });
    });

    it("wraps filter buttons in a group with aria-label", () => {
      const { container } = renderGrid();
      const group = container.querySelector('[role="group"][aria-label="Filter by technology"]');
      expect(group).toBeTruthy();
    });

    it("renders an empty aria-live region before a tag is selected", () => {
      const { container } = renderGrid();
      const region = container.querySelector("[aria-live]");
      expect(region).toBeTruthy();
      expect(region!.textContent).toBe("");
    });
  });

  describe("selecting a tag", () => {
    it("marks the clicked button as aria-pressed='true'", () => {
      renderGrid();
      const btn = screen.getByRole("button", { name: firstTag });
      fireEvent.click(btn);
      expect(btn.getAttribute("aria-pressed")).toBe("true");
    });

    it("replaces adventure cards with level cards for matching adventures", () => {
      renderGrid();
      fireEvent.click(screen.getByRole("button", { name: firstTag }));
      ADVENTURES.forEach((adventure) => {
        expect(
          screen.queryAllByRole("link").some((l) => l.getAttribute("href") === `/adventures/${adventure.id}/`)
        ).toBe(false);
      });
      adventuresWithFirstTag.forEach((adventure) => {
        adventure.levels.forEach((level) => {
          expect(
            screen.queryAllByRole("link").some(
              (l) => l.getAttribute("href") === `/adventures/${adventure.id}/levels/${level.id}/`
            )
          ).toBe(true);
        });
      });
    });

    it("links level cards to the correct /adventures/:id/levels/:levelId path", () => {
      renderGrid();
      fireEvent.click(screen.getByRole("button", { name: firstTag }));
      adventuresWithFirstTag.forEach((adventure) => {
        adventure.levels.forEach((level) => {
          const link = screen.queryAllByRole("link").find(
            (l) => l.getAttribute("href") === `/adventures/${adventure.id}/levels/${level.id}/`
          );
          expect(link).toBeTruthy();
        });
      });
    });

    it("shows a count and tag label when a tag is active", () => {
      renderGrid();
      fireEvent.click(screen.getByRole("button", { name: firstTag }));
      expect(screen.getAllByText((text) => text.includes("challenge") && text.includes(firstTag)).length).toBeGreaterThan(0);
    });

    it("announces challenge count and active tag in the live region", () => {
      const { container } = renderGrid();
      fireEvent.click(screen.getByRole("button", { name: firstTag }));
      const region = container.querySelector("[aria-live]");
      expect(region!.textContent).toContain("challenge");
      expect(region!.textContent).toContain(firstTag);
    });

    it("announces challenge count and active difficulty in the live region", () => {
      const { container } = renderGrid();
      const group = container.querySelector('[role="group"][aria-label="Filter by difficulty"]:not([hidden])') as HTMLElement;
      fireEvent.click(within(group).getByRole("button", { name: "Beginner" }));
      const region = container.querySelector("[aria-live]");
      expect(region!.textContent).toContain("challenge");
      expect(region!.textContent).toContain("Beginner");
    });

    it("announces the full Challenges.tsx format when two topics are active", () => {
      const { container } = renderGrid();
      fireEvent.click(screen.getByRole("button", { name: firstTag }));
      fireEvent.click(screen.getByRole("button", { name: secondTag }));
      const count = getLevelSummariesByFilters([firstTag, secondTag], null).length;
      const expectedText = `Showing ${count} ${count === 1 ? "challenge" : "challenges"} · ${firstTag}, ${secondTag}`;
      const region = container.querySelector("[aria-live]");
      expect(region!.textContent).toBe(expectedText);
    });
  });

  describe("deselecting a tag", () => {
    it("restores adventure cards when the active tag is clicked again", () => {
      renderGrid();
      const btn = screen.getByRole("button", { name: firstTag });
      fireEvent.click(btn);
      fireEvent.click(btn);
      ADVENTURES.forEach((adventure) => {
        expect(
          screen.getAllByRole("link").some((l) => l.getAttribute("href") === `/adventures/${adventure.id}/`)
        ).toBe(true);
      });
    });

    it("resets aria-pressed to 'false' after deselecting", () => {
      renderGrid();
      const btn = screen.getByRole("button", { name: firstTag });
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(btn.getAttribute("aria-pressed")).toBe("false");
    });

    it("announces filter cleared with adventure and challenge counts after deselecting", () => {
      const { container } = renderGrid();
      const btn = screen.getByRole("button", { name: firstTag });
      fireEvent.click(btn);
      fireEvent.click(btn);
      const region = container.querySelector("[aria-live]");
      expect(region).toBeTruthy();
      expect(region!.textContent).toContain("Filters cleared");
      expect(region!.textContent).toMatch(new RegExp(`${ADVENTURE_SUMMARIES.length}.*adventure`));
      expect(region!.textContent).toMatch(new RegExp(`${ALL_LEVEL_SUMMARIES.length}.*challenge`));
    });
  });

  describe("difficulty filter", () => {
    const getDifficultyGroup = (container: HTMLElement): HTMLElement => {
      // Target the always-visible desktop group; the mobile panel has hidden="" when closed.
      const group = container.querySelector('[role="group"][aria-label="Filter by difficulty"]:not([hidden])');
      expect(group).toBeTruthy();
      return group as HTMLElement;
    };

    it("renders difficulty filter buttons in the desktop group", () => {
      const { container } = renderGrid();
      const group = getDifficultyGroup(container);
      expect(within(group).getByRole("button", { name: "All Levels" })).toBeTruthy();
      expect(within(group).getByRole("button", { name: "Beginner" })).toBeTruthy();
      expect(within(group).getByRole("button", { name: "Intermediate" })).toBeTruthy();
      expect(within(group).getByRole("button", { name: "Expert" })).toBeTruthy();
    });

    it("difficulty buttons start with correct aria-pressed state", () => {
      const { container } = renderGrid();
      const group = getDifficultyGroup(container);
      expect(within(group).getByRole("button", { name: "All Levels" }).getAttribute("aria-pressed")).toBe("true");
      expect(within(group).getByRole("button", { name: "Beginner" }).getAttribute("aria-pressed")).toBe("false");
    });

    it("selecting a difficulty switches to level card view", () => {
      const { container } = renderGrid();
      const group = getDifficultyGroup(container);
      fireEvent.click(within(group).getByRole("button", { name: "Beginner" }));
      const levelLinks = screen.queryAllByRole("link").filter(
        (l) => l.getAttribute("href")?.includes("/levels/")
      );
      expect(levelLinks.length).toBeGreaterThan(0);
    });

    it("selecting a difficulty hides adventure cards", () => {
      const { container } = renderGrid();
      const group = getDifficultyGroup(container);
      fireEvent.click(within(group).getByRole("button", { name: "Beginner" }));
      ADVENTURES.forEach((adventure) => {
        expect(
          screen.queryAllByRole("link").some((l) => l.getAttribute("href") === `/adventures/${adventure.id}/`)
        ).toBe(false);
      });
    });

    it("clicking 'All Levels' after a selection restores adventure cards", () => {
      const { container } = renderGrid();
      const group = getDifficultyGroup(container);
      fireEvent.click(within(group).getByRole("button", { name: "Beginner" }));
      fireEvent.click(within(group).getByRole("button", { name: "All Levels" }));
      ADVENTURES.forEach((adventure) => {
        expect(
          screen.getAllByRole("link").some((l) => l.getAttribute("href") === `/adventures/${adventure.id}/`)
        ).toBe(true);
      });
    });

    it("clicking the active difficulty again deselects it", () => {
      const { container } = renderGrid();
      const group = getDifficultyGroup(container);
      const btn = within(group).getByRole("button", { name: "Beginner" });
      fireEvent.click(btn);
      fireEvent.click(btn);
      ADVENTURES.forEach((adventure) => {
        expect(
          screen.getAllByRole("link").some((l) => l.getAttribute("href") === `/adventures/${adventure.id}/`)
        ).toBe(true);
      });
    });

    it("combining difficulty and tag filters shows only matching levels", () => {
      const { container } = renderGrid();
      const diffGroup = getDifficultyGroup(container);
      const tagGroup = container.querySelector('[role="group"][aria-label="Filter by technology"]:not([hidden])') as HTMLElement;
      fireEvent.click(within(diffGroup).getByRole("button", { name: "Beginner" }));
      fireEvent.click(within(tagGroup).getByRole("button", { name: firstTag }));
      const expectedAdventures = ADVENTURES.filter((a) => a.tags.includes(firstTag));
      const levelLinks = screen.queryAllByRole("link").filter(
        (l) => l.getAttribute("href")?.includes("/levels/")
      );
      levelLinks.forEach((link) => {
        const href = link.getAttribute("href") ?? "";
        const matchingAdventure = expectedAdventures.find((a) => href.startsWith(`/adventures/${a.id}`));
        expect(matchingAdventure).toBeTruthy();
        expect(href).toContain("/levels/beginner");
      });
    });
  });
});
