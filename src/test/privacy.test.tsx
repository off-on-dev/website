import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Privacy from "@/pages/Privacy";
import { COMMUNITY_URL } from "@/data/constants";

function renderPrivacy(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <Privacy />
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Page structure
// ---------------------------------------------------------------------------

describe("Privacy - page structure", () => {
  it("renders a 'Privacy Policy' h1", () => {
    renderPrivacy();
    expect(screen.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeTruthy();
  });

  it("includes id='main-content' on the main element", () => {
    const { container } = renderPrivacy();
    expect(container.querySelector("main#main-content")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Contact links (sections 1 and 9 both link to COMMUNITY_URL/login)
// ---------------------------------------------------------------------------

describe("Privacy - contact links", () => {
  it("renders a 'log in' link (section 1) pointing to COMMUNITY_URL/login", () => {
    renderPrivacy();
    // Section 1 uses "log in" as the link text
    const link = screen.getByRole("link", { name: /^log in/i });
    expect(link.getAttribute("href")).toBe(`${COMMUNITY_URL}/login`);
  });

  it("'log in' link opens in a new tab with rel='noopener noreferrer'", () => {
    renderPrivacy();
    const link = screen.getByRole("link", { name: /^log in/i });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("'log in' link has an sr-only '(opens in new tab)' span", () => {
    renderPrivacy();
    const link = screen.getByRole("link", { name: /^log in/i });
    const srSpan = link.querySelector(".sr-only");
    expect(srSpan).toBeTruthy();
    expect(srSpan!.textContent).toBe(" (opens in new tab)");
  });

  it("renders a 'logging in' link (section 9) pointing to COMMUNITY_URL/login", () => {
    renderPrivacy();
    // Section 9 uses "logging in" as the link text
    const link = screen.getByRole("link", { name: /^logging in/i });
    expect(link.getAttribute("href")).toBe(`${COMMUNITY_URL}/login`);
  });

  it("'logging in' link opens in a new tab with rel='noopener noreferrer'", () => {
    renderPrivacy();
    const link = screen.getByRole("link", { name: /^logging in/i });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("'logging in' link has an sr-only '(opens in new tab)' span", () => {
    renderPrivacy();
    const link = screen.getByRole("link", { name: /^logging in/i });
    const srSpan = link.querySelector(".sr-only");
    expect(srSpan).toBeTruthy();
    expect(srSpan!.textContent).toBe(" (opens in new tab)");
  });

  it("renders mailto links to offondev@gmail.com", () => {
    renderPrivacy();
    const emailLinks = screen.getAllByRole("link", { name: /offondev@gmail\.com/i });
    // The email appears in sections 1, 7, and 9
    expect(emailLinks.length).toBeGreaterThan(0);
    emailLinks.forEach((a) => {
      expect(a.getAttribute("href")).toBe("mailto:offondev@gmail.com");
    });
  });

  it("does not link to /groups/moderators anywhere on the page", () => {
    renderPrivacy();
    const allLinks = screen.getAllByRole("link");
    const moderatorGroupLink = allLinks.find((a) =>
      a.getAttribute("href")?.includes("/groups/moderators")
    );
    expect(moderatorGroupLink).toBeUndefined();
  });
});
