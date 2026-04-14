import { useScrollAnimation } from "@/hooks/useScrollAnimation";
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
    desc: "The best way to understand complex systems is to debug them. Every challenge is a real-world scenario with broken environments, misconfigured pipelines, and invisible failures, powered by GitHub Codespaces.",
  },
  {
    icon: GitBranch,
    title: "Open source first",
    desc: "Every challenge, tool, and piece of infrastructure is open source. Practical, reproducible across technologies, and built around the tooling the community actually uses.",
  },
  {
    icon: Megaphone,
    title: "Share what you know",
    desc: "Post tutorials, design docs, and real-world case studies in Community Voices. Document what works, share what you've learned, and help others avoid the same hard lessons.",
  },
  {
    icon: Users,
    title: "Grow together",
    desc: "Mentor and be mentored. Ask questions in Q&A, share your experience, and help shape the next generation of contributors and maintainers.",
  },
  {
    icon: Heart,
    title: "People first",
    desc: "Open source work is often invisible, underfunded, and emotionally demanding. Whether you're contributing code, answering questions, writing tutorials, or simply showing up to learn, your work is visible, valued, and supported here.",
  },
  {
    icon: Unlock,
    title: "Vendor agnostic",
    desc: "The best knowledge should be accessible to everyone. Technical product mentions are welcome when neutral and reproducible. No vendor influences what you learn here.",
  },
  {
    icon: MapPin,
    title: "Events & meetups",
    desc: "Host your events and local meetups for free. Keep your community engaged, your content accessible, and your connections alive outside the forum.",
  },
  {
    icon: Shield,
    title: "Built to last",
    desc: `${BRAND_NAME} is built for the long term. We're committed to maintaining an inclusive, respectful space where contributors and maintainers can grow, regardless of shifting market trends or corporate interests.`,
  },
];

export const AboutSection = (): JSX.Element => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="mission" ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        {isVisible && (
          <div className="animate-fade-up">
            <div className="mb-16">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Our Mission</span>
              <div className="mt-4 flex flex-col gap-4 max-w-2xl">
                <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                  We are focused on what matters: supporting contributors and maintainers as open source faces new realities around regulation, digital sovereignty, and AI.
                </p>
                <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                  {BRAND_NAME} has one clear goal: Building the contributors and maintainers of tomorrow by helping people grow from curious users to confident contributors, and from contributors to sustainable maintainers.
                </p>
              </div>
            </div>

            <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Our Values</span>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.title} className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    <h3 className="mt-3 text-base font-semibold text-foreground">{v.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
