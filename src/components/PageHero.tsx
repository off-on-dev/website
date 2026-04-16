import { type ReactNode } from "react";
import { Link } from "react-router-dom";

type Cta = {
  label: ReactNode;
  href: string;
  external?: boolean;
}

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
}

const renderCta = (cta: Cta, isPrimary: boolean): JSX.Element => {
  const primaryCls = "btn-inverse";
  const secondaryCls = "btn-ghost-inverse";
  const cls = isPrimary ? primaryCls : secondaryCls;

  if (cta.external) {
    return (
      <a key={cta.href} href={cta.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {cta.label}
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    );
  }
  if (cta.href.startsWith("mailto:") || cta.href.startsWith("#")) {
    return (
      <a key={cta.href} href={cta.href} className={cls}>
        {cta.label}
      </a>
    );
  }
  return (
    <Link key={cta.href} to={cta.href} className={cls}>
      {cta.label}
    </Link>
  );
};

export const PageHero = ({ eyebrow, title, description, primaryCta, secondaryCta }: PageHeroProps): JSX.Element => {
  return (
    <section className="bg-primary pt-32 pb-20 px-6 md:px-16">
      <div className="mx-auto max-w-4xl">
        {eyebrow && (
          <span className="font-sans text-sm font-medium uppercase tracking-widest text-background/90 block mb-4">
            {eyebrow}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-background mb-5">
          {title}
        </h1>
        <p className="font-sans text-base leading-relaxed text-background/90 max-w-2xl mb-8">
          {description}
        </p>
        {(primaryCta || secondaryCta) && (
          <div className="flex gap-3 flex-wrap">
            {primaryCta && renderCta(primaryCta, true)}
            {secondaryCta && renderCta(secondaryCta, false)}
          </div>
        )}
      </div>
    </section>
  );
};
