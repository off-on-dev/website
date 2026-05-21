import type { JSX, ReactNode } from "react";
import { Link } from "react-router";
import { ADVENTURE_CONTRIBUTORS } from "@/data/adventures";
import { PersonNameLink } from "@/components/PersonNameLink";

export const ChallengeBuildersSection = ({ aside }: { aside?: ReactNode }): JSX.Element | null => {
  if (ADVENTURE_CONTRIBUTORS.length === 0) {
    return null;
  }

  const content = (
    <div>
      <h2 className="text-2xl font-bold text-foreground">Challenge Builders</h2>
      <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
        Adventures don't build themselves. A heartfelt thank you to everyone who has put in the time and care to create them.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {ADVENTURE_CONTRIBUTORS.map((contributor) => (
          <div
            key={contributor.name}
            className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6"
          >
            <PersonNameLink name={contributor.name} url={contributor.url} />
            {contributor.about && (
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{contributor.about}</p>
            )}
            <p className="mt-6 mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">adventures created</p>
            <ul className="space-y-3">
              {contributor.adventures.map(({ id, title }) => (
                <li key={id} className="flex items-center gap-2 text-xs">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <Link
                    to={`/adventures/${id}`}
                    className="docs-ext-link underline decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section id="challenge-builders" className="px-6 md:px-16 pb-16">
      <div className="mx-auto max-w-6xl">
        {aside ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
            {content}
            <div className="hidden lg:block">
              <div className="sticky top-24">{aside}</div>
            </div>
          </div>
        ) : (
          content
        )}
      </div>
    </section>
  );
};
