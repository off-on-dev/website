import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import PresentationTemplates from "@/pages/PresentationTemplates";

function renderPage(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <PresentationTemplates />
    </MemoryRouter>
  );
}

describe("PresentationTemplates — Reveal.js section", () => {
  it("preview link points to deck-template/ (folder, not a flat HTML file)", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /Preview the Template/i });
    expect(link.getAttribute("href")).toBe("/deck-template/");
  });

  it("download link points to downloads/offon-reveal-template.zip", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /Download Reveal\.js ZIP/i });
    expect(link.getAttribute("href")).toBe("/downloads/offon-reveal-template.zip");
    expect(link.getAttribute("download")).toBe("offon-reveal-template.zip");
  });

  it("step 1 instructs renaming the deck-template folder, not a single HTML file", () => {
    renderPage();
    expect(screen.getByText(/Rename the deck-template folder/i)).toBeTruthy();
  });

  it("step 4 instructs opening index.html, not a renamed top-level file", () => {
    renderPage();
    expect(screen.getByText(/Open index\.html in any browser/i)).toBeTruthy();
  });
});

describe("PresentationTemplates — PowerPoint section", () => {
  it("PPTX download link points to downloads/offon-deck-template.pptx", () => {
    renderPage();
    const link = screen.getByRole("link", { name: /Download PPTX/i });
    expect(link.getAttribute("href")).toBe("/downloads/offon-deck-template.pptx");
    expect(link.getAttribute("download")).toBe("offon-deck-template.pptx");
  });
});
