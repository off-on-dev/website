import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type JSX } from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router";
import { Layout } from "@/Layout";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = "analytics_consent";
const ls = window.localStorage;

// Rendered inside the index route so we can trigger client-side navigation
// without going through createMemoryRouter's fetch layer (avoids AbortSignal
// incompatibility in jsdom).
function NavButton({ to }: { to: string }): JSX.Element {
  const navigate = useNavigate();
  return (
    <button data-testid="nav-btn" onClick={() => navigate(to)}>
      go
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
                <div>home</div>
              </>
            }
          />
          <Route path="about" element={<div>about</div>} />
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
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  window.gtag = vi.fn();
  window.dataLayer = [];
  document.getElementById("gtag-script")?.remove();
});

afterEach(() => {
  vi.restoreAllMocks();
});

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

  // -------------------------------------------------------------------------
  // ScrollToTop: gtag page_view
  // -------------------------------------------------------------------------

  it("ScrollToTop fires gtag page_view when consent is granted", async () => {
    ls.setItem(STORAGE_KEY, JSON.stringify({ value: "granted", timestamp: Date.now() }));
    const { getByTestId } = renderLayout("/");
    await act(async () => {
      fireEvent.click(getByTestId("nav-btn"));
    });
    // loadGtag() replaces window.gtag with the dataLayer push shim on mount,
    // so page_view calls land in window.dataLayer rather than the original spy.
    const dl = window.dataLayer as unknown[][];
    expect(dl).toContainEqual(["event", "page_view", { page_path: "/about" }]);
  });

  it("ScrollToTop does not fire gtag when consent is null", async () => {
    const { getByTestId } = renderLayout("/");
    await act(async () => {
      fireEvent.click(getByTestId("nav-btn"));
    });
    expect(window.gtag).not.toHaveBeenCalledWith("event", "page_view", expect.anything());
  });

  it("ScrollToTop does not fire gtag when consent is denied", async () => {
    ls.setItem(STORAGE_KEY, JSON.stringify({ value: "denied", timestamp: Date.now() }));
    const { getByTestId } = renderLayout("/");
    await act(async () => {
      fireEvent.click(getByTestId("nav-btn"));
    });
    expect(window.gtag).not.toHaveBeenCalledWith("event", "page_view", expect.anything());
  });
});

// ---------------------------------------------------------------------------
// Layout regression: file content
// ---------------------------------------------------------------------------

describe("Layout file-content regression", () => {
  const source = readFileSync(resolve(__dirname, "../Layout.tsx"), "utf-8");

  it("does not import HelmetProvider from react-helmet-async", () => {
    expect(source).not.toContain("HelmetProvider");
  });
});
