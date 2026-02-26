import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { pushModal, closeModalById, closeAllModals } from "../../lib/api.js";
import { getStack } from "../../lib/store.js";

function DummyComponent() {
  return null;
}

describe("closeModalById", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    closeAllModals();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("removes the modal with the given id after animation", () => {
    const id = pushModal({ component: DummyComponent });
    closeModalById(id);
    expect(getStack()).toHaveLength(1);
    vi.advanceTimersByTime(250);
    expect(getStack()).toHaveLength(0);
  });

  it("calls onClose of the closed modal", () => {
    const onClose = vi.fn();
    const id = pushModal({ component: DummyComponent, onClose });
    closeModalById(id);
    vi.advanceTimersByTime(250);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does nothing when id does not exist", () => {
    pushModal({ component: DummyComponent });
    closeModalById("non-existent");
    vi.advanceTimersByTime(250);
    expect(getStack()).toHaveLength(1);
  });

  it("closes the correct modal when stack has multiple", () => {
    const onClose1 = vi.fn();
    const onClose2 = vi.fn();
    const id1 = pushModal({ component: DummyComponent, onClose: onClose1 });
    const id2 = pushModal({ component: DummyComponent, onClose: onClose2 });
    closeModalById(id1);
    vi.advanceTimersByTime(250);
    expect(getStack()).toHaveLength(1);
    expect(getStack()[0].id).toBe(id2);
    expect(onClose1).toHaveBeenCalledTimes(1);
    expect(onClose2).not.toHaveBeenCalled();
  });
});
