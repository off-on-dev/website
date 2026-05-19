import type { JSX } from "react";

type ScenarioSectionProps = {
  scenario: string;
};

export const ScenarioSection = ({ scenario }: ScenarioSectionProps): JSX.Element => (
  <section className="mb-14">
    <p className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-4">
      The scenario
    </p>
    <p className="text-lg italic text-[hsl(var(--text-secondary))] leading-relaxed">
      {scenario}
    </p>
  </section>
);
