import { type JSX } from "react";
import { Shield, TrendingUp, BookOpen } from "lucide-react";

type Highlight = {
  icon: JSX.Element;
  title: string;
  desc: string;
};

const highlights: Highlight[] = [
  {
    icon: <BookOpen size={22} aria-hidden="true" />,
    title: "Learn by Doing",
    desc: "Real-world, hands-on challenges. Broken pipelines, misconfigured systems, and more. All running in your browser via GitHub Codespaces, no setup needed.",
  },
  {
    icon: <TrendingUp size={22} aria-hidden="true" />,
    title: "Build Real Skills",
    desc: "Build practical, hands-on experience with every challenge. Earn Credly badges and leaderboard points along the way.",
  },
  {
    icon: <Shield size={22} aria-hidden="true" />,
    title: "Open Source",
    desc: "Everything runs on open source tools. Vendor-neutral and free from proprietary lock-in. Open, transparent, and reproducible by anyone.",
  },
];

export const ChallengeHighlights = (): JSX.Element => {
  return (
    <section aria-label="Challenge highlights" className="bg-card py-16 px-6 md:px-16 border-y border-[hsl(var(--surface-border))]">
      <div className="mx-auto max-w-6xl grid gap-8 sm:grid-cols-3">
        {highlights.map((h) => (
          <div key={h.title} className="flex gap-4">
            <span className="mt-0.5 shrink-0 text-primary">{h.icon}</span>
            <div>
              <p className="font-semibold text-foreground">{h.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{h.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
