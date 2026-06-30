import { useEffect } from "react";
import type { RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"])';

export const useFocusTrap = (containerRef: RefObject<HTMLElement | null>, enabled: boolean): void => {
  // This effect intentionally appears before the Tab-handler effect so that
  // initial focus is set before any keydown listener is active.
  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;
    // Guard: the container may be hidden by CSS (e.g. md:hidden at desktop widths)
    // even when enabled is true (e.g. after a viewport resize). Skip silently.
    if (window.getComputedStyle(container).display === "none") return;
    container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
  // containerRef is included for ESLint exhaustive-deps compliance. Ref objects
  // have stable identity (same object reference across renders), so this dep never
  // actually triggers a re-run; only changes to enabled do.
  }, [containerRef, enabled]);

  // Register the Tab/Shift+Tab handler. Re-queries the DOM on every keypress
  // so the list stays accurate if children are added or removed while the trap is active.
  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    const handler = (e: KeyboardEvent): void => {
      if (e.key !== "Tab") return;
      // Guard: if CSS hides the container (e.g. md:hidden on resize), let Tab pass through.
      if (window.getComputedStyle(container).display === "none") return;
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  // containerRef: see note on the first effect above.
  }, [containerRef, enabled]);
};
