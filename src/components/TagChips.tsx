import { type JSX } from "react";
import { Link } from "react-router";
import { tagToSlug } from "@/data/adventures";

type TagChipsProps = {
  tags: readonly string[];
};

export const TagChips = ({ tags }: TagChipsProps): JSX.Element => (
  <>
    {tags.map((tag) => (
      <Link
        key={tag}
        to={`/challenges/${tagToSlug(tag)}/`}
        className="tag-chip-link rounded-sm border border-[hsl(var(--surface-border))] px-2.5 py-1 text-xs text-[hsl(var(--text-faint))] hover:border-primary hover:text-primary transition-colors"
      >
        {tag}
      </Link>
    ))}
  </>
);
