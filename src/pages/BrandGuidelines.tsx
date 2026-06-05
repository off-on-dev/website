import type { JSX, ReactNode } from "react";
import type { MetaFunction } from "react-router";
import { useEffect, useState } from "react";
import { Check, X, Download, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  BRAND_NAME,
  BRAND_SLOGAN_PARTS,
  BRAND_SECONDARY_LINE,
  BRAND_SECONDARY_LINE_PARTS,
  BRAND_SHORT_DESCRIPTION,
  SITE_URL,
  SITE_NAME,
} from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `Brand Guidelines - ${BRAND_NAME}`,
    description: `Logos, colors, typography, mascot, and brand voice for ${BRAND_NAME}, the vendor-neutral open source community.`,
    url: `${SITE_URL}/brand`,
  });

// Compile-time constant — safe to evaluate at module level in a Vite app
const BASE = import.meta.env.BASE_URL;

type TocItem = { readonly id: string; readonly label: string };
type ColorSwatch = { name: string; token: string; hex: string; hsl: string; textClass: string; usage: string };
type DownloadSpec = { href: string; filename: string; label: string };

const TOC_ITEMS: TocItem[] = [
  { id: "mission", label: "Mission and Values" },
  { id: "logos", label: "Logo" },
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "design-elements", label: "Design Elements" },
  { id: "photography", label: "Photography" },
  { id: "voice", label: "Voice and Tone" },
  { id: "accessibility", label: "Accessibility" },
];

const DARK_COLORS: ColorSwatch[] = [
  { name: "Amber Primary", token: "--primary", hex: "#ffc034", hsl: "41 100% 60%", textClass: "text-[#0a0a0a]", usage: "Fills, borders, focus rings, accent highlights. ~12:1 on dark bg." },
  { name: "Background", token: "--background", hex: "#0a0a0a", hsl: "0 0% 4%", textClass: "text-[#faf8f3]", usage: "Page background." },
  { name: "Card", token: "--card", hex: "#141416", hsl: "240 9% 9%", textClass: "text-[#faf8f3]", usage: "Card and section surfaces." },
  { name: "Foreground", token: "--foreground", hex: "#faf8f3", hsl: "47 54% 98%", textClass: "text-[#0a0a0a]", usage: "Primary text. ~19:1 on dark bg." },
  { name: "Border", token: "--border", hex: "#1b283e", hsl: "219 36% 18%", textClass: "text-[#faf8f3]", usage: "Borders and dividers." },
  { name: "Link hover", token: "--primary", hex: "#ffc034", hsl: "41 100% 60%", textClass: "text-[#0a0a0a]", usage: "Link hover and active state on dark backgrounds. ~12:1 on dark bg." },
];

const LIGHT_COLORS: ColorSwatch[] = [
  { name: "Amber Primary", token: "--primary", hex: "#ffc034", hsl: "41 100% 60%", textClass: "text-[#0a0a0a]", usage: "Fills and borders only. Never as text color." },
  { name: "Background", token: "--background", hex: "#f8f9fb", hsl: "220 12% 98%", textClass: "text-[#0d0d17]", usage: "Page background." },
  { name: "Card", token: "--card", hex: "#f4f5f7", hsl: "220 10% 96%", textClass: "text-[#0d0d17]", usage: "Card and section surfaces." },
  { name: "Foreground", token: "--foreground", hex: "#0d0d17", hsl: "240 25% 8%", textClass: "text-[#f8f9fb]", usage: "Primary text. ~18:1 on light bg." },
  { name: "Border", token: "--border", hex: "#d8dbe2", hsl: "220 12% 87%", textClass: "text-[#0d0d17]", usage: "Borders and dividers." },
  { name: "Link hover", token: "--link-hover-light", hex: "#704d00", hsl: "41 100% 22%", textClass: "text-[#f8f9fb]", usage: "Amber inline link hover. ~7.4:1 on light bg." },
];

const FONT_WEIGHTS = [
  { weight: "400", label: "Regular", sample: "Open source community for everyone." },
  { weight: "500", label: "Medium", sample: "Learn through hands-on challenges." },
  { weight: "600", label: "Semibold", sample: "Build together. Grow together." },
  { weight: "700", label: "Bold", sample: "Vendor-Neutral. Open Source. Community-Driven." },
];

