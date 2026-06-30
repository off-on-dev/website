import type { JSX } from "react";
import { BRAND_NAME } from "@/data/constants";
import { BulletList } from "@/components/BulletList";
import { SectionLabel } from "@/components/SectionLabel";

export const AboutSection = (): JSX.Element => {
  return (
    <section id="approach" aria-label="Our foundation" className="py-16 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        <SectionLabel>our foundation</SectionLabel>

        <div className="mb-8">
          <h2 id="mission" className="text-2xl font-bold text-foreground">Our Mission</h2>
          <div className="mt-4 flex flex-col gap-4 max-w-3xl">
            <p className="text-lg text-foreground leading-relaxed">
              {BRAND_NAME} exists to sustain the people behind open source and create the maintainers of tomorrow.
            </p>
            <p className="text-dim leading-relaxed">
              We are a vendor-neutral, community-driven space built around one goal: supporting open source contributors and maintainers at every stage of their journey, from the first pull request to long-term stewardship.
            </p>
            <p className="text-dim leading-relaxed">
              Most platforms, foundations, and content formats today are designed with enterprises, legal teams, or marketing goals in mind. Far fewer are built for the individuals who actually keep open source alive.
            </p>
            <p className="text-dim leading-relaxed">
              As the ecosystem navigates new realities around regulation, digital sovereignty, and AI, {BRAND_NAME} gives the community a place to learn, share, mentor, and grow, from curious users to confident contributors, and from contributors to sustainable maintainers.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 id="vision" className="text-2xl font-bold text-foreground">Our Vision</h2>
          <div className="mt-4 flex flex-col gap-4 max-w-3xl">
            <p className="text-dim leading-relaxed">
              A future where open source is not only widely used, but actively sustained by a new generation of contributors and maintainers who are trained, supported, and connected, regardless of which company, country, or project they come from.
            </p>
            <p className="text-dim leading-relaxed">
              We believe a real community has to be open. Open in its tooling, open in its governance, and open in how knowledge is preserved and passed on. {BRAND_NAME} is our attempt to put that belief into practice.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 id="audience" className="text-2xl font-bold text-foreground">Who It's For</h2>
          <div className="mt-4 max-w-3xl">
            <BulletList items={[
              "Curious learners and developers looking for a practical, guided path into open source",
              "Engineers, SREs, and practitioners who want to deepen their skills through real-world challenges",
              "Contributors and maintainers who want to share knowledge and help grow the next generation",
              "Advocates, OSPO members, and community builders who want to amplify their work and strengthen the wider ecosystem",
              "Non-code contributors (writers, designers, translators, organisers) whose work is essential but often invisible",
              "Organisations and sponsors who want to support open source learning and connect with the community on the community's terms",
            ]} />
          </div>
        </div>

        <div>
          <h2 id="values" className="text-2xl font-bold text-foreground">What We Stand For</h2>
          <div className="mt-4 max-w-3xl">
            <BulletList items={[
              {
                lead: "Open and vendor-agnostic by default.",
                desc: "Every challenge, tool, and piece of content is built around open source. Sponsors fund the work; they do not shape the mission.",
              },
              {
                lead: "Reproducible and action-oriented.",
                desc: "Real-world scenarios, hands-on challenges, and practical knowledge you can apply, fork, and build on, not marketing in disguise.",
              },
              {
                lead: "Built for people, not pipelines.",
                desc: `${BRAND_NAME} is not a sales channel and not a source of revenue. It exists to develop the maintainers of tomorrow.`,
              },
              {
                lead: "Knowledge that lasts.",
                desc: `Unlike chat tools and social platforms that lose context the moment a thread scrolls away, ${BRAND_NAME} is designed to preserve, structure, and pass on what the community learns.`,
              },
              {
                lead: "Respectful and inclusive.",
                desc: "Constructive feedback, zero tolerance for harassment, and a space where every contribution, whether code, docs, design, or mentorship, is visible and valued.",
              },
            ]} />
          </div>
        </div>
      </div>
    </section>
  );
};
