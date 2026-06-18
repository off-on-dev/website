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
