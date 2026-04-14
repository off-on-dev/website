import { useConsent } from "@/hooks/useConsent";

type CookiePreferencesLinkProps = {
  className: string;
};

export function CookiePreferencesLink({ className }: CookiePreferencesLinkProps): JSX.Element {
  const { reset } = useConsent();

  return (
    <button
      type="button"
      onClick={reset}
      className={className}
      aria-label="Open cookie preferences"
    >
      Cookie preferences
    </button>
  );
}
