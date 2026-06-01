import { type JSX } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export const Breadcrumb = ({ items, className = "mb-5" }: BreadcrumbProps): JSX.Element => (
  <nav aria-label="Breadcrumb" className={className}>
    <ol className="flex flex-wrap items-center gap-1 text-xs text-[hsl(var(--text-faint))]">
      {items.map((item, index) => (
        <li key={item.label} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight size={12} aria-hidden="true" className="shrink-0" />
          )}
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
            >
              {item.label}
            </Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);
