import type { JSX } from "react";

type BulletItem = string | { lead: string; desc: string };

type BulletListProps = { items: BulletItem[] };

const itemKey = (item: BulletItem): string =>
  typeof item === "string" ? item : item.lead;

export const BulletList = ({ items }: BulletListProps): JSX.Element => (
  <ul className="flex flex-col gap-2">
    {items.map((item) => (
      <li key={itemKey(item)} className="flex items-start gap-2.5 text-sm text-[hsl(var(--text-secondary))]">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
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