const VALUES = [
  { name: "Vendor-Neutral", description: "We only discuss and recommend open source tools. Proprietary or vendor-specific technology is out of scope." },
  { name: "Open Source", description: "The challenges, tools, and content are open source. Anyone can participate, contribute, and build on what's here." },
  { name: "Community-Driven", description: "Direction and content come from contributors. There is no central authority deciding what matters." },
];

const LOGO_CARDS = [
  {
    label: "Dark backgrounds",
    note: "Color variant",
    bg: "bg-[#0a0a0a]",
    border: "border-[hsl(var(--surface-border))]",
    src: `${BASE}brand/offon-logo-dark-color.svg`,
    alt: `${SITE_NAME} color logo on dark background`,
    downloads: [
      { href: `${BASE}brand/offon-logo-dark-color.svg`, filename: "offon-logo-dark-color.svg", label: "SVG" },
      { href: `${BASE}brand/offon-logo-dark-color.png`, filename: "offon-logo-dark-color.png", label: "PNG" },
    ] as DownloadSpec[],
  },
  {
    label: "Light and amber backgrounds",
    note: "Mono variant",
    bg: "bg-[#f8f9fb]",
    border: "border-[hsl(220,12%,87%)]",
    src: `${BASE}brand/offon-logo-light-mono.svg`,
    alt: `${SITE_NAME} mono logo on light background`,
    downloads: [
      { href: `${BASE}brand/offon-logo-light-mono.svg`, filename: "offon-logo-light-mono.svg", label: "SVG" },
      { href: `${BASE}brand/offon-logo-light-mono.png`, filename: "offon-logo-light-mono.png", label: "PNG" },
    ] as DownloadSpec[],
  },
  {
    label: "Single-color / print on dark",
    note: "Dark mono variant",
    bg: "bg-[#0a0a0a]",
    border: "border-[hsl(var(--surface-border))]",
    src: `${BASE}brand/offon-logo-dark-mono.svg`,
    alt: `${SITE_NAME} mono logo on dark background`,
    downloads: [
      { href: `${BASE}brand/offon-logo-dark-mono.svg`, filename: "offon-logo-dark-mono.svg", label: "SVG" },
      { href: `${BASE}brand/offon-logo-dark-mono.png`, filename: "offon-logo-dark-mono.png", label: "PNG" },
    ] as DownloadSpec[],
  },
];

const ICON_DOWNLOADS: DownloadSpec[] = [
  { href: `${BASE}brand/offon-favicon.svg`, filename: "offon-favicon.svg", label: "SVG" },
  { href: `${BASE}brand/offon-favicon.png`, filename: "offon-favicon.png", label: "PNG" },
];

const NYX_FULL_DOWNLOADS: DownloadSpec[] = [
  { href: `${BASE}nyx.webp`, filename: "offon-nyx.webp", label: "WebP" },
  { href: `${BASE}brand/offon-nyx.png`, filename: "offon-nyx.png", label: "PNG" },
];

const NYX_PEEK_DOWNLOADS: DownloadSpec[] = [
  { href: `${BASE}nyx_peek.webp`, filename: "offon-nyx-peek.webp", label: "WebP" },
  { href: `${BASE}brand/offon-nyx-peek.png`, filename: "offon-nyx-peek.png", label: "PNG" },
];

const OG_DOWNLOADS: DownloadSpec[] = [
  { href: `${BASE}og.png`, filename: "offon-og.png", label: "PNG" },
];

// Sub-components

const SectionBlock = ({ id, eyebrow, heading, children }: {
  id: string;
  eyebrow: string;
  heading: string;
  children: ReactNode;
}): JSX.Element => (
  <section id={id} aria-labelledby={`${id}-heading`}>
    <div className="mb-10 pt-16">
      <span className="text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] block mb-2">{eyebrow}</span>
      <h2 id={`${id}-heading`} className="font-heading text-3xl md:text-4xl font-bold text-foreground">
        {heading}
      </h2>
    </div>
    {children}
  </section>
);

