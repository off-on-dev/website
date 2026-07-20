import { useMemo, type JSX } from "react";
import { ArrowDown, ExternalLink, Zap } from "lucide-react";
import { BRAND_SECONDARY_LINE_PARTS, BRAND_SLOGAN_PARTS, COMMUNITY_URL } from "@/data/constants";

export const Hero = (): JSX.Element => {
  const fireflies = useMemo(
    () => Array.from({ length: 8 }, (_, i) => <span key={i} className="firefly" />),
    [],
  );

  return (
    <section aria-labelledby="hero-heading" className="relative flex min-h-dvh items-center justify-center px-6 pt-20">
      {/* Firefly particles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {fireflies}
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
            <div className="animate-fade-up hero-badge mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-[hsl(var(--surface))] px-4 py-1.5">
              <Zap size={12} aria-hidden="true" className="text-foreground" />
              <span className="text-sm text-foreground">{BRAND_SLOGAN_PARTS[0]}</span>
              <Zap size={14} aria-hidden="true" className="text-foreground" />
              <span className="text-sm text-foreground">{BRAND_SLOGAN_PARTS[1]}</span>
              <Zap size={14} aria-hidden="true" className="text-foreground" />
              <span className="text-sm text-foreground">{BRAND_SLOGAN_PARTS[2]}</span>
            </div>
            <h1 id="hero-heading" className="animate-fade-up-delay-1 font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block text-primary">
                {BRAND_SECONDARY_LINE_PARTS[0]}
              </span>
              <span className="block text-foreground">
                {BRAND_SECONDARY_LINE_PARTS[1]}
              </span>
              <span className="block text-foreground">
                {BRAND_SECONDARY_LINE_PARTS[2]}
              </span>
            </h1>
            <p className="animate-fade-up-delay-2 font-sans mx-auto mt-6 max-w-xl text-lg leading-relaxed text-dim">
              A welcoming community for open source enthusiasts. Learn through hands-on challenges, share your knowledge, and grow alongside people who love open source as much as you do.
            </p>
            <div className="animate-fade-up-delay-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="#challenges" className="btn-primary">
                Start a Challenge <ArrowDown size={16} aria-hidden="true" />
              </a>
              <a
                href={COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                Join the Community <ExternalLink size={16} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
              </a>
            </div>
      </div>
    </section>
  );
};
