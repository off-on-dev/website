import { describe, it, expect, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

// Track all containers appended to body so afterEach can remove any that
// were not cleaned up by a test that failed mid-assertion.
const _bodyNodes: HTMLElement[] = [];

afterEach(() => {
  _bodyNodes.forEach((el) => {
    if (el.parentNode === document.body) document.body.removeChild(el);
  });
  _bodyNodes.length = 0;
});

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
  _bodyNodes.push(container);
  return {
    container, btn1, btn2, btn3,
    cleanup: () => {
      if (container.parentNode === document.body) document.body.removeChild(container);
      const idx = _bodyNodes.indexOf(container);
      if (idx !== -1) _bodyNodes.splice(idx, 1);
    },
  };
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

  it("focuses the first element when re-enabled after being disabled", () => {
    const { container, btn1, btn3, cleanup } = setupContainer();
    const containerRef = { current: container };
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useFocusTrap(containerRef, enabled),
      { initialProps: { enabled: true } }
    );
    btn3.focus();
    rerender({ enabled: false });
    expect(document.activeElement).toBe(btn3);
    rerender({ enabled: true });
    expect(document.activeElement).toBe(btn1);
    cleanup();
  });

  it("does nothing when containerRef.current is null", () => {
    const containerRef: { current: HTMLElement | null } = { current: null };
    const before = document.activeElement;
    const { unmount } = renderHook(() => useFocusTrap(containerRef, true));
    expect(document.activeElement).toBe(before);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(before);
    unmount();
  });

  it("lets Tab pass through when the container has no focusable elements", () => {
    const container = document.createElement("div");
    container.textContent = "No interactive children";
    document.body.appendChild(container);
    const externalBtn = document.createElement("button");
    document.body.appendChild(externalBtn);
    _bodyNodes.push(container, externalBtn);
    const containerRef = { current: container };
    externalBtn.focus();
    const { unmount } = renderHook(() => useFocusTrap(containerRef, true));
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(externalBtn);
    unmount();
    document.body.removeChild(container);
    document.body.removeChild(externalBtn);
    _bodyNodes.length = 0;
  });

  it("does not trap focus when the container is display:none", () => {
    const { container, btn3, cleanup } = setupContainer();
    container.style.display = "none";
    const containerRef = { current: container };
    const { unmount } = renderHook(() => useFocusTrap(containerRef, true));
    expect(document.activeElement).not.toBe(container.querySelector("button"));
    btn3.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(btn3);
    unmount();
    cleanup();
  });

  it("reflects focusable elements added after the trap activates", () => {
    const { container, btn1, btn3, cleanup } = setupContainer();
    const containerRef = { current: container };
    renderHook(() => useFocusTrap(containerRef, true));

    const btn4 = document.createElement("button");
    btn4.textContent = "Fourth";
    container.appendChild(btn4);

    // btn3 is no longer the last element; Tab from btn3 should NOT wrap.
    btn3.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(btn3);

    // btn4 is now the last element; Tab from btn4 SHOULD wrap to first.
    btn4.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(btn1);

    cleanup();
  });
});