const ColorCard = ({ swatch, dark }: { swatch: ColorSwatch; dark: boolean }): JSX.Element => (
  <div className="rounded-lg overflow-hidden border" style={{ borderColor: dark ? "#2e4268" : "#d8dbe2" }}>
    <div
      className="h-20 flex items-end p-3"
      style={{
        backgroundColor: swatch.hex,
        boxShadow: "inset 0 0 0 1px rgba(127,127,127,0.14)",
      }}
    >
      <span className={`font-mono text-xs font-semibold ${swatch.textClass}`}>{swatch.hex}</span>
    </div>
    <div className="p-4">
      <p className="font-sans font-semibold text-sm mb-0.5" style={{ color: dark ? "#faf8f3" : "#0d0d17" }}>{swatch.name}</p>
      <p className="font-mono text-xs mb-1" style={{ color: dark ? "#c8c4bc" : "#2a2a3e" }}>{swatch.hsl}</p>
      <p className="font-sans text-xs leading-snug" style={{ color: dark ? "#c8c4bc" : "#2a2a3e" }}>{swatch.usage}</p>
    </div>
  </div>
);

const DownloadBtn = ({ href, filename, label }: DownloadSpec): JSX.Element => (
  <a
    href={href}
    download={filename}
    aria-label={`Download ${filename}`}
    className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-[hsl(var(--text-secondary))] hover:text-foreground dark:hover:text-primary border border-[hsl(var(--surface-border))] rounded-md px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
  >
    <Download size={11} aria-hidden="true" />
    {label}
  </a>
);

const DownloadGroup = ({ downloads }: { downloads: DownloadSpec[] }): JSX.Element => (
  <div className="flex flex-wrap gap-2 mt-3">
    {downloads.map((d) => (
      <DownloadBtn key={d.filename} href={d.href} filename={d.filename} label={d.label} />
    ))}
  </div>
);

