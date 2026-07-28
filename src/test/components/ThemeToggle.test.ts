// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// ThemeToggle.vue unit tests
//
// Hydration invariant: ThemeToggle seeds a local `theme` ref to "dark" on first
// render (matching SSR), then reads the real theme from document.documentElement
// in onMounted. Tests manipulate the <html> classList directly to control the
// initial theme, matching what the Layout.astro pre-hydration script does.
//
// $theme is a persistentAtom backed by localStorage. The component never reads
// $theme in the render body (to avoid hydration mismatch). It only uses
// $theme.listen for cross-instance sync and $theme.set on toggle.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { nextTick } from "vue";
import ThemeToggle from "@/components/ThemeToggle.vue";
import { $theme } from "@/stores/theme";

/** Add #theme-status to body - the toggle() function writes into it. */
function addStatusEl(): HTMLElement {
  const el = document.createElement("span");
  el.id = "theme-status";
  el.className = "sr-only";
  document.body.appendChild(el);
  return el;
}

/** Remove #theme-status if present. */
function removeStatusEl(): void {
  document.getElementById("theme-status")?.remove();
}

describe("ThemeToggle", () => {
  afterEach(() => {
    removeStatusEl();
    // Reset html class and store to dark (server default)
    document.documentElement.classList.remove("light", "dark");
    $theme.set("dark");
    vi.useRealTimers();
  });

  // ── rendering ────────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders a single button element", async () => {
      const wrapper = mount(ThemeToggle);
      await flushPromises();
      expect(wrapper.find("button").exists()).toBe(true);
      wrapper.unmount();
    });

    it("button has type='button'", async () => {
      const wrapper = mount(ThemeToggle);
      await flushPromises();
      expect(wrapper.find("button").attributes("type")).toBe("button");
      wrapper.unmount();
    });

    it("renders a Sun icon when the current theme is dark", async () => {
      document.documentElement.classList.remove("light");
      const wrapper = mount(ThemeToggle);
      await flushPromises();
      // Sun is rendered when theme === 'dark'; Moon when theme === 'light'
      // Both lucide components render an SVG element
      expect(wrapper.find("svg").exists()).toBe(true);
      wrapper.unmount();
    });
  });

  // ── aria-label ───────────────────────────────────────────────────────────────

  describe("aria-label", () => {
    it("is 'Switch to light mode' when the current theme is dark", async () => {
      // No 'light' class on <html> = dark theme
      document.documentElement.classList.remove("light");
      const wrapper = mount(ThemeToggle, { attachTo: document.body });
      await flushPromises();
      expect(wrapper.find("button").attributes("aria-label")).toBe("Switch to light mode");
      wrapper.unmount();
    });

    it("is 'Switch to dark mode' when the current theme is light", async () => {
      document.documentElement.classList.add("light");
      const wrapper = mount(ThemeToggle, { attachTo: document.body });
      await flushPromises();
      expect(wrapper.find("button").attributes("aria-label")).toBe("Switch to dark mode");
      wrapper.unmount();
    });

    it("references 'light' or 'dark' in the aria-label (meaningful for screen readers)", async () => {
      const wrapper = mount(ThemeToggle);
      await flushPromises();
      const label = wrapper.find("button").attributes("aria-label") ?? "";
      expect(label).toMatch(/light|dark/i);
      wrapper.unmount();
    });
  });

  // ── toggle behaviour ─────────────────────────────────────────────────────────

  describe("toggle() - dark → light", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(async () => {
      document.documentElement.classList.remove("light");
      addStatusEl();
      wrapper = mount(ThemeToggle, { attachTo: document.body });
      await flushPromises();
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it("adds 'light' class to <html> after clicking from dark", async () => {
      await wrapper.find("button").trigger("click");
      await nextTick();
      expect(document.documentElement.classList.contains("light")).toBe(true);
    });

    it("removes 'dark' class from <html> after clicking from dark", async () => {
      document.documentElement.classList.add("dark");
      await wrapper.find("button").trigger("click");
      await nextTick();
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("updates $theme store to 'light' after clicking from dark", async () => {
      await wrapper.find("button").trigger("click");
      await nextTick();
      expect($theme.get()).toBe("light");
    });

    it("updates aria-label to 'Switch to dark mode' after toggling to light", async () => {
      await wrapper.find("button").trigger("click");
      await nextTick();
      expect(wrapper.find("button").attributes("aria-label")).toBe("Switch to dark mode");
    });
  });

  describe("toggle() - light → dark", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(async () => {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      addStatusEl();
      wrapper = mount(ThemeToggle, { attachTo: document.body });
      await flushPromises();
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it("adds 'dark' class to <html> after clicking from light", async () => {
      await wrapper.find("button").trigger("click");
      await nextTick();
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("removes 'light' class from <html> after clicking from light", async () => {
      await wrapper.find("button").trigger("click");
      await nextTick();
      expect(document.documentElement.classList.contains("light")).toBe(false);
    });

    it("updates $theme store to 'dark' after clicking from light", async () => {
      await wrapper.find("button").trigger("click");
      await nextTick();
      expect($theme.get()).toBe("dark");
    });

    it("updates aria-label to 'Switch to light mode' after toggling to dark", async () => {
      await wrapper.find("button").trigger("click");
      await nextTick();
      expect(wrapper.find("button").attributes("aria-label")).toBe("Switch to light mode");
    });
  });

  // ── #theme-status live region ────────────────────────────────────────────────

  describe("#theme-status live region", () => {
    it("announces 'Theme switched to light mode' 50ms after toggling from dark", async () => {
      vi.useFakeTimers();
      document.documentElement.classList.remove("light");
      const statusEl = addStatusEl();
      const wrapper = mount(ThemeToggle, { attachTo: document.body });
      await flushPromises();

      await wrapper.find("button").trigger("click");
      await nextTick();

      // Immediately after toggle: textContent is cleared first
      expect(statusEl.textContent).toBe("");

      vi.advanceTimersByTime(50);
      await nextTick();

      expect(statusEl.textContent).toBe("Theme switched to light mode");
      wrapper.unmount();
    });

    it("announces 'Theme switched to dark mode' 50ms after toggling from light", async () => {
      vi.useFakeTimers();
      document.documentElement.classList.add("light");
      const statusEl = addStatusEl();
      const wrapper = mount(ThemeToggle, { attachTo: document.body });
      await flushPromises();

      await wrapper.find("button").trigger("click");
      await nextTick();

      vi.advanceTimersByTime(50);
      await nextTick();

      expect(statusEl.textContent).toBe("Theme switched to dark mode");
      wrapper.unmount();
    });

    it("clears the status announcement after 1600ms", async () => {
      vi.useFakeTimers();
      document.documentElement.classList.remove("light");
      const statusEl = addStatusEl();
      const wrapper = mount(ThemeToggle, { attachTo: document.body });
      await flushPromises();

      await wrapper.find("button").trigger("click");
      await nextTick();

      // Advance past the announcement (50ms) and then past the clear timeout (1600ms)
      vi.advanceTimersByTime(50);
      await nextTick();
      expect(statusEl.textContent).not.toBe("");

      vi.advanceTimersByTime(1600);
      await nextTick();
      expect(statusEl.textContent).toBe("");
      wrapper.unmount();
    });

    it("does not throw when #theme-status is absent from the DOM", async () => {
      // No addStatusEl() call - toggle should be a no-op for status
      document.documentElement.classList.remove("light");
      const wrapper = mount(ThemeToggle, { attachTo: document.body });
      await flushPromises();
      await expect(wrapper.find("button").trigger("click")).resolves.not.toThrow();
      wrapper.unmount();
    });
  });

  // ── variant prop ─────────────────────────────────────────────────────────────

  describe("variant prop", () => {
    it("defaults to 'mobile' variant", async () => {
      const wrapper = mount(ThemeToggle);
      await flushPromises();
      // The desktop variant adds hover:border-primary/30; mobile does not
      expect(wrapper.find("button").classes()).not.toContain("hover:border-primary/30");
      wrapper.unmount();
    });

    it("adds hover:border-primary/30 class for desktop variant", async () => {
      const wrapper = mount(ThemeToggle, { props: { variant: "desktop" } });
      await flushPromises();
      expect(wrapper.find("button").classes()).toContain("hover:border-primary/30");
      wrapper.unmount();
    });

    it("does not add hover:border-primary/30 class for mobile variant", async () => {
      const wrapper = mount(ThemeToggle, { props: { variant: "mobile" } });
      await flushPromises();
      expect(wrapper.find("button").classes()).not.toContain("hover:border-primary/30");
      wrapper.unmount();
    });
  });

  // ── cross-instance sync via $theme store ────────────────────────────────────

  describe("cross-instance sync via $theme", () => {
    it("updates the local theme when $theme.set is called externally after mount", async () => {
      document.documentElement.classList.remove("light");
      const wrapper = mount(ThemeToggle, { attachTo: document.body });
      await flushPromises();

      // Start in dark
      expect(wrapper.find("button").attributes("aria-label")).toBe("Switch to light mode");

      // External agent changes the store (simulates the other toggle instance)
      $theme.set("light");
      document.documentElement.classList.add("light");
      await nextTick();

      expect(wrapper.find("button").attributes("aria-label")).toBe("Switch to dark mode");
      wrapper.unmount();
    });
  });
});
