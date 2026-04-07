import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const values = [
  {
    icon: "🔧",
    title: "Learn by breaking",
    desc: "We believe the best way to understand complex systems is to debug them. Every challenge is a real-world scenario that's intentionally broken for you to fix.",
  },
  {
    icon: "🌐",
    title: "Open source first",
    desc: "Every challenge, tool, and piece of infrastructure is open source. Built by the community, for the community.",
  },
  {
    icon: "🚀",
    title: "Zero setup",
    desc: "GitHub Codespaces means you go from zero to debugging in under 60 seconds. No local installs, no configuration headaches.",
  },
  {
    icon: "🤝",
    title: "Community driven",
    desc: "Challenges are designed, tested, and improved by practitioners who've seen these problems in production.",
  },
];

export const AboutSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="about" ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        {isVisible && (
          <div className="animate-fade-up">
            <div className="grid gap-12 lg:grid-cols-2 mb-16">
              <div>
                <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Our Mission</span>
                <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
                  Creating the contributors and maintainers of tomorrow
                </h2>
              </div>
              <div className="flex flex-col justify-center gap-4">
                <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                  We are focused on what matters: supporting contributors and maintainers as open source faces new realities around regulation, digital sovereignty, and AI.
                </p>
                <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                  This community has one clear goal: helping people grow from curious users to confident contributors, and from contributors to sustainable maintainers.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => (
                <div key={v.title} className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
                  <span className="text-2xl">{v.icon}</span>
                  <h3 className="mt-3 text-base font-semibold text-foreground">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