const TableOfContents = ({ activeId }: { activeId: string }): JSX.Element => (
  <nav aria-label="On this page">
    <p className="font-sans text-xs font-semibold uppercase tracking-widest text-[hsl(var(--text-faint))] mb-4">
      On this page
    </p>
    <ul className="space-y-0.5" role="list">
      {TOC_ITEMS.map(({ id, label }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            aria-current={activeId === id ? "location" : undefined}
            className={`block font-sans text-sm py-1.5 pl-3 border-l-2 transition-colors rounded-r-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
              activeId === id
                ? "border-primary text-foreground dark:text-primary font-medium"
                : "border-transparent text-[hsl(var(--text-secondary))] hover:text-foreground hover:border-[hsl(var(--surface-border))]"
            }`}
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

const BrandGuidelines = (): JSX.Element => {
  const [activeSection, setActiveSection] = useState("mission");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-10% 0% -80% 0%", threshold: 0 }
    );
    TOC_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">

        {/* Hero */}
        <section
          aria-labelledby="brand-hero-heading"
          className="bg-primary pt-32 pb-20 px-6 md:px-16"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <span className="font-sans text-sm font-medium uppercase tracking-widest text-primary-foreground/80 block mb-4">
                Brand
              </span>
              <h1 id="brand-hero-heading" className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-primary-foreground mb-5">
                Brand Guidelines
              </h1>
              <p className="font-sans text-base leading-relaxed text-primary-foreground/80 max-w-xl">
                Logos, colors, typography, mascot, and voice for {BRAND_NAME}.
              </p>
            </div>
          </div>
        </section>

        {/* Content with sticky right TOC */}
        <div className="px-6 sm:px-8 md:px-16 lg:px-20 pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-16">

              {/* Main content */}
              <div>

                {/* Mission and Values */}
                <SectionBlock id="mission" eyebrow="Foundation" heading="Mission and Values">
                  <p className="font-sans text-base text-[hsl(var(--text-secondary))] leading-relaxed max-w-prose mb-8">
                    {BRAND_SHORT_DESCRIPTION}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {VALUES.map((v) => (
                      <div key={v.name} className="rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap size={14} className="text-primary shrink-0" aria-hidden="true" />
                          <h3 className="font-sans font-semibold text-sm text-foreground">{v.name}</h3>
                        </div>
                        <p className="font-sans text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{v.description}</p>
                      </div>
                    ))}
                  </div>
                </SectionBlock>

                {/* Logo */}
                <SectionBlock id="logos" eyebrow="Identity" heading="Logo">

                  {/* Icon mark */}
                  <h3 className="font-sans text-base font-semibold text-foreground mb-3">Icon Mark</h3>
                  <p className="font-sans text-sm text-[hsl(var(--text-secondary))] max-w-prose mb-5">
                    A geometric amber firefly bolt. Use it at 24 px minimum. Never rotate, recolor, or distort it.
                  </p>
                  <div className="flex flex-wrap gap-5 mb-2">
                    {[
                      { bg: "bg-[#0a0a0a]", border: "border-[hsl(var(--surface-border))]", label: "On dark" },
                      { bg: "bg-[#f8f9fb]", border: "border-[hsl(220,12%,87%)]", label: "On light" },
                      { bg: "bg-primary", border: "border-primary/30", label: "On amber" },
                    ].map(({ bg, border, label }) => (
                      <div key={label} className="flex flex-col items-center gap-2">
                        <div className={`w-24 h-24 rounded-lg ${bg} border ${border} flex items-center justify-center p-4`}>
                          <img
                            src={`${BASE}brand/offon-favicon.svg`}
                            alt={`OffOn icon mark ${label.toLowerCase()}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="font-sans text-xs text-[hsl(var(--text-faint))]">{label}</span>
                      </div>
                    ))}
                  </div>
                  <DownloadGroup downloads={ICON_DOWNLOADS} />

                  {/* Wordmark */}
                  <h3 className="font-sans text-base font-semibold text-foreground mt-10 mb-3">Wordmark</h3>
                  <p className="font-sans text-sm text-[hsl(var(--text-secondary))] max-w-prose mb-5">
                    Dark backgrounds use the color variant. Light and amber backgrounds use the light mono. Single-color print on dark uses the dark mono.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {LOGO_CARDS.map((card) => (
                      <div key={card.label}>
                        <div className={`rounded-lg border ${card.border} ${card.bg} h-32 flex items-center justify-center px-8 mb-3`}>
                          <img src={card.src} alt={card.alt} className="h-12 w-auto max-w-[200px]" />
                        </div>
                        <p className="font-sans text-sm font-medium text-foreground mb-0.5">{card.label}</p>
                        <p className="font-sans text-xs text-[hsl(var(--text-faint))]">{card.note}</p>
                        <DownloadGroup downloads={card.downloads} />
                      </div>
                    ))}
                  </div>

                  {/* Do / Don't */}
                  <h3 className="font-sans text-base font-semibold text-foreground mt-10 mb-4">Do and Don't</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="rounded-lg border border-[hsl(85,48%,56%,0.35)] bg-[hsl(var(--surface))] p-5">
                      <h4 className="flex items-center gap-2 font-sans text-sm font-semibold text-foreground mb-3">
                        <Check size={13} className="text-[#15803d] shrink-0" aria-hidden="true" />
                        Do
                      </h4>
                      <ul role="list" className="font-sans text-sm text-[hsl(var(--text-secondary))] space-y-1.5">
                        <li>Use the correct variant for the background color</li>
                        <li>Maintain clear space equal to the "O" height on all sides</li>
                        <li>Scale proportionally</li>
                        <li>Use the icon mark when the wordmark won't fit</li>
                        <li>Use mono variants for print or embroidery</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[hsl(0,84%,60%,0.35)] bg-[hsl(var(--surface))] p-5">
                      <h4 className="flex items-center gap-2 font-sans text-sm font-semibold text-foreground mb-3">
                        <X size={13} className="text-destructive shrink-0" aria-hidden="true" />
                        Don't
                      </h4>
                      <ul role="list" className="font-sans text-sm text-[hsl(var(--text-secondary))] space-y-1.5">
                        <li>Don't recolor, outline, or add drop shadows</li>
                        <li>Don't use the dark logo on light backgrounds</li>
                        <li>Don't stretch, skew, or rotate</li>
                        <li>Don't place the logo over busy images or patterns</li>
                        <li>Don't use the color logo where mono is required</li>
                      </ul>
                    </div>
                  </div>
                </SectionBlock>

                {/* Colors */}
                <SectionBlock id="colors" eyebrow="Identity" heading="Colors">
                  <p className="font-sans text-sm text-[hsl(var(--text-secondary))] max-w-prose mb-6">
                    All colors are CSS custom properties in{" "}
                    <code className="font-mono text-xs bg-[hsl(var(--surface))] px-1.5 py-0.5 rounded border border-[hsl(var(--surface-border))]">
                      src/index.css
                    </code>
                    . Reference tokens, not hardcoded hex values.
                  </p>

                  {/* Side-by-side dark / light panels — each panel has its own correct background */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

                    {/* Dark mode panel — hardcoded dark surface tokens, always renders dark */}
                    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#2e4268" }}>
                      <div className="px-5 py-3 border-b" style={{ backgroundColor: "#151519", borderColor: "#2e4268" }}>
                        <span className="font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: "#8a8680" }}>Dark Mode</span>
                      </div>
                      <div className="p-5 grid grid-cols-2 gap-3" style={{ backgroundColor: "#151519" }}>
                        {DARK_COLORS.map((swatch) => (
                          <ColorCard key={swatch.token + swatch.name} swatch={swatch} dark={true} />
                        ))}
                      </div>
                    </div>

                    {/* Light mode panel — hardcoded light surface tokens, always renders light */}
                    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#d8dbe2" }}>
                      <div className="px-5 py-3 border-b" style={{ backgroundColor: "#f4f5f7", borderColor: "#d8dbe2" }}>
                        <span className="font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: "#6b6760" }}>Light Mode</span>
                      </div>
                      <div className="p-5 grid grid-cols-2 gap-3" style={{ backgroundColor: "#f4f5f7" }}>
                        {LIGHT_COLORS.map((swatch) => (
                          <ColorCard key={swatch.token + swatch.name} swatch={swatch} dark={false} />
                        ))}
                        <div className="col-span-2 rounded-lg border p-4 mt-1" style={{ borderColor: "#d8dbe2", backgroundColor: "#eaebee" }}>
                          <p className="font-sans text-xs" style={{ color: "#2a2a3e" }}>
                            <span className="font-semibold" style={{ color: "#0d0d17" }}>Amber in light mode:</span>{" "}
                            fill and border only. For hover text use{" "}
                            <code className="font-mono px-1 py-0.5 rounded" style={{ backgroundColor: "#dddee4", color: "#0d0d17" }}>--link-hover-light</code>.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </SectionBlock>

                {/* Typography */}
                <SectionBlock id="typography" eyebrow="Identity" heading="Typography">
                  <p className="font-sans text-sm text-[hsl(var(--text-secondary))] max-w-prose mb-8">
                    All fonts are self-hosted as WOFF2. No external requests. Use the{" "}
                    <code className="font-mono text-xs bg-[hsl(var(--surface))] px-1.5 py-0.5 rounded border border-[hsl(var(--surface-border))]">font-heading</code>,{" "}
                    <code className="font-mono text-xs bg-[hsl(var(--surface))] px-1.5 py-0.5 rounded border border-[hsl(var(--surface-border))]">font-sans</code>, and{" "}
                    <code className="font-mono text-xs bg-[hsl(var(--surface))] px-1.5 py-0.5 rounded border border-[hsl(var(--surface-border))]">font-mono</code>{" "}
                    Tailwind utilities.
                  </p>

                  <div className="mb-10">
                    <div className="flex flex-wrap items-baseline gap-3 mb-3">
                      <h3 className="font-sans text-sm font-semibold text-foreground">Syne</h3>
                      <span className="font-mono text-xs text-[hsl(var(--text-faint))]">font-heading / 700 / Headings and display</span>
                    </div>
                    <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8 space-y-3">
                      <p className="font-heading text-5xl font-bold text-foreground leading-tight">Open Source</p>
                      <p className="font-heading text-4xl font-bold text-foreground leading-tight">Community First</p>
                      <p className="font-heading text-3xl font-bold text-foreground leading-tight">Build Together</p>
                      <p className="font-heading text-2xl font-bold text-foreground leading-tight">Vendor-Neutral</p>
                      <p className="font-heading text-xl font-bold text-foreground leading-tight">Always Learning</p>
                    </div>
                  </div>

                  <div className="mb-10">
                    <div className="flex flex-wrap items-baseline gap-3 mb-3">
                      <h3 className="font-sans text-sm font-semibold text-foreground">Inter</h3>
                      <span className="font-mono text-xs text-[hsl(var(--text-faint))]">font-sans / 400-700 / Body and UI</span>
                    </div>
                    <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8 space-y-5">
                      {FONT_WEIGHTS.map(({ weight, label, sample }) => (
                        <div key={weight} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
                          <span className="font-mono text-xs text-[hsl(var(--text-faint))] shrink-0 sm:w-32">{weight} {label}</span>
                          <p className="font-sans text-base text-foreground" style={{ fontWeight: weight }}>{sample}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-baseline gap-3 mb-3">
                      <h3 className="font-sans text-sm font-semibold text-foreground">JetBrains Mono</h3>
                      <span className="font-mono text-xs text-[hsl(var(--text-faint))]">font-mono / 400-600 / Code and tokens</span>
                    </div>
                    <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8">
                      <pre className="font-mono text-sm text-[hsl(var(--text-secondary))] leading-relaxed overflow-x-auto">
                        <code>{`--primary: 41 100% 60%;
--font-heading: Syne, 'Syne Fallback', sans-serif;
--background: 0 0% 4%;
hsl(var(--foreground))`}</code>
                      </pre>
                    </div>
                  </div>
                </SectionBlock>

                {/* Design Elements */}
                <SectionBlock id="design-elements" eyebrow="Visual Identity" heading="Design Elements">

                  <h3 className="font-sans text-base font-semibold text-foreground mb-3">Mascot: Nyx</h3>
                  <p className="font-sans text-sm text-[hsl(var(--text-secondary))] max-w-prose mb-6">
                    Nyx is the {BRAND_NAME} firefly mascot. Nyx is gender neutral, so avoid gendered pronouns. Use Nyx in event materials, swag, and community campaigns. Don't alter the colors, proportions, or shape.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                    <div>
                      <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-primary h-56 flex items-center justify-center overflow-hidden mb-3">
                        <img
                          src={`${BASE}nyx.webp`}
                          alt="Nyx, the OffOn firefly mascot, full view"
                          width={180}
                          height={180}
                          className="object-contain w-44 h-44"
                        />
                      </div>
                      <p className="font-sans text-sm font-medium text-foreground mb-1">Nyx: Full</p>
                      <p className="font-sans text-xs text-[hsl(var(--text-faint))]">Hero sections, event banners, swag.</p>
                      <DownloadGroup downloads={NYX_FULL_DOWNLOADS} />
                    </div>
                    <div>
                      <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-primary h-56 flex items-center justify-center overflow-hidden mb-3">
                        <img
                          src={`${BASE}nyx_peek.webp`}
                          alt="Nyx the OffOn firefly mascot, peeking variant"
                          width={180}
                          height={180}
                          className="object-contain w-44 h-44"
                        />
                      </div>
                      <p className="font-sans text-sm font-medium text-foreground mb-1">Nyx: Peek</p>
                      <p className="font-sans text-xs text-[hsl(var(--text-faint))]">Page hero backgrounds, corner decorations.</p>
                      <DownloadGroup downloads={NYX_PEEK_DOWNLOADS} />
                    </div>
                  </div>

                  <h3 className="font-sans text-base font-semibold text-foreground mb-3">Open Graph Image</h3>
                  <p className="font-sans text-sm text-[hsl(var(--text-secondary))] max-w-prose mb-5">
                    Used as the social media preview when {BRAND_NAME} links are shared. Dimensions: 1200 x 630 px.
                  </p>
                  <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-[#141416] overflow-hidden mb-3 max-w-sm">
                    <img
                      src={`${BASE}og.png`}
                      alt="OffOn Open Graph preview image, 1200 by 630 pixels"
                      width={1200}
                      height={630}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                  <DownloadGroup downloads={OG_DOWNLOADS} />
                </SectionBlock>

                {/* Photography */}
                <SectionBlock id="photography" eyebrow="Visual Identity" heading="Photography">
                  <p className="font-sans text-sm text-[hsl(var(--text-secondary))] max-w-prose mb-8">
                    When photography appears in {BRAND_NAME} materials, it should feel raw and technical, not polished stock imagery.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div className="rounded-lg border border-[hsl(85,48%,56%,0.35)] bg-[hsl(var(--surface))] p-5">
                      <h3 className="flex items-center gap-2 font-sans text-sm font-semibold text-foreground mb-3">
                        <Check size={13} className="text-[#15803d] shrink-0" aria-hidden="true" />
                        Use
                      </h3>
                      <ul role="list" className="font-sans text-sm text-[hsl(var(--text-secondary))] space-y-1.5">
                        <li>Real developers at real terminals</li>
                        <li>Dark environments that echo the dark mode palette</li>
                        <li>Collaborative scenes with multiple contributors</li>
                        <li>Warm amber or neutral accent lighting</li>
                        <li>Diverse representation of the open source community</li>
                        <li>Legible code on screens where visible</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[hsl(0,84%,60%,0.35)] bg-[hsl(var(--surface))] p-5">
                      <h3 className="flex items-center gap-2 font-sans text-sm font-semibold text-foreground mb-3">
                        <X size={13} className="text-destructive shrink-0" aria-hidden="true" />
                        Avoid
                      </h3>
                      <ul role="list" className="font-sans text-sm text-[hsl(var(--text-secondary))] space-y-1.5">
                        <li>Stock photos of people smiling at laptops</li>
                        <li>Bright, corporate-feeling environments</li>
                        <li>Heavily retouched or filtered images</li>
                        <li>Low-quality clipart or filler illustrations</li>
                        <li>Photos with visible vendor brand logos</li>
                        <li>Images that imply exclusion</li>
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
                    <h3 className="font-sans text-sm font-semibold text-foreground mb-1">When photos aren't available</h3>
                    <p className="font-sans text-sm text-[hsl(var(--text-secondary))]">
                      Use the Nyx mascot or abstract dark/amber compositions. A clean empty section is better than a distracting stock photo.
                    </p>
                  </div>
                </SectionBlock>

                {/* Voice and Tone */}
                <SectionBlock id="voice" eyebrow="Communication" heading="Voice and Tone">

                  <div className="mb-10">
                    <h3 className="font-sans text-base font-semibold text-foreground mb-3">Brand Name</h3>
                    <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 max-w-md">
                      <p className="font-heading text-4xl font-bold text-foreground mb-4">{BRAND_NAME}</p>
                      <p className="font-sans text-sm text-[hsl(var(--text-secondary))] mb-5">
                        Always camelCase. Domain is always lowercase:{" "}
                        <code className="font-mono text-xs bg-background px-1 py-0.5 rounded border border-[hsl(var(--surface-border))]">offon.dev</code>
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { text: "OffOn", ok: true },
                          { text: "offon.dev", ok: true },
                          { text: "Offon", ok: false },
                          { text: "OFFON", ok: false },
                          { text: "offon", ok: false },
                          { text: "Off-On", ok: false },
                        ].map(({ text, ok }) => (
                          <div key={text} className="flex items-center gap-2">
                            {ok
                              ? <Check size={11} className="text-[#15803d] shrink-0" aria-hidden="true" />
                              : <X size={11} className="text-destructive shrink-0" aria-hidden="true" />
                            }
                            <span className={`font-mono text-xs ${ok ? "text-foreground" : "text-[hsl(var(--text-faint))] line-through"}`}>
                              {text}
                            </span>
                            <span className="sr-only">{ok ? "(correct)" : "(incorrect)"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mb-10">
                    <h3 className="font-sans text-base font-semibold text-foreground mb-4">Slogans</h3>
                    <div className="space-y-3">
                      <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
                        <p className="font-sans text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-2">Primary</p>
                        <p className="font-heading text-xl font-bold text-foreground">
                          {BRAND_SLOGAN_PARTS.join(". ")}.
                        </p>
                      </div>
                      <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
                        <p className="font-sans text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-2">Secondary</p>
                        <p className="font-heading text-xl font-bold text-foreground">{BRAND_SECONDARY_LINE}</p>
                        <p className="font-sans text-xs text-[hsl(var(--text-faint))] mt-2">
                          The lowercase "always" is intentional.
                        </p>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-3">
                          {BRAND_SECONDARY_LINE_PARTS.map((part) => (
                            <span key={part} className="font-mono text-xs text-[hsl(var(--text-faint))]">{part}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-sans text-base font-semibold text-foreground mb-4">Tone</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
                        <h4 className="font-sans text-sm font-semibold text-foreground mb-3">We are</h4>
                        <ul role="list" className="font-sans text-sm text-[hsl(var(--text-secondary))] space-y-1.5">
                          <li>Direct and to the point</li>
                          <li>Focused on the community, not the brand</li>
                          <li>Inclusive and welcoming</li>
                          <li>Plain-spoken, no unnecessary jargon</li>
                          <li>Active voice wherever possible</li>
                        </ul>
                      </div>
                      <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
                        <h4 className="font-sans text-sm font-semibold text-foreground mb-3">We are not</h4>
                        <ul role="list" className="font-sans text-sm text-[hsl(var(--text-secondary))] space-y-1.5">
                          <li>Corporate or formal</li>
                          <li>Hype-driven or hollow</li>
                          <li>Exclusive or gatekeeping</li>
                          <li>Vendor-aligned in language</li>
                          <li>Passive or hedging</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </SectionBlock>

                {/* Accessibility */}
                <SectionBlock id="accessibility" eyebrow="Standards" heading="Accessibility">
                  <p className="font-sans text-sm text-[hsl(var(--text-secondary))] max-w-prose mb-8">
                    Every page on {BRAND_NAME} targets WCAG 2.2 Level AA for structure and interaction. Body text contrast targets AAA (7:1) in both light and dark mode. The full statement, testing approach, and how to report a barrier are in the{" "}
                    <a href="/accessibility/" className="docs-ext-link">Accessibility Statement</a>.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
                      <h3 className="font-sans text-sm font-semibold text-foreground mb-3">Color and contrast</h3>
                      <ul role="list" className="font-sans text-sm text-[hsl(var(--text-secondary))] space-y-1.5">
                        <li>Body text: minimum 7:1 contrast (WCAG AAA) in both modes</li>
                        <li>Large text (18pt+ or bold 14pt+): minimum 4.5:1 (WCAG AAA)</li>
                        <li>UI controls and focus indicators: minimum 3:1</li>
                        <li>Never use amber <code className="font-mono text-xs bg-background px-1 py-0.5 rounded border border-[hsl(var(--surface-border))]">#ffc034</code> as text in light mode</li>
                        <li>Hover states must meet contrast in both light and dark</li>
                        <li>Never convey meaning through color alone</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
                      <h3 className="font-sans text-sm font-semibold text-foreground mb-3">Interaction and motion</h3>
                      <ul role="list" className="font-sans text-sm text-[hsl(var(--text-secondary))] space-y-1.5">
                        <li>Every interactive element is keyboard reachable</li>
                        <li>Focus rings visible in both modes on all elements</li>
                        <li>Touch targets minimum 24 x 24 px (prefer 44 x 44 px)</li>
                        <li>Animations respect <code className="font-mono text-xs bg-background px-1 py-0.5 rounded border border-[hsl(var(--surface-border))]">prefers-reduced-motion</code></li>
                        <li>All images have descriptive alt text</li>
                      </ul>
                    </div>
                  </div>
                </SectionBlock>

              </div>

              {/* Sticky right TOC — visible to screen readers, not aria-hidden */}
              <aside aria-label="Page sections" className="hidden lg:block">
                <div className="sticky top-24 pt-16">
                  <TableOfContents activeId={activeSection} />
                </div>
              </aside>

            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default BrandGuidelines;
