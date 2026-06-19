import type { JSX } from "react";
import type { MetaFunction } from "react-router";
import { Download, FileText, Presentation, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BRAND_NAME, SITE_URL } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `Presentation Templates - ${BRAND_NAME}`,
    description: `Download slide templates for ${BRAND_NAME} events. Available as a Slidev Markdown project or an editable PowerPoint file.`,
    url: `${SITE_URL}/presentation-templates`,
    extra: [{ name: "robots", content: "noindex" }],
  });

const BASE = import.meta.env.BASE_URL;

type Template = {
  readonly icon: JSX.Element;
  readonly title: string;
  readonly format: string;
  readonly description: string;
  readonly includes: readonly string[];
  readonly filename: string;
  readonly label: string;
};

const TEMPLATES: readonly Template[] = [
  {
    icon: <FileText size={24} aria-hidden="true" />,
    title: "Slidev Template",
    format: "ZIP archive",
    description:
      "A Slidev Markdown project with the OffOn design system pre-wired. Open in your editor, run the dev server, and write slides in Markdown.",
    includes: [
      "deck-template.md: main slide file",
      "style.css: OffOn colors, fonts, and utility classes",
      "components/GlobalTop.vue: header component",
      "public/brand/: OffOn logo SVG",
      "package.json: pinned Slidev version",
    ],
    filename: "offon-slidev-template.zip",
    label: "Download Slidev ZIP",
  },
  {
    icon: <Presentation size={24} aria-hidden="true" />,
    title: "PowerPoint Template",
    format: "PPTX file",
    description:
      "An editable PowerPoint file with OffOn branding applied. Open in PowerPoint or Keynote and edit slides directly.",
    includes: [
      "Title slide with OffOn branding",
      "Section and content slide layouts",
      "OffOn color palette and typography",
      "Speaker notes placeholder",
    ],
    filename: "offon-deck-template.pptx",
    label: "Download PPTX",
  },
];

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

type RevealStep = { readonly step: number; readonly text: string };

const REVEAL_STEPS: readonly RevealStep[] = [
  { step: 1, text: "Copy deck-template.html from the public/ directory in the offon.dev repo and rename it (e.g. my-talk.html)." },
  { step: 2, text: 'Replace TITLE_PLACEHOLDER in the <title> tag with your event or talk name.' },
  { step: 3, text: "Edit the slide sections directly in the HTML. Each <section> is one slide. Delete layouts you don't need." },
  { step: 4, text: "Place the file in public/ and push. GitHub Pages serves it automatically at offon.dev/my-talk.html, with all fonts and assets resolving from the same origin." },
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEMPLATES.map((t) => (
            <div
              key={t.filename}
              className="rounded-xl border border-surface-border bg-card p-6 flex flex-col gap-5"
            >
              <div className="flex items-start gap-3">
                <span className="text-primary mt-0.5">{t.icon}</span>
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">{t.title}</h2>
                  <span className="text-xs text-muted-foreground">{t.format}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{t.description}</p>

              <ul className="space-y-1" role="list">
                {t.includes.map((item) => (
                  <li key={item} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-primary shrink-0 mt-px" aria-hidden="true">–</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <a
                  href={`${BASE}downloads/${t.filename}`}
                  download={t.filename}
                  className="btn-primary inline-flex items-center gap-2 w-full justify-center"
                >
                  <Download size={16} aria-hidden="true" />
                  {t.label}
                </a>
              </div>
            </div>
          ))}
        </div>

        <section aria-labelledby="reveal-heading" className="mt-16 pt-10 border-t border-surface-border">
          <h2 id="reveal-heading" className="font-heading text-xl font-bold text-foreground mb-2">
            Reveal.js HTML Template
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
            A self-contained HTML file that runs in any browser with no build step. Fonts, the
            Reveal.js library, and all brand assets are served from offon.dev, so the file just
            works when saved next to the live site.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Included slide layouts</h3>
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
              <h3 className="text-sm font-semibold text-foreground mb-3">How to create a new deck</h3>
              <ol className="space-y-3 list-none" role="list">
                {REVEAL_STEPS.map(({ step, text }) => (
                  <li key={step} className="flex gap-3 text-xs text-muted-foreground">
                    <span className="text-primary font-semibold shrink-0 w-4" aria-hidden="true">{step}.</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <a
            href={`${BASE}deck-template.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost inline-flex items-center gap-2"
          >
            Preview the template
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </section>
      </div>
    </main>

    <Footer />
  </div>
);

export default PresentationTemplates;
