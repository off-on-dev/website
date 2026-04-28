import type { JSX } from "react";
import { Link } from "react-router";
import { Cookie } from "lucide-react";
import { useConsent } from "@/hooks/useConsent";

export function ConsentBanner(): JSX.Element {
  const { consent, grant, deny, reset } = useConsent();

  if (consent !== null) {
    return (
      <button
        type="button"
        onClick={reset}
        aria-label="Change cookie preferences"
        title="Change cookie preferences"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}
        className="fixed right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Cookie size={18} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      aria-live="polite"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background shadow-lg"
    >
      <div className="mx-auto flex max-w-screen-xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-start sm:gap-8 sm:px-6">
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-foreground">This site uses analytics cookies</p>
          <p className="text-sm text-muted-foreground">
            We use Google Analytics to understand how visitors use offon.dev. No data is collected
            until you explicitly accept. You can change your preference at any time. See our{" "}
            <Link
              to="/privacy"
              className="underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
            >
              Privacy Policy
            </Link>{" "}
            for details.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:items-center">
          <button
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
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
