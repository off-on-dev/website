import { atom } from "nanostores";
import { GA_MEASUREMENT_ID, CONSENT_STORAGE_KEY, CONSENT_EXPIRY_MS } from "@/lib/site";

// Consent state machine. See the CLAUDE.md "Consent state machine" table —
// every transition here mirrors a row.
//
// Uses a plain atom (default null) rather than @nanostores/persistent so the
// island's first client render matches SSR (null); localStorage is read in
// initConsent() on mount, not at store init (which would cause a hydration
// mismatch for returning users). The stored format is {value, timestamp} with
// a 180-day expiry (key: CONSENT_STORAGE_KEY).

export type ConsentValue = "granted" | "denied";
type StoredConsent = { value: ConsentValue; timestamp: number };

// null = undecided (show banner); "granted"/"denied" = decided.
export const $consent = atom<ConsentValue | null>(null);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Module-scoped guard: append gtag.js at most once per session across any
// deny -> grant -> deny -> grant cycle.
let gtagScriptInjected = false;

function isValidStoredConsent(value: unknown): value is StoredConsent {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).timestamp === "number" &&
    ((value as Record<string, unknown>).value === "granted" ||
      (value as Record<string, unknown>).value === "denied")
  );
}

function readStored(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidStoredConsent(parsed)) {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }
    if (Date.now() - parsed.timestamp > CONSENT_EXPIRY_MS) {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(value: ConsentValue): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value, timestamp: Date.now() }));
  } catch {
    /* storage unavailable */
  }
}

// Clears any _ga* cookies a prior granted session set (host-only, no Domain).
function clearGaCookies(): void {
  const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie.split(";").forEach((entry) => {
    const name = entry.split("=")[0]?.trim();
    if (!name || !name.startsWith("_ga")) return;
    document.cookie = `${name}=; path=/; ${expired}`;
  });
}

// Queue consent update + js + config synchronously BEFORE appending the script,
// so gtag.js drains the dataLayer in the correct order on load. On a re-grant
// within the session, gtag.js is already running - flip consent only.
function injectGtag(): void {
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", { analytics_storage: "granted" });
  if (gtagScriptInjected) return;
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    cookie_flags: "SameSite=Lax;Secure",
    cookie_expires: CONSENT_EXPIRY_MS / 1000,
    send_page_view: false,
  });
  const script = document.createElement("script");
  script.id = "gtag-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  gtagScriptInjected = true;
}

// Denied consent update only. Does not remove the script, wipe dataLayer, or
// replace window.gtag - gtag.js stops sending hits when analytics_storage flips.
function revokeAnalyticsConsent(): void {
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", { analytics_storage: "denied" });
}

export function grant(): void {
  writeStored("granted");
  $consent.set("granted");
  injectGtag();
}

export function deny(): void {
  writeStored("denied");
  $consent.set("denied");
  revokeAnalyticsConsent();
  clearGaCookies();
}

export function reset(): void {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
  $consent.set(null);
  revokeAnalyticsConsent();
  clearGaCookies();
}

// Run once on mount: GPC opt-out + restore stored choice (+ inject on granted).
export function initConsent(): void {
  const stored = readStored();
  const gpcActive =
    typeof navigator !== "undefined" &&
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  if (gpcActive && stored?.value !== "granted") {
    writeStored("denied");
    $consent.set("denied");
    clearGaCookies();
    return;
  }
  if (!stored) return;
  $consent.set(stored.value);
  if (stored.value === "granted") injectGtag();
}

// Fire a GA4 page_view - only when consent is granted and gtag.js is loaded.
// Called on astro:page-load so client navigations are tracked without queueing
// events while consent is undecided/denied.
export function firePageView(): void {
  if ($consent.get() !== "granted" || typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_path: window.location.pathname,
    page_location: window.location.href,
    page_title: document.title,
  });
}

// Delegated click tracking, gated on consent at click time. Registered once
// (the consent island is transition:persist), so it survives View Transitions.
//
// The payload is a compatibility surface: GA4 custom dimensions and saved
// reports are keyed on these exact parameter names. Renaming one silently
// breaks every report that uses it, with no error anywhere. Do not rename them.

const TRACKED_SELECTOR = "a, button";
// GA4 silently truncates string parameter values at 100 chars. Truncate
// ourselves so the limit is visible in the source rather than discovered
// through missing-tail data in reports.
const MAX_CLICK_TEXT_LENGTH = 100;
// Skip-nav link target. Excluded because it fires on every keyboard Tab+Enter
// and reflects assistive-tech navigation, not user intent.
const SKIP_NAV_HREF = "#main-content";

let clickTrackerBound = false;
let clickHandler: ((e: MouseEvent) => void) | null = null;

export function trackClicks(): void {
  if (clickTrackerBound) return;
  clickTrackerBound = true;
  clickHandler = (e: MouseEvent) => {
    if ($consent.get() !== "granted" || typeof window.gtag !== "function") return;
    const target = e.target as Element | null;
    if (!target || typeof target.closest !== "function") return;
    const tracked = target.closest(TRACKED_SELECTOR);
    if (!tracked) return;

    if (tracked instanceof HTMLAnchorElement && tracked.getAttribute("href") === SKIP_NAV_HREF) {
      return;
    }

    // Prefer aria-label so icon-only controls (theme toggle, cookie button,
    // copy, dismiss) report something meaningful instead of an empty string.
    // Internal whitespace is collapsed so multi-line labels do not fragment
    // into separate values in reports.
    const rawText =
      (tracked.getAttribute("aria-label") || tracked.textContent || "").replace(/\s+/g, " ").trim() ||
      "unknown";
    const href = tracked instanceof HTMLAnchorElement ? tracked.href : "";

    window.gtag("event", "click_event", {
      click_text: rawText.slice(0, MAX_CLICK_TEXT_LENGTH),
      click_url: href || tracked.getAttribute("data-url") || "no-url",
      click_element: tracked.tagName.toLowerCase(),
      click_page: window.location.pathname,
    });
  };
  document.addEventListener("click", clickHandler, { capture: true });
}

export function stopTrackClicks(): void {
  if (clickHandler) {
    document.removeEventListener("click", clickHandler, { capture: true });
    clickHandler = null;
  }
  clickTrackerBound = false;
}
