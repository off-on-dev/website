import { useState, useEffect, useCallback, useContext, createContext, ReactNode, type JSX } from "react";
import { GA_MEASUREMENT_ID, CONSENT_STORAGE_KEY, CONSENT_EXPIRY_MS } from "@/data/constants";

export type ConsentValue = "granted" | "denied";

type StoredConsent = {
  value: ConsentValue;
  timestamp: number;
};

// Module-scoped guard so the gtag.js script tag is appended at most once per
// session. Both the Accept click and the mount-restore-from-localStorage path
// route through the same injector and consult this flag, so a deny -> grant ->
// deny -> grant cycle never appends a second script tag and a tab that already
// loaded gtag.js does not load it again on a re-grant.
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
    const stored: StoredConsent = { value, timestamp: Date.now() };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));
  } catch { /* storage unavailable */ }
}

// Clears any GA4 cookies that gtag.js set during a prior granted session.
// Without this, declining only stops new hits but leaves _ga and _ga_<id>
// on disk, which is not what users reasonably expect "decline" to do.
// gtag.js writes these as host-only cookies (no Domain attribute on the
// cookie) when its domain setting is left at the gtag.js default, so we
// clear with no domain attribute to match.
function clearGaCookies(): void {
  const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie.split(";").forEach((entry) => {
    const name = entry.split("=")[0]?.trim();
    if (!name || !name.startsWith("_ga")) return;
    document.cookie = `${name}=; path=/; ${expired}`;
  });
}

// Shared injector for both the Accept click and the mount-restore path. The
// queue order matters: the inline bootstrap in root.tsx has already pushed
// `consent default (denied)` into dataLayer. We push consent update + js +
// config synchronously before appending the script tag, so when gtag.js
// loads and drains the queue it processes:
//   1. consent default (denied)   - from the bootstrap
//   2. consent update (granted)   - from us
//   3. js                          - from us
//   4. config                      - from us
// After that drain, gtag.js replaces dataLayer.push with a live processor and
// any subsequent commands (page_view, click_event, deny, re-grant) are
// handled in real time. Putting the consent update inside script.onload
// would race with React effects that fire page_view between appendChild and
// onload, sending events while the consent state is still seen as denied.
function injectGtag(): void {
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", { analytics_storage: "granted" });
  // js, config, and the script tag belong to the first-injection path only.
  // On a re-grant within the same session (deny -> grant), gtag.js is still
  // running from the original load and has already processed js + config; we
  // only need to flip the consent state.
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

// Pushes a denied consent update. Intentionally does not remove the script
// tag, wipe dataLayer, or replace window.gtag with a no-op. gtag.js stops
// sending hits the moment analytics_storage flips to denied; doing more
// orphans gtag.js's internal references and silently breaks subsequent
// measurement on a re-grant within the same session.
function revokeAnalyticsConsent(): void {
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", { analytics_storage: "denied" });
}

type ConsentContextValue = {
  // null = not yet decided (show banner), "granted" | "denied" = decided
  consent: ConsentValue | null;
  grant: () => void;
  deny: () => void;
  reset: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

type ConsentProviderProps = {
  children: ReactNode;
};

export function ConsentProvider({ children }: ConsentProviderProps): JSX.Element {
  const [consent, setConsent] = useState<ConsentValue | null>(null);

  // Restore stored choice into React state on mount. If the prior decision was
  // granted, also run the injector so gtag.js loads on a hard reload without
  // requiring a second click. Both paths share the same module-scoped guard
  // so the script tag is appended at most once per session.
  useEffect(() => {
    const stored = readStored();

    // Global Privacy Control: if the browser signals opt-out and the user has
    // not explicitly granted consent in this browser, treat it as denied and
    // skip the banner entirely. An explicit prior Accept overrides GPC so the
    // user's deliberate choice is respected.
    const gpcActive =
      typeof navigator !== "undefined" &&
      (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
    if (gpcActive && stored?.value !== "granted") {
      writeStored("denied");
      setConsent("denied"); // eslint-disable-line react-hooks/set-state-in-effect -- GPC opt-out resolved from navigator at mount; same constraint as stored-consent restore below
      clearGaCookies();
      return;
    }

    if (!stored) return;
    setConsent(stored.value);
    if (stored.value === "granted") {
      injectGtag();
    }
  }, []);

  const grant = useCallback((): void => {
    writeStored("granted");
    setConsent("granted");
    injectGtag();
  }, []);

  const deny = useCallback((): void => {
    writeStored("denied");
    setConsent("denied");
    revokeAnalyticsConsent();
    clearGaCookies();
  }, []);

  // Clears the stored choice and re-shows the banner. Called by the cookie
  // preferences floating button. Mirrors deny in terms of gtag state and
  // cookie cleanup, but moves React state back to null instead of "denied"
  // so the banner reappears.
  const reset = useCallback((): void => {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch { /* storage unavailable */ }
    setConsent(null);
    revokeAnalyticsConsent();
    clearGaCookies();
  }, []);

  return (
    <ConsentContext.Provider value={{ consent, grant, deny, reset }}>
      {children}
    </ConsentContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- intentional: context hook + provider in one file
export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
}

// Test-only: lets the consent test reset the module-scoped injection guard
// between cases. Production code never needs this; the boolean is intentionally
// session-scoped.
// eslint-disable-next-line react-refresh/only-export-components -- intentional: test helper colocated with hook
export function __resetGtagInjectionForTests(): void {
  gtagScriptInjected = false;
}
