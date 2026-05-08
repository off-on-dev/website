import type { JSX, ReactNode } from "react";

type SectionLabelProps = {
  children: ReactNode;
};

// Uppercased eyebrow label rendered above section h2s. The CSS class
// `section-label` applies `text-transform: uppercase`, so source text stays
// lowercase per styleguide.md.
export const SectionLabel = ({ children }: SectionLabelProps): JSX.Element => (
  <div className="mb-3">
    <span className="section-label font-sans text-sm font-medium uppercase tracking-widest text-primary">
      {children}
    </span>
  </div>
);
