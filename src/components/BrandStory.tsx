import type { JSX } from "react";

export const BrandStory = (): JSX.Element => {
  return (
    <section id="story" className="px-6 md:px-16 pb-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold text-foreground">The Story Behind the Firefly</h2>
        <div className="mt-4 flex flex-col gap-4 max-w-3xl">
          <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
            When we rebranded, we wanted the name and the mascot to say something true about this community. David put name ideas on the table, like OnOffOn.dev. In a team meeting, Katharina suggested offon.dev, and the whole team was in.
          </p>
          <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
            The mascot took longer. We tried AI and a few other approaches as a team. Sinduri became Kathi's sounding board as they talked through which creature fit a community like ours. In one of those conversations, Kathi heard "firefly", and she created the perfect logo.
          </p>
          <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
            The firefly is more than a mascot. Each of you is remarkable on your own. Together, we glow brighter.
          </p>
        </div>
      </div>
    </section>
  );
};
