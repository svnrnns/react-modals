import { describe, it, expect, beforeEach, vi } from "vitest";
import { pushModal, closeAllModals } from "../../lib/api.js";
import { getStack } from "../../lib/store.js";

function DummyComponent() {
  return null;
}

describe("pushModal", () => {
  beforeEach(() => {
    closeAllModals();
  });

  it("returns a non-empty string id", () => {
    const id = pushModal({ component: DummyComponent });
    expect(id).toBeTypeOf("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("returns unique ids for multiple modals", () => {
    const id1 = pushModal({ component: DummyComponent });
    const id2 = pushModal({ component: DummyComponent });
    expect(id1).not.toBe(id2);
  });

  it("adds one item to the stack", () => {
    expect(getStack()).toHaveLength(0);
    pushModal({ component: DummyComponent });
    expect(getStack()).toHaveLength(1);
  });

  it("adds item with correct phase entering", () => {
    pushModal({ component: DummyComponent });
    const stack = getStack();
    expect(stack[0].phase).toBe("entering");
  });

  it("passes through options (title, className, width, height)", () => {
    const id = pushModal({
      component: DummyComponent,
      title: "Test Title",
      className: "custom-class",
      width: 400,
      height: 300,
    });
    const stack = getStack();
    const item = stack.find((m) => m.id === id);
    expect(item?.title).toBe("Test Title");
    expect(item?.className).toBe("custom-class");
    expect(item?.width).toBe(400);
    expect(item?.height).toBe(300);
  });

  it("defaults hideHeader, disableClickOutside, disableEsc, disableAutoFocus to false", () => {
    pushModal({ component: DummyComponent });
    const item = getStack()[0];
    expect(item.hideHeader).toBe(false);
    expect(item.disableClickOutside).toBe(false);
    expect(item.disableEsc).toBe(false);
    expect(item.disableAutoFocus).toBe(false);
  });

  it("respects hideHeader true", () => {
    pushModal({ component: DummyComponent, hideHeader: true });
    expect(getStack()[0].hideHeader).toBe(true);
  });

  it("respects disableClickOutside true", () => {
    pushModal({ component: DummyComponent, disableClickOutside: true });
    expect(getStack()[0].disableClickOutside).toBe(true);
  });

  it("respects disableEsc true", () => {
    pushModal({ component: DummyComponent, disableEsc: true });
    expect(getStack()[0].disableEsc).toBe(true);
  });

  it("respects disableAutoFocus true", () => {
    pushModal({ component: DummyComponent, disableAutoFocus: true });
    expect(getStack()[0].disableAutoFocus).toBe(true);
  });

  it("uses empty object for props when not provided", () => {
    pushModal({ component: DummyComponent });
    expect(getStack()[0].props).toEqual({});
  });

  it("uses provided props", () => {
    pushModal({
      component: DummyComponent,
      props: { name: "test", count: 1 },
    });
    expect(getStack()[0].props).toEqual({ name: "test", count: 1 });
  });

  it("passes through footer option", () => {
    function Footer(_props: { x?: number; closeModal: () => void }) {
      return null;
    }
    pushModal({
      component: DummyComponent,
      footer: { component: Footer, props: { x: 1 }, className: "footer-cls" },
    });
    const item = getStack()[0];
    expect(item.footer?.component).toBe(Footer);
    expect(item.footer?.props).toEqual({ x: 1 });
    expect(item.footer?.className).toBe("footer-cls");
  });

  it("passes through onClose callback", () => {
    const onClose = vi.fn();
    pushModal({ component: DummyComponent, onClose });
    expect(getStack()[0].onClose).toBe(onClose);
  });
});
