import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { useEscapeKey } from "@/hooks/useEscapeKey";

describe("useEscapeKey", () => {
  it("calls the callback when Escape is pressed and enabled is true", () => {
    const callback = vi.fn();
    renderHook(() => useEscapeKey(callback, true));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(callback).toHaveBeenCalledOnce();
  });

  it("does not call the callback when enabled is false", () => {
    const callback = vi.fn();
    renderHook(() => useEscapeKey(callback, false));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(callback).not.toHaveBeenCalled();
  });

  it("does not call the callback for other keys", () => {
    const callback = vi.fn();
    renderHook(() => useEscapeKey(callback, true));
    fireEvent.keyDown(document, { key: "Enter" });
    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "Tab" });
    expect(callback).not.toHaveBeenCalled();
  });

  it("removes the listener on unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useEscapeKey(callback, true));
    unmount();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(callback).not.toHaveBeenCalled();
  });

  it("removes the listener when enabled transitions from true to false", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useEscapeKey(callback, enabled),
      { initialProps: { enabled: true } }
    );
    rerender({ enabled: false });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(callback).not.toHaveBeenCalled();
  });

  it("adds the listener when enabled transitions from false to true", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useEscapeKey(callback, enabled),
      { initialProps: { enabled: false } }
    );
    rerender({ enabled: true });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(callback).toHaveBeenCalledOnce();
  });

  it("uses the latest callback without re-registering the listener", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ cb }: { cb: () => void }) => useEscapeKey(cb, true),
      { initialProps: { cb: first } }
    );
    rerender({ cb: second });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });
});
