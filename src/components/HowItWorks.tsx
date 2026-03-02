import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const steps = [
  { num: "01", title: "Choose a challenge", desc: "Browse by difficulty tier — Starter, Builder, or Architect. Each challenge has a narrative, clear objectives, and estimated time." },
  { num: "02", title: "Launch the environment", desc: "Interactive terminals and simulations run directly in your browser. No local setup, no cloud account. Just start debugging." },
  { num: "03", title: "Fix. Validate. Ship.", desc: "Work through the broken environment using real tools. Built-in validation tells you when you've nailed it." },
  { num: "04", title: "Share your approach", desc: "Post your solution in the community discussion below each challenge. Learn from how others solved the same problem differently." },
];

export const HowItWorks = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        {isVisible && (
          <>
            <div className="animate-fade-up mb-3">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">
                How it works
              </span>
            </div>
            <h2 className="animate-fade-up-delay-1 mb-12 text-3xl font-bold text-foreground md:text-4xl">
              From zero to solved in four steps
            </h2>
            <div className="animate-fade-up-delay-2 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-colors hover:bg-[hsl(var(--surface-hover))]"
                >
                  <span className="font-mono text-xs text-primary">{step.num}</span>
                  <h3 className="mt-3 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
