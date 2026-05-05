import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import CommunityGuide from "@/pages/CommunityGuide";
import { COMMUNITY_URL } from "@/data/constants";

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
  it("renders a 'log in' link pointing to COMMUNITY_URL/login", () => {
    renderCommunityGuide();
    const loginLinks = screen.getAllByRole("link", { name: /log in/i });
    const loginLink = loginLinks.find(
      (a) => a.getAttribute("href") === `${COMMUNITY_URL}/login`
    );
    expect(loginLink).toBeTruthy();
  });

  it("'log in' link opens in a new tab with rel='noopener noreferrer'", () => {
    renderCommunityGuide();
    const loginLinks = screen.getAllByRole("link", { name: /log in/i });
    const loginLink = loginLinks.find(
      (a) => a.getAttribute("href") === `${COMMUNITY_URL}/login`
    );
    expect(loginLink?.getAttribute("target")).toBe("_blank");
    expect(loginLink?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("'log in' link has an sr-only '(opens in new tab)' span", () => {
    renderCommunityGuide();
    const loginLinks = screen.getAllByRole("link", { name: /log in/i });
    const loginLink = loginLinks.find(
      (a) => a.getAttribute("href") === `${COMMUNITY_URL}/login`
    );
    const srSpan = loginLink?.querySelector(".sr-only");
    expect(srSpan).toBeTruthy();
    expect(srSpan!.textContent).toBe(" (opens in new tab)");
  });

  it("renders a mailto link to offondev@gmail.com in the contact section", () => {
    renderCommunityGuide();
    const emailLinks = screen.getAllByRole("link", { name: /offondev@gmail\.com/i });
    const emailLink = emailLinks.find(
      (a) => a.getAttribute("href") === "mailto:offondev@gmail.com"
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
});
