import type { CSSProperties } from "react";
import { Badge } from "@/components/ui/badge";
import type { AdventureLevel } from "@/data/adventures";

type Difficulty = AdventureLevel["difficulty"];

const badgeStyle: Record<Difficulty, CSSProperties> = {
  Beginner: {
    color: "hsl(0 0% 0%)",
    borderColor: "hsl(41 100% 75% / 0.6)",
    backgroundColor: "hsl(41 100% 82%)",
  },
  Intermediate: {
    color: "hsl(0 0% 0%)",
    borderColor: "hsl(41 100% 70% / 0.6)",
    backgroundColor: "hsl(41 100% 76%)",
  },
  Expert: {
    color: "hsl(0 0% 0%)",
    borderColor: "hsl(41 100% 60% / 0.6)",
    backgroundColor: "hsl(41 100% 68%)",
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
