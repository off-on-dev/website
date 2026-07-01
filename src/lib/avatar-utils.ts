import type { CSSProperties } from "react";

const AVATAR_COLORS = [
  "--primary",
  "--difficulty-architect",
  "--teal",
  "--difficulty-builder",
  "--destructive",
] as const;

export const makeAvatarPalette = (opacity: number): CSSProperties[] =>
  AVATAR_COLORS.map((color) => ({
    backgroundColor: `hsl(var(${color}) / ${opacity})`,
    color: "hsl(var(--foreground))",
  }));
