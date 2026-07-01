import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type JSX } from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router";
import { Layout } from "@/Layout";
import { __resetGtagInjectionForTests } from "@/hooks/useConsent";
import { CONSENT_STORAGE_KEY } from "@/data/constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ls = window.localStorage;

function NavButton({ to }: { to: string }): JSX.Element {
  const navigate = useNavigate();
  return (
    <button data-testid="nav-btn" onClick={() => navigate(to)}>
      go
    </button>
  );
}

function NavButton2({ to }: { to: string }): JSX.Element {
  const navigate = useNavigate();
  return (
    <button data-testid="nav-btn-hash" onClick={() => navigate(to)}>
      go-hash
    </button>
  );
}

function renderLayout(initialPath = "/"): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={
              <>
                <NavButton to="/about" />
                <NavButton2 to="/about#target" />
                <div>home</div>
              </>
            }
          />
          <Route
            path="about"
            element={
              <div>
                about
                <div id="target" data-testid="hash-target">
                  hash target
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  ls.clear();
  document.getElementById("gtag-script")?.remove();
  __resetGtagInjectionForTests();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  window.gtag = vi.fn();
  window.dataLayer = [];
});

afterEach(() => {
  vi.restoreAllMocks();
});

function pageViewCalls(): unknown[][] {
  const calls = (window.gtag as ReturnType<typeof vi.fn>).mock.calls;
  return calls.filter((c) => c[0] === "event" && c[1] === "page_view");
}

// ---------------------------------------------------------------------------
// Layout: provider tree and Outlet
// ---------------------------------------------------------------------------

describe("Layout", () => {
  it("renders children via Outlet without crashing", () => {
    const { getByText } = renderLayout("/");
    expect(getByText("home")).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // ScrollToTop: scroll behaviour
  // -------------------------------------------------------------------------

  it("ScrollToTop scrolls to top on initial render", () => {
    renderLayout("/");
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("ScrollToTop scrolls to top again on route change", async () => {
    const { getByTestId } = renderLayout("/");
    const callsBefore = (window.scrollTo as ReturnType<typeof vi.fn>).mock.calls.length;
    await act(async () => {
      fireEvent.click(getByTestId("nav-btn"));
    });
    expect(window.scrollTo).toHaveBeenCalledTimes(callsBefore + 1);
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 0);
  });

  it("ScrollToTop scrolls the hash target into view, not to the top", async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    const { getByTestId } = renderLayout("/");
    const callsBefore = (window.scrollTo as ReturnType<typeof vi.fn>).mock.calls.length;
    await act(async () => {
      fireEvent.click(getByTestId("nav-btn-hash"));
    });
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
    expect(window.scrollTo).toHaveBeenCalledTimes(callsBefore);
  });

  // -------------------------------------------------------------------------
  // PageViewTracker: gtag page_view
  // -------------------------------------------------------------------------

  it("does not fire page_view when consent is null", async () => {
    const { getByTestId } = renderLayout("/");
    await act(async () => {
      fireEvent.click(getByTestId("nav-btn"));
    });
    expect(pageViewCalls().length).toBe(0);
  });

  it("does not fire page_view when consent is denied", async () => {
    ls.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value: "denied", timestamp: Date.now() }));
    const { getByTestId } = renderLayout("/");
    await act(async () => {
      fireEvent.click(getByTestId("nav-btn"));
    });
    expect(pageViewCalls().length).toBe(0);
  });

  it("fires page_view when consent is granted, with the new pathname on route change", async () => {
    ls.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value: "granted", timestamp: Date.now() }));
    const { getByTestId } = renderLayout("/");
    await act(async () => {
      fireEvent.click(getByTestId("nav-btn"));
    });
    const calls = pageViewCalls();
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[calls.length - 1][2]).toMatchObject({
      page_path: "/about",
      page_location: window.location.href,
      page_title: document.title,
    });
  });
});

// ---------------------------------------------------------------------------
// FocusReset: route-change focus management
// ---------------------------------------------------------------------------

function renderLayoutWithMain(initialPath = "/"): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={
              <>
                <NavButton to="/about" />
                <main id="main-content" tabIndex={-1}>home</main>
              </>
            }
          />
          <Route
            path="about"
            element={<main id="main-content" tabIndex={-1}>about</main>}
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("FocusReset", () => {
  it("does not move focus on initial mount", () => {
    renderLayoutWithMain("/");
    const main = document.getElementById("main-content");
    expect(document.activeElement).not.toBe(main);
  });

  it("moves focus to #main-content after route change", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    const { getByTestId } = renderLayoutWithMain("/");
    await act(async () => {
      fireEvent.click(getByTestId("nav-btn"));
    });
    expect(document.activeElement).toBe(document.getElementById("main-content"));
  });

  it("passes { preventScroll: true } to focus() so ScrollToTop scroll position is not overridden", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");
    const { getByTestId } = renderLayoutWithMain("/");
    await act(async () => {
      fireEvent.click(getByTestId("nav-btn"));
    });
    const mainFocusCall = focusSpy.mock.calls.find(
      (_, i) => focusSpy.mock.instances[i] === document.getElementById("main-content")
    );
    expect(mainFocusCall).toBeDefined();
    expect(mainFocusCall![0]).toEqual({ preventScroll: true });
  });

  it("does not throw when #main-content is absent in the route", async () => {
    const { getByTestId } = renderLayout("/");
    await expect(
      act(async () => { fireEvent.click(getByTestId("nav-btn")); })
    ).resolves.not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Layout regression: file content
// ---------------------------------------------------------------------------

describe("Layout file-content regression", () => {
  const source = readFileSync(resolve(__dirname, "../Layout.tsx"), "utf-8");

  it("does not import HelmetProvider", () => {
    expect(source).not.toContain("HelmetProvider");
  });

  it("PageViewTracker gates on consent === \"granted\"", () => {
    const trackerStart = source.indexOf("const PageViewTracker");
    const trackerEnd = source.indexOf("};", trackerStart);
    const trackerBody = source.slice(trackerStart, trackerEnd);
    expect(trackerBody).toContain("useConsent");
    expect(trackerBody).toMatch(/consent\s*!==\s*["']granted["']/);
  });
});
