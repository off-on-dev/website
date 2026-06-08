import { describe, expect, it } from "vitest";
import { parseDocument } from "yaml";
import { insertCommunityCategoryId } from "../../scripts/lib/community-category.mjs";

type YAMLDocContents = { items?: Array<{ key?: { value?: string } }> };

function docKeys(doc: ReturnType<typeof parseDocument>): string[] {
  return (doc.contents as YAMLDocContents).items?.map((item) => item.key?.value ?? "") ?? [];
}

describe("insertCommunityCategoryId", () => {
  it("inserts community_category_id after slug when missing", () => {
    const doc = parseDocument("slug: lex-imperfecta\nname: Lex Imperfecta\n");

    const inserted = insertCommunityCategoryId(doc, 43);

    expect(inserted).toBe(true);
    expect(doc.get("community_category_id")).toBe(43);

    expect(docKeys(doc)).toEqual(["slug", "community_category_id", "name"]);
  });

  it("does not insert when key already exists", () => {
    const doc = parseDocument("slug: lex-imperfecta\ncommunity_category_id: 43\nname: Lex Imperfecta\n");

    const inserted = insertCommunityCategoryId(doc, 44);

    expect(inserted).toBe(false);
    expect(doc.get("community_category_id")).toBe(43);
  });

  it("does not insert for invalid category IDs", () => {
    const doc = parseDocument("slug: lex-imperfecta\nname: Lex Imperfecta\n");

    expect(insertCommunityCategoryId(doc, 0)).toBe(false);
    expect(insertCommunityCategoryId(doc, -1)).toBe(false);
    expect(insertCommunityCategoryId(doc, Number.NaN)).toBe(false);
    expect(doc.get("community_category_id")).toBeUndefined();
  });

  it("inserts at position 0 when slug key is absent", () => {
    const doc = parseDocument("name: Lex Imperfecta\n");

    const inserted = insertCommunityCategoryId(doc, 43);

    expect(inserted).toBe(true);
    expect(doc.get("community_category_id")).toBe(43);

    expect(docKeys(doc)[0]).toBe("community_category_id");
  });

  it("returns false for non-mapping root documents", () => {
    const doc = parseDocument("- one\n- two\n");

    const inserted = insertCommunityCategoryId(doc, 43);

    expect(inserted).toBe(false);
    expect(doc.get("community_category_id")).toBeUndefined();
  });
});
