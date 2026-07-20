import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Abbr } from "@/components/Abbr";

const DEFAULT_RECT = {
  left: 100, right: 140, bottom: 50, top: 30,
  width: 40, height: 20, x: 100, y: 30,
  toJSON: () => ({}),
};

function mockRect(overrides: Partial<typeof DEFAULT_RECT> = {}): void {
  Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({ ...DEFAULT_RECT, ...overrides });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Abbr: semantics", () => {
  it("renders abbreviation text", () => {
    mockRect();
    render(<Abbr title="pull request">PR</Abbr>);
    expect(screen.getByText("PR")).toBeInTheDocument();
  });

  it("renders sr-only expansion text", () => {
    mockRect();
    render(<Abbr title="pull request">PR</Abbr>);
    // Two spans contain this text (sr-only + visible tooltip); confirm at least the sr-only one exists.
    const matches = screen.getAllByText("pull request");
    expect(matches.length).toBeGreaterThanOrEqual(1);
    const srOnly = matches.find((el) => el.classList.contains("sr-only"));
    expect(srOnly).toBeInTheDocument();
  });

  it("links abbr to sr-only expansion via aria-describedby", () => {
    mockRect();
    render(<Abbr title="pull request">PR</Abbr>);
    const abbr = screen.getByText("PR").closest("abbr")!;
    const descId = abbr.getAttribute("aria-describedby")!;
    expect(descId).toBeTruthy();
    const srOnly = document.getElementById(descId);
    expect(srOnly).toHaveTextContent("pull request");
  });

  it("has tabIndex=0 for keyboard accessibility (WCAG 1.4.13)", () => {
    mockRect();
    render(<Abbr title="pull request">PR</Abbr>);
    const abbr = screen.getByText("PR").closest("abbr");
    expect(abbr).toHaveAttribute("tabindex", "0");
  });

  it("does not carry a title attribute so the browser native tooltip is suppressed", () => {
    mockRect();
    render(<Abbr title="pull request">PR</Abbr>);
    const abbr = screen.getByText("PR").closest("abbr");
    expect(abbr).not.toHaveAttribute("title");
  });
});

describe("Abbr: keyboard behavior", () => {
  it("blurs the element when Escape is pressed (WCAG 1.4.13 dismissible)", () => {
    mockRect();
    render(<Abbr title="pull request">PR</Abbr>);
    const abbr = screen.getByText("PR").closest("abbr")!;
    // Spy with implementation so the native blur event still fires.
    const blurSpy = vi.spyOn(abbr, "blur").mockImplementation(() => {
      fireEvent.blur(abbr);
    });
    fireEvent.keyDown(abbr, { key: "Escape" });
    expect(blurSpy).toHaveBeenCalledOnce();
  });

  it("does not blur for non-Escape keys", () => {
    mockRect();
    render(<Abbr title="pull request">PR</Abbr>);
    const abbr = screen.getByText("PR").closest("abbr")!;
    const blurSpy = vi.spyOn(abbr, "blur");
    fireEvent.keyDown(abbr, { key: "Enter" });
    expect(blurSpy).not.toHaveBeenCalled();
  });
});

describe("Abbr: pointer behavior", () => {
  it("focuses the abbr on click so touch users can reveal the tooltip", () => {
    // iOS Safari does not reliably focus a tabindex-only element on tap; the
    // onClick handler forces focus, which is what reveals the tooltip.
    mockRect();
    render(<Abbr title="pull request">PR</Abbr>);
    const abbr = screen.getByText("PR").closest("abbr")!;
    fireEvent.click(abbr);
    expect(abbr).toHaveFocus();
  });
});

describe("Abbr: tooltip positioning", () => {
  it("opens the tooltip rightward (left-0) when there is enough space to the right", () => {
    // left=100, innerWidth=1024 → spaceRight=908 >= 80 → side=left
    mockRect({ left: 100, right: 140 });
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
    const { container } = render(<Abbr title="Site Reliability Engineer">SRE</Abbr>);
    const tooltipSpan = container.querySelector<HTMLElement>("[aria-hidden='true']");
    expect(tooltipSpan?.className).toContain("left-0");
    expect(tooltipSpan?.className).not.toContain("right-0");
  });

  it("opens the tooltip leftward (right-0) when the abbr is near the right viewport edge", () => {
    // left=1000, innerWidth=1024 → spaceRight=8 < 80 → side=right
    mockRect({ left: 1000, right: 1020 });
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
    const { container } = render(<Abbr title="pull request">PR</Abbr>);
    const tooltipSpan = container.querySelector<HTMLElement>("[aria-hidden='true']");
    expect(tooltipSpan?.className).toContain("right-0");
    expect(tooltipSpan?.className).not.toContain("left-0");
  });

  it("removes the resize listener on unmount", () => {
    mockRect();
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<Abbr title="pull request">PR</Abbr>);
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
