import type { JSX } from "react";
import { Hammer, ExternalLink } from "lucide-react";

type ContributorBadgeProps = {
  name: string;
  url?: string;
  glow?: boolean;
};

const basePillClass =
  "contributor-pill inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs text-primary";

export const ContributorBadge = ({ name, url, glow = false }: ContributorBadgeProps): JSX.Element => {
  const pillClass = glow ? `${basePillClass} contributor-pill-glow` : basePillClass;

  const content = (
    <>
      <Hammer size={11} aria-hidden="true" />
      <span>Challenge Builder</span>
      <span className="opacity-40" aria-hidden="true">·</span>
      <span>{name}</span>
    </>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${pillClass} hover:border-primary/40 hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1`}
      >
        {content}
        <ExternalLink size={11} aria-hidden="true" />
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    );
  }

  return <span className={pillClass}>{content}</span>;
};
