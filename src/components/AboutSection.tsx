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
                <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">About</span>
                <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
                  Hands-on cloud-native education for everyone
                </h2>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                  Open Ecosystem is a collection of free, hands-on challenges that teach cloud-native technologies through realistic debugging scenarios. Born out of the Dynatrace open source program, we believe that the best engineers aren't the ones who memorize docs — they're the ones who've broken things and fixed them.
                </p>
                <p className="mt-4 text-[hsl(var(--text-secondary))] leading-relaxed">
                  Each adventure drops you into a pre-built environment with something intentionally wrong. Your job is to find it, understand it, and fix it — using the same tools and workflows you'd use in production.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => (
                <div key={v.title} className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
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
