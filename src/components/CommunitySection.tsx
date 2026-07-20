import { type ReactNode, type JSX } from "react";
import { ExternalLink, Megaphone, CircleHelp, UserPlus, CalendarDays } from "lucide-react";
import { COMMUNITY_URL } from "@/data/constants";
import { SectionLabel } from "@/components/SectionLabel";
import { SidebarLayout } from "@/components/SidebarLayout";

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

export const CommunitySection = ({ aside }: { aside?: ReactNode }): JSX.Element => {
  const content = (
    <div>
      <SectionLabel>community</SectionLabel>
      <h2 id="community-section-heading" className="mb-6 text-3xl font-bold text-primary md:text-4xl">
        Get Involved
      </h2>
      <p className="mb-12 max-w-xl text-dim leading-relaxed">
        The community is where open source comes alive. Share what you know, ask for help, meet the people behind the projects, and find events near you.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.title}
            className="card-glow flex flex-col rounded-xl border border-border bg-[hsl(var(--surface))] p-8"
          >
            <span className="mb-4 text-primary">{card.icon}</span>
            <h3 className="text-xl font-semibold text-foreground">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">{card.desc}</p>
            <a
              href={card.href}
              target="_blank"
              rel="noopener noreferrer" aria-describedby="new-tab-hint"
              className="docs-ext-link mt-5 text-sm font-medium"
            >
              {card.cta} <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section aria-labelledby="community-section-heading" className="py-24 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        <SidebarLayout aside={aside}>{content}</SidebarLayout>
      </div>
    </section>
  );
};
