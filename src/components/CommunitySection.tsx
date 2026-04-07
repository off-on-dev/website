import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const highlights = [
  { emoji: "💬", text: "Active discussions on open source challenges, tutorials, and real-world incidents" },
  { emoji: "🎤", text: "Community-hosted events, webinars, and local meetups you can add to the calendar" },
  { emoji: "📍", text: "Local Open Ecosystem meetups — find your city and join community discussions" },
  { emoji: "🌱", text: "A welcoming space to introduce yourself, ask questions, and grow in public" },
];

export const CommunitySection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        {isVisible && (
          <div className="animate-fade-up grid gap-12 lg:grid-cols-2">
            <div>
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Community</span>
              <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
                Find your people
              </h2>
              <p className="mt-4 text-[hsl(var(--text-secondary))] leading-relaxed">
                community.offon.dev is where the conversations happen. Browse discussions, share what you've built, ask questions, and connect with people who care about the same things.
              </p>
              <p className="mt-3 text-[hsl(var(--text-secondary))] leading-relaxed">
                Mission-driven. Community-powered. Open by design.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://community.offon.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Browse the forum →
                </a>
                <a
                  href="https://community.offon.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  Getting started guide
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-4 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
                  <span className="text-xl shrink-0 mt-0.5">{h.emoji}</span>
                  <p className="text-sm leading-relaxed text-muted-foreground">{h.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
