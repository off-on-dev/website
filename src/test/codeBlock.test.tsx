import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CodeBlock } from "@/components/CodeBlock";

const LANGUAGE = "bash";
const CODE = "git status --short";

function renderBlock(props: { language?: string; title?: string; code?: string } = {}) {
  return render(
    <CodeBlock
      language={props.language ?? LANGUAGE}
      title={props.title}
      code={props.code ?? CODE}
    />
  );
}

describe("CodeBlock", () => {
  describe("rendering", () => {
    it("shows the language label when no title is provided", () => {
      renderBlock();
      expect(screen.getByText(LANGUAGE)).toBeInTheDocument();
    });

    it("shows the title instead of language when title is provided", () => {
      renderBlock({ title: "Install dependencies" });
      expect(screen.getByText("Install dependencies")).toBeInTheDocument();
      expect(screen.queryByText(LANGUAGE)).not.toBeInTheDocument();
    });

    it("renders the code content inside a <pre>", () => {
      renderBlock();
      const pre = document.querySelector("pre");
      expect(pre).not.toBeNull();
      expect(pre?.textContent).toBe(CODE);
    });

    it("pre has an aria-label derived from language when no title", () => {
      renderBlock();
      expect(screen.getByLabelText(`${LANGUAGE} code block`)).toBeInTheDocument();
    });

    it("pre has an aria-label from title when title is provided", () => {
      renderBlock({ title: "Install step" });
      expect(screen.getByLabelText("Install step")).toBeInTheDocument();
    });

    it("renders a copy button with accessible label", () => {
      renderBlock();
      expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
    });

    it("has a polite live region for screen reader announcements", () => {
      renderBlock();
      expect(document.querySelector("[aria-live='polite']")).toBeInTheDocument();
    });
  });

  describe("copy button", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it("calls clipboard.writeText with code on click", async () => {
      renderBlock();
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalledOnce();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(CODE);
    });

    it("changes button label to 'Code copied' immediately after click", async () => {
      renderBlock();
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      });
      expect(screen.getByRole("button", { name: "Code copied" })).toBeInTheDocument();
    });

    it("shows 'Copied' button text after click", async () => {
      renderBlock();
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      });
      expect(screen.getByRole("button")).toHaveTextContent("Copied");
    });

    it("announces copy to live region immediately after click", async () => {
      renderBlock();
      const live = document.querySelector("[aria-live='polite']");
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      });
      expect(live).toHaveTextContent("Code copied to clipboard");
    });

    it("reverts button label and text to 'Copy code' after 1500ms", async () => {
      renderBlock();
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      });
      act(() => { vi.advanceTimersByTime(1500); });
      expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
      expect(screen.getByRole("button")).toHaveTextContent("Copy");
    });

    it("clears live region after 1500ms", async () => {
      renderBlock();
      const live = document.querySelector("[aria-live='polite']");
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      });
      act(() => { vi.advanceTimersByTime(1500); });
      expect(live).toHaveTextContent("");
    });

    it("does not reset before 1500ms", async () => {
      renderBlock();
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      });
      act(() => { vi.advanceTimersByTime(1000); });
      expect(screen.getByRole("button", { name: "Code copied" })).toBeInTheDocument();
    });

    it("handles rapid re-clicks without stacking timeouts", async () => {
      renderBlock();
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      });
      act(() => { vi.advanceTimersByTime(500); });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Code copied" }));
      });
      act(() => { vi.advanceTimersByTime(1500); });
      // Only the second click's timer should fire; button should be back to Copy
      expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
    });

    it("does not throw when clipboard API is unavailable", async () => {
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      renderBlock();
      expect(() => {
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      }).not.toThrow();
    });
  });
});
