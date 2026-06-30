import { describe, it, expect } from "vitest";
import { makeAvatarPalette } from "@/lib/avatar-utils";

describe("makeAvatarPalette", () => {
  it("returns 5 entries", () => {
    expect(makeAvatarPalette(0.25)).toHaveLength(5);
  });

  it("each entry uses the provided opacity in backgroundColor", () => {
    const palette = makeAvatarPalette(0.2);
    for (const style of palette) {
      expect(style.backgroundColor).toMatch(/\/ 0\.2\)$/);
    }
  });

  it("each entry sets color to the foreground token", () => {
    const palette = makeAvatarPalette(0.25);
    for (const style of palette) {
      expect(style.color).toBe("hsl(var(--foreground))");
    }
  });

  it("each backgroundColor references a CSS custom property", () => {
    const palette = makeAvatarPalette(1);
    for (const style of palette) {
      expect(style.backgroundColor).toMatch(/^hsl\(var\(--/);
    }
  });

  it("distinct entries use different color tokens", () => {
    const palette = makeAvatarPalette(0.25);
    const colors = palette.map((s) => s.backgroundColor);
    expect(new Set(colors).size).toBe(5);
  });
});
