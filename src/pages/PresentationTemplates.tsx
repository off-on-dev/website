import type { JSX } from "react";
import type { MetaFunction } from "react-router";
import { Download, Presentation, Globe, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BRAND_NAME, SITE_URL } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `Presentation Templates - ${BRAND_NAME}`,
    description: `Download slide templates for ${BRAND_NAME} events. Available as Reveal.js HTML or an editable PowerPoint file.`,
    url: `${SITE_URL}/presentation-templates`,
    extra: [{ name: "robots", content: "noindex" }],
  });

const BASE = import.meta.env.BASE_URL;

const REVEAL_SLIDES: readonly string[] = [
  "Title slide with co-brand area",
  "Agenda table",
  "Bullet rows",
  "Two-column split",
  "Cards grid",
  "Speaker cards",
  "Bullet rows with tech tags",
  "Asymmetric split with image",
  "Two-column cards",
  "Contribute cards",
  "Board members",
  "Final / join slide",
];

const REVEAL_STEPS: readonly { readonly step: number; readonly text: string }[] = [
  { step: 1, text: "Download and unzip the template. Rename deck-template.html to your talk name (e.g. my-talk.html)." },
  { step: 2, text: 'Replace TITLE_PLACEHOLDER in the <title> tag with your event or talk name.' },
  { step: 3, text: "Edit the slide sections directly in the HTML. Each <section> is one slide. Delete layouts you don't need." },
  { step: 4, text: "Open the HTML file in any browser for local use. All assets are bundled in the ZIP, so no server is needed." },
  { step: 5, text: "To publish: upload the HTML and asset folders to any web host, or place the file in offon.dev's public/ folder and push to main." },
];

const PPTX_INCLUDES: readonly string[] = [
  "Title slide with OffOn branding",
  "Section and content slide layouts",
  "OffOn color palette and typography",
  "Speaker notes placeholder",
];

const PresentationTemplates = (): JSX.Element => (
  <div className="min-h-dvh bg-background">
    <Navbar />

    <main id="main-content" tabIndex={-1} className="px-6 md:px-16 pt-28 pb-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">
          Presentation Templates
        </h1>
        <p className="text-muted-foreground mb-12 max-w-2xl">
          Slide templates for OffOn events and talks. Choose the format that fits your workflow.
        </p>

        <section aria-labelledby="reveal-heading">
          <div className="rounded-xl border border-surface-border bg-card p-6 flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <span className="text-primary mt-0.5"><Globe size={24} aria-hidden="true" /></span>
              <div>
                <h2 id="reveal-heading" className="font-heading text-lg font-bold text-foreground">
                  Reveal.js HTML Template
                </h2>
                <span className="text-xs text-muted-foreground">ZIP archive</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              A single HTML file with no build step. The ZIP bundles all assets so it works
              locally, on offon.dev, or on any other web host. Preview the live version on
              offon.dev before downloading.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Included Slide Layouts</h3>
                <ul className="space-y-1.5" role="list">
                  {REVEAL_SLIDES.map((slide) => (
                    <li key={slide} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary shrink-0 mt-px" aria-hidden="true">–</span>
                      <span>{slide}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">How to Create a New Deck</h3>
                <ul className="space-y-3" role="list">
                  {REVEAL_STEPS.map(({ step, text }) => (
                    <li key={step} className="flex gap-3 text-xs text-muted-foreground">
                      <span className="text-primary font-semibold shrink-0 w-4" aria-hidden="true">{step}.</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-auto justify-end">
              <a
                href={`${BASE}deck-template.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost inline-flex items-center gap-2"
              >
                Preview the Template
                <ExternalLink size={14} aria-hidden="true" />
              </a>
              <a
                href={`${BASE}downloads/offon-reveal-template.zip`}
                download="offon-reveal-template.zip"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Download size={16} aria-hidden="true" />
                Download Reveal.js ZIP
              </a>
            </div>
          </div>
        </section>

        <section aria-labelledby="pptx-heading" className="mt-6">
          <div className="rounded-xl border border-surface-border bg-card p-6 flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <span className="text-primary mt-0.5"><Presentation size={24} aria-hidden="true" /></span>
              <div>
                <h2 id="pptx-heading" className="font-heading text-lg font-bold text-foreground">
                  PowerPoint Template
                </h2>
                <span className="text-xs text-muted-foreground">PPTX file</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              An editable PowerPoint file with OffOn branding applied. Open in PowerPoint or Keynote and edit slides directly.
            </p>

            <ul className="space-y-1" role="list">
              {PPTX_INCLUDES.map((item) => (
                <li key={item} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-primary shrink-0 mt-px" aria-hidden="true">–</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex mt-auto justify-end">
              <a
                href={`${BASE}downloads/offon-deck-template.pptx`}
                download="offon-deck-template.pptx"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Download size={16} aria-hidden="true" />
                Download PPTX
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>

    <Footer />
  </div>
);

export default PresentationTemplates;
