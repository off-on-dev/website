import type { JSX } from "react";
import { Badge } from "@/components/ui/badge";
import type { AdventureLevel } from "@/data/adventures";
import { difficultyStyle } from "@/lib/difficulty";

type Difficulty = AdventureLevel["difficulty"];

type DifficultyBadgeProps = {
  difficulty: Difficulty;
  showDot?: boolean;
}

export const DifficultyBadge = ({ difficulty, showDot = false }: DifficultyBadgeProps): JSX.Element => (
  <Badge
    variant="outline"
    className="gap-1.5 rounded-md py-1 font-mono text-xs uppercase tracking-wider"
    style={difficultyStyle(difficulty)}
    data-difficulty={difficulty}
  >
    {showDot && (
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
    )}
    {difficulty}
  </Badge>
);
