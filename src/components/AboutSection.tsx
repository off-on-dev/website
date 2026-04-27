import type { JSX } from "react";
import { BRAND_NAME } from "@/data/constants";
import { Zap, GitBranch, Megaphone, Users, Heart, Unlock, MapPin, Shield, LucideIcon } from "lucide-react";

type Value = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

const values: Value[] = [
  {
    icon: Zap,
    title: "Learn by doing",
    desc: "The best way to understand complex systems is to debug them. Every challenge is a real-world scenario with broken environments, misconfigured pipelines, and invisible failures.",
  },
  {
    icon: GitBranch,
    title: "Open source first",
    desc: "Open source is the reason technology moves as fast as it does. It drives innovation through collaboration, keeps knowledge free, and ensures the tools we all rely on are not locked behind closed doors.",
  },
  {
    icon: Megaphone,
    title: "Share what you know",
    desc: "Post tutorials, design docs, and real-world case studies in Community Voices. Document what works, share what you have learned, and help others avoid the same hard lessons.",
  },
  {
    icon: Users,
    title: "Grow together",
    desc: "Mentor and be mentored. Ask questions in Q&A, share your experience, and help shape the next generation of contributors and maintainers.",
  },
  {
    icon: Heart,
    title: "People first",
    desc: "Open source work is often invisible, underfunded, and emotionally demanding. Whether contributing code, answering questions, or simply showing up to learn, your work is visible, valued, and supported here.",
  },
  {
    icon: Unlock,
    title: "Vendor agnostic",
    desc: "The best knowledge should be accessible to everyone. Technical product mentions are welcome when neutral and reproducible, because a more open ecosystem benefits the whole community.",
  },
  {
    icon: MapPin,
    title: "Events & meetups",
    desc: "Host your events and local meetups for free. Keep your community engaged, your content accessible, and your connections alive outside the forum.",
  },
  {
    icon: Shield,
    title: "Built to last",
    desc: `${BRAND_NAME} is built for the long term. We are committed to maintaining an inclusive, respectful space where contributors and maintainers can grow, regardless of shifting market trends or corporate interests.`,
  },
];

export const AboutSection = (): JSX.Element => {
  return (
    <section id="mission" className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div>
          <div className="mb-16">
            <h2 className="font-sans text-sm font-medium uppercase tracking-widest text-primary">Our Mission</h2>
            <div className="mt-4 flex flex-col gap-4 max-w-2xl">
              <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                {BRAND_NAME} is a vendor-neutral, community-driven space built around one goal: supporting the open source contributors and maintainers of tomorrow.
              </p>
              <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                As open source navigates new realities around regulation, digital sovereignty, and AI, {BRAND_NAME} gives the community a place to learn, share their work, and grow, from curious users to confident contributors, and from contributors to sustainable maintainers.
              </p>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="font-sans text-sm font-medium uppercase tracking-widest text-primary">Who It's For</h2>
            <div className="mt-4 max-w-2xl">
              <ul className="flex flex-col gap-2">
                {[
                  "Curious learners and developers looking for a practical, guided path into open source",
                  "Engineers, SREs, and practitioners who want to deepen their skills through real-world challenges",
                  "Contributors and maintainers who want to share knowledge and help grow the next generation",
                  "Advocates and community builders who want to connect and collaborate",
                  "Organisations and sponsors who want to support open source learning and connect with the community",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[hsl(var(--text-secondary))]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="font-sans text-sm font-medium uppercase tracking-widest text-primary">What We Stand For</h2>
            <div className="mt-4 max-w-2xl">
              <ul className="flex flex-col gap-2">
                {[
                  "Open, vendor-agnostic practices: every challenge, tool, and content is built around open source",
                  "Reproducible, action-oriented content: real-world scenarios, hands-on challenges, and practical knowledge you can apply and build on",
                  "Respectful, inclusive collaboration: constructive feedback, zero tolerance for harassment, and a space where all contributions are visible and valued",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[hsl(var(--text-secondary))]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <h2 className="font-sans text-sm font-medium uppercase tracking-widest text-primary">How We Build Together</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-3 text-lg font-semibold text-foreground">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
