import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const Hero = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="relative flex min-h-screen items-center justify-center px-6 pt-20">
      <div className="hero-glow absolute inset-0 pointer-events-none" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {isVisible && (
          <>
            <div className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="font-mono text-xs text-muted-foreground">
                Vendor-neutral · Open source · Community-driven
              </span>
            </div>
             <h1 className="animate-fade-up-delay-1 text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
               <span className="bg-gradient-to-r from-primary via-teal to-[hsl(var(--purple))] bg-clip-text text-transparent">
                 Break things.
               </span>
               <br />
               <span className="text-foreground">
                 Learn everything.
               </span>
             </h1>
            <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[hsl(var(--text-secondary))]">
              Hands-on challenges with broken Kubernetes clusters, misconfigured pipelines, and invisible failures. Real tools, real scenarios, cloud dev environments powered by GitHub Codespaces.
            </p>
            <div className="animate-fade-up-delay-3 mt-10 flex items-center justify-center gap-4">
              <a
                href="#challenges"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                Start a challenge ↓
              </a>
              <a
                href="https://community.open-ecosystem.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--surface-border))] bg-transparent px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-[hsl(var(--surface-hover))]"
              >
                Join the community →
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
