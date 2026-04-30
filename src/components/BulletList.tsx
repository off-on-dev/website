import type { JSX } from "react";

type BulletListProps = { items: string[] };

export const BulletList = ({ items }: BulletListProps): JSX.Element => (
  <ul className="flex flex-col gap-2">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-2.5 text-sm text-[hsl(var(--text-secondary))]">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
        {item}
      </li>
    ))}
  </ul>
);
