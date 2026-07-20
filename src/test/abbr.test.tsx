import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Abbr } from "@/components/Abbr";

function mockRect(): void {
  Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
    left: 100, right: 140, bottom: 50, top: 30,
    width: 40, height: 20, x: 100, y: 30, toJSON: () => ({}),
  });
}

// The visual tooltip is a portal appended to document.body (aria-hidden), shared
// with the prose path via useAbbrTooltips. The sr-only expansion span is not
// aria-hidden, so filtering on aria-hidden isolates the portal.
function portal(title: string): HTMLElement | undefined {
  return Array.from(document.body.querySelectorAll<HTMLElement>("span[aria-hidden='true']"))
    .find((el) => el.textContent === title);
}

describe("Abbr: semantics", () => {
  beforeEach(() => {
    mockRect();
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
  });
  afterEach(() => vi.restoreAllMocks());

  it("renders the abbreviation text", () => {
    render(<Abbr title="pull request">PR</Abbr>);
    expect(screen.getByText("PR")).toBeInTheDocument();
  });

  it("links the abbr to an sr-only expansion via aria-describedby", () => {
    render(<Abbr title="pull request">PR</Abbr>);
    const abbr = screen.getByText("PR").closest("abbr")!;
    const descId = abbr.getAttribute("aria-describedby")!;
    expect(descId).toBeTruthy();
    expect(document.getElementById(descId)).toHaveTextContent("pull request");
  });

  it("keeps the visible token as the name: data-title set, no aria-label, no title", () => {
    render(<Abbr title="pull request">PR</Abbr>);
    const abbr = screen.getByText("PR").closest("abbr")!;
    expect(abbr).toHaveAttribute("data-title", "pull request");
    expect(abbr).not.toHaveAttribute("aria-label");
    expect(abbr).not.toHaveAttribute("title");
  });

  it("is focusable so keyboard and touch users can reveal the tooltip", () => {
    render(<Abbr title="pull request">PR</Abbr>);
    expect(screen.getByText("PR").closest("abbr")).toHaveAttribute("tabindex", "0");
  });
});

describe("Abbr: tooltip (shared useAbbrTooltips)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockRect();
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
  });
  afterEach(() => {
    act(() => vi.runOnlyPendingTimers());
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows a portal tooltip on hover", () => {
    render(<Abbr title="pull request">PR</Abbr>);
    const abbr = screen.getByText("PR").closest("abbr")!;
    fireEvent.mouseEnter(abbr);
    expect(portal("pull request")?.style.display).toBe("block");
  });

  it("reveals on click by forcing focus (touch path)", () => {
    render(<Abbr title="pull request">PR</Abbr>);
    const abbr = screen.getByText("PR").closest("abbr")!;
    fireEvent.click(abbr);
    expect(abbr).toHaveFocus();
    expect(portal("pull request")?.style.display).toBe("block");
  });

  it("hides on Escape without moving focus", () => {
    render(<Abbr title="pull request">PR</Abbr>);
    const abbr = screen.getByText("PR").closest("abbr")!;
    const blurSpy = vi.spyOn(abbr, "blur");
    fireEvent.focus(abbr);
    fireEvent.keyDown(abbr, { key: "Escape" });
    expect(blurSpy).not.toHaveBeenCalled();
    expect(portal("pull request")?.style.display).toBe("none");
  });

  it("removes the portal from document.body on unmount", () => {
    const { unmount } = render(<Abbr title="pull request">PR</Abbr>);
    expect(portal("pull request")).toBeDefined();
    act(() => unmount());
    expect(portal("pull request")).toBeUndefined();
  });
});
