import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MarkdownContent } from "@/components/MarkdownContent";

const CODE = "git status";
const SOURCE_ONE = `<pre><code>${CODE}</code></pre>`;
const SOURCE_TWO = `<pre><code>one</code></pre><pre><code>two</code></pre>`;
const SOURCE_PROSE = "<p>No code blocks here</p>";

function clickCopyButton(): HTMLElement {
  const btn = screen.getByRole("button", { name: "Copy code" });
  fireEvent.click(btn);
  return btn;
}

describe("MarkdownContent: copy button", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders content from source HTML", () => {
    render(<MarkdownContent source="<p>Hello world</p>" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("does not inject a copy button when there are no <pre> blocks", () => {
    render(<MarkdownContent source={SOURCE_PROSE} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("injects a copy button for a single <pre> block", () => {
    render(<MarkdownContent source={SOURCE_ONE} />);
    expect(
      screen.getByRole("button", { name: "Copy code" })
    ).toBeInTheDocument();
  });

  it("injects one copy button per <pre> block", () => {
    render(<MarkdownContent source={SOURCE_TWO} />);
    const buttons = screen.getAllByRole("button", { name: "Copy code" });
    expect(buttons).toHaveLength(2);
  });

  it("wraps each <pre> in an .md-pre-group container", () => {
    render(<MarkdownContent source={SOURCE_TWO} />);
    expect(document.querySelectorAll(".md-pre-group")).toHaveLength(2);
  });

  it("calls clipboard.writeText with the pre text content on click", async () => {
    render(<MarkdownContent source={SOURCE_ONE} />);
    await act(async () => {
      clickCopyButton();
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(CODE);
  });

  it("updates aria-label to 'Code copied' immediately after click", async () => {
    render(<MarkdownContent source={SOURCE_ONE} />);
    await act(async () => {
      clickCopyButton();
    });
    expect(
      screen.getByRole("button", { name: "Code copied" })
    ).toBeInTheDocument();
  });

  it("shows 'Copied' text immediately after click", async () => {
    render(<MarkdownContent source={SOURCE_ONE} />);
    let btn!: HTMLElement;
    await act(async () => {
      btn = clickCopyButton();
    });
    expect(btn).toHaveTextContent("Copied");
  });

  it("resets button text and aria-label to 'Copy code' after 1500ms", async () => {
    render(<MarkdownContent source={SOURCE_ONE} />);
    await act(async () => {
      clickCopyButton();
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(
      screen.getByRole("button", { name: "Copy code" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("Copy");
  });

  it("does not reset before 1500ms have elapsed", async () => {
    render(<MarkdownContent source={SOURCE_ONE} />);
    await act(async () => {
      clickCopyButton();
    });
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      screen.getByRole("button", { name: "Code copied" })
    ).toBeInTheDocument();
  });

  it("announces copy via live region immediately after click", async () => {
    render(<MarkdownContent source={SOURCE_ONE} />);
    const live = document.querySelector("[aria-live='polite']");
    expect(live).toBeInTheDocument();
    await act(async () => {
      clickCopyButton();
    });
    expect(live).toHaveTextContent("Code copied to clipboard");
  });

  it("clears live region after 1500ms", async () => {
    render(<MarkdownContent source={SOURCE_ONE} />);
    const live = document.querySelector("[aria-live='polite']");
    await act(async () => {
      clickCopyButton();
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(live).toHaveTextContent("");
  });

  it("handles rapid re-clicks without stacking timeouts", async () => {
    render(<MarkdownContent source={SOURCE_ONE} />);
    await act(async () => { clickCopyButton(); });
    await act(async () => { vi.advanceTimersByTime(500); });
    // Second click while still in "Copied" state
    const btn = screen.getByRole("button", { name: "Code copied" });
    await act(async () => { fireEvent.click(btn); });
    await act(async () => { vi.advanceTimersByTime(1500); });
    // Only the second click's timer should have fired; button back to Copy
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
  });

  it("clears live region and cancels timer on unmount", async () => {
    const { unmount } = render(<MarkdownContent source={SOURCE_ONE} />);
    const live = document.querySelector("[aria-live='polite']");
    await act(async () => { clickCopyButton(); });
    expect(live).toHaveTextContent("Code copied to clipboard");
    act(() => { unmount(); });
    // Timer should be cancelled — no stale writes after unmount
    act(() => { vi.advanceTimersByTime(1500); });
    // live region was cleared by cleanup
    expect(live).toBeEmptyDOMElement();
  });

  it("cleans up copy buttons and wrappers when source changes", async () => {
    const { rerender } = render(<MarkdownContent source={SOURCE_ONE} />);
    expect(document.querySelectorAll(".md-pre-group")).toHaveLength(1);
    await act(async () => {
      rerender(<MarkdownContent source={SOURCE_PROSE} />);
    });
    expect(document.querySelectorAll(".md-pre-group")).toHaveLength(0);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("injects new buttons when source changes to content with more <pre> blocks", async () => {
    const { rerender } = render(<MarkdownContent source={SOURCE_ONE} />);
    expect(document.querySelectorAll(".md-pre-group")).toHaveLength(1);
    await act(async () => {
      rerender(<MarkdownContent source={SOURCE_TWO} />);
    });
    expect(document.querySelectorAll(".md-pre-group")).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// abbr portal tooltips
// ---------------------------------------------------------------------------

describe("MarkdownContent: abbr[title] → data-title conversion", () => {
  it("converts abbr[title] to data-title and removes the title attribute", () => {
    render(<MarkdownContent source='<p><abbr title="Kubernetes">K8s</abbr></p>' />);
    const abbr = document.querySelector("abbr")!;
    expect(abbr).not.toHaveAttribute("title");
    expect(abbr).toHaveAttribute("data-title", "Kubernetes");
  });

  it("sets aria-label to the expansion text on converted abbr elements", () => {
    render(<MarkdownContent source='<p><abbr title="Kubernetes">K8s</abbr></p>' />);
    const abbr = document.querySelector("abbr")!;
    expect(abbr).toHaveAttribute("aria-label", "Kubernetes");
  });

  it("does not mutate abbr elements that already have data-title instead of title", () => {
    const source = '<p><abbr data-title="Role-Based Access Control" aria-label="Role-Based Access Control" tabindex="0">RBAC</abbr></p>';
    render(<MarkdownContent source={source} />);
    const abbr = document.querySelector("abbr")!;
    expect(abbr).toHaveAttribute("data-title", "Role-Based Access Control");
    expect(abbr).not.toHaveAttribute("title");
  });
});

describe("MarkdownContent: abbr portal tooltip lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 100, right: 140, bottom: 50, top: 30,
      width: 40, height: 20, x: 100, y: 30,
      toJSON: () => ({}),
    });
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function renderWithAbbr(title = "Kubernetes", text = "K8s"): ReturnType<typeof render> {
    const source = `<p><abbr data-title="${title}" aria-label="${title}" tabindex="0">${text}</abbr></p>`;
    return render(<MarkdownContent source={source} />);
  }

  function findPortal(title: string): HTMLElement | undefined {
    return Array.from(document.body.querySelectorAll<HTMLElement>("span[aria-hidden='true']"))
      .find((el) => el.textContent === title);
  }

  it("appends a portal tooltip to document.body for each abbr[data-title]", () => {
    renderWithAbbr();
    const portal = findPortal("Kubernetes");
    expect(portal).toBeDefined();
    expect(portal?.style.display).toBe("none");
  });

  it("shows the portal tooltip on focus", () => {
    renderWithAbbr();
    const abbr = document.querySelector<HTMLElement>("abbr[data-title]")!;
    fireEvent.focus(abbr);
    const portal = findPortal("Kubernetes");
    expect(portal?.style.display).toBe("block");
  });

  it("shows the portal tooltip on click by forcing focus (touch path)", () => {
    // iOS Safari does not reliably focus a tabindex-only element on tap; the
    // click handler calls focus(), which routes touch through the focus path.
    renderWithAbbr();
    const abbr = document.querySelector<HTMLElement>("abbr[data-title]")!;
    fireEvent.click(abbr);
    const portal = findPortal("Kubernetes");
    expect(portal?.style.display).toBe("block");
  });

  it("hides the portal tooltip immediately on blur", () => {
    renderWithAbbr();
    const abbr = document.querySelector<HTMLElement>("abbr[data-title]")!;
    fireEvent.focus(abbr);
    fireEvent.blur(abbr);
    const portal = findPortal("Kubernetes");
    expect(portal?.style.display).toBe("none");
  });

  it("hides the tooltip on Escape without moving focus", () => {
    // WCAG 1.4.13: dismiss without moving keyboard focus. Escape hides the
    // portal but must not blur the abbr.
    renderWithAbbr();
    const abbr = document.querySelector<HTMLElement>("abbr[data-title]")!;
    const blurSpy = vi.spyOn(abbr, "blur");
    fireEvent.focus(abbr);
    fireEvent.keyDown(abbr, { key: "Escape" });
    expect(blurSpy).not.toHaveBeenCalled();
    const portal = findPortal("Kubernetes");
    expect(portal?.style.display).toBe("none");
  });

  it("removes the portal from document.body when the component unmounts", () => {
    const { unmount } = renderWithAbbr();
    const portal = findPortal("Kubernetes");
    expect(portal).toBeDefined();
    act(() => { unmount(); });
    expect(portal?.parentNode).toBeNull();
  });

  it("removes the abbr-js-tooltip suppression class on unmount", () => {
    const { unmount } = renderWithAbbr();
    const abbr = document.querySelector<HTMLElement>("abbr[data-title]")!;
    expect(abbr.classList.contains("abbr-js-tooltip")).toBe(true);
    act(() => { unmount(); });
    expect(abbr.classList.contains("abbr-js-tooltip")).toBe(false);
  });

  it("keeps the tooltip visible when the mouse leaves the portal while the abbr is keyboard-focused", () => {
    renderWithAbbr();
    const abbr = document.querySelector<HTMLElement>("abbr[data-title]")!;
    const portal = findPortal("Kubernetes")!;
    // Keyboard user focuses the abbr first (tooltip becomes visible via focus path).
    fireEvent.focus(abbr);
    expect(portal.style.display).toBe("block");
    // Mouse enters then leaves the portal while abbr still has focus.
    fireEvent.mouseEnter(portal);
    fireEvent.mouseLeave(portal);
    // scheduleHide should be suppressed because document.activeElement === abbr.
    expect(portal.style.display).toBe("block");
  });
});
