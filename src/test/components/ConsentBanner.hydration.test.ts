// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// ConsentBanner.vue hydration focus guard (P6)
//
// Deliberately does NOT mock the consent store. The bug this covers only exists
// when the real initConsent() runs during onMounted: it restores a stored choice
// and that registers on $consent as a null -> granted/denied transition. The
// focus watcher must ignore that transition, or every returning visitor has
// focus yanked to the cookie button on every page load, destroying the skip-nav
// link. The React ConsentBanner guarded this explicitly; the Vue port dropped it.
//
// The sibling ConsentBanner.test.ts mocks initConsent, which is exactly why it
// could not catch this.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { nextTick } from "vue";
import ConsentBanner from "@/components/ConsentBanner.vue";
import { $consent } from "@/stores/consent";
import { CONSENT_STORAGE_KEY } from "@/lib/site";

const COOKIE_BTN = '[aria-label="Change cookie preferences"]';
const DECLINE_BTN = '[aria-label="Decline analytics cookies"]';

function storeConsent(value: "granted" | "denied"): void {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value, timestamp: Date.now() }));
}

/** Stand-in for the skip-nav link: whatever had focus before the island hydrated. */
function focusSentinel(): HTMLAnchorElement {
  const sentinel = document.createElement("a");
  sentinel.href = "#main-content";
  sentinel.textContent = "Skip to main content";
  document.body.appendChild(sentinel);
  sentinel.focus();
  return sentinel;
}

describe("ConsentBanner hydration focus guard", () => {
  let savedGtag: typeof window.gtag;

  beforeEach(() => {
    $consent.set(null);
    // initConsent() restores the store BEFORE calling injectGtag(), and injectGtag()
    // no-ops unless window.gtag is a function. Removing the stub keeps the restore
    // path intact while stopping happy-dom from trying to fetch gtag.js. These tests
    // are about focus, not analytics; the store tests cover injection.
    savedGtag = window.gtag;
    window.gtag = undefined;
  });

  afterEach(() => {
    window.gtag = savedGtag;
    $consent.set(null);
    document.querySelectorAll("a[href='#main-content']").forEach((el) => el.remove());
  });

  for (const stored of ["granted", "denied"] as const) {
    it(`does not move focus on mount when a stored "${stored}" choice is restored`, async () => {
      storeConsent(stored);
      const sentinel = focusSentinel();

      const wrapper = mount(ConsentBanner, { attachTo: document.body });
      await flushPromises();
      await nextTick();
      await flushPromises();

      // The restore did happen: the banner is gone and the cookie button is up.
      expect($consent.get()).toBe(stored);
      expect(wrapper.find(COOKIE_BTN).exists()).toBe(true);

      // ...but focus never moved off the skip-nav link.
      expect(document.activeElement).toBe(sentinel);

      wrapper.unmount();
    });
  }

  it("still moves focus to the cookie button on a genuine Decline click", async () => {
    // No stored value: the banner renders and the guard has been released.
    const sentinel = focusSentinel();

    const wrapper = mount(ConsentBanner, { attachTo: document.body });
    await flushPromises();
    await nextTick();
    await flushPromises();

    expect(wrapper.find(DECLINE_BTN).exists()).toBe(true);
    expect(document.activeElement).toBe(sentinel);

    await wrapper.find(DECLINE_BTN).trigger("click");
    await nextTick();
    await nextTick();
    await flushPromises();

    const cookieBtn = wrapper.find(COOKIE_BTN);
    expect(cookieBtn.exists()).toBe(true);
    expect(document.activeElement).toBe(cookieBtn.element);

    wrapper.unmount();
  });

  it("still moves focus to Decline when a decided user reopens preferences", async () => {
    storeConsent("denied");
    focusSentinel();

    const wrapper = mount(ConsentBanner, { attachTo: document.body });
    await flushPromises();
    await nextTick();
    await flushPromises();

    await wrapper.find(COOKIE_BTN).trigger("click");
    await nextTick();
    await nextTick();
    await flushPromises();

    const declineBtn = wrapper.find(DECLINE_BTN);
    expect(declineBtn.exists()).toBe(true);
    expect(document.activeElement).toBe(declineBtn.element);

    wrapper.unmount();
  });
});
