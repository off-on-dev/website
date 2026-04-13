import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/hooks/useConsent";

export function ConsentBanner(): JSX.Element | null {
  const { consent, grant, deny } = useConsent();

  if (consent !== null) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      aria-live="polite"
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
              className="underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm"
            >
              Privacy Policy
            </Link>{" "}
            for details.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={deny}
            aria-label="Decline analytics cookies"
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={grant}
            aria-label="Accept analytics cookies"
          >
            Accept analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
