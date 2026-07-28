// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// MobileMenu.vue unit tests
//
// The component renders a hamburger trigger button + a drawer (#mobile-menu)
// that is always in the DOM so aria-controls has a valid target. The drawer
// is shown/hidden via the :hidden binding, not via v-if, so elements remain
// queryable regardless of open state.
//
// currentPath is set in onMounted from window.location.pathname. Tests that
// need a specific active path use history.pushState() before mounting.

import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { nextTick } from "vue";
import MobileMenu from "@/components/MobileMenu.vue";

type NavLink = { href: string; label: string; external?: boolean };

const defaultLinks: NavLink[] = [
  { href: "/adventures/", label: "Adventures" },
  { href: "/challenges/", label: "Challenges" },
  { href: "https://community.offon.dev", label: "Community", external: true },
];

function mountMenu(links: NavLink[] = defaultLinks): ReturnType<typeof mount> {
  return mount(MobileMenu, {
    props: { links },
    attachTo: document.body,
  });
}

describe("MobileMenu", () => {
  afterEach(() => {
    // Restore pathname to root
    window.history.pushState({}, "", "/");
  });

  // ── trigger button ───────────────────────────────────────────────────────────

  describe("trigger button", () => {
    it("renders a button with aria-label='Menu'", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      const trigger = wrapper.find("button[aria-label='Menu']");
      expect(trigger.exists()).toBe(true);
      wrapper.unmount();
    });

    it("has aria-expanded='false' when the menu is closed", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      const trigger = wrapper.find("button[aria-label='Menu']");
      expect(trigger.attributes("aria-expanded")).toBe("false");
      wrapper.unmount();
    });

    it("has aria-controls='mobile-menu'", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      const trigger = wrapper.find("button[aria-label='Menu']");
      expect(trigger.attributes("aria-controls")).toBe("mobile-menu");
      wrapper.unmount();
    });

    it("button has type='button'", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      expect(wrapper.find("button[aria-label='Menu']").attributes("type")).toBe("button");
      wrapper.unmount();
    });
  });

  // ── drawer element ───────────────────────────────────────────────────────────

  describe("drawer element", () => {
    it("drawer is in the DOM with id='mobile-menu'", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      expect(wrapper.find("#mobile-menu").exists()).toBe(true);
      wrapper.unmount();
    });

    it("drawer has hidden attribute when closed", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      const drawer = wrapper.find("#mobile-menu");
      // :hidden="!open" → open=false → hidden attribute present
      expect(drawer.attributes("hidden")).toBeDefined();
      wrapper.unmount();
    });
  });

  // ── open / close ─────────────────────────────────────────────────────────────

  describe("open and close", () => {
    it("clicking the trigger sets aria-expanded to 'true'", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      await wrapper.find("button[aria-label='Menu']").trigger("click");
      await nextTick();
      expect(wrapper.find("button[aria-label='Menu']").attributes("aria-expanded")).toBe("true");
      wrapper.unmount();
    });

    it("clicking the trigger removes the hidden attribute from the drawer", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      await wrapper.find("button[aria-label='Menu']").trigger("click");
      await nextTick();
      // :hidden="!open" → open=true → hidden attribute absent
      expect(wrapper.find("#mobile-menu").attributes("hidden")).toBeUndefined();
      wrapper.unmount();
    });

    it("clicking the trigger a second time closes the drawer (aria-expanded back to 'false')", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      const trigger = wrapper.find("button[aria-label='Menu']");
      await trigger.trigger("click");
      await nextTick();
      expect(trigger.attributes("aria-expanded")).toBe("true");

      await trigger.trigger("click");
      await nextTick();
      expect(trigger.attributes("aria-expanded")).toBe("false");
      wrapper.unmount();
    });

    it("clicking the trigger a second time restores the hidden attribute", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      const trigger = wrapper.find("button[aria-label='Menu']");
      await trigger.trigger("click");
      await nextTick();
      expect(wrapper.find("#mobile-menu").attributes("hidden")).toBeUndefined();

      await trigger.trigger("click");
      await nextTick();
      expect(wrapper.find("#mobile-menu").attributes("hidden")).toBeDefined();
      wrapper.unmount();
    });
  });

  // ── link rendering ───────────────────────────────────────────────────────────

  describe("link rendering", () => {
    it("renders all nav links inside the drawer", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      // Open the drawer so all links are visible
      await wrapper.find("button[aria-label='Menu']").trigger("click");
      await nextTick();
      const links = wrapper.find("#mobile-menu").findAll("a");
      expect(links).toHaveLength(defaultLinks.length);
      wrapper.unmount();
    });

    it("renders internal links with the correct href", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      const adventuresLink = wrapper
        .find("#mobile-menu")
        .findAll("a")
        .find((a) => a.text().includes("Adventures"));
      expect(adventuresLink?.attributes("href")).toBe("/adventures/");
      wrapper.unmount();
    });

    it("renders external links with target='_blank' and rel='noopener noreferrer'", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      const communityLink = wrapper
        .find("#mobile-menu")
        .findAll("a")
        .find((a) => a.text().includes("Community"));
      expect(communityLink?.attributes("target")).toBe("_blank");
      expect(communityLink?.attributes("rel")).toBe("noopener noreferrer");
      wrapper.unmount();
    });
  });

  // ── active link ──────────────────────────────────────────────────────────────

  describe("active link (aria-current)", () => {
    it("sets aria-current='page' on an internal link whose href matches the current path", async () => {
      window.history.pushState({}, "", "/adventures/");
      const wrapper = mountMenu();
      await flushPromises();

      const adventuresLink = wrapper
        .find("#mobile-menu")
        .findAll("a")
        .find((a) => a.attributes("href") === "/adventures/");

      expect(adventuresLink?.attributes("aria-current")).toBe("page");
      wrapper.unmount();
    });

    it("does not set aria-current on non-matching internal links", async () => {
      window.history.pushState({}, "", "/adventures/");
      const wrapper = mountMenu();
      await flushPromises();

      const challengesLink = wrapper
        .find("#mobile-menu")
        .findAll("a")
        .find((a) => a.attributes("href") === "/challenges/");

      expect(challengesLink?.attributes("aria-current")).toBeUndefined();
      wrapper.unmount();
    });

    it("never sets aria-current on external links even when the pathname could match", async () => {
      // External links include '://' and isActive() returns false for them
      window.history.pushState({}, "", "/");
      const wrapper = mountMenu([
        { href: "https://community.offon.dev/", label: "Community", external: true },
      ]);
      await flushPromises();

      const link = wrapper.find("#mobile-menu a");
      expect(link.attributes("aria-current")).toBeUndefined();
      wrapper.unmount();
    });

    it("sets aria-current on a sub-path match (startsWith semantics)", async () => {
      window.history.pushState({}, "", "/adventures/git-adventure/levels/beginner/");
      const wrapper = mountMenu();
      await flushPromises();

      // /adventures/ is a prefix of the current pathname
      const adventuresLink = wrapper
        .find("#mobile-menu")
        .findAll("a")
        .find((a) => a.attributes("href") === "/adventures/");

      expect(adventuresLink?.attributes("aria-current")).toBe("page");
      wrapper.unmount();
    });

    it("sets aria-current as 'page' string, not just a truthy value", async () => {
      window.history.pushState({}, "", "/challenges/");
      const wrapper = mountMenu();
      await flushPromises();

      const challengesLink = wrapper
        .find("#mobile-menu")
        .findAll("a")
        .find((a) => a.attributes("href") === "/challenges/");

      expect(challengesLink?.attributes("aria-current")).toBe("page");
      wrapper.unmount();
    });
  });

  // ── keyboard interaction ─────────────────────────────────────────────────────

  describe("keyboard interaction", () => {
    it("Escape key closes an open drawer", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      const trigger = wrapper.find("button[aria-label='Menu']");

      await trigger.trigger("click");
      await nextTick();
      expect(trigger.attributes("aria-expanded")).toBe("true");

      // Dispatch Escape on the document (the handler listens on document)
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await nextTick();

      expect(trigger.attributes("aria-expanded")).toBe("false");
      wrapper.unmount();
    });

    it("Escape key does nothing when the drawer is already closed", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      const trigger = wrapper.find("button[aria-label='Menu']");
      expect(trigger.attributes("aria-expanded")).toBe("false");

      // Should not throw and should leave the drawer closed
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await nextTick();

      expect(trigger.attributes("aria-expanded")).toBe("false");
      wrapper.unmount();
    });

    it("non-Escape keys do not close the drawer", async () => {
      const wrapper = mountMenu();
      await flushPromises();
      await wrapper.find("button[aria-label='Menu']").trigger("click");
      await nextTick();
      expect(wrapper.find("button[aria-label='Menu']").attributes("aria-expanded")).toBe("true");

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
      await nextTick();

      expect(wrapper.find("button[aria-label='Menu']").attributes("aria-expanded")).toBe("true");
      wrapper.unmount();
    });
  });

  // ── cleanup on unmount ───────────────────────────────────────────────────────

  describe("cleanup on unmount", () => {
    it("removes the keydown listener when unmounted", async () => {
      const removeListenerSpy = vi.spyOn(document, "removeEventListener");
      const wrapper = mountMenu();
      await flushPromises();
      await wrapper.find("button[aria-label='Menu']").trigger("click");
      await nextTick();

      wrapper.unmount();

      // removeEventListener is called for "keydown" (and astro:before-swap etc.)
      const keydownCalls = removeListenerSpy.mock.calls.filter((c) => c[0] === "keydown");
      expect(keydownCalls.length).toBeGreaterThan(0);
      removeListenerSpy.mockRestore();
    });
  });
});
