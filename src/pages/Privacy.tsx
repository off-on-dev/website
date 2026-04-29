import type { JSX } from "react";
import type { MetaFunction } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SITE_URL, COMMUNITY_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

// Last reviewed date - update this whenever the policy content changes
const LAST_UPDATED = "13 April 2026";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `Privacy Policy - ${BRAND_NAME}`,
    description: `${BRAND_NAME} privacy policy: what data we collect, how consent-based analytics works, and your GDPR rights explained.`,
    url: `${SITE_URL}/privacy`,
    extra: [{ name: "robots", content: "noindex" }],
  });

const Privacy = (): JSX.Element => {
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
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {LAST_UPDATED}</p>

        <p className={paragraph}>
          This policy explains how offon.dev (the "Site") collects and uses data, what rights you
          have under the General Data Protection Regulation (GDPR, EU 2016/679), and how to
          exercise those rights.
        </p>

        <h2 className={heading2}>1. Data controller</h2>
        <p className={paragraph}>
          The data controller for this Site is the offon.dev moderation team. You can contact us
          at any time:
        </p>
        <ul className={list}>
          <li>Email: <a href="mailto:offondev@gmail.com" className={link}>offondev@gmail.com</a></li>
          <li>
            Community moderators:{" "}
            <a href={`${COMMUNITY_URL}/groups/moderators`} target="_blank" rel="noopener noreferrer" className={link}>
              @moderators<span className="sr-only"> (opens in new tab)</span>
            </a>
          </li>
        </ul>
        <p className={paragraph}>
          This Site does not have a designated Data Protection Officer (DPO) because it is operated
          by a small volunteer community and does not engage in large-scale or systematic processing
          of personal data. The contact above is responsible for all data protection matters.
        </p>

        <h2 className={heading2}>2. What data we collect and why</h2>

        <h3 className={heading3}>Analytics cookies (Google Analytics 4)</h3>
        <p className={paragraph}>
          We use Google Analytics 4 (GA4) to understand how visitors use the Site. This helps us
          improve content and navigation. GA4 collects:
        </p>
        <ul className={list}>
          <li>Pages visited and time spent on each page</li>
          <li>Referring website or search query</li>
          <li>Approximate geographic location (country or region, not precise location)</li>
          <li>Browser type, operating system, and screen size</li>
          <li>Interactions such as link clicks</li>
        </ul>
        <p className={paragraph}>
          <strong>Legal basis:</strong> Consent (Article 6(1)(a) GDPR). We use Google Analytics
          Consent Mode v2, which means no analytics data is collected until you explicitly accept
          cookies. If you decline or have not yet responded to the cookie banner, no analytics data
          is sent.
        </p>
        <p className={paragraph}>
          You may withdraw your consent at any time by clicking the cookie preferences button
          (bottom right of the page). Withdrawal does not affect the lawfulness of processing
          carried out before withdrawal.
        </p>

        <h3 className={heading3}>No other data collection</h3>
        <p className={paragraph}>
          This Site has no backend, no user accounts, no contact forms, and no payment processing.
          We do not collect names, email addresses, or any other personal data directly. The only
          personal data processing activity is the analytics described above.
        </p>

        <h2 className={heading2}>3. Data processors and international transfers</h2>
        <p className={paragraph}>
          When you accept analytics cookies, data is processed by Google LLC (Google Analytics).
          Google acts as a data processor on our behalf under a Data Processing Agreement. Google
          may transfer data to and process it in the United States. Such transfers occur under the
          EU-U.S. Data Privacy Framework and Standard Contractual Clauses as appropriate
          safeguards. For more information, see{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className={link}>
            Google's Privacy Policy<span className="sr-only"> (opens in new tab)</span>
          </a>{" "}
          and{" "}
          <a href="https://support.google.com/analytics/answer/6004245" target="_blank" rel="noopener noreferrer" className={link}>
            Google Analytics data safeguards<span className="sr-only"> (opens in new tab)</span>
          </a>
          .
        </p>
        <p className={paragraph}>
          We do not sell, rent, or share your data with any other third parties.
        </p>

        <h2 className={heading2}>4. Retention</h2>
        <p className={paragraph}>
          Google Analytics retains event-level data for 14 months by default (the minimum available
          in GA4). Aggregated, non-identifiable reporting data may be retained longer within the
          Google Analytics interface.
        </p>
        <p className={paragraph}>
          Your cookie consent preference is stored in your browser's local storage for up to
          6 months, after which you will be asked again.
        </p>

        <h2 className={heading2}>5. Your rights under GDPR</h2>
        <p className={paragraph}>
          As a data subject under GDPR, you have the following rights. To exercise any of them,
          contact us at <a href="mailto:offondev@gmail.com" className={link}>offondev@gmail.com</a>.
          We will respond within 30 days.
        </p>
        <ul className={list}>
          <li>
            <strong>Right of access (Art. 15)</strong> - You may request a copy of the personal
            data we hold about you and information about how it is processed.
          </li>
          <li>
            <strong>Right to rectification (Art. 16)</strong> - You may request correction of
            inaccurate personal data.
          </li>
          <li>
            <strong>Right to erasure (Art. 17)</strong> - You may request deletion of your personal
            data (the "right to be forgotten"), where no other legal basis requires us to retain it.
          </li>
          <li>
            <strong>Right to restriction (Art. 18)</strong> - You may request that we restrict
            processing of your data in certain circumstances.
          </li>
          <li>
            <strong>Right to data portability (Art. 20)</strong> - You may request a
            machine-readable copy of the personal data you provided, where processing is based on
            consent and carried out by automated means.
          </li>
          <li>
            <strong>Right to object (Art. 21)</strong> - You may object to processing at any time.
            For analytics, the easiest way is to decline or withdraw consent via the cookie banner.
          </li>
          <li>
            <strong>Right to withdraw consent (Art. 7(3))</strong> - You may withdraw consent at
            any time using the cookie preferences button (bottom right of the page). Withdrawal does not affect
            prior lawful processing.
          </li>
        </ul>

        <h2 className={heading2}>6. Right to lodge a complaint</h2>
        <p className={paragraph}>
          If you believe we are processing your personal data unlawfully, you have the right to
          lodge a complaint with a supervisory authority. In the EU, this is typically the data
          protection authority in your country of residence or the country where the alleged
          violation occurred. A list of EU supervisory authorities is available from the{" "}
          <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer" className={link}>
            European Data Protection Board<span className="sr-only"> (opens in new tab)</span>
          </a>
          . We do ask that you contact us first so we have an opportunity to address the issue
          directly.
        </p>

        <h2 className={heading2}>7. Children's privacy</h2>
        <p className={paragraph}>
          This Site is not directed at children under 16. We do not knowingly collect personal data
          from children. If you believe a child has provided personal data, contact us and we will
          delete it promptly.
        </p>

        <h2 className={heading2}>8. Changes to this policy</h2>
        <p className={paragraph}>
          We may update this policy from time to time. The "Last updated" date at the top reflects
          the most recent revision. Significant changes will be noted in the site's changelog or
          community forum. Continued use of the Site after changes constitutes acceptance of the
          updated policy.
        </p>

        <h2 className={heading2}>9. Contact</h2>
        <p className={paragraph}>
          For any questions or requests relating to this policy or your personal data, contact us
          at <a href="mailto:offondev@gmail.com" className={link}>offondev@gmail.com</a> or via
          the{" "}
          <a href={`${COMMUNITY_URL}/groups/moderators`} target="_blank" rel="noopener noreferrer" className={link}>
            @moderators on the forum<span className="sr-only"> (opens in new tab)</span>
          </a>
          .
        </p>
        </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
