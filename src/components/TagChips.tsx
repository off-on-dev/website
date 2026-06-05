import { type JSX } from "react";
import { Link } from "react-router";
import { tagToSlug } from "@/data/adventures/tag-utils";

type TagChipsProps = {
  tags: readonly string[];
};

export const TagChips = ({ tags }: TagChipsProps): JSX.Element => (
  <>
    {tags.map((tag) => (
      <Link
        key={tag}
        to={`/challenges/${tagToSlug(tag)}/`}
        className="tag-chip-link rounded-sm border border-[hsl(var(--surface-border))] px-2.5 py-1 text-xs text-[hsl(var(--text-faint))] hover:border-foreground/40 dark:hover:border-primary hover:text-foreground dark:hover:text-primary transition-colors"
      >
        {tag}
      </Link>
    ))}
  </>
);
