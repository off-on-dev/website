import type { CSSProperties } from "react";
import { Badge } from "@/components/ui/badge";
import type { AdventureLevel } from "@/data/adventures";

type Difficulty = AdventureLevel["difficulty"];

const badgeStyle: Record<Difficulty, CSSProperties> = {
  Beginner: {
    color: "hsl(var(--difficulty-starter))",
    borderColor: "hsl(var(--difficulty-starter) / 0.35)",
    backgroundColor: "hsl(var(--difficulty-starter) / 0.1)",
  },
  Intermediate: {
    color: "hsl(var(--difficulty-builder))",
    borderColor: "hsl(var(--difficulty-builder) / 0.35)",
    backgroundColor: "hsl(var(--difficulty-builder) / 0.1)",
  },
  Expert: {
    color: "hsl(var(--difficulty-architect))",
    borderColor: "hsl(var(--difficulty-architect) / 0.35)",
    backgroundColor: "hsl(var(--difficulty-architect) / 0.1)",
  },
};

const dotColorClass: Record<Difficulty, string> = {
  Beginner: "bg-[hsl(var(--difficulty-starter))]",
  Intermediate: "bg-[hsl(var(--difficulty-builder))]",
  Expert: "bg-[hsl(var(--difficulty-architect))]",
};

type DifficultyBadgeProps = {
  difficulty: Difficulty;
  showDot?: boolean;
}

export const DifficultyBadge = ({ difficulty, showDot = false }: DifficultyBadgeProps): JSX.Element => (
  <Badge
    variant="outline"
    className="gap-1.5 rounded-md py-1 font-mono text-xs uppercase tracking-wider"
    style={badgeStyle[difficulty]}
  >
    {showDot && (
      <span className={`h-2 w-2 rounded-full ${dotColorClass[difficulty]}`} aria-hidden="true" />
    )}
    {difficulty}
  </Badge>
);
