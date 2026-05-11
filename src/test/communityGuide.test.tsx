import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import CommunityGuide from "@/pages/CommunityGuide";
import { CONTACT_EMAIL, COMMUNITY_URL } from "@/data/constants";

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

// ---------------------------------------------------------------------------
// Get Involved section
// ---------------------------------------------------------------------------

describe("CommunityGuide - get involved section", () => {
  it("renders a 'Create an account' link pointing to the community signup page", () => {
    renderCommunityGuide();
    const link = screen.getByRole("link", { name: /create an account/i });
    expect(link.getAttribute("href")).toBe(`${COMMUNITY_URL}/signup`);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("renders a 'Say hello' link pointing to the introductions category", () => {
    renderCommunityGuide();
    const link = screen.getByRole("link", { name: /say hello/i });
    expect(link.getAttribute("href")).toBe(`${COMMUNITY_URL}/c/general/introductions/18`);
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("renders an 'Ask a question' link pointing to the Q&A category", () => {
    renderCommunityGuide();
    const link = screen.getByRole("link", { name: /ask a question/i });
    expect(link.getAttribute("href")).toBe(`${COMMUNITY_URL}/c/public-categories/q-a/10`);
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("renders a 'Share something' link pointing to the community voices category", () => {
    renderCommunityGuide();
    const link = screen.getByRole("link", { name: /share something/i });
    expect(link.getAttribute("href")).toBe(`${COMMUNITY_URL}/c/community-voices/38`);
    expect(link.getAttribute("target")).toBe("_blank");
  });
});

// ---------------------------------------------------------------------------
// Take on a Challenge section
// ---------------------------------------------------------------------------

describe("CommunityGuide - take on a challenge section", () => {
  it("renders a 'Start a challenge' link pointing to the challenges category", () => {
    renderCommunityGuide();
    const link = screen.getByRole("link", { name: /start a challenge/i });
    expect(link.getAttribute("href")).toBe(`${COMMUNITY_URL}/c/challenges/11`);
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("renders a 'Submit an idea' link pointing to the GitHub contributing guide", () => {
    renderCommunityGuide();
    const link = screen.getByRole("link", { name: /submit an idea/i });
    expect(link.getAttribute("href")).toBe(
      "https://github.com/dynatrace-oss/open-ecosystem-challenges/blob/main/docs/contributing/adventure-ideas.md"
    );
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });
});

// ---------------------------------------------------------------------------
// Policies section
// ---------------------------------------------------------------------------

describe("CommunityGuide - policies section", () => {
  it("renders a 'Trust Levels' link pointing to the community trust level guide", () => {
    renderCommunityGuide();
    const link = screen.getByRole("link", { name: /trust levels/i });
    expect(link.getAttribute("href")).toBe(`${COMMUNITY_URL}/t/trust-level-guide/1475`);
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("renders a 'Code of Conduct' link pointing to the community code of conduct", () => {
    renderCommunityGuide();
    const section = screen.getByRole("region", { name: /policies/i });
    const link = within(section).getByRole("link", { name: /code of conduct/i });
    expect(link.getAttribute("href")).toBe(`${COMMUNITY_URL}/t/code-of-conduct/31`);
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("renders a 'Privacy Policy' link pointing to the community privacy policy", () => {
    renderCommunityGuide();
    const section = screen.getByRole("region", { name: /policies/i });
    const link = within(section).getByRole("link", { name: /privacy policy/i });
    expect(link.getAttribute("href")).toBe(`${COMMUNITY_URL}/t/privacy-policy/22`);
    expect(link.getAttribute("target")).toBe("_blank");
  });
});
