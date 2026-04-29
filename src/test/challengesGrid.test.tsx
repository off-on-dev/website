import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ChallengesGrid } from "@/components/ChallengesGrid";
import { ADVENTURES } from "@/data/adventures";

const allTags = Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort();
const firstTag = allTags[0];
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
        expect(screen.getByRole("link", { name: adventure.title })).toBeTruthy();
      });
    });

    it("links each adventure card to /adventures/:id", () => {
      renderGrid();
      ADVENTURES.forEach((adventure) => {
        const link = screen.getByRole("link", { name: adventure.title });
        expect(link.getAttribute("href")).toBe(`/adventures/${adventure.id}`);
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
      const group = container.querySelector('[role="group"][aria-label="Filter challenges by technology"]');
      expect(group).toBeTruthy();
    });

    it("does not render an aria-live region before a tag is selected", () => {
      const { container } = renderGrid();
      expect(container.querySelector("[aria-live]")).toBeNull();
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
      // Adventure cards are gone
      ADVENTURES.forEach((adventure) => {
        expect(screen.queryByRole("link", { name: adventure.title })).toBeNull();
      });
      // Level cards for matching adventures are shown
      adventuresWithFirstTag.forEach((adventure) => {
        adventure.levels.forEach((level) => {
          expect(screen.getByRole("link", { name: level.name })).toBeTruthy();
        });
      });
    });

    it("links level cards to the correct /adventures/:id/levels/:levelId path", () => {
      renderGrid();
      fireEvent.click(screen.getByRole("button", { name: firstTag }));
      adventuresWithFirstTag.forEach((adventure) => {
        adventure.levels.forEach((level) => {
          const link = screen.getByRole("link", { name: level.name });
          expect(link.getAttribute("href")).toBe(
            `/adventures/${adventure.id}/levels/${level.id}`
          );
        });
      });
    });

    it("shows a 'Challenges tagged with <tag>' label", () => {
      renderGrid();
      fireEvent.click(screen.getByRole("button", { name: firstTag }));
      expect(screen.getByText(`Challenges tagged with ${firstTag}`)).toBeTruthy();
    });

    it("renders an aria-live region when a tag is active", () => {
      const { container } = renderGrid();
      fireEvent.click(screen.getByRole("button", { name: firstTag }));
      expect(container.querySelector('[aria-live="polite"]')).toBeTruthy();
    });
  });

  describe("deselecting a tag", () => {
    it("restores adventure cards when the active tag is clicked again", () => {
      renderGrid();
      const btn = screen.getByRole("button", { name: firstTag });
      fireEvent.click(btn);
      fireEvent.click(btn);
      ADVENTURES.forEach((adventure) => {
        expect(screen.getByRole("link", { name: adventure.title })).toBeTruthy();
      });
    });

    it("resets aria-pressed to 'false' after deselecting", () => {
      renderGrid();
      const btn = screen.getByRole("button", { name: firstTag });
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(btn.getAttribute("aria-pressed")).toBe("false");
    });

    it("removes the aria-live region after deselecting", () => {
      const { container } = renderGrid();
      const btn = screen.getByRole("button", { name: firstTag });
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(container.querySelector("[aria-live]")).toBeNull();
    });
  });
});
