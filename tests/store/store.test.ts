import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getStack,
  subscribe,
  pushItem,
  removeItemById,
  updateItemPhase,
  getTopId,
  popItem,
  clearStack,
} from "../../lib/store.js";
import { closeAllModals } from "../../lib/api.js";

function DummyComponent() {
  return null;
}

const createItem = (id: string, phase: "entering" | "entered" | "exiting" = "entering") => ({
  id,
  component: DummyComponent,
  props: {},
  phase,
});

describe("store", () => {
  beforeEach(() => {
    closeAllModals();
  });

  describe("getStack", () => {
    it("returns empty array when no modals", () => {
      expect(getStack()).toEqual([]);
    });

    it("returns current stack", () => {
      pushItem(createItem("a"));
      pushItem(createItem("b"));
      const stack = getStack();
      expect(stack).toHaveLength(2);
      expect(stack[0].id).toBe("a");
      expect(stack[1].id).toBe("b");
    });
  });

  describe("subscribe", () => {
    it("calls listener when stack changes", () => {
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);
      expect(listener).not.toHaveBeenCalled();
      pushItem(createItem("a"));
      expect(listener).toHaveBeenCalledTimes(1);
      pushItem(createItem("b"));
      expect(listener).toHaveBeenCalledTimes(2);
      unsubscribe();
      pushItem(createItem("c"));
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("returns unsubscribe function that removes listener", () => {
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);
      pushItem(createItem("a"));
      unsubscribe();
      pushItem(createItem("b"));
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("pushItem", () => {
    it("adds item to stack", () => {
      const item = createItem("x");
      pushItem(item);
      expect(getStack()).toHaveLength(1);
      expect(getStack()[0].id).toBe("x");
    });
  });

  describe("getTopId", () => {
    it("returns null when stack empty", () => {
      expect(getTopId()).toBeNull();
    });

    it("returns id of last item", () => {
      pushItem(createItem("a"));
      pushItem(createItem("b"));
      expect(getTopId()).toBe("b");
    });
  });

  describe("popItem", () => {
    it("returns undefined when stack empty", () => {
      expect(popItem()).toBeUndefined();
    });

    it("removes and returns last item", () => {
      pushItem(createItem("a"));
      pushItem(createItem("b"));
      const removed = popItem();
      expect(removed?.id).toBe("b");
      expect(getStack()).toHaveLength(1);
      expect(getStack()[0].id).toBe("a");
    });
  });

  describe("removeItemById", () => {
    it("returns undefined when id not found", () => {
      pushItem(createItem("a"));
      expect(removeItemById("b")).toBeUndefined();
      expect(getStack()).toHaveLength(1);
    });

    it("removes item with given id and returns it", () => {
      pushItem(createItem("a"));
      pushItem(createItem("b"));
      pushItem(createItem("c"));
      const removed = removeItemById("b");
      expect(removed?.id).toBe("b");
      expect(getStack()).toHaveLength(2);
      expect(getStack().map((m) => m.id)).toEqual(["a", "c"]);
    });
  });

  describe("updateItemPhase", () => {
    it("updates phase of item with given id", () => {
      pushItem(createItem("a"));
      updateItemPhase("a", "entered");
      expect(getStack()[0].phase).toBe("entered");
    });

    it("does nothing when id not found", () => {
      pushItem(createItem("a"));
      updateItemPhase("b", "exiting");
      expect(getStack()[0].phase).toBe("entering");
    });
  });

  describe("clearStack", () => {
    it("empties stack and returns previous items", () => {
      pushItem(createItem("a"));
      pushItem(createItem("b"));
      const cleared = clearStack();
      expect(cleared).toHaveLength(2);
      expect(getStack()).toHaveLength(0);
    });

    it("returns empty array when stack already empty", () => {
      expect(clearStack()).toEqual([]);
    });
  });
});
