import { useEffect } from "react";
import { useConsent } from "@/hooks/useConsent";

const TRACKED_SELECTOR = "a, button";
// GA4 silently truncates string parameter values at 100 chars. Truncate
// ourselves so the limit is visible in the source rather than discovered
// through missing-tail data in reports.
const MAX_CLICK_TEXT_LENGTH = 100;
// Skip-nav link target. Defined in Layout.tsx and every page's <main id>.
// Excluded from tracking because it fires on every keyboard Tab+Enter and
// reflects assistive-tech navigation, not user intent.
const SKIP_NAV_HREF = "#main-content";

// Attaches a delegated document-level click listener that fires a GA4
// `click_event` for clicks that resolve to an <a> or <button> ancestor.
// Listener is only attached when analytics consent is "granted" and removed
// the moment consent flips to "denied" or null.
export function useClickTracking(): void {
  const { consent } = useConsent();

  useEffect(() => {
    if (consent !== "granted") return;

    const handleClick = (event: MouseEvent): void => {
      if (typeof window.gtag !== "function") return;

      const eventTarget = event.target as Element | null;
      if (!eventTarget || typeof eventTarget.closest !== "function") return;

      const tracked = eventTarget.closest(TRACKED_SELECTOR) as
        | HTMLAnchorElement
        | HTMLButtonElement
        | null;
      if (!tracked) return;

      if (
        tracked instanceof HTMLAnchorElement &&
        tracked.getAttribute("href") === SKIP_NAV_HREF
      ) {
        return;
      }

      // Prefer aria-label so icon-only buttons report something meaningful
      // instead of "unknown" (textContent is empty when the icon is aria-hidden).
      const rawText =
        (tracked.getAttribute("aria-label") || tracked.textContent || "").trim() || "unknown";
      const clickText = rawText.slice(0, MAX_CLICK_TEXT_LENGTH);
      const href = tracked instanceof HTMLAnchorElement ? tracked.href : "";
      const clickUrl = href || tracked.getAttribute("data-url") || "no-url";
      const clickElement = tracked.tagName.toLowerCase();

      window.gtag("event", "click_event", {
        click_text: clickText,
        click_url: clickUrl,
        click_element: clickElement,
        click_page: window.location.pathname,
      });
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [consent]);
}
