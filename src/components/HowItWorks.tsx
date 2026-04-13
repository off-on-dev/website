import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { COMMUNITY_URL } from "@/data/constants";

const pillars = [
  {
    icon: "🎙️",
    title: "Community Voices",
    desc: "Share tutorials, showcase projects, post open source news, and write about what you have learned. The home for community-created content.",
    cta: "Share something →",
    href: `${COMMUNITY_URL}/c/community-voices/38`,
  },
  {
    icon: "❓",
    title: "Q&A",
    desc: "Stuck on a technical problem or not sure where to start with open source? Post a clear question and get answers from the community. No question is too basic.",
    cta: "Ask a question →",
    href: `${COMMUNITY_URL}/c/general/q-a/10`,
  },
  {
    icon: "🏆",
    title: "Challenges",
    desc: "Hands-on missions to practice OpenTelemetry, AI, and cloud-native skills. Fix broken setups, modernize infrastructure, and earn points on the leaderboard.",
    cta: "See current challenges ↓",
    href: "#challenges",
  },
  {
    icon: "👋",
    title: "Connect",
    desc: "Say hello, find events near you, and meet people who care about the same things. Find local meetups, add upcoming events, and introduce yourself.",
    cta: "Find your people →",
    href: `${COMMUNITY_URL}/c/general/introductions/18`,
  },
];

export const HowItWorks = (): JSX.Element => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        {isVisible && (
          <>
            <div className="animate-fade-up mb-3">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">
                Get Involved
              </span>
            </div>
            <h2 className="animate-fade-up-delay-1 mb-3 text-3xl font-bold text-primary md:text-4xl">
              Start here
            </h2>
            <p className="animate-fade-up-delay-1 mb-12 max-w-xl text-[hsl(var(--text-secondary))] leading-relaxed">
              Share what you have built, write about what you have learned, or ask the community for help.
            </p>
            <div className="animate-fade-up-delay-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((p) => (
                <div
                  key={p.title}
                  className="card-glow flex flex-col rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6"
                >
                  <span className="text-2xl mb-3" aria-hidden="true">{p.icon}</span>
                  <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">{p.desc}</p>
                  <a
                    href={p.href}
                    target={p.href.startsWith("http") ? "_blank" : undefined}
                    rel={p.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-4 text-sm font-medium text-primary hover:underline"
                  >
                    {p.cta}
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
