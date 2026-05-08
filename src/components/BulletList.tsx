import type { JSX } from "react";
import { Check, X } from "lucide-react";

type BulletItem = string | { lead: string; desc: string };

type Marker = "dot" | "check" | "x";

type Spacing = "tight" | "loose";

type BulletListProps = {
  items: BulletItem[];
  marker?: Marker;
  spacing?: Spacing;
};

const itemKey = (item: BulletItem): string =>
  typeof item === "string" ? item : item.lead;

const ulClass = (spacing: Spacing): string =>
  spacing === "loose" ? "space-y-3" : "flex flex-col gap-2";

const liClass = (spacing: Spacing): string =>
  spacing === "loose"
    ? "flex items-start gap-3 text-sm text-muted-foreground leading-relaxed"
    : "flex items-start gap-2.5 text-sm text-[hsl(var(--text-secondary))]";

function MarkerIcon({ marker }: { marker: Marker }): JSX.Element {
  if (marker === "check") {
    return <Check size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-foreground" />;
  }
  if (marker === "x") {
    return <X size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-foreground" />;
  }
  return <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />;
}

export const BulletList = ({
  items,
  marker = "dot",
  spacing = "tight",
}: BulletListProps): JSX.Element => (
  <ul className={ulClass(spacing)}>
    {items.map((item) => (
      <li key={itemKey(item)} className={liClass(spacing)}>
        <MarkerIcon marker={marker} />
        {typeof item === "string" ? (
          item
        ) : (
          <span>
            <strong className="font-semibold text-foreground">{item.lead}</strong> {item.desc}
          </span>
        )}
      </li>
    ))}
  </ul>
);
