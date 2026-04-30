import type { JSX } from "react";
import { ArrowUpRight } from "lucide-react";

type LinkItem = { label: string; href: string };

type LinkSectionProps = {
  heading: string;
  links: LinkItem[];
};

const extLinkCls = "docs-ext-link inline-flex items-center gap-1 underline decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm";

export const LinkSection = ({ heading, links }: LinkSectionProps): JSX.Element => (
  <div>
    <h3 className="text-base font-semibold text-foreground mb-2">{heading}</h3>
    <ul className="space-y-1.5">
      {links.map((item) => (
        <li key={item.label} className="flex items-center gap-2.5 text-sm">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <a href={item.href} target="_blank" rel="noopener noreferrer" className={extLinkCls}>
            {item.label} <ArrowUpRight size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  </div>
);
