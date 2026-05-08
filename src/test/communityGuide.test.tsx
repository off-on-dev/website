import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import CommunityGuide from "@/pages/CommunityGuide";
import { CONTACT_EMAIL } from "@/data/constants";

function renderCommunityGuide(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <CommunityGuide />
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Contact section
// ---------------------------------------------------------------------------

describe("CommunityGuide - contact section", () => {
  it("renders a 'reach out to the board' link pointing to /about#board", () => {
    renderCommunityGuide();
    const boardLink = screen.getByRole("link", { name: /reach out to the board/i });
    expect(boardLink.getAttribute("href")).toBe("/about#board");
  });

  it("renders a mailto link to the contact email in the contact section", () => {
    renderCommunityGuide();
    const emailLinks = screen.getAllByRole("link", { name: new RegExp(CONTACT_EMAIL.replace(".", "\\."), "i") });
    const emailLink = emailLinks.find(
      (a) => a.getAttribute("href") === `mailto:${CONTACT_EMAIL}`
    );
    expect(emailLink).toBeTruthy();
  });

  it("does not link to /groups/moderators", () => {
    renderCommunityGuide();
    const allLinks = screen.getAllByRole("link");
    const moderatorGroupLink = allLinks.find((a) =>
      a.getAttribute("href")?.includes("/groups/moderators")
    );
    expect(moderatorGroupLink).toBeUndefined();
  });

  it("does not link to the community login page", () => {
    renderCommunityGuide();
    const allLinks = screen.getAllByRole("link");
    const loginLink = allLinks.find((a) =>
      a.getAttribute("href")?.includes("/login")
    );
    expect(loginLink).toBeUndefined();
  });
});
