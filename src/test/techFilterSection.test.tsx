import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { TechFilterSection } from "@/components/TechFilterSection";
import { ADVENTURES } from "@/data/adventures";

const renderSection = () =>
  render(
    <MemoryRouter>
      <TechFilterSection />
    </MemoryRouter>
  );

const firstTag = Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort()[0];

describe("TechFilterSection", () => {
  describe("initial state", () => {
    it("renders the section heading", () => {
      renderSection();
      expect(screen.getByRole("heading", { level: 2, name: "Find Challenges by Technology" })).toBeTruthy();
    });

    it("renders a filter button for every unique tag", () => {
      renderSection();
      const allTags = Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort();
      allTags.forEach((tag) => {
        expect(screen.getByRole("button", { name: tag })).toBeTruthy();
      });
    });

    it("all buttons start with aria-pressed='false'", () => {
      renderSection();
      const buttons = screen.getAllByRole("button");
      buttons.forEach((btn) => {
        expect(btn.getAttribute("aria-pressed")).toBe("false");
      });
    });

    it("does not render any challenge cards before a tag is selected", () => {
      renderSection();
      expect(screen.queryByRole("link", { name: /start/i })).toBeNull();
    });

    it("renders the aria-live region regardless of selection state", () => {
      const { container } = renderSection();
      expect(container.querySelector('[aria-live="polite"]')).toBeTruthy();
    });
  });

  describe("selecting a tag", () => {
    it("marks the clicked button as aria-pressed='true'", () => {
      renderSection();
      const btn = screen.getByRole("button", { name: firstTag });
      fireEvent.click(btn);
      expect(btn.getAttribute("aria-pressed")).toBe("true");
    });

    it("marks all other buttons as aria-pressed='false' when one is active", () => {
      renderSection();
      fireEvent.click(screen.getByRole("button", { name: firstTag }));
      const allTags = Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort();
      allTags
        .filter((tag) => tag !== firstTag)
        .forEach((tag) => {
          expect(screen.getByRole("button", { name: tag }).getAttribute("aria-pressed")).toBe("false");
        });
    });

    it("shows challenge cards when a tag with matching adventures is selected", () => {
      renderSection();
      fireEvent.click(screen.getByRole("button", { name: firstTag }));
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
    });

    it("each challenge card links to the correct adventure level path", () => {
      renderSection();
      fireEvent.click(screen.getByRole("button", { name: firstTag }));
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link.getAttribute("href")).toMatch(/^\/adventures\/.+\/levels\/.+/);
      });
    });
  });

  describe("deselecting a tag", () => {
    it("hides challenge cards when the active tag is clicked again", () => {
      renderSection();
      const btn = screen.getByRole("button", { name: firstTag });
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(screen.queryAllByRole("link").length).toBe(0);
    });

    it("resets aria-pressed to 'false' after deselecting", () => {
      renderSection();
      const btn = screen.getByRole("button", { name: firstTag });
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(btn.getAttribute("aria-pressed")).toBe("false");
    });
  });
});
