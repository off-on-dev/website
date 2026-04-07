import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const BottomCTA = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-2xl">
        {isVisible && (
          <div className="card-glow animate-fade-up relative rounded-2xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-12 text-center overflow-hidden">
            <div className="cta-glow absolute inset-0 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-foreground">You belong here</h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto leading-relaxed">
                This community exists for people who care about open source, learning in public, and building spaces that last. Whether you're here to learn, mentor, share your work, or connect with others who understand the craft — join us.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <a
                  href="https://community.offon.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Join the community →
                </a>
                <a
                  href="https://github.com/dynatrace-oss/offon-challenges"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  GitHub ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
