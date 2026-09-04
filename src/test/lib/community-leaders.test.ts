// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

import { describe, it, expect } from "vitest";
import { parseCommunityLeadersData, SECTION_IDS } from "@/lib/community-leaders";

const VALID_USER = { username: "alice", avatarUrl: "https://example.com/a.png", count: 5 };

const VALID_DATA = {
  lastUpdated: "2025-01-01T00:00:00Z",
  sections: [
    { id: "top-contributors", title: "Top Contributors", users: [VALID_USER] },
  ],
};

describe("parseCommunityLeadersData", () => {
  it("returns the parsed data when the input is valid", () => {
    const result = parseCommunityLeadersData(VALID_DATA);
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0]?.id).toBe("top-contributors");
    expect(result.sections[0]?.users[0]?.username).toBe("alice");
  });

  it("accepts all known section IDs", () => {
    const data = {
      lastUpdated: "2025-01-01T00:00:00Z",
      sections: SECTION_IDS.map((id) => ({ id, title: id, users: [] })),
    };
    expect(() => parseCommunityLeadersData(data)).not.toThrow();
  });

  it("accepts a section with no users", () => {
    const data = {
      lastUpdated: "2025-01-01T00:00:00Z",
      sections: [{ id: "top-contributors", title: "Top Contributors", users: [] }],
    };
    expect(() => parseCommunityLeadersData(data)).not.toThrow();
  });

  it("throws when the input is not an object", () => {
    expect(() => parseCommunityLeadersData(null)).toThrow("failed schema validation");
    expect(() => parseCommunityLeadersData("string")).toThrow("failed schema validation");
    expect(() => parseCommunityLeadersData(42)).toThrow("failed schema validation");
  });

  it("throws when sections is missing", () => {
    expect(() => parseCommunityLeadersData({ lastUpdated: "2025-01-01T00:00:00Z" })).toThrow(
      "failed schema validation",
    );
  });

  it("throws when a section has an unrecognised id", () => {
    const bad = {
      lastUpdated: "2025-01-01T00:00:00Z",
      sections: [{ id: "new-unknown-section", title: "New Section", users: [] }],
    };
    expect(() => parseCommunityLeadersData(bad)).toThrow("failed schema validation");
  });

  // Optional rather than required because buildAvatarUrl can return undefined.
  // The value is still format-checked when present — see the next test.
  it("accepts a user with no avatarUrl (field is optional)", () => {
    const data = {
      lastUpdated: "2025-01-01T00:00:00Z",
      sections: [
        {
          id: "top-contributors",
          title: "Top Contributors",
          users: [{ username: "alice", count: 5 }],
        },
      ],
    };
    expect(() => parseCommunityLeadersData(data)).not.toThrow();
  });

  it("throws when avatarUrl is present but not a URL", () => {
    const bad = {
      lastUpdated: "2025-01-01T00:00:00Z",
      sections: [
        {
          id: "top-contributors",
          title: "Top Contributors",
          users: [{ username: "alice", avatarUrl: "not-a-url", count: 5 }],
        },
      ],
    };
    expect(() => parseCommunityLeadersData(bad)).toThrow("failed schema validation");
  });

  it("throws when a user is missing username", () => {
    const bad = {
      lastUpdated: "2025-01-01T00:00:00Z",
      sections: [
        {
          id: "top-contributors",
          title: "Top Contributors",
          users: [{ count: 5 }],
        },
      ],
    };
    expect(() => parseCommunityLeadersData(bad)).toThrow("failed schema validation");
  });

  it("throws when a user count is a string instead of a number", () => {
    const bad = {
      lastUpdated: "2025-01-01T00:00:00Z",
      sections: [
        {
          id: "top-contributors",
          title: "Top Contributors",
          users: [{ username: "alice", avatarUrl: "https://example.com/a.png", count: "five" }],
        },
      ],
    };
    expect(() => parseCommunityLeadersData(bad)).toThrow("failed schema validation");
  });
});
