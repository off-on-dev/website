import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

// When a static host (GitHub Pages, local preview) serves the prerendered
// 404.html as a fallback for an unknown URL, the embedded __reactRouterContext
// stream contains route-match state for the /404 route — not the actual browser
// URL. HydratedRouter uses that stale route state, which triggers a client-side
// route-match mismatch and React error #418. React recovers automatically
// (it switches to a client render of the correct NotFound page), but the error
// and any resulting font-preload warnings pollute the console.
//
// Fix: detect the mismatch via the canonical URL baked into the HTML and pass
// onRecoverableError: () => {} so React's auto-recovery is silent. The user
// sees the correct 404 UI regardless; this only suppresses console noise.
function isStaleServe(): boolean {
  try {
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical?.href) return false;
    const prerenderedPath = new URL(canonical.href).pathname.replace(/\/$/, "") || "/";
    const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
    return prerenderedPath !== currentPath;
  } catch {
    return false;
  }
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
    isStaleServe()
      ? {
          // HydratedRouter requires __reactRouterContext to be present; it cannot
          // be cleared. Instead, suppress the recoverable hydration error (#418)
          // that React raises when the prerendered route state doesn't match the
          // current URL. React auto-recovers to a client render of the correct page.
          onRecoverableError: () => {},
        }
      : undefined,
  );
});
