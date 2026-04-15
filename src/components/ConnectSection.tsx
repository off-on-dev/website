import { ArrowRight, UserPlus, CalendarDays } from "lucide-react";
import { type ReactNode } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { COMMUNITY_URL } from "@/data/constants";

const items: { icon: ReactNode; title: string; desc: string; cta: string; href: string }[] = [
  {
    icon: <UserPlus size={28} aria-hidden="true" />,
    title: "Introduce yourself",
    desc: "New here? Tell us about yourself. Share your role, what you're building or learning, and one thing you want to get out of the community.",
    cta: "Say hello",
    href: `${COMMUNITY_URL}/c/general/introductions/18`,
  },
  {
    icon: <CalendarDays size={28} aria-hidden="true" />,
    title: "Events & meetups",
    desc: "Find upcoming events, add local meetups to the community calendar, and connect with members in your city. Some of the best connections happen face to face.",
    cta: "See upcoming events",
    href: `${COMMUNITY_URL}/c/events-and-talks/12`,
  },
];

export const ConnectSection = (): JSX.Element => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        {isVisible && (
          <>
            <div className="animate-fade-up mb-3">
              <span className="section-label font-mono text-xs font-medium uppercase tracking-widest text-primary">
                Connect
              </span>
            </div>
            <h2 className="animate-fade-up-delay-1 mb-3 text-3xl font-bold text-primary md:text-4xl">
              Stronger together
            </h2>
            <p className="animate-fade-up-delay-1 mb-12 max-w-xl text-[hsl(var(--text-secondary))] leading-relaxed">
              Open source thrives when passionate people find each other. Start by introducing yourself to the community, find events near you, and meet the builders and maintainers who share your drive.            </p>
            <div className="animate-fade-up-delay-2 grid gap-6 md:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.title}
                  className="card-glow flex flex-col rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8"
                >
                  <span className="mb-4 text-primary">{item.icon}</span>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">{item.desc}</p>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm"
                  >
                    {item.cta} <ArrowRight size={13} aria-hidden="true" />
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
