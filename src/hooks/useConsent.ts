import { useState, useEffect, useCallback } from "react";

type ConsentValue = "granted" | "denied";

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

type UseConsentReturn = {
  // null = not yet decided (show banner), "granted" | "denied" = decided
  consent: ConsentValue | null;
  grant: () => void;
  deny: () => void;
  reset: () => void;
};

export function useConsent(): UseConsentReturn {
  const [consent, setConsent] = useState<ConsentValue | null>(() => {
    const stored = readStored();
    return stored ? stored.value : null;
  });

  // On mount, restore a previously granted consent into gtag's consent state
  useEffect(() => {
    const stored = readStored();
    if (stored?.value === "granted") {
      updateGtag("granted");
    }
  }, []);

  const grant = useCallback((): void => {
    writeStored("granted");
    setConsent("granted");
    updateGtag("granted");
  }, []);

  const deny = useCallback((): void => {
    writeStored("denied");
    setConsent("denied");
  }, []);

  // Clears the stored choice and re-shows the banner (for "Cookie preferences" link)
  const reset = useCallback((): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* storage unavailable */ }
    setConsent(null);
    updateGtag("denied");
  }, []);

  return { consent, grant, deny, reset };
}
