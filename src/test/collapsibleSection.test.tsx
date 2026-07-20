import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CollapsibleSection } from "@/components/CollapsibleSection";

const renderSection = (props: Partial<Parameters<typeof CollapsibleSection>[0]> = {}): ReturnType<typeof render> =>
  render(
    <CollapsibleSection id="test-section" title="Test Title" {...props}>
      <p>Content</p>
    </CollapsibleSection>
  );

describe("CollapsibleSection", () => {
  describe("headingLevel", () => {
    it("defaults to h2 when headingLevel is omitted", () => {
      const { getByRole } = renderSection();
      expect(getByRole("heading", { level: 2, name: "Test Title" })).toBeTruthy();
    });

    it("renders h2 when headingLevel={2}", () => {
      const { getByRole } = renderSection({ headingLevel: 2 });
      expect(getByRole("heading", { level: 2, name: "Test Title" })).toBeTruthy();
    });

    it("renders h3 when headingLevel={3}", () => {
      const { getByRole } = renderSection({ headingLevel: 3 });
      expect(getByRole("heading", { level: 3, name: "Test Title" })).toBeTruthy();
    });

    it("renders h4 when headingLevel={4}", () => {
      const { getByRole } = renderSection({ headingLevel: 4 });
      expect(getByRole("heading", { level: 4, name: "Test Title" })).toBeTruthy();
    });

    it("does not render an h2 when headingLevel={3}", () => {
      const { queryByRole } = renderSection({ headingLevel: 3 });
      expect(queryByRole("heading", { level: 2 })).toBeNull();
    });
  });

  describe("defaultOpen", () => {
    it("renders the details element open by default", () => {
      const { container } = renderSection();
      expect(container.querySelector("details[open]")).toBeTruthy();
    });

    it("renders the details element closed when defaultOpen={false}", () => {
      const { container } = renderSection({ defaultOpen: false });
      expect(container.querySelector("details[open]")).toBeNull();
    });
  });

  describe("id", () => {
    it("sets the id on the details element for anchor linking", () => {
      const { container } = renderSection({ id: "my-section" });
      expect(container.querySelector("details#my-section")).toBeTruthy();
    });
  });

  describe("children", () => {
    it("renders children inside the section body", () => {
      const { getByText } = renderSection();
      expect(getByText("Content")).toBeTruthy();
    });
  });
});
