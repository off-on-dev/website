import { useEffect } from "react";
import type { RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"])';

export const useFocusTrap = (containerRef: RefObject<HTMLElement | null>, enabled: boolean): void => {
  // Move focus to the first focusable element when the trap activates.
  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;
    container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
  }, [containerRef, enabled]);

  // Register the Tab/Shift+Tab handler. Re-queries the DOM on every keypress
  // so the list stays accurate if children are added or removed while the trap is active.
  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    const handler = (e: KeyboardEvent): void => {
      if (e.key !== "Tab") return;
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
  }, [containerRef, enabled]);
};
