import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

function setupContainer(): { container: HTMLDivElement; btn1: HTMLButtonElement; btn2: HTMLButtonElement; btn3: HTMLButtonElement; cleanup: () => void } {
  const container = document.createElement("div");
  const btn1 = document.createElement("button");
  const btn2 = document.createElement("button");
  const btn3 = document.createElement("button");
  btn1.textContent = "First";
  btn2.textContent = "Second";
  btn3.textContent = "Third";
  container.appendChild(btn1);
  container.appendChild(btn2);
  container.appendChild(btn3);
  document.body.appendChild(container);
  return { container, btn1, btn2, btn3, cleanup: () => document.body.removeChild(container) };
}

describe("useFocusTrap", () => {
  it("focuses the first focusable element when enabled", () => {
    const { container, btn1, cleanup } = setupContainer();
    const containerRef = { current: container };
    renderHook(() => useFocusTrap(containerRef, true));
    expect(document.activeElement).toBe(btn1);
    cleanup();
  });

  it("does not move focus when disabled", () => {
    const { container, btn1, cleanup } = setupContainer();
    const containerRef = { current: container };
    renderHook(() => useFocusTrap(containerRef, false));
    expect(document.activeElement).not.toBe(btn1);
    cleanup();
  });

  it("wraps Tab from last element to first", () => {
    const { container, btn1, btn3, cleanup } = setupContainer();
    const containerRef = { current: container };
    renderHook(() => useFocusTrap(containerRef, true));
    btn3.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(btn1);
    cleanup();
  });

  it("wraps Shift+Tab from first element to last", () => {
    const { container, btn1, btn3, cleanup } = setupContainer();
    const containerRef = { current: container };
    renderHook(() => useFocusTrap(containerRef, true));
    btn1.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(btn3);
    cleanup();
  });

  it("does not intercept Tab when not on a boundary element", () => {
    const { container, btn2, cleanup } = setupContainer();
    const containerRef = { current: container };
    renderHook(() => useFocusTrap(containerRef, true));
    btn2.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    // Handler does not move focus because btn2 is not the last element
    expect(document.activeElement).toBe(btn2);
    cleanup();
  });

  it("does not handle Tab when disabled", () => {
    const { container, btn3, cleanup } = setupContainer();
    const containerRef = { current: container };
    renderHook(() => useFocusTrap(containerRef, false));
    btn3.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(btn3);
    cleanup();
  });

  it("removes the listener on unmount", () => {
    const { container, btn3, cleanup } = setupContainer();
    const containerRef = { current: container };
    const { unmount } = renderHook(() => useFocusTrap(containerRef, true));
    unmount();
    btn3.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(btn3);
    cleanup();
  });

  it("removes the listener when enabled transitions to false", () => {
    const { container, btn3, cleanup } = setupContainer();
    const containerRef = { current: container };
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useFocusTrap(containerRef, enabled),
      { initialProps: { enabled: true } }
    );
    rerender({ enabled: false });
    btn3.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(btn3);
    cleanup();
  });
});
