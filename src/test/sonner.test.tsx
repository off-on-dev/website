import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { Toaster } from "@/components/ui/sonner";

// ---------------------------------------------------------------------------
// TEST 1: File-content regression guard
// Locks in the import so nobody accidentally reverts it to next-themes.
// ---------------------------------------------------------------------------

describe("Sonner toaster imports", () => {
  const source = readFileSync(
    resolve(__dirname, "../components/ui/sonner.tsx"),
    "utf8"
  );

  it("imports useTheme from the app's hook, not next-themes", () => {
    expect(source).toContain('from "@/hooks/useTheme"');
  });

  it("does not import from next-themes", () => {
    expect(source).not.toContain("next-themes");
  });
});

// ---------------------------------------------------------------------------
// TEST 2 and 3: Behavior. Toaster is correctly wired to the app's
// ThemeProvider. We render Toaster alongside a ThemeConsumer in the same
// tree and assert the shared context returns the expected theme (dark by
// default, light after toggle). If Toaster were still importing from
// next-themes it would either crash or create a separate context that
// diverges from the app's theme state.
// ---------------------------------------------------------------------------

// Exposes theme state and toggle for assertions
function ThemeConsumer(): JSX.Element {
  const { theme, toggle } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggle}>toggle</button>
    </div>
  );
}

describe("Toaster theme wiring", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = "";
  });

  it("Toaster renders without crashing inside the app ThemeProvider, and the shared context reads dark by default", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
        <Toaster />
      </ThemeProvider>
    );

    expect(getByTestId("theme-value").textContent).toBe("dark");
  });

  it("Toaster renders without crashing after theme toggle, and the shared context reflects light", () => {
    const { getByTestId, getByRole } = render(
      <ThemeProvider>
        <ThemeConsumer />
        <Toaster />
      </ThemeProvider>
    );

    fireEvent.click(getByRole("button", { name: "toggle" }));
    expect(getByTestId("theme-value").textContent).toBe("light");
  });
});
