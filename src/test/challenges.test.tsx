import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import Challenges from "@/pages/Challenges";
import { ADVENTURES } from "@/data/adventures";
import { ADVENTURE_SUMMARIES } from "@/data/adventures/summaries";
import { tagToSlug } from "@/data/adventures/tag-utils";

const allTags = Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort();
const firstTag = allTags[0];
const firstTagSlug = tagToSlug(firstTag);
const secondTag = allTags[1];
const secondTagSlug = tagToSlug(secondTag);
const totalChallenges = ADVENTURES.flatMap((a) => a.levels).length;

function renderChallenges(initialPath = "/challenges"): { router: ReturnType<typeof createMemoryRouter> } & ReturnType<typeof render> {
  const router = createMemoryRouter(
    [{ path: "/challenges/:tag?", element: <Challenges /> }],
    { initialEntries: [initialPath] }
  );
  const result = render(<RouterProvider router={router} />);
  return { ...result, router };
}

describe("Challenges - default (All) state", () => {
  it("renders an adventure card for every adventure", () => {
    renderChallenges();
    ADVENTURE_SUMMARIES.forEach((adventure) => {
      expect(
        screen.getAllByRole("link").some((l) => l.getAttribute("href") === `/adventures/${adventure.id}/`)
      ).toBe(true);
    });
  });

  it("does not render individual level cards in the All view", () => {
    renderChallenges();
    const levelLinks = screen.queryAllByRole("link").filter(
      (l) => l.getAttribute("href")?.includes("/levels/")
    );
    expect(levelLinks.length).toBe(0);
  });

  it("shows adventure and challenge counts when unfiltered", () => {
    renderChallenges();
    const countLine = screen.getByText(
      new RegExp(`${ADVENTURE_SUMMARIES.length}.*adventure.*${totalChallenges}.*challenge`)
    );
    expect(countLine).toBeTruthy();
  });

  it("count line includes the adventure count", () => {
    renderChallenges();
    const countLine = screen.getByText(new RegExp(`${ADVENTURE_SUMMARIES.length}.*adventure`));
    expect(countLine.textContent).toContain(String(ADVENTURE_SUMMARIES.length));
    expect(countLine.textContent).toContain("adventure");
  });

  it("count line includes the total challenge count", () => {
    renderChallenges();
    const countLine = screen.getByText(new RegExp(`${ADVENTURE_SUMMARIES.length}.*adventure`));
    expect(countLine.textContent).toContain(String(totalChallenges));
    expect(countLine.textContent).toContain("challenge");
  });

  it("renders a filter button for every unique tag", () => {
    renderChallenges();
    allTags.forEach((tag) => {
      expect(screen.getByRole("button", { name: tag })).toBeTruthy();
    });
  });

  it("wraps filter buttons in a group with aria-label", () => {
    const { container } = renderChallenges();
    const group = container.querySelector('[role="group"][aria-label="Filter by technology"]');
    expect(group).toBeTruthy();
  });

  it("live region is empty before any interaction", () => {
    const { container } = renderChallenges();
    const region = container.querySelector("[aria-live]");
    expect(region).toBeTruthy();
    expect(region!.textContent).toBe("");
  });
});

describe("Challenges - tag filter", () => {
  it("replaces adventure cards with level cards on tag selection", () => {
    renderChallenges();
    fireEvent.click(screen.getByRole("button", { name: firstTag }));
    // ChallengeBuildersSection always renders adventure links regardless of filter
    // state, so exclude that persistent section from this assertion.
    ADVENTURE_SUMMARIES.forEach((adventure) => {
      expect(
        screen.queryAllByRole("link").some(
          (l) => l.getAttribute("href") === `/adventures/${adventure.id}/` && !l.closest("#challenge-builders")
        )
      ).toBe(false);
    });
  });

  it("shows level cards linking to /adventures/:id/levels/:levelId when a tag is selected", () => {
    renderChallenges();
    fireEvent.click(screen.getByRole("button", { name: firstTag }));
    const levelLinks = screen.queryAllByRole("link").filter(
      (l) => l.getAttribute("href")?.includes("/levels/")
    );
    expect(levelLinks.length).toBeGreaterThan(0);
  });

  it("marks the active tag button as aria-pressed='true'", () => {
    renderChallenges();
    const btn = screen.getByRole("button", { name: firstTag });
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
  });

  it("announces the challenge count and active tag when a tag is active", () => {
    const { container } = renderChallenges();
    fireEvent.click(screen.getByRole("button", { name: firstTag }));
    const region = container.querySelector("[aria-live]");
    expect(region!.textContent).toContain("challenge");
    expect(region!.textContent).toContain(firstTag);
  });
});

describe("Challenges - deselecting a tag", () => {
  it("restores adventure cards when the active tag is clicked again", () => {
    renderChallenges();
    const btn = screen.getByRole("button", { name: firstTag });
    fireEvent.click(btn);
    fireEvent.click(btn);
    ADVENTURE_SUMMARIES.forEach((adventure) => {
      expect(
        screen.getAllByRole("link").some((l) => l.getAttribute("href") === `/adventures/${adventure.id}/`)
      ).toBe(true);
    });
  });

  it("resets aria-pressed to 'false' after deselecting", () => {
    renderChallenges();
    const btn = screen.getByRole("button", { name: firstTag });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-pressed")).toBe("false");
  });

  it("announces adventure count when filters are cleared", () => {
    const { container } = renderChallenges();
    const btn = screen.getByRole("button", { name: firstTag });
    fireEvent.click(btn);
    fireEvent.click(btn);
    const region = container.querySelector("[aria-live]");
    expect(region!.textContent).toContain("adventures");
  });
});

