import { COMMUNITY_URL } from "@/data/constants";

export const Hero = (): JSX.Element => {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-6 pt-20 overflow-hidden">
      {/* Multi-color animated glow */}
      <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* Firefly particles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="firefly" />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
            <div className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-[hsl(var(--surface))] px-4 py-1.5" aria-label="Vendor-neutral, Open source, Community-driven">
              <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
              <span className="text-xs text-foreground">Vendor-neutral</span>
              <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
              <span className="text-xs text-foreground">Open source</span>
              <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
              <span className="text-xs text-foreground">Community-driven</span>
            </div>
            <h1 className="animate-fade-up-delay-1 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-primary via-primary/70 to-[hsl(var(--teal))] bg-clip-text text-transparent">
                Break things.
              </span>
              <br />
              <span className="text-foreground">
                Learn everything.
              </span>
            </h1>
            <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[hsl(var(--text-secondary))]">
              Hands-on challenges with real open source tools and broken-on-purpose environments powered by GitHub Codespaces. Practical, reproducible, and built for one purpose: building the contributors and maintainers of tomorrow.
            </p>
            <div className="animate-fade-up-delay-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="#challenges" className="btn-primary">
                Start a challenge ↓
              </a>
              <a
                href={COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                Join the community →
              </a>
            </div>
      </div>
    </section>
  );
};
