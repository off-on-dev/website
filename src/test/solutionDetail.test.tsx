import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import type { Location } from "react-router";
import { ConsentProvider } from "@/hooks/useConsent";
import SolutionDetail, { meta } from "@/pages/SolutionDetail";
import { ADVENTURES } from "@/data/adventures";
import { SOLUTIONS } from "@/data/solutions";
import { BRAND_NAME, COMMUNITY_URL } from "@/data/constants";

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return { ...actual, useLoaderData: vi.fn() };
});

import { useLoaderData } from "react-router";

const adventure = ADVENTURES.find((a) => a.id === "echoes-lost-in-orbit")!;
const level = adventure.levels.find((l) => l.id === "beginner")!;
const solution = SOLUTIONS.find(
  (s) => s.adventureId === "echoes-lost-in-orbit" && s.levelId === "beginner"
)!;

const baseLoader = {
  adventure,
  level,
  solutionUnlocked: true,
  solution,
  challengeUrl: `/adventures/${adventure.id}/levels/${level.id}/`,
  discussionUrl: COMMUNITY_URL,
  deadline: undefined,
};

function renderPage() {
  return render(
    <ConsentProvider>
      <MemoryRouter
        initialEntries={[`/adventures/${adventure.id}/levels/${level.id}/solution`]}
      >
        <Routes>
          <Route
            path="/adventures/:id/levels/:levelId/solution"
            element={<SolutionDetail />}
          />
        </Routes>
      </MemoryRouter>
    </ConsentProvider>
  );
}

describe("SolutionDetail — page states", () => {
  beforeEach(() => {
    vi.mocked(useLoaderData).mockReturnValue(baseLoader);
  });

  it("renders the solution title and contributor name", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1, name: solution.title })).toBeTruthy();
    expect(screen.getByText(solution.contributor!.name)).toBeTruthy();
  });

  it("renders all step titles", () => {
    renderPage();
    for (const step of solution.steps) {
      expect(screen.getAllByText(step.title).length).toBeGreaterThan(0);
    }
  });

  it("renders the spoiler warning", () => {
    renderPage();
    expect(screen.getByText(solution.spoilerWarning!)).toBeTruthy();
  });

  it("renders the back-to-challenge link", () => {
    renderPage();
    expect(
      screen.getByRole("link", { name: /Back to challenge/i })
    ).toBeTruthy();
  });
});

describe("SolutionDetail — locked state", () => {
  it("shows not-yet-available message when deadline has not passed", () => {
    vi.mocked(useLoaderData).mockReturnValue({
      ...baseLoader,
      solutionUnlocked: false,
      solution: null,
    });
    renderPage();
    expect(screen.getByText("Not yet available")).toBeTruthy();
    expect(screen.queryByRole("heading", { level: 1, name: solution.title })).toBeNull();
  });
});

describe("SolutionDetail — no solution authored", () => {
  it("shows placeholder message when deadline passed but no solution exists", () => {
    vi.mocked(useLoaderData).mockReturnValue({
      ...baseLoader,
      solutionUnlocked: true,
      solution: null,
    });
    renderPage();
    expect(screen.getByText(/hasn't been published yet/i)).toBeTruthy();
    expect(screen.queryByRole("heading", { level: 1, name: solution.title })).toBeNull();
  });
});

describe("SolutionDetail — not found", () => {
  it("shows not-found heading when adventure is null", () => {
    vi.mocked(useLoaderData).mockReturnValue({
      adventure: null,
      level: null,
      solutionUnlocked: false,
      solution: null,
      challengeUrl: "/adventures/",
      discussionUrl: COMMUNITY_URL,
      deadline: undefined,
    });
    renderPage();
    expect(screen.getByRole("heading", { level: 1, name: /Solution not found/i })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// meta() — called server-side; does not use useLoaderData
// ---------------------------------------------------------------------------

const STUB_LOCATION: Location = { pathname: "/", search: "", hash: "", state: null, key: "default" };

function callMeta(loaderData: unknown): ReturnType<typeof meta> {
  return meta({ loaderData, params: {}, location: STUB_LOCATION, matches: [] } as Parameters<typeof meta>[0]);
}

describe("SolutionDetail — meta()", () => {
  it("returns noindex and a 'Not Found' title when adventure is missing", () => {
    const result = callMeta({ adventure: null, level: null, solutionUnlocked: false, solution: null });
    expect(result).toContainEqual({ title: `Solution Not Found - ${BRAND_NAME}` });
    expect(result).toContainEqual({ name: "robots", content: "noindex, nofollow" });
  });

  it("returns noindex when the solution is locked (deadline not passed)", () => {
    const result = callMeta({ adventure, level, solutionUnlocked: false, solution: null });
    expect(result).toContainEqual({ name: "robots", content: "noindex, nofollow" });
    expect(result).toContainEqual({
      title: `${level.name} Solution - ${adventure.title} - ${BRAND_NAME}`,
    });
  });

  it("returns noindex and a 'Not Found' title when unlocked but no solution authored", () => {
    const result = callMeta({ adventure, level, solutionUnlocked: true, solution: null });
    expect(result).toContainEqual({ title: `Solution Not Found - ${BRAND_NAME}` });
    expect(result).toContainEqual({ name: "robots", content: "noindex, nofollow" });
  });

  it("returns a full meta set with correct title when solution is available", () => {
    const result = callMeta({ adventure, level, solutionUnlocked: true, solution });
    const expected = `${solution.title} - ${adventure.title} - ${BRAND_NAME}`;
    expect(result).toContainEqual({ title: expected });
    expect(result?.find((d) => "name" in d && d.name === "robots")).toBeUndefined();
  });
});

describe("CodeBlock — copy button", () => {
  let clipboardWriteText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: clipboardWriteText },
      writable: true,
      configurable: true,
    });
    vi.mocked(useLoaderData).mockReturnValue(baseLoader);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls clipboard.writeText with code content on click", async () => {
    renderPage();
    const copyBtn = screen.getAllByRole("button", { name: /Copy code/i })[0];
    await act(async () => { fireEvent.click(copyBtn); });
    expect(clipboardWriteText).toHaveBeenCalledTimes(1);
    expect(typeof clipboardWriteText.mock.calls[0][0]).toBe("string");
  });

  it("shows Copied state after click and announces to screen readers", async () => {
    renderPage();
    const copyBtn = screen.getAllByRole("button", { name: /Copy code/i })[0];
    await act(async () => { fireEvent.click(copyBtn); });
    expect(screen.getAllByRole("button", { name: /Code copied/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Code copied to clipboard").length).toBeGreaterThan(0);
  });

  it("reverts copy button back to Copy after 1500ms", async () => {
    vi.useFakeTimers();
    renderPage();
    const copyBtn = screen.getAllByRole("button", { name: /Copy code/i })[0];
    await act(async () => { fireEvent.click(copyBtn); });
    act(() => { vi.advanceTimersByTime(1500); });
    expect(screen.getAllByRole("button", { name: /Copy code/i }).length).toBeGreaterThan(0);
  });
});
