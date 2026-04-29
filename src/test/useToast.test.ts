import { describe, it, expect, beforeEach, vi } from "vitest";
import { reducer } from "@/hooks/use-toast";

// Stub setTimeout so DISMISS_TOAST side effects don't leak between tests
vi.stubGlobal("setTimeout", vi.fn(() => 0));

type State = { toasts: { id: string; title?: string; open?: boolean; [key: string]: unknown }[] };

const emptyState: State = { toasts: [] };

const makeToast = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  title: `Toast ${id}`,
  open: true,
  ...extra,
});

describe("use-toast reducer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ADD_TOAST", () => {
    it("adds a toast to an empty state", () => {
      const toast = makeToast("1");
      const next = reducer(emptyState, { type: "ADD_TOAST", toast });
      expect(next.toasts).toHaveLength(1);
      expect(next.toasts[0].id).toBe("1");
    });

    it("prepends the new toast so the latest is first", () => {
      const first = makeToast("1");
      const stateWithOne = reducer(emptyState, { type: "ADD_TOAST", toast: first });
      const second = makeToast("2");
      const next = reducer(stateWithOne, { type: "ADD_TOAST", toast: second });
      expect(next.toasts[0].id).toBe("2");
    });

    it("enforces TOAST_LIMIT of 1 by dropping older toasts", () => {
      const first = makeToast("1");
      const stateWithOne = reducer(emptyState, { type: "ADD_TOAST", toast: first });
      const second = makeToast("2");
      const next = reducer(stateWithOne, { type: "ADD_TOAST", toast: second });
      expect(next.toasts).toHaveLength(1);
      expect(next.toasts[0].id).toBe("2");
    });

    it("does not mutate the previous state", () => {
      const toast = makeToast("1");
      reducer(emptyState, { type: "ADD_TOAST", toast });
      expect(emptyState.toasts).toHaveLength(0);
    });
  });

  describe("UPDATE_TOAST", () => {
    it("merges new props into the matching toast", () => {
      const toast = makeToast("1", { title: "Original" });
      const stateWithOne = reducer(emptyState, { type: "ADD_TOAST", toast });
      const next = reducer(stateWithOne, {
        type: "UPDATE_TOAST",
        toast: { id: "1", title: "Updated" },
      });
      expect(next.toasts[0].title).toBe("Updated");
    });

    it("leaves non-matching toasts unchanged", () => {
      const toast = makeToast("1", { title: "Keep me" });
      const stateWithOne = reducer(emptyState, { type: "ADD_TOAST", toast });
      const next = reducer(stateWithOne, {
        type: "UPDATE_TOAST",
        toast: { id: "99", title: "Should not apply" },
      });
      expect(next.toasts[0].title).toBe("Keep me");
    });
  });

  describe("DISMISS_TOAST", () => {
    it("sets open to false on the targeted toast", () => {
      const toast = makeToast("1", { open: true });
      const stateWithOne = reducer(emptyState, { type: "ADD_TOAST", toast });
      const next = reducer(stateWithOne, { type: "DISMISS_TOAST", toastId: "1" });
      expect(next.toasts[0].open).toBe(false);
    });

    it("does not affect non-targeted toasts when given an id", () => {
      const toast = makeToast("1", { open: true });
      const stateWithOne = reducer(emptyState, { type: "ADD_TOAST", toast });
      const next = reducer(stateWithOne, { type: "DISMISS_TOAST", toastId: "99" });
      expect(next.toasts[0].open).toBe(true);
    });

    it("sets open to false on all toasts when no id is given", () => {
      const toast = makeToast("1", { open: true });
      const stateWithOne = reducer(emptyState, { type: "ADD_TOAST", toast });
      const next = reducer(stateWithOne, { type: "DISMISS_TOAST" });
      expect(next.toasts.every((t) => t.open === false)).toBe(true);
    });

    it("schedules removal via setTimeout when dismissing by id", () => {
      // Use a unique id so the module-level toastTimeouts guard doesn't skip this call
      const toast = makeToast("timeout-test-unique");
      const stateWithOne = reducer(emptyState, { type: "ADD_TOAST", toast });
      reducer(stateWithOne, { type: "DISMISS_TOAST", toastId: "timeout-test-unique" });
      expect(setTimeout).toHaveBeenCalled();
    });
  });

  describe("REMOVE_TOAST", () => {
    it("removes the toast with the given id", () => {
      const toast = makeToast("1");
      const stateWithOne = reducer(emptyState, { type: "ADD_TOAST", toast });
      const next = reducer(stateWithOne, { type: "REMOVE_TOAST", toastId: "1" });
      expect(next.toasts).toHaveLength(0);
    });

    it("is a no-op when the id does not match any toast", () => {
      const toast = makeToast("1");
      const stateWithOne = reducer(emptyState, { type: "ADD_TOAST", toast });
      const next = reducer(stateWithOne, { type: "REMOVE_TOAST", toastId: "99" });
      expect(next.toasts).toHaveLength(1);
    });

    it("clears all toasts when no id is given", () => {
      const toast = makeToast("1");
      const stateWithOne = reducer(emptyState, { type: "ADD_TOAST", toast });
      const next = reducer(stateWithOne, { type: "REMOVE_TOAST" });
      expect(next.toasts).toHaveLength(0);
    });
  });
});
