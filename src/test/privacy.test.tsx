import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Privacy from "@/pages/Privacy";
import { CONTACT_EMAIL } from "@/data/constants";

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
// Contact links (sections 1 and 9 both link to the board section on /about)
// ---------------------------------------------------------------------------

describe("Privacy - contact links", () => {
  it("renders a 'reach out to the board' link (section 1) pointing to /about#board", () => {
    renderPrivacy();
    const link = screen.getByRole("link", { name: /^reach out to the board/i });
    expect(link.getAttribute("href")).toBe("/about#board");
  });

  it("renders a 'reaching out to the board' link (section 9) pointing to /about#board", () => {
    renderPrivacy();
    const link = screen.getByRole("link", { name: /^reaching out to the board/i });
    expect(link.getAttribute("href")).toBe("/about#board");
  });

  it("renders mailto links to the contact email", () => {
    renderPrivacy();
    const emailLinks = screen.getAllByRole("link", { name: new RegExp(CONTACT_EMAIL.replace(".", "\\."), "i") });
    // The email appears in sections 1, 7, and 9
    expect(emailLinks.length).toBeGreaterThan(0);
    emailLinks.forEach((a) => {
      expect(a.getAttribute("href")).toBe(`mailto:${CONTACT_EMAIL}`);
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

  it("does not link to the community login page", () => {
    renderPrivacy();
    const allLinks = screen.getAllByRole("link");
    const loginLink = allLinks.find((a) =>
      a.getAttribute("href")?.includes("/login")
    );
    expect(loginLink).toBeUndefined();
  });
});
