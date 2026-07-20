import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { NotFoundPage } from "@/components/NotFoundPage";

const renderNotFoundPage = (): ReturnType<typeof render> =>
  render(
    <MemoryRouter>
      <NotFoundPage title="Test Not Found" message="Nothing here." />
    </MemoryRouter>
  );

describe("NotFoundPage", () => {
  it("renders main#main-content", () => {
    const { container } = renderNotFoundPage();
    expect(container.querySelector("main#main-content")).toBeTruthy();
  });

  it("main#main-content has tabIndex={-1} so FocusReset can shift focus after SPA navigation", () => {
    const { container } = renderNotFoundPage();
    const main = container.querySelector("main#main-content");
    expect(main?.getAttribute("tabindex")).toBe("-1");
  });

  it("renders the provided title as an h1", () => {
    const { getByRole } = renderNotFoundPage();
    expect(getByRole("heading", { level: 1, name: "Test Not Found" })).toBeTruthy();
  });
});
