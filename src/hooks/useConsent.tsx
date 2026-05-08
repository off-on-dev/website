import { useState, useEffect, useCallback, useContext, createContext, ReactNode, type JSX } from "react";
import { GA_MEASUREMENT_ID, CONSENT_STORAGE_KEY, CONSENT_EXPIRY_MS } from "@/data/constants";

export type ConsentValue = "granted" | "denied";

type StoredConsent = {
  value: ConsentValue;
  timestamp: number;
};


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

function updateGtag(value: ConsentValue): void {
  if (typeof window.gtag !== "function") return;
  window.gtag("consent", "update", { analytics_storage: value });
}

// Dynamically injects gtag.js and initialises the config. Safe to call multiple
// times - the script tag is only added once (guarded by id).
// Also restores the dataLayer push shim in case revokeGtag() replaced window.gtag
// with a no-op (deny → grant cycle).
function loadGtag(): void {
  // Restore the dataLayer shim before queuing any commands. If revokeGtag()
  // replaced window.gtag with a no-op, this ensures consent updates and config
  // commands are properly queued for gtag.js to process on load.
  window.dataLayer = window.dataLayer || [];
  const dl = window.dataLayer as unknown[];
  window.gtag = (...args: unknown[]): void => { dl.push(args); };

  // Queue js + config synchronously so they sit before any subsequent event in
  // dataLayer. gtag.js processes the queue in order on load; pushing these in
  // script.onload would race with effects (e.g. ScrollToTop's page_view) that
  // can fire between appendChild and onload, causing those events to be
  // processed without a known measurement ID. Repeated config calls are
  // documented as safe and re-apply settings each time.
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });

  // The consent update must reach gtag.js after it has loaded. Pushing it into
  // dataLayer before the script processes its initial queue can cause the
  // consent state to be ignored. Defer to script.onload (or fire immediately if
  // the script is already loaded from a prior grant in this session).
  function fireConsentUpdate(): void {
    if (typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }

  const existing = document.getElementById("gtag-script") as HTMLScriptElement | null;
  if (existing) {
    if (existing.dataset.loaded === "true") {
      fireConsentUpdate();
    } else {
      existing.addEventListener("load", fireConsentUpdate, { once: true });
    }
    return;
  }

  const script = document.createElement("script");
  script.id = "gtag-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.onload = (): void => {
    script.dataset.loaded = "true";
    fireConsentUpdate();
  };
  document.head.appendChild(script);
}

// Removes the injected gtag script, revokes consent signals, and no-ops gtag
// for the remainder of the session. Called when the user denies or resets consent.
function revokeGtag(): void {
  updateGtag("denied");
  const el = document.getElementById("gtag-script");
  if (el) el.remove();
  // Prevent any queued or future events being sent for this session
  window.dataLayer = [];
  window.gtag = (..._args: unknown[]): void => { /* consent revoked */ };
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

  // On mount, restore previously stored consent: update state and reload gtag if needed.
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setConsent(stored.value); // eslint-disable-line react-hooks/set-state-in-effect -- localStorage cannot be read in a lazy useState initializer; SSG requires a safe default on first render (see CLAUDE.md hydration rules)
      if (stored.value === "granted") {
        loadGtag();
      }
    }
  }, []);

  const grant = useCallback((): void => {
    writeStored("granted");
    setConsent("granted");
    loadGtag();
  }, []);

  const deny = useCallback((): void => {
    writeStored("denied");
    setConsent("denied");
    revokeGtag();
  }, []);

  // Clears the stored choice and re-shows the banner (used by the cookie preferences button in ConsentBanner)
  const reset = useCallback((): void => {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch { /* storage unavailable */ }
    setConsent(null);
    revokeGtag();
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
