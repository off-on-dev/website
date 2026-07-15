import { type JSX } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

export const SponsorStrip = (): JSX.Element => {
  return (
    <section aria-labelledby="sponsor-heading" className="bg-card border-y border-border py-16 px-6 md:px-16">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 id="sponsor-heading" className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-primary">
            Support OffOn
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          <p className="font-sans text-base leading-relaxed text-dim">
            Sponsor challenges, swag, or licenses and connect with the next generation of open source contributors.
          </p>
          <div>
            <Link to="/sponsors/" className="btn-primary">
              Become a Sponsor <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
