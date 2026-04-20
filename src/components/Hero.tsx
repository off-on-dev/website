import { ArrowDown, ArrowRight } from "lucide-react";
import { COMMUNITY_URL } from "@/data/constants";

export const Hero = (): JSX.Element => {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-6 pt-20">
      {/* Firefly particles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="firefly" />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
            <div className="hero-badge animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-[hsl(var(--surface))] px-4 py-1.5" aria-label="Vendor-neutral, Open source, Community-driven">
              <svg aria-hidden="true" className="h-3 w-3 text-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/></svg>
              <span className="text-xs text-foreground">Vendor-neutral</span>
              <svg aria-hidden="true" className="h-3 w-3 text-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/></svg>
              <span className="text-xs text-foreground">Open source</span>
              <svg aria-hidden="true" className="h-3 w-3 text-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/></svg>
              <span className="text-xs text-foreground">Community-driven</span>
            </div>
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block text-foreground dark:text-primary">
                Always On.
              </span>
              <span className="block text-foreground">
                Always Open.
              </span>
            </h1>
            <p className="font-sans animate-fade-up-delay-2 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[hsl(var(--text-secondary))]">
              A welcoming community for open source enthusiasts to learn, share knowledge, and build together. Take on hands-on challenges, write tutorials, share open source projects and news, and keep growing.
            </p>
            <div className="animate-fade-up-delay-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="#challenges" className="btn-primary">
                Start a challenge <ArrowDown size={16} aria-hidden="true" />
              </a>
              <a
                href={COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                Join the community <ArrowRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
              </a>
            </div>
      </div>
    </section>
  );
};
