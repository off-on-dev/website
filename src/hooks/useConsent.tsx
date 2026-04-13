import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from "react";
import { GA_MEASUREMENT_ID } from "@/data/constants";

export type ConsentValue = "granted" | "denied";

type StoredConsent = {
  value: ConsentValue;
  timestamp: number;
};

// Re-prompt after 6 months (in ms)
const EXPIRY_MS = 6 * 30 * 24 * 60 * 60 * 1000;
const STORAGE_KEY = "analytics_consent";

function readStored(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (Date.now() - parsed.timestamp > EXPIRY_MS) {
      localStorage.removeItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
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

  if (document.getElementById("gtag-script")) {
    // Already loaded - fire config directly (gtag.js is listening to dataLayer)
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
    return;
  }
  const script = document.createElement("script");
  script.id = "gtag-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.onload = (): void => {
    // gtag.js has now loaded and replaced window.gtag with its own implementation
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
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
  const [consent, setConsent] = useState<ConsentValue | null>(() => {
    const stored = readStored();
    return stored ? stored.value : null;
  });

  // On mount, restore a previously granted consent: load gtag and update signals.
  useEffect(() => {
    const stored = readStored();
    if (stored?.value === "granted") {
      loadGtag();
      updateGtag("granted");
    }
  }, []);

  const grant = useCallback((): void => {
    writeStored("granted");
    setConsent("granted");
    loadGtag();
    updateGtag("granted");
  }, []);

  const deny = useCallback((): void => {
    writeStored("denied");
    setConsent("denied");
    revokeGtag();
  }, []);

  // Clears the stored choice and re-shows the banner (for "Cookie preferences" link)
  const reset = useCallback((): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
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
