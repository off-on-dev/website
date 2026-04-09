import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const BottomCTA = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="bg-primary py-16 px-6 md:px-16">
      {isVisible && (
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - headline */}
          <h2 className="animate-fade-up text-4xl md:text-5xl font-bold leading-tight tracking-tight text-background">
            Start curious.<br />
            Break things.<br />
            Learn together.<br />
            Glow brighter.
          </h2>

          {/* Right - copy + buttons */}
          <div className="animate-fade-up-delay-1 flex flex-col gap-4">
            <p className="font-mono text-sm leading-relaxed text-background/90">
              Some species of fireflies synchronize their flashing. Thousands of individuals, each emitting their own signal, collectively producing something far more powerful than any single light source could output.
            </p>
            <p className="font-mono text-sm leading-relaxed text-background/90">
              That's offon.{" "}
              <strong className="font-medium text-background">
                You bring your questions, your fixes, your half-finished PRs.
              </strong>{" "}
              We bring the challenges, the tooling, and the engineers who care about the same problems you do.
            </p>
            <p className="font-mono text-sm leading-relaxed text-background/90">
              Everyone ships their own spark. The community is where those signals synchronize to illuminate the entire ecosystem.
            </p>
            <p className="font-mono text-sm font-medium text-background">
              Always on. Always open. Always learning.
            </p>
            <div className="flex gap-3 flex-wrap mt-2">
              <a
                href="https://community.open-ecosystem.com"
                target="_blank"
                rel="noopener noreferrer"
              className="bg-background text-primary font-bold text-sm px-5 py-2.5 rounded-md border-2 border-primary transition-all hover:bg-primary hover:border-primary-foreground hover:text-primary-foreground hover:scale-[1.02] active:scale-[0.97]"
              >
                Join the community →<span className="sr-only"> (opens in new tab)</span>
              </a>
              <a
                href="https://github.com/dynatrace-oss/offon-challenges"
                target="_blank"
                rel="noopener noreferrer"
              className="bg-transparent text-background font-bold text-sm px-5 py-2.5 rounded-md border-2 border-background/70 transition-all hover:bg-primary-foreground hover:border-primary-foreground hover:text-primary hover:scale-[1.02] active:scale-[0.97]"
              >
                GitHub ↗<span className="sr-only"> (opens in new tab)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
