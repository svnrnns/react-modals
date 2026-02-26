import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { pushModal, createCloseModal, closeAllModals } from "../../lib/api.js";
import { getStack } from "../../lib/store.js";

function DummyComponent() {
  return null;
}

describe("createCloseModal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    closeAllModals();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a function that closes the modal with the given id", () => {
    const id = pushModal({ component: DummyComponent });
    const close = createCloseModal(id);
    expect(getStack()).toHaveLength(1);
    close();
    vi.advanceTimersByTime(250);
    expect(getStack()).toHaveLength(0);
  });

  it("invokes onClose when the returned function is called", () => {
    const onClose = vi.fn();
    const id = pushModal({ component: DummyComponent, onClose });
    createCloseModal(id)();
    vi.advanceTimersByTime(250);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
