import { type ReactNode, type JSX } from "react";
import { ArrowRight, Megaphone, CircleHelp, UserPlus, CalendarDays } from "lucide-react";
import { COMMUNITY_URL } from "@/data/constants";

type Card = {
  icon: ReactNode;
  title: string;
  desc: string;
  cta: string;
  href: string;
};

const cards: Card[] = [
  {
    icon: <Megaphone size={28} aria-hidden="true" />,
    title: "Community Voices",
    desc: "Share tutorials, showcase projects, post open source news, and write about what you have learned. The home for community-created content.",
    cta: "Share Something",
    href: `${COMMUNITY_URL}/c/community-voices/38`,
  },
  {
    icon: <CircleHelp size={28} aria-hidden="true" />,
    title: "Q&A",
    desc: "Stuck on a technical problem or not sure where to start? Post a question and get answers from the community. No question is too basic.",
    cta: "Ask a Question",
    href: `${COMMUNITY_URL}/c/general/q-a/10`,
  },
  {
    icon: <UserPlus size={28} aria-hidden="true" />,
    title: "Introduce Yourself",
    desc: "New here? Tell us about yourself. Share your role, what you're building or learning, and one thing you want to get out of the community.",
    cta: "Say Hello",
    href: `${COMMUNITY_URL}/c/general/introductions/18`,
  },
  {
    icon: <CalendarDays size={28} aria-hidden="true" />,
    title: "Events & Meetups",
    desc: "Find upcoming events, add local meetups to the community calendar, and connect with members in your city.",
    cta: "See Upcoming Events",
    href: `${COMMUNITY_URL}/c/events-and-talks/12`,
  },
];

export const CommunitySection = (): JSX.Element => {
  return (
    <section className="py-24 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="animate-fade-up mb-3">
          <span className="section-label font-sans text-sm font-medium uppercase tracking-widest text-primary">
            community
          </span>
        </div>
        <h2 className="animate-fade-up-delay-1 mb-6 text-3xl font-bold text-primary md:text-4xl">
          Get Involved
        </h2>
        <p className="animate-fade-up-delay-1 mb-12 max-w-xl text-[hsl(var(--text-secondary))] leading-relaxed">
          The community is where open source comes alive. Share what you know, ask for help, meet the people behind the projects, and find events near you.
        </p>
        <div className="animate-fade-up-delay-2 grid gap-6 sm:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.title}
              className="card-glow flex flex-col rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8"
            >
              <span className="mb-4 text-primary">{card.icon}</span>
              <h3 className="text-xl font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">{card.desc}</p>
              <a
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
              >
                {card.cta} <ArrowRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
