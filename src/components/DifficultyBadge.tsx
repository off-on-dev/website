import type { CSSProperties, JSX } from "react";
import { Badge } from "@/components/ui/badge";
import type { AdventureLevel } from "@/data/adventures";

type Difficulty = AdventureLevel["difficulty"];

const badgeStyle: Record<Difficulty, CSSProperties> = {
  Beginner: {
    color: "hsl(var(--difficulty-text))",
    borderColor: "hsl(var(--difficulty-starter-border))",
    backgroundColor: "hsl(var(--difficulty-starter-bg))",
  },
  Intermediate: {
    color: "hsl(var(--difficulty-text))",
    borderColor: "hsl(var(--difficulty-builder-border))",
    backgroundColor: "hsl(var(--difficulty-builder-bg))",
  },
  Expert: {
    color: "hsl(var(--difficulty-text))",
    borderColor: "hsl(var(--difficulty-architect-border))",
    backgroundColor: "hsl(var(--difficulty-architect-bg))",
  },
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
    data-difficulty={difficulty}
  >
    {showDot && (
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
    )}
    {difficulty}
  </Badge>
);
