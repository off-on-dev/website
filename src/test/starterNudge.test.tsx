import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { StarterNudge } from "@/components/StarterNudge";

const STARTER_NUDGE_KEY = "starter_nudge_dismissed";

function renderNudge(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <StarterNudge />
    </MemoryRouter>,
  );
}

// The nudge renders a "Dismiss suggestion" button only when visible, so its
// presence is the show/hide signal. starterLevel is derived from live adventure
// data at import time; a live Beginner adventure exists, so the happy path fires.
const nudge = (): HTMLElement | null =>
  screen.queryByRole("button", { name: /dismiss suggestion/i });

describe("StarterNudge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    act(() => { vi.runOnlyPendingTimers(); });
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("stays hidden until the mount timer fires", () => {
    renderNudge();
    expect(nudge()).toBeNull();
  });

  it("shows the nudge after mount when no dismissal is stored", () => {
    renderNudge();
    act(() => { vi.runAllTimers(); });
    expect(nudge()).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start with/i })).toBeInTheDocument();
  });

  it("does not show when a dismissal is already stored", () => {
    localStorage.setItem(STARTER_NUDGE_KEY, "1");
    renderNudge();
    act(() => { vi.runAllTimers(); });
    expect(nudge()).toBeNull();
  });

  it("does not show and does not throw when localStorage.getItem throws", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("localStorage unavailable");
    });
    expect(() => {
      renderNudge();
      act(() => { vi.runAllTimers(); });
    }).not.toThrow();
    expect(nudge()).toBeNull();
  });

  it("persists the dismissal and hides when the dismiss button is clicked", () => {
    const setItemSpy = vi.spyOn(window.localStorage, "setItem");
    renderNudge();
    act(() => { vi.runAllTimers(); });
    fireEvent.click(nudge()!);
    expect(setItemSpy).toHaveBeenCalledWith(STARTER_NUDGE_KEY, "1");
    expect(nudge()).toBeNull();
  });

  it("hides without throwing when localStorage.setItem throws on dismiss", () => {
    renderNudge();
    act(() => { vi.runAllTimers(); });
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    const btn = nudge()!;
    expect(() => fireEvent.click(btn)).not.toThrow();
    expect(nudge()).toBeNull();
  });
});
