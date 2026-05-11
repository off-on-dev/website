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
          <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
            When we rebranded, we wanted the name and the mascot to feel true to this community. We talked through a lot of ideas and kept coming back to the same question: what mascot could reflect a space built on curiosity, contribution, and learning by doing?
          </p>
          <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
            At one point, someone said firefly, and it clicked. That is how Nyx came to life.
          </p>
          <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
            Nyx is more than a mascot. The firefly reflects what {BRAND_NAME} is about: people showing up for each other, sharing what they know, and building something brighter together. Each person brings their own spark, but together, we glow brighter.
          </p>
        </div>
      </div>
    </section>
  );
};
