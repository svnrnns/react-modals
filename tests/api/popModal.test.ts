import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { pushModal, popModal, closeAllModals } from "../../lib/api.js";
import { getStack, getTopId } from "../../lib/store.js";

function DummyComponent() {
  return null;
}

describe("popModal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    closeAllModals();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does nothing when stack is empty", () => {
    popModal();
    expect(getStack()).toHaveLength(0);
  });

  it("removes top modal after animation duration", () => {
    pushModal({ component: DummyComponent });
    expect(getStack()).toHaveLength(1);
    popModal();
    expect(getStack()).toHaveLength(1);
    vi.advanceTimersByTime(250);
    expect(getStack()).toHaveLength(0);
  });

  it("calls onClose of the removed modal", () => {
    const onClose = vi.fn();
    pushModal({ component: DummyComponent, onClose });
    popModal();
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(250);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("removes only the top modal when stack has multiple", () => {
    const id1 = pushModal({ component: DummyComponent });
    const id2 = pushModal({ component: DummyComponent });
    expect(getStack()).toHaveLength(2);
    expect(getTopId()).toBe(id2);
    popModal();
    vi.advanceTimersByTime(250);
    expect(getStack()).toHaveLength(1);
    expect(getStack()[0].id).toBe(id1);
  });
});
