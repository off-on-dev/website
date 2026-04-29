import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { PageHero } from "@/components/PageHero";
type HeroProps = Parameters<typeof PageHero>[0];

const renderHero = (props: HeroProps): ReturnType<typeof render> =>
  render(
    <MemoryRouter>
      <PageHero {...props} />
    </MemoryRouter>
  );

describe("PageHero", () => {
  describe("content rendering", () => {
    it("renders the title as an h1", () => {
      renderHero({ title: "Test Title", description: "Test description" });
      expect(screen.getByRole("heading", { level: 1, name: "Test Title" })).toBeTruthy();
    });

    it("renders the description text", () => {
      renderHero({ title: "T", description: "My description text" });
      expect(screen.getByText("My description text")).toBeTruthy();
    });

    it("renders the eyebrow text when provided", () => {
      renderHero({ title: "T", description: "D", eyebrow: "Adventures" });
      expect(screen.getByText("Adventures")).toBeTruthy();
    });

    it("does not render an eyebrow element when eyebrow is omitted", () => {
      renderHero({ title: "T", description: "D" });
      // When no eyebrow is provided the h1 must be the first element in the content div
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1.previousElementSibling).toBeNull();
    });
  });

  describe("CTA rendering", () => {
    it("renders no links when neither primaryCta nor secondaryCta is provided", () => {
      renderHero({ title: "T", description: "D" });
      expect(screen.queryByRole("link")).toBeNull();
    });

    it("renders only one link when only primaryCta is provided", () => {
      renderHero({
        title: "T",
        description: "D",
        primaryCta: { label: "Get Started", href: "/start" },
      });
      expect(screen.getAllByRole("link")).toHaveLength(1);
    });

    it("renders two links when both CTAs are provided", () => {
      renderHero({
        title: "T",
        description: "D",
        primaryCta: { label: "Primary", href: "/primary" },
        secondaryCta: { label: "Secondary", href: "/secondary" },
      });
      expect(screen.getAllByRole("link")).toHaveLength(2);
    });

    it("applies btn-inverse class to the primary CTA", () => {
      renderHero({
        title: "T",
        description: "D",
        primaryCta: { label: "Go", href: "/go" },
      });
      expect(screen.getByRole("link", { name: "Go" }).className).toContain("btn-inverse");
    });

    it("applies btn-ghost-inverse class to the secondary CTA", () => {
      renderHero({
        title: "T",
        description: "D",
        secondaryCta: { label: "Learn more", href: "/more" },
      });
      expect(screen.getByRole("link", { name: "Learn more" }).className).toContain("btn-ghost-inverse");
    });
  });

  describe("renderCta: external link", () => {
    it("renders an <a> with target='_blank' when cta.external is true", () => {
      renderHero({
        title: "T",
        description: "D",
        primaryCta: { label: "Community", href: "https://example.com", external: true },
      });
      const link = screen.getByRole("link", { name: /Community/ });
      expect(link.getAttribute("target")).toBe("_blank");
    });

    it("includes rel='noopener noreferrer' on external links", () => {
      renderHero({
        title: "T",
        description: "D",
        primaryCta: { label: "Community", href: "https://example.com", external: true },
      });
      const link = screen.getByRole("link", { name: /Community/ });
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    });

    it("includes a sr-only '(opens in new tab)' span on external links", () => {
      renderHero({
        title: "T",
        description: "D",
        primaryCta: { label: "Community", href: "https://example.com", external: true },
      });
      const srSpan = screen.getByText("(opens in new tab)");
      expect(srSpan.className).toContain("sr-only");
    });
  });

  describe("renderCta: mailto and hash links", () => {
    it("renders a plain <a> for a mailto: href with no target attribute", () => {
      renderHero({
        title: "T",
        description: "D",
        primaryCta: { label: "Email us", href: "mailto:hi@example.com" },
      });
      const link = screen.getByRole("link", { name: "Email us" });
      expect(link.tagName).toBe("A");
      expect(link.getAttribute("target")).toBeNull();
    });

    it("renders a plain <a> for a # hash href with no target attribute", () => {
      renderHero({
        title: "T",
        description: "D",
        primaryCta: { label: "Jump down", href: "#section" },
      });
      const link = screen.getByRole("link", { name: "Jump down" });
      expect(link.tagName).toBe("A");
      expect(link.getAttribute("target")).toBeNull();
    });
  });

  describe("renderCta: internal React Router link", () => {
    it("renders an <a> with no target for internal paths", () => {
      renderHero({
        title: "T",
        description: "D",
        primaryCta: { label: "About", href: "/about" },
      });
      const link = screen.getByRole("link", { name: "About" });
      expect(link.tagName).toBe("A");
      expect(link.getAttribute("target")).toBeNull();
    });

    it("sets the correct href for internal paths", () => {
      renderHero({
        title: "T",
        description: "D",
        primaryCta: { label: "About", href: "/about" },
      });
      expect(screen.getByRole("link", { name: "About" }).getAttribute("href")).toBe("/about");
    });
  });
});
