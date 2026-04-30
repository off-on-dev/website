import { type JSX } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

export const SponsorStrip = (): JSX.Element => {
  return (
    <section className="bg-card border-t border-[hsl(var(--surface-border))] py-12 px-6 md:px-16">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <p className="text-lg text-[hsl(var(--text-secondary))] leading-relaxed max-w-xl">
          Sponsor challenges, swag, or licenses and connect with the next generation of open source contributors.
        </p>
        <Link
          to="/sponsors"
          className="btn-primary shrink-0"
        >
          Become a Sponsor <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
};
