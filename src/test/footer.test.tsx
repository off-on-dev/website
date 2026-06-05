import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Footer } from "@/components/Footer";

function renderFooter(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = "";
});

// ---------------------------------------------------------------------------
// Explore nav
// ---------------------------------------------------------------------------

describe("Footer - Explore nav", () => {
  it("renders a nav landmark labelled 'Explore'", () => {
    renderFooter();
    expect(screen.getByRole("navigation", { name: "Explore" })).toBeTruthy();
  });

  it("has a Challenges link pointing to /challenges", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", { name: "Explore" });
    expect(within(nav).getByRole("link", { name: "Challenges" }).getAttribute("href")).toBe("/challenges/");
  });

  it("has a Handbook link pointing to /handbook", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", { name: "Explore" });
    expect(within(nav).getByRole("link", { name: "Handbook" }).getAttribute("href")).toBe("/handbook/");
  });

  it("has an About link pointing to /about", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", { name: "Explore" });
    expect(within(nav).getByRole("link", { name: "About" }).getAttribute("href")).toBe("/about/");
  });

  it("has a Brand link pointing to /brand", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", { name: "Explore" });
    expect(within(nav).getByRole("link", { name: "Brand" }).getAttribute("href")).toBe("/brand/");
  });

});

// ---------------------------------------------------------------------------
// Community nav
// ---------------------------------------------------------------------------

describe("Footer - Community nav", () => {
  it("renders a nav landmark labelled 'Community'", () => {
    renderFooter();
    expect(screen.getByRole("navigation", { name: "Community" })).toBeTruthy();
  });

  it("has a Hub external link that opens in a new tab", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", { name: "Community" });
    const link = within(nav).getByRole("link", { name: /Hub/ });
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("has a Privacy Policy link pointing to /privacy", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", { name: "Community" });
    expect(within(nav).getByRole("link", { name: "Privacy Policy" }).getAttribute("href")).toBe("/privacy/");
  });

  it("has a Code of Conduct external link that opens in a new tab", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", { name: "Community" });
    expect(within(nav).getByRole("link", { name: /Code of Conduct/ }).getAttribute("target")).toBe("_blank");
  });

  it("has an Accessibility link pointing to /accessibility", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", { name: "Community" });
    expect(within(nav).getByRole("link", { name: "Accessibility" }).getAttribute("href")).toBe("/accessibility/");
  });
});

// ---------------------------------------------------------------------------
// Bottom strip
// ---------------------------------------------------------------------------

describe("Footer - bottom strip", () => {
  it("renders the LinkedIn link with an aria-label that mentions 'opens in new tab'", () => {
    renderFooter();
    const linkedInLink = screen.getByRole("link", { name: /LinkedIn.*opens in new tab/i });
    expect(linkedInLink).toBeTruthy();
    expect(linkedInLink.getAttribute("target")).toBe("_blank");
  });

  it("renders the Bluesky link with an aria-label that mentions 'opens in new tab'", () => {
    renderFooter();
    const link = screen.getByRole("link", { name: /Bluesky.*opens in new tab/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("Bluesky link href matches BLUESKY_URL constant", () => {
    renderFooter();
    const link = screen.getByRole("link", { name: /Bluesky.*opens in new tab/i });
    expect(link.getAttribute("href")).toBe("https://bsky.app/profile/off-on-dev.bsky.social");
  });

  it("renders the X / Twitter link as an external link that opens in a new tab", () => {
    renderFooter();
    const link = screen.getByRole("link", { name: /X \/ Twitter.*opens in new tab/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("https://x.com/OffonDev");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("renders all three slogan parts in the bottom strip", () => {
    renderFooter();
    expect(screen.getByText("Vendor-Neutral")).toBeTruthy();
    expect(screen.getByText("Open Source")).toBeTruthy();
    expect(screen.getByText("Community-Driven")).toBeTruthy();
  });

  it("renders copyright text with the brand name", () => {
    renderFooter();
    expect(screen.getByText(/© \d{4} OffOn\. All rights reserved\./)).toBeTruthy();
  });
});
