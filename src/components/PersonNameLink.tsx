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
      rel="noopener noreferrer" aria-describedby="new-tab-hint"
      className="docs-ext-link text-base font-semibold"
    >
      {name}
      <ExternalLink size={12} aria-hidden="true" />
      
    </a>
  );
};
