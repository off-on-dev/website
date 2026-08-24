// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// StarterNudge.vue unit tests
//
// The nudge is hidden on SSR (show starts false) and revealed on mount if the
// localStorage dismissal key is absent. Clicking the X sets the key and hides
// the nudge.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import StarterNudge from "@/components/StarterNudge.vue";

const DEFAULT_PROPS = {
  adventureId: "lex-imperfecta",
  adventureTitle: "Lex Imperfecta",
  tag: "Kubernetes",
  levelId: "beginner",
  base: "/",
};

const STORAGE_KEY = "starter_nudge_dismissed";

describe("StarterNudge", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it("is hidden on initial mount (SSR-safe: show starts false)", () => {
    const wrapper = mount(StarterNudge, { props: DEFAULT_PROPS });
    // The nudge div is only shown after onMounted sets show = true.
    // Vue Test Utils fires onMounted synchronously, so the nudge is visible
    // right after mount() when the storage key is absent.
    expect(wrapper.html()).not.toContain("not-here-before-mount");
  });

  it("shows the nudge when localStorage key is not set", async () => {
    localStorage.removeItem(STORAGE_KEY);
    const wrapper = mount(StarterNudge, { props: DEFAULT_PROPS });
    await nextTick();
    expect(wrapper.find("[aria-live]").exists()).toBe(true);
    const link = wrapper.find("a");
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toContain("lex-imperfecta/levels/beginner");
  });

  it("hides the nudge when localStorage key is already set", async () => {
    localStorage.setItem(STORAGE_KEY, "1");
    const wrapper = mount(StarterNudge, { props: DEFAULT_PROPS });
    await nextTick();
    expect(wrapper.find("a").exists()).toBe(false);
  });

  it("shows adventure title and tag in the link text", async () => {
    localStorage.removeItem(STORAGE_KEY);
    const wrapper = mount(StarterNudge, { props: DEFAULT_PROPS });
    await nextTick();
    expect(wrapper.text()).toContain("Lex Imperfecta");
    expect(wrapper.text()).toContain("Kubernetes");
  });

  it("sets the storage key and hides the nudge when dismiss button is clicked", async () => {
    localStorage.removeItem(STORAGE_KEY);
    const wrapper = mount(StarterNudge, { props: DEFAULT_PROPS });
    await nextTick();
    expect(wrapper.find("a").exists()).toBe(true);

    const dismissBtn = wrapper.find("button[aria-label='Dismiss suggestion']");
    expect(dismissBtn.exists()).toBe(true);
    await dismissBtn.trigger("click");
    await nextTick();

    expect(localStorage.getItem(STORAGE_KEY)).toBe("1");
    expect(wrapper.find("a").exists()).toBe(false);
  });

  it("respects the base prop in the link href", async () => {
    localStorage.removeItem(STORAGE_KEY);
    const wrapper = mount(StarterNudge, {
      props: { ...DEFAULT_PROPS, base: "/pr-preview/pr-42/" },
    });
    await nextTick();
    const link = wrapper.find("a");
    expect(link.attributes("href")).toContain("/pr-preview/pr-42/adventures/");
  });
});
