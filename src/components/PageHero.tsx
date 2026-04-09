import { Link } from "react-router-dom";

interface Cta {
  label: string;
  href: string;
  external?: boolean;
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
}

const renderCta = (cta: Cta, isPrimary: boolean) => {
  const primaryCls =
    "bg-background text-primary font-bold text-sm px-5 py-2.5 rounded-md border-2 border-primary transition-all hover:bg-primary hover:border-primary-foreground hover:text-primary-foreground hover:scale-[1.02] active:scale-[0.97]";
  const secondaryCls =
    "bg-transparent text-background font-bold text-sm px-5 py-2.5 rounded-md border-2 border-background/70 transition-all hover:bg-primary-foreground hover:border-primary-foreground hover:text-primary hover:scale-[1.02] active:scale-[0.97]";
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

export const PageHero = ({ eyebrow, title, description, primaryCta, secondaryCta }: PageHeroProps) => {
  return (
    <section className="bg-primary pt-32 pb-20 px-6 md:px-16">
      <div className="mx-auto max-w-4xl">
        {eyebrow && (
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-background/70 block mb-4">
            {eyebrow}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-background mb-5">
          {title}
        </h1>
        <p className="font-mono text-sm leading-relaxed text-background/90 max-w-2xl mb-8">
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
