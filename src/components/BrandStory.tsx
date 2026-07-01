import type { JSX } from "react";
import { SectionLabel } from "@/components/SectionLabel";
import { BRAND_NAME } from "@/data/constants";

export const BrandStory = (): JSX.Element => {
  return (
    <section id="story" aria-labelledby="story-heading" className="px-6 md:px-16 pb-16">
      <div className="mx-auto max-w-6xl">
        <SectionLabel>our story</SectionLabel>
        <h2 id="story-heading" className="text-2xl font-bold text-foreground">The Story Behind the Firefly</h2>
        <div className="mt-4 flex flex-col gap-4 max-w-3xl">
          <p className="text-dim leading-relaxed">
            When we rebranded, we wanted the name and the mascot to feel true to this community. We talked through a lot of ideas and kept coming back to the same question: what mascot could reflect a space built on curiosity, contribution, and learning by doing?
          </p>
          <p className="text-dim leading-relaxed">
            At one point, someone said firefly, and it clicked. That is how Nyx came to life.
          </p>
          <p className="text-dim leading-relaxed">
            Nyx is more than a mascot. The firefly reflects what {BRAND_NAME} is about: people showing up for each other, sharing what they know, and building something brighter together. Each person brings their own spark, but together, we glow brighter.
          </p>
          <p className="text-dim leading-relaxed">
            That spark matters more than ever. AI can write code, but when it takes over all the work, how do people discover their passion or the creativity needed to design the best solutions? When curiosity fades, growth stops.
          </p>
          <p className="text-dim leading-relaxed">
            Understanding how things work still matters. When we combine our thinking, that is where the real magic happens. The power of community is not just about being part of something. It is an engine that fuels human connection, curiosity, and genuine love for a topic. AI cannot replicate that experience.
          </p>
        </div>
      </div>
    </section>
  );
};
