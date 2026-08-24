// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// ─────────────────────────────────────────────────────────────────────────────
// Consent store unit tests
//
// Organisation:
//   1. Static-import section - covers atom state, gtag consent-update calls,
//      localStorage, and cookie clearing. Does NOT assert on script injection
//      or gtag("js") / gtag("config"), because gtagScriptInjected is
//      module-scoped and would already be true after the first grant().
//   2. Module-guard sections - each describe resets the module registry via
//      vi.resetModules() so gtagScriptInjected and clickTrackerBound start false.
// ─────────────────────────────────────────────────────────────────────────────

import {
  $consent,
  grant,
  deny,
  reset,
  initConsent,
  firePageView,
  trackClicks,
} from "@/stores/consent";
import { CONSENT_STORAGE_KEY, CONSENT_EXPIRY_MS, GA_MEASUREMENT_ID } from "@/lib/site";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Write a consent entry with an optional artificial age in ms. */
function seedConsent(value: "granted" | "denied", ageMsAgo = 0): void {
  localStorage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({ value, timestamp: Date.now() - ageMsAgo }),
  );
}

/** Typed access to the vi.fn() mock on window.gtag. */
function gtagMock(): ReturnType<typeof vi.fn> {
  return window.gtag as ReturnType<typeof vi.fn>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Static-import tests: state machine transitions + feature behaviour
// ─────────────────────────────────────────────────────────────────────────────

describe("consent store", () => {
  // Return to null state before every test so each transition starts clean.
  // setup.ts already clears localStorage, cookies, and all mocks; calling
  // reset() here also zeros the $consent atom and calls vi.clearAllMocks()
  // to flush the gtag calls that reset() itself makes.
  beforeEach(() => {
    reset();
    vi.clearAllMocks();
  });

  // ── null → granted (Accept) ───────────────────────────────────────────────

  describe("null → granted (Accept)", () => {
    it("transitions $consent from null to 'granted'", () => {
      expect($consent.get()).toBeNull();
      grant();
      expect($consent.get()).toBe("granted");
    });

    it("writes { value: 'granted', timestamp } to localStorage", () => {
      const before = Date.now();
      grant();
      const after = Date.now();
      const stored = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY)!);
      expect(stored.value).toBe("granted");
      expect(stored.timestamp).toBeGreaterThanOrEqual(before);
      expect(stored.timestamp).toBeLessThanOrEqual(after);
    });

    it("calls gtag consent update with analytics_storage: 'granted'", () => {
      grant();
      expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "granted",
      });
    });

    it("does not issue a denied consent update", () => {
      grant();
      const deniedCalls = gtagMock().mock.calls.filter(
        (c) => c[0] === "consent" && (c[2] as Record<string, string>)?.analytics_storage === "denied",
      );
      expect(deniedCalls).toHaveLength(0);
    });
  });

  // ── null → denied (Decline) ───────────────────────────────────────────────

  describe("null → denied (Decline)", () => {
    it("transitions $consent from null to 'denied'", () => {
      expect($consent.get()).toBeNull();
      deny();
      expect($consent.get()).toBe("denied");
    });

    it("writes { value: 'denied', timestamp } to localStorage", () => {
      const before = Date.now();
      deny();
      const after = Date.now();
      const stored = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY)!);
      expect(stored.value).toBe("denied");
      expect(stored.timestamp).toBeGreaterThanOrEqual(before);
      expect(stored.timestamp).toBeLessThanOrEqual(after);
    });

    it("calls gtag consent update with analytics_storage: 'denied'", () => {
      deny();
      expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "denied",
      });
    });

    it("clears _ga* cookies while leaving unrelated cookies intact", () => {
      document.cookie = "_ga=abc";
      document.cookie = "_gat=xyz";
      document.cookie = "session=keep";
      deny();
      expect(document.cookie).not.toContain("_ga=abc");
      expect(document.cookie).not.toContain("_gat=xyz");
      expect(document.cookie).toContain("session=keep");
    });
  });

  // ── granted → denied ──────────────────────────────────────────────────────

  describe("granted → denied", () => {
    it("revokes analytics consent and clears _ga* cookies after a prior grant", () => {
      grant();
      vi.clearAllMocks();
      document.cookie = "_ga=abc123";

      deny();

      expect($consent.get()).toBe("denied");
      expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "denied",
      });
      expect(document.cookie).not.toContain("_ga=abc123");
    });

    it("does not issue a granted consent update on deny", () => {
      grant();
      vi.clearAllMocks();
      deny();
      const grantedCalls = gtagMock().mock.calls.filter(
        (c) => c[0] === "consent" && (c[2] as Record<string, string>)?.analytics_storage === "granted",
      );
      expect(grantedCalls).toHaveLength(0);
    });
  });

  // ── denied → granted ──────────────────────────────────────────────────────

  describe("denied → granted", () => {
    it("sets consent to granted and issues a granted consent update", () => {
      deny();
      vi.clearAllMocks();

      grant();

      expect($consent.get()).toBe("granted");
      expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "granted",
      });
    });
  });

  // ── granted / denied → null (Cookie Preferences / reset) ─────────────────

  describe("reset() - granted/denied → null", () => {
    it("sets $consent to null from granted", () => {
      grant();
      reset();
      expect($consent.get()).toBeNull();
    });

    it("sets $consent to null from denied", () => {
      deny();
      reset();
      expect($consent.get()).toBeNull();
    });

    it("removes the consent entry from localStorage", () => {
      grant();
      reset();
      expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
    });

    it("calls gtag consent update with denied on reset from granted", () => {
      grant();
      vi.clearAllMocks();
      reset();
      expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "denied",
      });
    });

    it("calls gtag consent update with denied on reset from denied", () => {
      deny();
      vi.clearAllMocks();
      reset();
      expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "denied",
      });
    });

    it("clears _ga* cookies", () => {
      document.cookie = "_ga=abc";
      document.cookie = "_gat=xyz";
      reset();
      expect(document.cookie).not.toContain("_ga=abc");
      expect(document.cookie).not.toContain("_gat=xyz");
    });

    it("does not throw when $consent is already null", () => {
      expect($consent.get()).toBeNull();
      expect(() => reset()).not.toThrow();
    });
  });

  // ── initConsent() ─────────────────────────────────────────────────────────

  describe("initConsent()", () => {
    it("leaves $consent null and does not call gtag when no stored value", () => {
      initConsent();
      expect($consent.get()).toBeNull();
      expect(window.gtag).not.toHaveBeenCalled();
    });

    it("restores stored denied without calling gtag", () => {
      seedConsent("denied");
      initConsent();
      expect($consent.get()).toBe("denied");
      expect(window.gtag).not.toHaveBeenCalled();
    });

    it("restores stored granted and calls gtag consent update granted", () => {
      seedConsent("granted");
      initConsent();
      expect($consent.get()).toBe("granted");
      expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "granted",
      });
    });

    it("ignores stored consent older than CONSENT_EXPIRY_MS and removes it", () => {
      seedConsent("granted", CONSENT_EXPIRY_MS + 1_000);
      initConsent();
      expect($consent.get()).toBeNull();
      expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
    });

    it("handles malformed JSON in localStorage gracefully", () => {
      localStorage.setItem(CONSENT_STORAGE_KEY, "{bad json{{");
      expect(() => initConsent()).not.toThrow();
      expect($consent.get()).toBeNull();
    });

    it("forces denied when GPC is active and no stored value", () => {
      Object.defineProperty(navigator, "globalPrivacyControl", {
        value: true,
        configurable: true,
        writable: true,
      });
      try {
        initConsent();
        expect($consent.get()).toBe("denied");
        expect(JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY)!).value).toBe("denied");
      } finally {
        delete (navigator as any).globalPrivacyControl;
      }
    });

    it("forces denied when GPC is active and stored value is denied", () => {
      Object.defineProperty(navigator, "globalPrivacyControl", {
        value: true,
        configurable: true,
        writable: true,
      });
      try {
        seedConsent("denied");
        initConsent();
        expect($consent.get()).toBe("denied");
      } finally {
        delete (navigator as any).globalPrivacyControl;
      }
    });

    it("respects an explicit stored grant even when GPC is active", () => {
      Object.defineProperty(navigator, "globalPrivacyControl", {
        value: true,
        configurable: true,
        writable: true,
      });
      try {
        seedConsent("granted");
        initConsent();
        expect($consent.get()).toBe("granted");
      } finally {
        delete (navigator as any).globalPrivacyControl;
      }
    });

    it("clears _ga* cookies when GPC forces a denied state", () => {
      document.cookie = "_ga=gpc-deny-test";
      Object.defineProperty(navigator, "globalPrivacyControl", {
        value: true,
        configurable: true,
        writable: true,
      });
      try {
        initConsent();
        expect(document.cookie).not.toContain("_ga=gpc-deny-test");
      } finally {
        delete (navigator as any).globalPrivacyControl;
      }
    });
  });

  // ── firePageView() ────────────────────────────────────────────────────────

  describe("firePageView()", () => {
    it("does nothing when consent is null", () => {
      expect($consent.get()).toBeNull();
      firePageView();
      expect(window.gtag).not.toHaveBeenCalledWith("event", "page_view", expect.anything());
    });

    it("does nothing when consent is denied", () => {
      deny();
      vi.clearAllMocks();
      firePageView();
      expect(window.gtag).not.toHaveBeenCalledWith("event", "page_view", expect.anything());
    });

    it("does nothing when window.gtag is not a function", () => {
      grant();
      const original = window.gtag;
      try {
        (window as any).gtag = undefined;
        expect(() => firePageView()).not.toThrow();
      } finally {
        window.gtag = original;
      }
    });

    it("fires page_view when consent is granted and gtag is a function", () => {
      grant();
      vi.clearAllMocks();
      firePageView();
      expect(window.gtag).toHaveBeenCalledWith("event", "page_view", {
        page_path: window.location.pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    });
  });

  // trackClicks() - behaviour ─────────────────────────────────────────────
  //
  // clickTrackerBound is module-scoped; once the listener is registered in the
  // first test that calls trackClicks(), subsequent calls are no-ops. That is
  // fine here because the listener gate-checks $consent at click time, so
  // controlling the atom value controls the outcome regardless of which test
  // first registered the listener.

  describe("trackClicks() - behaviour", () => {
    it("does not call gtag for button clicks when consent is null", () => {
      trackClicks();
      const btn = document.createElement("button");
      btn.textContent = "Click me";
      document.body.appendChild(btn);
      btn.click();
      document.body.removeChild(btn);
      expect(window.gtag).not.toHaveBeenCalledWith("event", "click_event", expect.anything());
    });

    it("does not call gtag for button clicks when consent is denied", () => {
      deny();
      vi.clearAllMocks();
      trackClicks();
      const btn = document.createElement("button");
      btn.textContent = "Click me";
      document.body.appendChild(btn);
      btn.click();
      document.body.removeChild(btn);
      expect(window.gtag).not.toHaveBeenCalledWith("event", "click_event", expect.anything());
    });

    it("calls gtag click_event for a <button> when consent is granted", () => {
      grant();
      vi.clearAllMocks();
      trackClicks();
      const btn = document.createElement("button");
      btn.textContent = "Submit";
      document.body.appendChild(btn);
      btn.click();
      document.body.removeChild(btn);
      expect(window.gtag).toHaveBeenCalledWith("event", "click_event", {
        click_element: "button",
        click_text: "Submit",
        click_url: "no-url",
        click_page: window.location.pathname,
      });
    });

    it("calls gtag click_event with click_url for an <a> when consent is granted", () => {
      grant();
      vi.clearAllMocks();
      trackClicks();
      const a = document.createElement("a");
      a.href = "https://offon.dev/adventures/";
      a.textContent = "Adventures";
      document.body.appendChild(a);
      // Read the pathname before the click: happy-dom follows the anchor, so
      // window.location has already changed by assertion time.
      const pathAtClick = window.location.pathname;
      a.click();
      document.body.removeChild(a);
      expect(window.gtag).toHaveBeenCalledWith("event", "click_event", {
        click_element: "a",
        click_text: "Adventures",
        click_url: a.href,
        click_page: pathAtClick,
      });
    });

    it("ignores clicks on non-interactive elements", () => {
      grant();
      vi.clearAllMocks();
      trackClicks();
      const div = document.createElement("div");
      div.textContent = "Not interactive";
      document.body.appendChild(div);
      div.click();
      document.body.removeChild(div);
      expect(window.gtag).not.toHaveBeenCalledWith("event", "click_event", expect.anything());
    });

    it("truncates click_text to 100 characters", () => {
      grant();
      vi.clearAllMocks();
      trackClicks();
      const btn = document.createElement("button");
      btn.textContent = "A".repeat(200);
      document.body.appendChild(btn);
      btn.click();
      document.body.removeChild(btn);
      const clickCall = gtagMock().mock.calls.find(
        (c) => c[0] === "event" && c[1] === "click_event",
      );
      expect(clickCall).toBeDefined();
      expect((clickCall![2] as Record<string, string>).click_text).toHaveLength(100);
    });

    it("collapses internal whitespace in click_text", () => {
      grant();
      vi.clearAllMocks();
      trackClicks();
      const btn = document.createElement("button");
      btn.textContent = "  Hello   World  ";
      document.body.appendChild(btn);
      btn.click();
      document.body.removeChild(btn);
      const clickCall = gtagMock().mock.calls.find(
        (c) => c[0] === "event" && c[1] === "click_event",
      );
      expect((clickCall![2] as Record<string, string>).click_text).toBe("Hello World");
    });

    it("tracks a click on a child element inside a <button>", () => {
      grant();
      vi.clearAllMocks();
      trackClicks();
      const btn = document.createElement("button");
      btn.textContent = "Parent";
      const span = document.createElement("span");
      span.textContent = "Child";
      btn.appendChild(span);
      document.body.appendChild(btn);
      span.click(); // click the inner span; closest() should resolve to the button
      document.body.removeChild(btn);
      expect(window.gtag).toHaveBeenCalledWith("event", "click_event", {
        click_element: "button",
        click_text: "ParentChild",
        click_url: "no-url",
        click_page: window.location.pathname,
      });
    });

    // ── payload parity with the React useClickTracking hook (P7) ──────────────
    //
    // GA4 custom dimensions and saved reports are keyed on these exact parameter
    // names and fallback values. The migration had renamed them to
    // element/link_text/link_url and dropped click_page, silently breaking every
    // existing report at cutover.

    it("prefers aria-label over textContent so icon-only controls are identifiable", () => {
      grant();
      vi.clearAllMocks();
      trackClicks();
      const btn = document.createElement("button");
      btn.setAttribute("aria-label", "Switch to light mode");
      btn.innerHTML = '<svg aria-hidden="true"></svg>';
      document.body.appendChild(btn);
      btn.click();
      document.body.removeChild(btn);
      expect(window.gtag).toHaveBeenCalledWith("event", "click_event", {
        click_element: "button",
        click_text: "Switch to light mode",
        click_url: "no-url",
        click_page: window.location.pathname,
      });
    });

    it('falls back to "unknown" when there is no label and no text', () => {
      grant();
      vi.clearAllMocks();
      trackClicks();
      const btn = document.createElement("button");
      document.body.appendChild(btn);
      btn.click();
      document.body.removeChild(btn);
      const call = gtagMock().mock.calls.find((c) => c[1] === "click_event");
      expect((call![2] as Record<string, string>).click_text).toBe("unknown");
    });

    it("falls back to data-url when the element is not an anchor", () => {
      grant();
      vi.clearAllMocks();
      trackClicks();
      const btn = document.createElement("button");
      btn.textContent = "Open";
      btn.setAttribute("data-url", "https://offon.dev/handbook/");
      document.body.appendChild(btn);
      btn.click();
      document.body.removeChild(btn);
      const call = gtagMock().mock.calls.find((c) => c[1] === "click_event");
      expect((call![2] as Record<string, string>).click_url).toBe("https://offon.dev/handbook/");
    });

    it("does not track the skip-nav link", () => {
      grant();
      vi.clearAllMocks();
      trackClicks();
      const a = document.createElement("a");
      a.setAttribute("href", "#main-content");
      a.textContent = "Skip to main content";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      expect(window.gtag).not.toHaveBeenCalledWith("event", "click_event", expect.anything());
    });

    it("tracks an <a> with no href (the selector is 'a, button', not 'a[href]')", () => {
      grant();
      vi.clearAllMocks();
      trackClicks();
      const a = document.createElement("a");
      a.textContent = "Placeholder";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      const call = gtagMock().mock.calls.find((c) => c[1] === "click_event");
      expect(call).toBeDefined();
      expect((call![2] as Record<string, string>).click_url).toBe("no-url");
    });

    it("reports the current pathname as click_page", () => {
      grant();
      vi.clearAllMocks();
      trackClicks();
      const btn = document.createElement("button");
      btn.textContent = "Go";
      document.body.appendChild(btn);
      btn.click();
      document.body.removeChild(btn);
      const call = gtagMock().mock.calls.find((c) => c[1] === "click_event");
      expect((call![2] as Record<string, string>).click_page).toBe(window.location.pathname);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// gtagScriptInjected guard - requires fresh module state
// ─────────────────────────────────────────────────────────────────────────────

describe("consent store - gtagScriptInjected guard", () => {
  beforeEach(() => {
    vi.resetModules();
    // Re-stub gtag; a fresh module import may run before setup.ts stubs are in
    // place in some environments, and vi.resetModules() can clear module-level
    // references. Reassigning here guarantees a clean mock.
    window.gtag = vi.fn();
    window.dataLayer = [];
    localStorage.clear();
  });

  afterEach(() => {
    // Remove injected script tags so the DOM is clean for the next test.
    document.querySelectorAll('script[id="gtag-script"]').forEach((s) => s.remove());
  });

  it("appends the gtag.js script tag to <head> on first grant", async () => {
    const { grant } = await import("@/stores/consent");
    grant();
    const script = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    expect(script).not.toBeNull();
    expect((script as HTMLScriptElement).src).toContain(GA_MEASUREMENT_ID);
  });

  it("calls gtag('js', Date) and gtag('config', ...) on first grant", async () => {
    const { grant } = await import("@/stores/consent");
    grant();
    expect(window.gtag).toHaveBeenCalledWith("js", expect.any(Date));
    expect(window.gtag).toHaveBeenCalledWith("config", GA_MEASUREMENT_ID, {
      cookie_flags: "SameSite=Lax;Secure",
      cookie_expires: CONSENT_EXPIRY_MS / 1000,
      send_page_view: false,
    });
  });

  it("does not append a second script tag on re-grant", async () => {
    const { grant } = await import("@/stores/consent");
    grant();
    vi.clearAllMocks();
    grant();
    const scripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
    expect(scripts).toHaveLength(1);
  });

  it("does not call gtag('js') or gtag('config') on re-grant", async () => {
    const { grant } = await import("@/stores/consent");
    grant();
    vi.clearAllMocks();
    grant();
    expect(window.gtag).not.toHaveBeenCalledWith("js", expect.any(Date));
    expect(window.gtag).not.toHaveBeenCalledWith("config", GA_MEASUREMENT_ID, expect.anything());
  });

  it("still calls consent update on every grant regardless of the injection guard", async () => {
    const { grant } = await import("@/stores/consent");
    grant();
    grant();
    const grantedUpdates = gtagMock().mock.calls.filter(
      (c) => c[0] === "consent" && c[1] === "update" && (c[2] as Record<string, string>)?.analytics_storage === "granted",
    );
    expect(grantedUpdates).toHaveLength(2);
  });

  it("does not inject the script when window.gtag is not a function at grant time", async () => {
    (window as any).gtag = "not-a-function";
    const { grant } = await import("@/stores/consent");
    grant();
    const script = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    expect(script).toBeNull();
  });

  it("injects the script via initConsent when stored consent is granted", async () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ value: "granted", timestamp: Date.now() }),
    );
    const { initConsent } = await import("@/stores/consent");
    initConsent();
    const script = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    expect(script).not.toBeNull();
  });

  it("does not inject the script via initConsent when stored consent is denied", async () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ value: "denied", timestamp: Date.now() }),
    );
    const { initConsent } = await import("@/stores/consent");
    initConsent();
    const script = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    expect(script).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// clickTrackerBound guard - requires fresh module state
// ─────────────────────────────────────────────────────────────────────────────

describe("consent store - clickTrackerBound guard", () => {
  beforeEach(() => {
    vi.resetModules();
    window.gtag = vi.fn();
    window.dataLayer = [];
    localStorage.clear();
  });

  it("registers the document click listener exactly once across multiple trackClicks() calls", async () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    const { trackClicks } = await import("@/stores/consent");

    trackClicks();
    trackClicks();
    trackClicks();

    const clickListeners = addEventListenerSpy.mock.calls.filter((c) => c[0] === "click");
    expect(clickListeners).toHaveLength(1);
    addEventListenerSpy.mockRestore();
  });
});
