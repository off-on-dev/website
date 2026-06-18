import { describe, it, expect } from "vitest";
import { BOARD_MEMBERS } from "@/data/team";

describe("BOARD_MEMBERS", () => {
  it("image paths are relative public paths (no leading slash, prefixed with BASE_URL at render time)", () => {
    const withImages = BOARD_MEMBERS.filter((m) => m.image !== undefined);
    expect(withImages.length).toBeGreaterThan(0);
    for (const member of withImages) {
      // Paths must not start with "/" so BoardSection can prepend import.meta.env.BASE_URL,
      // which resolves correctly in both production (/) and PR preview (/pr-preview/pr-N/) deployments.
      expect(member.image).toMatch(/^team\/.+\.webp$/);
    }
  });
});
