import type { JSX } from "react";
import type { LinksFunction, MetaFunction } from "react-router";
import { Link } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SITE_URL, BRAND_NAME, CONTACT_EMAIL } from "@/data/constants";
import { buildPageMeta, syneBoldPreload } from "@/lib/meta";

export const links: LinksFunction = () => syneBoldPreload;

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `Accessibility Statement - ${BRAND_NAME}`,
    description: `${BRAND_NAME} accessibility statement: WCAG 2.2 AA commitment, supported environments, known limitations, and how to report a barrier.`,
    url: `${SITE_URL}/accessibility`,
  });

const Accessibility = (): JSX.Element => {
  const heading2 = "text-xl font-heading font-semibold text-foreground mt-10 mb-3";
  const heading3 = "text-lg font-heading font-semibold text-foreground mt-6 mb-2";
  const paragraph = "text-sm text-muted-foreground leading-relaxed mb-4";
  const list = "list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4 ml-2";
  const link = "underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main id="main-content" className="px-6 md:px-16 pt-28 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="font-heading text-3xl font-bold text-foreground mb-10">Accessibility Statement</h1>

            <p className={paragraph}>
              {BRAND_NAME} is a platform for open source enthusiasts. We want everyone to be able
              to read, browse, and contribute, regardless of disability, assistive technology, or
              device. This document explains what we support today, how we test, and how to tell us
              when we get it wrong.
            </p>

            <h2 className={heading2}>Our Commitment</h2>
            <ul className={list}>
              <li>
                <strong>Target:</strong>{" "}
                <a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noopener noreferrer" className={link}>
                  WCAG 2.2 Level AA<span className="sr-only"> (opens in new tab)</span>
                </a>{" "}
                across every page on offon.dev.
              </li>
              <li>
                <strong>Both color modes:</strong> light and dark mode must meet contrast and focus
                requirements. We do not ship a feature that only works in one mode.
              </li>
              <li>
                <strong>Keyboard first:</strong> every interactive element is reachable and operable
                from the keyboard alone.
              </li>
              <li>
                <strong>No motion traps:</strong> we honor <code>prefers-reduced-motion</code> and
                avoid auto-playing animation that the user did not request.
              </li>
            </ul>

            <h2 className={heading2}>What We Support Today</h2>
            <ul className={list}>
              <li>Skip-to-content link as the first focusable element on every page.</li>
              <li>Visible focus rings on all interactive elements, in both light and dark mode.</li>
              <li>
                Semantic landmarks: one <code>&lt;main id="main-content"&gt;</code>, plus{" "}
                <code>&lt;nav&gt;</code>, <code>&lt;header&gt;</code>, <code>&lt;footer&gt;</code>,{" "}
                <code>&lt;section&gt;</code>, and <code>&lt;article&gt;</code> where appropriate.
              </li>
              <li>One <code>&lt;h1&gt;</code> per page with no skipped heading levels.</li>
              <li>
                Meaningful <code>alt</code> text on informational images, empty{" "}
                <code>alt=""</code> paired with <code>aria-hidden="true"</code> on decorative ones.
              </li>
              <li>Screen reader announcement of links that open in a new tab.</li>
              <li>
                Color contrast verified at 4.5:1 for body text and 3:1 for large text and UI
                controls in both modes.
              </li>
              <li>
                Tested with{" "}
                <a href="https://github.com/dequelabs/axe-core" target="_blank" rel="noopener noreferrer" className={link}>
                  axe-core<span className="sr-only"> (opens in new tab)</span>
                </a>{" "}
                on every pull request preview, in both light and dark mode.
              </li>
              <li>Self-hosted fonts so users on restricted networks are not locked out.</li>
              <li>
                Google Analytics is opt-in only via the consent banner. No tracking runs until the
                user accepts.
              </li>
            </ul>

            <h2 className={heading2}>Supported Environments</h2>
            <ul className={list}>
              <li>
                Modern evergreen browsers: Chrome, Edge, Firefox, Safari (current and previous major
                versions).
              </li>
              <li>Mobile web on iOS Safari and Android Chrome.</li>
              <li>
                Screen readers we test against during manual spot checks: VoiceOver on macOS and
                iOS, NVDA on Windows.
              </li>
              <li>
                The site is fully static and served from GitHub Pages, so it works without
                JavaScript for reading content. Some interactive features (theme toggle, consent
                banner, filtering) require JavaScript.
              </li>
            </ul>

            <h2 className={heading2}>Known Limitations</h2>
            <ul className={list}>
              <li>
                We do not currently provide captions or transcripts because the site does not host
                video or audio. If we add media, captions and transcripts will ship with it.
              </li>
              <li>
                The community discussion content is hosted on a separate Discourse instance and
                follows its own accessibility status.
              </li>
            </ul>
            <p className={paragraph}>
              If you find a barrier that is not listed here, please report it using the link below.
              We treat this list as evidence-based, not aspirational.
            </p>

            <h2 className={heading2}>How We Test</h2>

            <h3 className={heading3}>Automated</h3>
            <ul className={list}>
              <li>
                <strong>axe-core via Playwright</strong> on every pull request, configured in{" "}
                <code>e2e/smoke.spec.ts</code>. Runs in both dark and light mode against the
                production build. The PR preview workflow blocks on these scans.
              </li>
              <li>
                <strong>Vitest</strong> assertions on landmark roles, labels, and focus behavior
                for components and hooks.
              </li>
            </ul>

            <h3 className={heading3}>Manual</h3>
            <p className={paragraph}>For UI changes, contributors verify:</p>
            <ul className={list}>
              <li>Tab order matches the visual reading order.</li>
              <li>Focus is visible on every interactive element in both modes.</li>
              <li>
                The page works at 200% browser zoom and at 375px, 768px, and 1280px widths.
              </li>
              <li>Screen reader spot check on the changed flow (VoiceOver or NVDA).</li>
            </ul>

            <h2 className={heading2}>Reporting an Accessibility Barrier</h2>
            <p className={paragraph}>
              If something on offon.dev blocks you or is hard to use,{" "}
              <a
                href="https://github.com/off-on-dev/website/issues/new?template=accessibility.yml"
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                open an accessibility issue<span className="sr-only"> (opens in new tab)</span>
              </a>
              . The form prompts for the page, your assistive technology, and severity, which helps
              us reproduce and prioritize.
            </p>
            <ul className={list}>
              <li>
                <strong>Preferred:</strong> GitHub issue (link above). The fastest way to get a
                response with a fix timeline.
              </li>
              <li>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className={link}>{CONTACT_EMAIL}</a>{" "}
                if you cannot or prefer not to use GitHub.
              </li>
            </ul>
            <p className={paragraph}>
              We aim to acknowledge accessibility reports within five working days and to provide a
              workaround or fix timeline in the same response.
            </p>

            <h3 className={heading3}>Severity We Use</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm text-muted-foreground border-collapse">
                <thead>
                  <tr className="border-b border-[hsl(var(--surface-border))]">
                    <th className="text-left font-semibold text-foreground py-2 pr-6 w-28">Severity</th>
                    <th className="text-left font-semibold text-foreground py-2">Definition</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[hsl(var(--surface-border))]">
                    <td className="py-2 pr-6 align-top font-medium text-foreground">Critical</td>
                    <td className="py-2 align-top">Blocks a user from completing a core task (reading content, navigating to a challenge, accepting consent).</td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--surface-border))]">
                    <td className="py-2 pr-6 align-top font-medium text-foreground">High</td>
                    <td className="py-2 align-top">Significant difficulty, but a workaround exists.</td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--surface-border))]">
                    <td className="py-2 pr-6 align-top font-medium text-foreground">Medium</td>
                    <td className="py-2 align-top">Inconsistent or annoying experience that does not block the task.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6 align-top font-medium text-foreground">Low</td>
                    <td className="py-2 align-top">Minor issue with minimal impact on usability.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className={heading2}>For Contributors</h2>
            <p className={paragraph}>
              If you are submitting a pull request, every UI change should pass the accessibility
              checklist in our pull request template. The full ruleset lives in{" "}
              <a
                href="https://github.com/off-on-dev/website/blob/main/CLAUDE.md"
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                CLAUDE.md<span className="sr-only"> (opens in new tab)</span>
              </a>{" "}
              and applies to every change.
            </p>
            <p className={paragraph}>
              Thank you for helping us make {BRAND_NAME} usable by everyone.
            </p>

            <p className="text-sm text-muted-foreground mt-10">
              Have a question?{" "}
              <Link to="/about" className={link}>Reach out to the team</Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Accessibility;
