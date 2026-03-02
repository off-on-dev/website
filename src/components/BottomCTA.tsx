import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const BottomCTA = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-2xl">
        {isVisible && (
          <div className="animate-fade-up relative rounded-2xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-12 text-center overflow-hidden">
            <div className="cta-glow absolute inset-0 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-foreground">Ready to break something?</h2>
              <p className="mt-3 text-muted-foreground">No signup wall. No credit card. Just pick a challenge and start debugging.</p>
              <a
                href="#challenges"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                Browse challenges
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
