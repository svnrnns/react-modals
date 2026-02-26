import { describe, it, expect, beforeEach, vi } from "vitest";
import { pushModal, closeAllModals } from "../../lib/api.js";
import { getStack } from "../../lib/store.js";

function DummyComponent() {
  return null;
}

describe("closeAllModals", () => {
  beforeEach(() => {
    closeAllModals();
  });

  it("clears the stack immediately", () => {
    pushModal({ component: DummyComponent });
    pushModal({ component: DummyComponent });
    expect(getStack()).toHaveLength(2);
    closeAllModals();
    expect(getStack()).toHaveLength(0);
  });

  it("calls onClose for each modal", () => {
    const onClose1 = vi.fn();
    const onClose2 = vi.fn();
    pushModal({ component: DummyComponent, onClose: onClose1 });
    pushModal({ component: DummyComponent, onClose: onClose2 });
    closeAllModals();
    expect(onClose1).toHaveBeenCalledTimes(1);
    expect(onClose2).toHaveBeenCalledTimes(1);
  });

  it("is safe to call when stack is already empty", () => {
    expect(() => closeAllModals()).not.toThrow();
    expect(getStack()).toHaveLength(0);
  });
});
