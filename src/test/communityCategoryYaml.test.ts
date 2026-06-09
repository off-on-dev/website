import { describe, expect, it } from "vitest";
import {
  insertRootFieldAfterSlug,
  setLevelField,
} from "../../scripts/lib/yaml-text-edit.mjs";

describe("setLevelField", () => {
  const yaml = [
    "slug: my-adventure",
    "levels:",
    "  - level: beginner",
    "    name: Beginner",
    "    community_url: https://community.offon.dev/t/old/1",
    "  - level: intermediate",
    "    name: Intermediate",
    "    community_url: \"\"",
  ].join("\n");

  it("updates the field in the target level", () => {
    const result = setLevelField(yaml, "intermediate", "community_url", "https://community.offon.dev/t/new/2");
    expect(result).toContain('    community_url: https://community.offon.dev/t/new/2');
  });

  it("leaves all other lines unchanged", () => {
    const result = setLevelField(yaml, "intermediate", "community_url", "https://community.offon.dev/t/new/2");
    const changedLines = result.split("\n").filter((l, i) => l !== yaml.split("\n")[i]);
    expect(changedLines).toHaveLength(1);
  });

  it("does not modify a different level with the same field name", () => {
    const result = setLevelField(yaml, "intermediate", "community_url", "https://community.offon.dev/t/new/2");
    expect(result).toContain("community_url: https://community.offon.dev/t/old/1");
  });

  it("replaces a quoted empty value", () => {
    const result = setLevelField(yaml, "intermediate", "community_url", "https://community.offon.dev/t/new/2");
    expect(result).not.toContain('community_url: ""');
    expect(result).toContain("community_url: https://community.offon.dev/t/new/2");
  });

  it("throws when the field is not found in the target level", () => {
    expect(() => setLevelField(yaml, "intermediate", "nonexistent_field", "value")).toThrow(
      "Field 'nonexistent_field' not found in level 'intermediate'"
    );
  });

  it("throws when the target level does not exist", () => {
    expect(() => setLevelField(yaml, "expert", "community_url", "value")).toThrow(
      "Field 'community_url' not found in level 'expert'"
    );
  });
});

describe("insertRootFieldAfterSlug", () => {
  it("inserts the field immediately after slug", () => {
    const text = "slug: my-adventure\nname: My Adventure\n";
    const result = insertRootFieldAfterSlug(text, "community_category_id", 43);
    expect(result).toBe("slug: my-adventure\ncommunity_category_id: 43\nname: My Adventure\n");
  });

  it("inserts only one new line", () => {
    const text = "slug: my-adventure\nname: My Adventure\n";
    const result = insertRootFieldAfterSlug(text, "community_category_id", 43);
    const addedLines = result.split("\n").filter((l) => !text.split("\n").includes(l));
    expect(addedLines).toHaveLength(1);
    expect(addedLines[0]).toBe("community_category_id: 43");
  });

  it("does not match an indented slug key inside a nested block", () => {
    const text = "slug: root\nlevels:\n  - level: beginner\n    slug: nested\nname: X\n";
    const result = insertRootFieldAfterSlug(text, "community_category_id", 43);
    // Should insert after the root slug, not the nested one
    expect(result.split("\n")[1]).toBe("community_category_id: 43");
  });

  it("throws when no root-level slug field exists", () => {
    const text = "name: My Adventure\n";
    expect(() => insertRootFieldAfterSlug(text, "community_category_id", 43)).toThrow(
      "'slug' field not found in adventure.yaml"
    );
  });
});