describe("Challenges - URL state", () => {
  it("single tag selection sets ?topics= without changing pathname", () => {
    const { router } = renderChallenges();
    fireEvent.click(screen.getByRole("button", { name: firstTag }));
    expect(router.state.location.pathname).toBe("/challenges");
    expect(new URLSearchParams(router.state.location.search).get("topics")).toBe(firstTagSlug);
  });

  it("second tag selection adds to ?topics= without changing pathname", () => {
    const { router } = renderChallenges();
    fireEvent.click(screen.getByRole("button", { name: firstTag }));
    fireEvent.click(screen.getByRole("button", { name: secondTag }));
    expect(router.state.location.pathname).toBe("/challenges");
    const topics = new URLSearchParams(router.state.location.search).get("topics")!.split(",");
    expect(topics).toContain(firstTagSlug);
    expect(topics).toContain(secondTagSlug);
  });

  it("deselecting one tag leaves the other in ?topics=", () => {
    const { router } = renderChallenges();
    fireEvent.click(screen.getByRole("button", { name: firstTag }));
    fireEvent.click(screen.getByRole("button", { name: secondTag }));
    fireEvent.click(screen.getByRole("button", { name: secondTag }));
    expect(router.state.location.pathname).toBe("/challenges");
    expect(new URLSearchParams(router.state.location.search).get("topics")).toBe(firstTagSlug);
  });

  it("deselecting all tags removes ?topics= param", () => {
    const { router } = renderChallenges();
    fireEvent.click(screen.getByRole("button", { name: firstTag }));
    fireEvent.click(screen.getByRole("button", { name: firstTag }));
    expect(router.state.location.pathname).toBe("/challenges");
    expect(new URLSearchParams(router.state.location.search).get("topics")).toBeNull();
  });

  it("difficulty selection appends ?difficulty= without changing path", () => {
    const { router } = renderChallenges(`/challenges/${firstTagSlug}`);
    const diffBtn = screen.getByRole("button", { name: "Beginner" });
    fireEvent.click(diffBtn);
    expect(router.state.location.pathname).toBe(`/challenges/${firstTagSlug}`);
    expect(new URLSearchParams(router.state.location.search).get("difficulty")).toBe("Beginner");
  });

  it("initialising from a tag path URL pre-selects that tag", () => {
    renderChallenges(`/challenges/${firstTagSlug}`);
    expect(screen.getByRole("button", { name: firstTag }).getAttribute("aria-pressed")).toBe("true");
  });

  it("initialising from ?topics= pre-selects multiple tags", () => {
    renderChallenges(`/challenges?topics=${firstTagSlug},${secondTagSlug}`);
    expect(screen.getByRole("button", { name: firstTag }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: secondTag }).getAttribute("aria-pressed")).toBe("true");
  });

  it("aria-live announces active filter when URL already has ?topics= on mount", () => {
    const { container } = renderChallenges(`/challenges?topics=${firstTagSlug}`);
    const region = container.querySelector("[aria-live]");
    expect(region!.textContent).toMatch(/challenge/);
  });

  it("aria-live announces active filter when URL already has a tag path on mount", () => {
    const { container } = renderChallenges(`/challenges/${firstTagSlug}`);
    const region = container.querySelector("[aria-live]");
    expect(region!.textContent).toMatch(/challenge/);
  });

  it("clicking All Tools on a path-param route navigates to /challenges/ and clears the filter", () => {
    const { router } = renderChallenges(`/challenges/${firstTagSlug}`);
    expect(screen.getByRole("button", { name: firstTag }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "All Tools" }));
    expect(router.state.location.pathname).toBe("/challenges/");
    expect(new URLSearchParams(router.state.location.search).get("topics")).toBeNull();
  });

  it("clicking All Tools on a path-param route with difficulty preserves difficulty and navigates away", () => {
    const { router } = renderChallenges(`/challenges/${firstTagSlug}?difficulty=Beginner`);
    fireEvent.click(screen.getByRole("button", { name: "All Tools" }));
    expect(router.state.location.pathname).toBe("/challenges/");
    expect(new URLSearchParams(router.state.location.search).get("difficulty")).toBe("Beginner");
    expect(new URLSearchParams(router.state.location.search).get("topics")).toBeNull();
  });

  it("does not announce 'filters cleared' when URL contains an unresolvable topics slug", () => {
    const { container } = renderChallenges("/challenges?topics=__invalid_slug__");
    const region = container.querySelector("[aria-live]");
    expect(region!.textContent).toBe("");
  });
});

describe("Challenges - results heading", () => {
  it("renders an 'All Challenges' heading in the unfiltered state", () => {
    renderChallenges();
    expect(screen.getByRole("heading", { level: 2, name: "All Challenges" })).toBeTruthy();
  });

  it("renders a 'Filtered Challenges' heading when a filter is active", () => {
    renderChallenges();
    fireEvent.click(screen.getByRole("button", { name: firstTag }));
    expect(screen.getByRole("heading", { level: 2, name: "Filtered Challenges" })).toBeTruthy();
  });

  it("heading switches from 'All Challenges' to 'Filtered Challenges' when a tag is selected", () => {
    renderChallenges();
    expect(screen.getByRole("heading", { level: 2, name: "All Challenges" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: firstTag }));
    expect(screen.queryByRole("heading", { level: 2, name: "All Challenges" })).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "Filtered Challenges" })).toBeTruthy();
  });
});
