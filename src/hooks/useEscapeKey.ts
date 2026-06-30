import { useEffect, useRef } from "react";

export const useEscapeKey = (onEscape: () => void, enabled: boolean): void => {
  const callbackRef = useRef(onEscape);
  // No dep array: runs after every render to keep the ref in sync with the latest
  // onEscape. This lets the keydown handler always call the current callback without
  // re-registering the listener on every render. Removing this effect would cause a
  // stale-closure bug where the handler captures only the initial callback.
  useEffect(() => {
    callbackRef.current = onEscape;
  });

  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "Escape") callbackRef.current();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [enabled]);
};
