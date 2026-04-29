import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import NotFound from "@/pages/NotFound";

const renderNotFound = (): ReturnType<typeof render> =>
  render(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>
  );

describe("NotFound", () => {
  describe("page structure", () => {
    it("renders a Page Not Found h1", () => {
      renderNotFound();
      expect(screen.getByRole("heading", { level: 1, name: "Page Not Found" })).toBeTruthy();
    });

    it("includes id='main-content' on the main element", () => {
      const { container } = renderNotFound();
      expect(container.querySelector("main#main-content")).toBeTruthy();
    });
  });

  describe("helpful links nav", () => {
    it("renders a navigation landmark labelled 'Helpful links'", () => {
      renderNotFound();
      expect(screen.getByRole("navigation", { name: "Helpful links" })).toBeTruthy();
    });

    it("renders exactly three links inside the helpful links nav", () => {
      renderNotFound();
      const nav = screen.getByRole("navigation", { name: "Helpful links" });
      expect(within(nav).getAllByRole("link")).toHaveLength(3);
    });

    it("links 'Adventures' to /adventures", () => {
      renderNotFound();
      const nav = screen.getByRole("navigation", { name: "Helpful links" });
      const link = within(nav).getByRole("link", { name: /Adventures/ });
      expect(link.getAttribute("href")).toBe("/adventures");
    });

    it("links 'Handbook' to /handbook", () => {
      renderNotFound();
      const nav = screen.getByRole("navigation", { name: "Helpful links" });
      const link = within(nav).getByRole("link", { name: /Handbook/ });
      expect(link.getAttribute("href")).toBe("/handbook");
    });

    it("links 'About' to /about", () => {
      renderNotFound();
      const nav = screen.getByRole("navigation", { name: "Helpful links" });
      const link = within(nav).getByRole("link", { name: /About/ });
      expect(link.getAttribute("href")).toBe("/about");
    });
  });
});
