import type { JSX } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "./index.css";

// Inline script strings extracted to constants so tests can assert ordering in this file.
const themeScript = `(function(){var t=localStorage.getItem("theme");if(t==="light"){document.documentElement.classList.remove("dark");document.documentElement.classList.add("light");}})();`;

// Gated-load Consent Mode v2. The inline bootstrap does the bare minimum and
// nothing more: bootstrap dataLayer, define window.gtag as the push shim, and
// declare every signal denied by default. No localStorage read, no
// wait_for_update, no js, no config, no <script src="...gtagtm/...">. gtag.js
// itself is appended to <head> from useConsent.tsx the moment the user clicks
// Accept (or on mount when localStorage already records a granted decision).
// This guarantees zero requests to any Google domain before consent.
const gtagBootstrap = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});`;

// Description is kept in sync with the Index page meta description (src/pages/Index.tsx).
// JSON-LD inline scripts cannot reference TS constants (they live inside dangerouslySetInnerHTML),
// so the string is duplicated. Update both together.
const webSiteJsonLd = `{"@context":"https://schema.org","@type":"WebSite","name":"OffOn","url":"https://offon.dev","description":"A vendor-neutral community for open source enthusiasts. Learn through hands-on challenges, share what you know, and connect with people who love open source."}`;

// sameAs links populate Google's Knowledge Panel. Mirror LINKEDIN_URL,
// the Discourse community URL, and the open-ecosystem-challenges GitHub org
// from src/data/constants.ts.
const orgJsonLd = `{"@context":"https://schema.org","@type":"Organization","name":"OffOn","url":"https://offon.dev","logo":"https://offon.dev/favicon.png","sameAs":["https://www.linkedin.com/company/open-ecosystem/","https://community.open-ecosystem.com","https://github.com/dynatrace-oss/open-ecosystem-challenges"]}`;

export default function Root(): JSX.Element {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="author" content="offon.dev" />
        <link rel="icon" href={`${import.meta.env.BASE_URL}favicon.svg`} type="image/svg+xml" />
        <link rel="icon" href={`${import.meta.env.BASE_URL}favicon.png`} type="image/png" />
        <link rel="shortcut icon" href={`${import.meta.env.BASE_URL}favicon.ico`} />
        <link rel="apple-touch-icon" href={`${import.meta.env.BASE_URL}apple-touch-icon.png`} />
        <link rel="manifest" href={`${import.meta.env.BASE_URL}site.webmanifest`} />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f5f5ff" media="(prefers-color-scheme: light)" />
        {/* Theme must be set before React boots to prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Consent Mode v2 default-denied bootstrap. gtag.js is loaded later, only on Accept. */}
        <script dangerouslySetInnerHTML={{ __html: gtagBootstrap }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: webSiteJsonLd }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: orgJsonLd }} />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
