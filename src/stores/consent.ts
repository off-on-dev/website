import { atom } from "nanostores";
import { GA_MEASUREMENT_ID, CONSENT_STORAGE_KEY, CONSENT_EXPIRY_MS } from "@/lib/site";

// Consent state machine ported from src/hooks/useConsent.tsx. See the CLAUDE.md
// "Consent state machine" table — every transition here mirrors a row.
//
// Uses a plain atom (default null) rather than @nanostores/persistent so the
// island's first client render matches SSR (null); localStorage is read in
// initConsent() on mount, not at store init (which would cause a hydration
// mismatch for returning users). The stored format ({value, timestamp} + 180d
// expiry) is identical to the React app's, so existing consent survives cutover.

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

function readStored(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
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
// within the session, gtag.js is already running — flip consent only.
function injectGtag(): void {
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", { analytics_storage: "granted" });
  if (gtagScriptInjected) return;
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    cookie_flags: "SameSite=Lax;Secure",
    cookie_expires: 15552000,
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
// replace window.gtag — gtag.js stops sending hits when analytics_storage flips.
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

// Fire a GA4 page_view — only when consent is granted and gtag.js is loaded.
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
let clickTrackerBound = false;
export function trackClicks(): void {
  if (clickTrackerBound) return;
  clickTrackerBound = true;
  document.addEventListener(
    "click",
    (e) => {
      if ($consent.get() !== "granted" || typeof window.gtag !== "function") return;
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.("a[href], button");
      if (!el) return;
      window.gtag("event", "click_event", {
        element: el.tagName.toLowerCase(),
        link_text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 100),
        ...(el.tagName === "A" ? { link_url: (el as HTMLAnchorElement).href } : {}),
      });
    },
    { capture: true },
  );
}
