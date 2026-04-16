import { type ReactNode } from "react";
import { ArrowRight, Megaphone, CircleHelp } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { COMMUNITY_URL } from "@/data/constants";

type Pillar = {
  icon: ReactNode;
  title: string;
  desc: string;
  cta: string;
  href: string;
}

const pillars: Pillar[] = [
  {
    icon: <Megaphone size={28} aria-hidden="true" />,
    title: "Community Voices",
    desc: "Share tutorials, showcase projects, post open source news, and write about what you have learned. The home for community-created content.",
    cta: "Share something",
    href: `${COMMUNITY_URL}/c/community-voices/38`,
  },
  {
    icon: <CircleHelp size={28} aria-hidden="true" />,
    title: "Q&A",
    desc: "Stuck on a technical problem or not sure where to start with open source? Post a question and get answers from the community. No question is too basic.",
    cta: "Ask a question",
    href: `${COMMUNITY_URL}/c/general/q-a/10`,
  },
];

export const CommunityVoicesSection = (): JSX.Element => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        {isVisible && (
          <>
          <div className="animate-fade-up mb-3">
            <span className="section-label font-sans text-sm font-medium uppercase tracking-widest text-primary">
              Community
            </span>
          </div>
          <h2 className="animate-fade-up-delay-1 mb-3 text-3xl font-bold text-primary md:text-4xl">
            Share and learn together
          </h2>
          <p className="animate-fade-up-delay-1 mb-12 max-w-xl text-[hsl(var(--text-secondary))] leading-relaxed">
            Post what you've built, write about what you've learned, or ask the community for help. Every contribution counts.
          </p>
          <div className="animate-fade-up-delay-2 grid gap-6 md:grid-cols-2">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="card-glow flex flex-col rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8"
              >
                <span className="mb-4 text-primary">{p.icon}</span>
                <h3 className="text-xl font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">{p.desc}</p>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm"
                >
                  {p.cta} <ArrowRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
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
