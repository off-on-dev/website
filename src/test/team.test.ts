import { describe, it, expect } from "vitest";
import { BOARD_MEMBERS } from "@/data/team";

describe("BOARD_MEMBERS", () => {
  it("image paths are public URLs, not Vite-bundled assets", () => {
    const withImages = BOARD_MEMBERS.filter((m) => m.image !== undefined);
    expect(withImages.length).toBeGreaterThan(0);
    for (const member of withImages) {
      expect(member.image).toMatch(/^\/team\/.+\.webp$/);
    }
  });
});
