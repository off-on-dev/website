import { useState, useEffect, useRef, type JSX } from "react";
import { Link } from "react-router";
import { Cookie } from "lucide-react";
import { useConsent } from "@/hooks/useConsent";
import { SITE_NAME } from "@/data/constants";

export function ConsentBanner(): JSX.Element {
  const { consent, grant, deny, reset } = useConsent();
  const [mounted, setMounted] = useState(false);
  const declineRef = useRef<HTMLButtonElement>(null);
  const prevConsentRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect -- mount guard; SSG requires a safe default (null) on first render so the banner is absent from prerendered HTML and cannot become the LCP element
  }, []);

  // Move focus to Decline only when the banner reappears after a reset (consent
  // transitions from non-null to null). Skips the initial page-load case so the
  // banner never steals focus from the skip nav link.
  useEffect(() => {
    const prevConsent = prevConsentRef.current;
    prevConsentRef.current = consent;
    if (mounted && consent === null && prevConsent != null) {
      declineRef.current?.focus();
    }
  }, [mounted, consent]);

  // Pre-render an empty aria-live region so the region is already in the DOM when
  // banner content appears after mount. AT only announces content changes within
  // a pre-existing live region — it does not reliably announce a newly inserted one.
  if (!mounted) return <div aria-live="polite" aria-atomic="true" />;

  if (consent !== null) {
    return (
      <button
        type="button"
        onClick={reset}
        aria-label="Change cookie preferences"
        title="Change cookie preferences"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}
        className="fixed right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition-colors hover:bg-accent hover:text-accent-foreground focus-ring"
      >
        <Cookie size={18} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div aria-live="polite" aria-atomic="true">
    <div
      role="region"
      aria-labelledby="consent-banner-title"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background shadow-lg"
    >
      <div className="mx-auto flex max-w-screen-xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-start sm:gap-8 sm:px-6">
        <div className="flex-1 space-y-1">
          <p id="consent-banner-title" className="text-sm text-foreground">This site uses analytics cookies</p>
          <p className="text-sm text-muted-foreground">
            We use Google Analytics to understand how visitors use {SITE_NAME}. No data is sent to
            Google until you accept. You can change your preference at any time. See our{" "}
            <Link
              to="/privacy/"
              className="underline underline-offset-2 hover:text-foreground focus-ring-tight rounded-sm"
            >
              Privacy Policy
            </Link>{" "}
            for details.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:items-center">
          <button
            ref={declineRef}
            type="button"
            onClick={deny}
            aria-label="Decline analytics cookies"
            className="btn-ghost"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={grant}
            aria-label="Accept analytics cookies"
            className="btn-primary"
          >
            Accept Analytics
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
