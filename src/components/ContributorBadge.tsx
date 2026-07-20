import type { JSX } from "react";
import { Hammer, ExternalLink } from "lucide-react";

type ContributorBadgeProps = {
  name: string;
  url?: string;
  glow?: boolean;
  label?: string;
};

const basePillClass =
  "contributor-pill inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs text-primary";

export const ContributorBadge = ({ name, url, glow = false, label = "Challenge Builder" }: ContributorBadgeProps): JSX.Element => {
  const pillClass = glow ? `${basePillClass} contributor-pill-glow` : basePillClass;

  const content = (
    <>
      <Hammer size={11} aria-hidden="true" />
      <span>{label}</span>
      <span aria-hidden="true" className="inline-block w-px h-3 bg-current opacity-40" />
      <span>{name}</span>
    </>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer" aria-describedby="new-tab-hint"
        className={`${pillClass} hover:border-primary/40 hover:bg-primary/10 transition-colors focus-ring-tight`}
      >
        {content}
        <ExternalLink size={11} aria-hidden="true" />
        
      </a>
    );
  }

  return <span className={pillClass}>{content}</span>;
};
