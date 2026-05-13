import type { JSX } from "react";
import { ExternalLink } from "lucide-react";

type PersonNameLinkProps = {
  name: string;
  url?: string;
};

export const PersonNameLink = ({ name, url }: PersonNameLinkProps): JSX.Element => {
  if (!url) {
    return <span className="text-base font-semibold text-foreground">{name}</span>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="docs-ext-link inline-flex items-center gap-1.5 text-base font-semibold underline decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
    >
      {name}
      <ExternalLink size={13} aria-hidden="true" />
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
};
